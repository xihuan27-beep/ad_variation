import PptxGenJS from 'pptxgenjs';
import type { ValidationResult } from './types';

const COLORS = {
  bg: '070C1A',
  surface: '0F1729',
  card: '162038',
  accent: '5B6EF5',
  text: 'EEF2FF',
  secondary: '8B9EC7',
  success: '10B981',
  warn: 'F59E0B',
};

function addTitleSlide(pptx: PptxGenJS, fileName: string): void {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  // Accent bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.08, h: '100%',
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });

  slide.addText('소재 제작 가이드', {
    x: 0.5, y: 1.5, w: 9, h: 0.8,
    fontSize: 32, bold: true, color: COLORS.text,
    fontFace: 'Arial',
  });

  slide.addText(`파일: ${fileName}`, {
    x: 0.5, y: 2.5, w: 9, h: 0.4,
    fontSize: 14, color: COLORS.secondary,
    fontFace: 'Arial',
  });

  slide.addText(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, {
    x: 0.5, y: 3.0, w: 9, h: 0.4,
    fontSize: 12, color: COLORS.secondary,
    fontFace: 'Arial',
  });

  slide.addText('자동 생성 | AdSpec 시스템', {
    x: 0.5, y: 4.5, w: 9, h: 0.3,
    fontSize: 10, color: '4C6591',
    fontFace: 'Arial',
  });
}

function addSpecSlide(pptx: PptxGenJS, result: ValidationResult, index: number): void {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bg };

  const { mediaSpec, finalSpecs, status } = result;
  const mediaName = mediaSpec?.mediaName || result.excelRow.mediaName;
  const productName = mediaSpec?.productName || result.excelRow.productName;
  const specs = finalSpecs || mediaSpec?.specs || result.excelRow.extractedSpecs || {};

  // Slide number
  slide.addText(`${String(index).padStart(2, '0')}`, {
    x: 8.5, y: 0.2, w: 1.2, h: 0.4,
    fontSize: 11, color: '4C6591', fontFace: 'Arial', align: 'right',
  });

  // Status badge
  const badgeColor = status === 'match' ? COLORS.success : status === 'mismatch' ? COLORS.warn : '4C6591';
  const badgeLabel = status === 'match' ? '검증 완료' : status === 'mismatch' ? '수정 적용' : '미매칭';
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.4, y: 0.25, w: 1.1, h: 0.3,
    fill: { color: badgeColor + '30' },
    line: { color: badgeColor, pt: 1 },
    rectRadius: 0.04,
  });
  slide.addText(badgeLabel, {
    x: 0.4, y: 0.25, w: 1.1, h: 0.3,
    fontSize: 9, bold: true, color: badgeColor, align: 'center', fontFace: 'Arial',
  });

  // Header
  slide.addText(mediaName, {
    x: 0.4, y: 0.65, w: 9, h: 0.45,
    fontSize: 13, color: COLORS.secondary, fontFace: 'Arial',
  });
  slide.addText(productName, {
    x: 0.4, y: 1.05, w: 9, h: 0.7,
    fontSize: 26, bold: true, color: COLORS.text, fontFace: 'Arial',
  });

  // Divider
  slide.addShape(pptx.ShapeType.line, {
    x: 0.4, y: 1.85, w: 9.2, h: 0,
    line: { color: '1E3050', pt: 1 },
  });

  // Spec rows
  const specItems: [string, string][] = [];
  if (specs.resolution) specItems.push(['해상도', specs.resolution]);
  if (specs.fileSize) specItems.push(['파일 용량', specs.fileSize]);
  if (specs.format?.length) specItems.push(['파일 형식', specs.format.join(' / ')]);
  if (specs.ratio) specItems.push(['비율', specs.ratio]);
  if (specs.duration) specItems.push(['재생 시간', specs.duration]);
  if (specs.safeArea) specItems.push(['안전 영역', specs.safeArea]);
  if (specs.textLength?.title) specItems.push(['제목 길이', `${specs.textLength.title}자 이내`]);
  if (specs.textLength?.description) specItems.push(['설명 길이', `${specs.textLength.description}자 이내`]);
  if (specs.additionalNotes) specItems.push(['추가 안내', specs.additionalNotes]);

  const startY = 2.0;
  const rowH = 0.38;

  specItems.slice(0, 8).forEach(([label, value], i) => {
    const y = startY + i * rowH;
    const isEven = i % 2 === 0;

    if (isEven) {
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.4, y, w: 9.2, h: rowH,
        fill: { color: '162038' },
        line: { color: 'transparent' },
      });
    }

    slide.addText(label, {
      x: 0.6, y: y + 0.04, w: 2.0, h: rowH - 0.08,
      fontSize: 10, color: COLORS.secondary, bold: true, fontFace: 'Arial',
      valign: 'middle',
    });
    slide.addText(value, {
      x: 2.8, y: y + 0.04, w: 6.6, h: rowH - 0.08,
      fontSize: 11, color: COLORS.text, fontFace: 'Arial',
      valign: 'middle',
    });
  });

  // Discrepancy note
  if (result.discrepancies?.length > 0) {
    const resolved = result.discrepancies.filter((d) => d.userChoice);
    if (resolved.length > 0) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.4, y: 5.0, w: 9.2, h: 0.5,
        fill: { color: COLORS.warn + '15' },
        line: { color: COLORS.warn + '40', pt: 1 },
        rectRadius: 0.04,
      });
      slide.addText(`⚠ ${resolved.length}개 항목 수정 적용 (${resolved.map((d) => d.fieldLabel).join(', ')})`, {
        x: 0.6, y: 5.0, w: 9.0, h: 0.5,
        fontSize: 9, color: COLORS.warn, fontFace: 'Arial', valign: 'middle',
      });
    }
  }
}

export async function generatePPT(results: ValidationResult[], fileName: string): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = '소재 제작 가이드';
  pptx.author = 'AdSpec System';

  addTitleSlide(pptx, fileName);

  results.forEach((result, i) => {
    addSpecSlide(pptx, result, i + 1);
  });

  const output = await pptx.write({ outputType: 'nodebuffer' });
  return output as Buffer;
}
