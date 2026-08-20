import * as XLSX from 'xlsx';
import type { ExcelRow, SpecDetail } from './types';

const MEDIA_KEYWORDS = ['매체', '매체명', 'media', '채널'];
const PRODUCT_KEYWORDS = ['상품', '상품명', '지면', 'product', '소재'];
const DATE_KEYWORDS = ['집행', '기간', '일정', 'date', '라이브'];
const SIZE_KEYWORDS = ['해상도', '사이즈', 'resolution', '크기', 'size'];
const WEIGHT_KEYWORDS = ['용량', '파일용량', '파일크기', 'filesize', 'weight', 'kb', 'mb'];
const FORMAT_KEYWORDS = ['형식', '포맷', 'format', '확장자'];
const DURATION_KEYWORDS = ['재생', '길이', '시간', 'duration', '초'];

function normalizeHeader(h: string): string {
  return h.toString().trim().toLowerCase().replace(/\s+/g, '');
}

function findColumn(headers: string[], keywords: string[]): number {
  return headers.findIndex((h) => keywords.some((k) => normalizeHeader(h).includes(k.toLowerCase())));
}

function extractSpecsFromText(text: string): Partial<SpecDetail> {
  const specs: Partial<SpecDetail> = {};

  const resMatch = text.match(/(\d{3,4})\s*[xX×]\s*(\d{3,4})/);
  if (resMatch) specs.resolution = `${resMatch[1]}x${resMatch[2]}`;

  const sizeMatch = text.match(/(\d+(?:\.\d+)?)\s*(KB|MB|kb|mb)/i);
  if (sizeMatch) specs.fileSize = `${sizeMatch[1]}${sizeMatch[2].toUpperCase()}`;

  const formatMatch = text.match(/\b(JPG|JPEG|PNG|GIF|MP4|MOV|AVI|HTML5|WEBP)\b/gi);
  if (formatMatch) specs.format = [...new Set(formatMatch.map((f) => f.toUpperCase()))];

  const durMatch = text.match(/(\d+)\s*초/);
  if (durMatch) specs.duration = `${durMatch[1]}초`;

  return specs;
}

export async function parseExcelFile(buffer: ArrayBuffer): Promise<ExcelRow[]> {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const rows: ExcelRow[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
    if (!data.length) continue;

    const headerRowIdx = data.findIndex(
      (row) =>
        row.some((cell) => MEDIA_KEYWORDS.some((k) => normalizeHeader(String(cell)).includes(k))) ||
        row.some((cell) => PRODUCT_KEYWORDS.some((k) => normalizeHeader(String(cell)).includes(k)))
    );

    if (headerRowIdx === -1) {
      // No clear header — try to extract spec text from entire sheet
      const rawText = data
        .flat()
        .filter(Boolean)
        .map(String)
        .join(' ');
      if (rawText.length > 20) {
        const specs = extractSpecsFromText(rawText);
        if (Object.keys(specs).length > 0) {
          rows.push({
            mediaName: sheetName,
            productName: '',
            rawText,
            extractedSpecs: specs,
          });
        }
      }
      continue;
    }

    const headers = data[headerRowIdx].map(String);
    const mediaCol = findColumn(headers, MEDIA_KEYWORDS);
    const productCol = findColumn(headers, PRODUCT_KEYWORDS);
    const dateCol = findColumn(headers, DATE_KEYWORDS);
    const sizeCol = findColumn(headers, SIZE_KEYWORDS);
    const weightCol = findColumn(headers, WEIGHT_KEYWORDS);
    const formatCol = findColumn(headers, FORMAT_KEYWORDS);
    const durationCol = findColumn(headers, DURATION_KEYWORDS);

    for (let i = headerRowIdx + 1; i < data.length; i++) {
      const row = data[i];
      const mediaName = mediaCol >= 0 ? String(row[mediaCol] || '').trim() : '';
      const productName = productCol >= 0 ? String(row[productCol] || '').trim() : '';

      if (!mediaName && !productName) continue;

      const rawText = row.join(' ');
      const specs: Partial<NonNullable<ExcelRow['extractedSpecs']>> = {};

      if (sizeCol >= 0 && row[sizeCol]) specs.resolution = String(row[sizeCol]).trim();
      if (weightCol >= 0 && row[weightCol]) specs.fileSize = String(row[weightCol]).trim();
      if (durationCol >= 0 && row[durationCol]) specs.duration = String(row[durationCol]).trim();
      if (formatCol >= 0 && row[formatCol]) {
        specs.format = String(row[formatCol])
          .split(/[,\/·\s]+/)
          .filter(Boolean)
          .map((f) => f.toUpperCase().trim());
      }

      // Also try to extract from raw text as fallback
      const textSpecs = extractSpecsFromText(rawText);
      const merged = { ...textSpecs, ...specs };

      rows.push({
        mediaName: mediaName || sheetName,
        productName,
        liveDate: dateCol >= 0 ? String(row[dateCol] || '').trim() : undefined,
        extractedSpecs: Object.keys(merged).length > 0 ? merged : undefined,
        rawText,
      });
    }
  }

  return rows;
}
