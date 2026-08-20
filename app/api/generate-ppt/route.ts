import { NextRequest, NextResponse } from 'next/server';
import { generatePPT } from '@/lib/ppt-generator';
import { applyUpdate } from '@/lib/master-db';
import type { ValidationResult } from '@/lib/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { results, fileName } = body as {
      results: ValidationResult[];
      fileName: string;
    };

    if (!results?.length) {
      return NextResponse.json({ error: '검증 결과가 없습니다.' }, { status: 400 });
    }

    // Apply user choices and update in-memory DB
    const processedResults: ValidationResult[] = results.map((result) => {
      if (!result.mediaSpec || !result.discrepancies.length) return result;

      const updatedSpecs = { ...result.mediaSpec.specs };

      for (const disc of result.discrepancies) {
        if (disc.userChoice === 'excel') {
          const field = disc.field as keyof typeof updatedSpecs;
          if (field === 'format') {
            (updatedSpecs as Record<string, unknown>)[field] = disc.excelValue.split(/[,/ ]+/).map((f: string) => f.trim().toUpperCase());
          } else {
            (updatedSpecs as Record<string, unknown>)[field] = disc.excelValue;
          }
          // Persist to in-memory DB (in production: DB write + admin approval)
          applyUpdate(result.mediaSpec.id, { specs: { [field]: (updatedSpecs as Record<string, unknown>)[field] } as typeof updatedSpecs });
        }
      }

      return {
        ...result,
        finalSpecs: updatedSpecs,
      };
    });

    const pptBuffer = await generatePPT(processedResults, fileName || '소재기획');
    const base64 = Buffer.from(pptBuffer).toString('base64');

    return NextResponse.json({ pptBase64: base64 });
  } catch (err) {
    console.error('PPT generation error:', err);
    return NextResponse.json({ error: 'PPT 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
