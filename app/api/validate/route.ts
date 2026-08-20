import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFile } from '@/lib/excel-parser';
import { fuzzyMatch } from '@/lib/fuzzy-match';
import { getEffectiveSpec } from '@/lib/master-db';
import type { ValidationResult, Discrepancy, ExcelRow, SpecDetail } from '@/lib/types';

const FIELD_LABELS: Record<string, string> = {
  resolution: '해상도',
  fileSize: '파일 용량',
  format: '파일 형식',
  duration: '재생 시간',
  ratio: '비율',
  safeArea: '안전 영역',
  additionalNotes: '추가 안내',
};

function compareSpecs(
  masterSpecs: SpecDetail,
  excelSpecs: Partial<SpecDetail>
): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];

  const fields = ['resolution', 'fileSize', 'format', 'duration', 'ratio'] as const;

  for (const field of fields) {
    const masterVal = masterSpecs[field];
    const excelVal = excelSpecs[field];
    if (!excelVal) continue;

    const masterStr = Array.isArray(masterVal) ? masterVal.join(', ') : String(masterVal || '');
    const excelStr = Array.isArray(excelVal) ? excelVal.join(', ') : String(excelVal);

    if (!masterVal) continue;

    const mNorm = masterStr.replace(/\s/g, '').toUpperCase();
    const eNorm = excelStr.replace(/\s/g, '').toUpperCase();

    if (mNorm !== eNorm && eNorm.length > 0) {
      discrepancies.push({
        field,
        fieldLabel: FIELD_LABELS[field] || field,
        masterValue: masterStr,
        excelValue: excelStr,
      });
    }
  }

  return discrepancies;
}

async function llmDeltaCheck(
  masterSpecs: SpecDetail,
  rawText: string
): Promise<Discrepancy[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !rawText?.trim()) return [];

  try {
    const { Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey });

    const prompt = `다음은 광고 매체 소재 스펙의 마스터 DB 값과 엑셀 원문 텍스트입니다.
두 데이터 간의 수치 차이(해상도, 파일용량, 재생시간 등)만 JSON 배열로 반환하세요.

마스터 DB:
${JSON.stringify(masterSpecs, null, 2)}

엑셀 원문:
${rawText.slice(0, 1000)}

응답 형식 (차이가 없으면 빈 배열):
[{"field": "fileSize", "fieldLabel": "파일 용량", "masterValue": "200KB", "excelValue": "300KB"}]`;

    const msg = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {
    // LLM unavailable — fall through to rule-based only
  }
  return [];
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 필요합니다.' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const excelRows: ExcelRow[] = await parseExcelFile(buffer);

    const results: ValidationResult[] = await Promise.all(
      excelRows.map(async (row, idx) => {
        const match = fuzzyMatch(row.mediaName, row.productName);

        if (!match || match.score < 0.3) {
          return {
            id: `result-${idx}`,
            mediaSpec: null,
            excelRow: row,
            matchScore: match?.score || 0,
            status: 'not_found' as const,
            discrepancies: [],
          };
        }

        const spec = getEffectiveSpec(match.spec.id);
        if (!spec) {
          return {
            id: `result-${idx}`,
            mediaSpec: match.spec,
            excelRow: row,
            matchScore: match.score,
            status: 'not_found' as const,
            discrepancies: [],
          };
        }

        const ruleDiscrepancies = row.extractedSpecs
          ? compareSpecs(spec.specs, row.extractedSpecs)
          : [];

        const llmDiscrepancies = row.rawText
          ? await llmDeltaCheck(spec.specs, row.rawText)
          : [];

        // Merge, deduplicate by field
        const allDiscrepancies = [...ruleDiscrepancies];
        for (const d of llmDiscrepancies) {
          if (!allDiscrepancies.find((r) => r.field === d.field)) {
            allDiscrepancies.push(d);
          }
        }

        return {
          id: `result-${idx}`,
          mediaSpec: spec,
          excelRow: row,
          matchScore: match.score,
          status: allDiscrepancies.length > 0 ? ('mismatch' as const) : ('match' as const),
          discrepancies: allDiscrepancies,
          finalSpecs: { ...spec.specs },
        };
      })
    );

    return NextResponse.json({ results, rowCount: excelRows.length });
  } catch (err) {
    console.error('Validation error:', err);
    return NextResponse.json({ error: '파일 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
