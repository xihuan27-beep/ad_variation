import PptxGenJS from 'pptxgenjs';

import { fixedSpecAreas, formatSpec, userInputAreas } from './spec-db';
import type { AssetArea } from './spec-db';
import { isItemComplete, resolveAsset, suggestedAssetFor, type CampaignMeta, type WorkItem } from './campaign';

const COLOR = {
  bg: '070C1A',
  card: '162038',
  border: '273D60',
  accent: '5B6EF5',
  text: 'EEF2FF',
  secondary: '8B9EC7',
  muted: '4C6591',
  success: '10B981',
  warn: 'F59E0B',
  danger: 'EF4444',
};

const W = 10;
const H = 5.625;
const MARGIN = 0.4;

function addBackground(slide: PptxGenJS.Slide): void {
  slide.background = { color: COLOR.bg };
}

function addAccentBar(pptx: PptxGenJS, slide: PptxGenJS.Slide): void {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 0.08,
    h: H,
    fill: { color: COLOR.accent },
    line: { color: COLOR.accent },
  });
}

function addTitleSlide(pptx: PptxGenJS, meta: CampaignMeta, items: WorkItem[]): void {
  const slide = pptx.addSlide();
  addBackground(slide);
  addAccentBar(pptx, slide);

  slide.addText('소재 제작 가이드', {
    x: MARGIN, y: 1.5, w: W - MARGIN * 2, h: 0.8,
    fontSize: 32, bold: true, color: COLOR.text, fontFace: 'Malgun Gothic',
  });
  slide.addText(meta.brand, {
    x: MARGIN, y: 2.3, w: W - MARGIN * 2, h: 0.5,
    fontSize: 18, color: COLOR.secondary, fontFace: 'Malgun Gothic',
  });
  if (meta.mainCopy) {
    slide.addText(meta.mainCopy, {
      x: MARGIN, y: 2.75, w: W - MARGIN * 2, h: 0.4,
      fontSize: 13, italic: true, color: COLOR.muted, fontFace: 'Malgun Gothic',
    });
  }

  const done = items.filter((i) => isItemComplete(i)).length;
  slide.addText(
    [
      { text: `엑셀 파일: ${meta.fileName ?? '-'}`, options: { breakLine: true } },
      { text: `집행 매체: ${items.length}건 (확정 완료 ${done}건)`, options: { breakLine: true } },
      { text: `생성일: ${new Date().toLocaleDateString('ko-KR')}` },
    ],
    {
      x: MARGIN, y: 4.4, w: W - MARGIN * 2, h: 0.9,
      fontSize: 11, color: COLOR.secondary, fontFace: 'Malgun Gothic', lineSpacingMultiple: 1.4,
    }
  );
}

/** 매체 슬라이드 공통 머리글 — 매칭 성공/실패 모두 동일한 자리에 그린다 */
function addHeader(pptx: PptxGenJS, slide: PptxGenJS.Slide, item: WorkItem): void {
  addBackground(slide);
  addAccentBar(pptx, slide);

  slide.addText(item.rawProductName || item.rawMediaName, {
    x: MARGIN, y: 0.25, w: W - MARGIN * 2, h: 0.5,
    fontSize: 20, bold: true, color: COLOR.text, fontFace: 'Malgun Gothic',
  });

  const subParts = [item.rawMediaName, item.deadline ? `소재 전달 기한 ${item.deadline}` : '', item.liveSchedule ? `라이브 ${item.liveSchedule}` : ''].filter(Boolean);
  slide.addText(subParts.join('  ·  '), {
    x: MARGIN, y: 0.75, w: W - MARGIN * 2, h: 0.3,
    fontSize: 11, color: COLOR.secondary, fontFace: 'Malgun Gothic',
  });

  slide.addShape(pptx.ShapeType.line, {
    x: MARGIN, y: 1.12, w: W - MARGIN * 2, h: 0,
    line: { color: COLOR.border, width: 0.75 },
  });
}

function addUnmatchedSlide(pptx: PptxGenJS, item: WorkItem): void {
  const slide = pptx.addSlide();
  addHeader(pptx, slide, item);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: MARGIN, y: 1.5, w: W - MARGIN * 2, h: 1,
    fill: { color: COLOR.card },
    line: { color: COLOR.warn, width: 1 },
    rectRadius: 0.06,
  });
  slide.addText(
    '이 매체는 마스터 DB에서 매칭되는 상품을 찾지 못했습니다. 매체명과 상품명을 다시 확인해 주세요.',
    {
      x: MARGIN + 0.2, y: 1.7, w: W - MARGIN * 2 - 0.4, h: 0.6,
      fontSize: 13, color: COLOR.warn, fontFace: 'Malgun Gothic', valign: 'middle',
    }
  );
}

/**
 * 왼쪽 컬럼 — DB 기준 고정 규격.
 *
 * IMAGE 영역은 이 DB에서 압도적으로 isUserInput: false 다 — 매체마다 파일을
 * 새로 고르는 게 아니라, 캠페인이 올린 메인 비주얼(또는 로고)을 그 규격대로
 * 크롭해서 쓰는 구조이기 때문이다. 그래서 실제 소재가 들어갈 자리를 텍스트가
 * 아니라 업로드된 이미지를 그 비율로 크롭한 실제 미리보기로 보여준다.
 */
function addFixedSpecColumn(pptx: PptxGenJS, slide: PptxGenJS.Slide, areas: AssetArea[], meta: CampaignMeta): void {
  const x = MARGIN;
  const w = 4.55;
  let y = 1.35;

  slide.addText('제작 스펙 (DB 기준)', {
    x, y, w, h: 0.3,
    fontSize: 12, bold: true, color: COLOR.accent, fontFace: 'Malgun Gothic',
  });
  y += 0.35;

  if (areas.length === 0) {
    slide.addText('고정 규격 없음 — 전 항목 캠페인마다 입력', {
      x, y, w, h: 0.4,
      fontSize: 10, color: COLOR.muted, fontFace: 'Malgun Gothic',
    });
    return;
  }

  for (const a of areas) {
    const asset = suggestedAssetFor(a, meta);
    const hasThumb = !!asset && !!a.widthPx && !!a.heightPx;
    const rowH = hasThumb ? 0.95 : 0.5;
    if (y + rowH > H - MARGIN) break; // 남은 공간이 없으면 여기서 멈춘다 — 화면에서 전체 확인 가능

    if (hasThumb) {
      const ratio = a.widthPx! / a.heightPx!;
      const boxH = 0.8;
      const boxW = Math.min(boxH * ratio, 1.6);
      slide.addImage({ data: asset!.dataUrl, x, y, w: boxW, h: boxH, sizing: { type: 'cover', w: boxW, h: boxH } });
      slide.addText(
        [
          { text: a.areaName, options: { bold: true, color: COLOR.text, breakLine: true } },
          { text: formatSpec(a), options: { color: COLOR.secondary, fontSize: 8.5 } },
        ],
        {
          x: x + boxW + 0.12, y, w: w - boxW - 0.12, h: boxH,
          fontSize: 9.5, fontFace: 'Malgun Gothic', valign: 'top', wrap: true, lineSpacingMultiple: 1.15,
        }
      );
    } else {
      slide.addText(
        [
          { text: a.areaName, options: { bold: true, color: COLOR.text, breakLine: true, bullet: true } },
          { text: formatSpec(a), options: { color: COLOR.secondary, breakLine: true, indentLevel: 1 } },
        ],
        {
          x, y, w, h: rowH,
          fontSize: 9, fontFace: 'Malgun Gothic', valign: 'top', wrap: true, lineSpacingMultiple: 1.1,
        }
      );
    }

    y += rowH + 0.06;
  }
}

/** 오른쪽 컬럼 — 캠페인마다 확정한 소재·문구. 이미지는 실제 업로드본을 그대로 삽입한다 */
function addConfirmedColumn(pptx: PptxGenJS, slide: PptxGenJS.Slide, item: WorkItem, meta: CampaignMeta): void {
  if (!item.entry) return;
  const areas = userInputAreas(item.entry);
  const x = 5.0;
  const w = 4.6;
  let y = 1.35;

  slide.addText('확정 소재', {
    x, y, w, h: 0.3,
    fontSize: 12, bold: true, color: COLOR.accent, fontFace: 'Malgun Gothic',
  });
  y += 0.4;

  for (const a of areas) {
    const v = item.values[a.displayOrder];
    const asset = resolveAsset(meta, v?.assetRef);
    const rowH = a.areaType === 'IMAGE' && asset ? 1.0 : 0.42;

    if (y + rowH > H - MARGIN) break; // 남은 공간이 없으면 여기서 멈춘다 — 나머지는 화면에서 확인

    slide.addText(a.areaName, {
      x, y, w: 1.3, h: rowH,
      fontSize: 9, bold: true, color: COLOR.text, fontFace: 'Malgun Gothic', valign: 'top',
    });

    const contentX = x + 1.35;
    const contentW = w - 1.35;

    if (a.areaType === 'IMAGE' && asset) {
      // 스펙 비율대로 축소해 크롭될 형태를 그대로 보여준다
      const ratio = a.widthPx && a.heightPx ? a.widthPx / a.heightPx : 1;
      const boxH = Math.min(0.9, rowH - 0.1);
      const boxW = Math.min(boxH * ratio, contentW);
      slide.addImage({ data: asset.dataUrl, x: contentX, y, w: boxW, h: boxH, sizing: { type: 'cover', w: boxW, h: boxH } });
      slide.addText(asset.name, {
        x: contentX + boxW + 0.1, y, w: contentW - boxW - 0.1, h: boxH,
        fontSize: 8.5, color: COLOR.secondary, fontFace: 'Malgun Gothic', valign: 'middle', wrap: true,
      });
    } else if (a.areaType === 'VIDEO') {
      // 동영상은 미리보기를 심지 않고 파일명과 확인 상태만 남긴다
      const label = asset ? `${asset.name} (동영상 — 별도 첨부 필요)` : '(미확정)';
      slide.addText(label, {
        x: contentX, y, w: contentW, h: rowH,
        fontSize: 9.5, color: asset ? COLOR.secondary : COLOR.warn, fontFace: 'Malgun Gothic', valign: 'top', wrap: true,
      });
    } else {
      const text = v?.value?.trim() || '(미확정)';
      slide.addText(text, {
        x: contentX, y, w: contentW, h: rowH,
        fontSize: 9.5, color: v?.value?.trim() ? COLOR.text : COLOR.warn, fontFace: 'Malgun Gothic', valign: 'top', wrap: true,
      });
    }

    y += rowH + 0.06;
  }
}

function addMediaSlide(pptx: PptxGenJS, item: WorkItem, meta: CampaignMeta): void {
  const slide = pptx.addSlide();
  addHeader(pptx, slide, item);
  if (!item.entry) return;
  addFixedSpecColumn(pptx, slide, fixedSpecAreas(item.entry), meta);
  addConfirmedColumn(pptx, slide, item, meta);

  if (!isItemComplete(item)) {
    slide.addText('⚠ 확정되지 않은 항목이 있습니다', {
      x: MARGIN, y: H - 0.35, w: W - MARGIN * 2, h: 0.3,
      fontSize: 9, color: COLOR.warn, fontFace: 'Malgun Gothic',
    });
  }
}

function addSummarySlide(pptx: PptxGenJS, items: WorkItem[]): void {
  const slide = pptx.addSlide();
  addBackground(slide);
  addAccentBar(pptx, slide);

  slide.addText('집행 매체 요약', {
    x: MARGIN, y: 0.3, w: W - MARGIN * 2, h: 0.4,
    fontSize: 16, bold: true, color: COLOR.text, fontFace: 'Malgun Gothic',
  });

  const rows = items.map((it) => [
    { text: it.rawProductName || it.rawMediaName, options: { color: COLOR.text, fontSize: 9.5 } },
    { text: it.rawMediaName, options: { color: COLOR.secondary, fontSize: 9.5 } },
    { text: it.deadline ?? '-', options: { color: COLOR.secondary, fontSize: 9.5 } },
    {
      text: isItemComplete(it) ? '완료' : '미완료',
      options: { color: isItemComplete(it) ? COLOR.success : COLOR.warn, fontSize: 9.5, bold: true },
    },
  ]);

  slide.addTable(
    [
      [
        { text: '매체/상품', options: { bold: true, color: COLOR.accent, fontSize: 10 } },
        { text: '매체', options: { bold: true, color: COLOR.accent, fontSize: 10 } },
        { text: '전달 기한', options: { bold: true, color: COLOR.accent, fontSize: 10 } },
        { text: '상태', options: { bold: true, color: COLOR.accent, fontSize: 10 } },
      ],
      ...rows,
    ],
    {
      x: MARGIN, y: 0.85, w: W - MARGIN * 2,
      fontFace: 'Malgun Gothic',
      border: { type: 'solid', color: COLOR.border, pt: 0.5 },
      fill: { color: COLOR.card },
      autoPage: true,
    }
  );
}

/**
 * 캠페인의 매체별 소재 제작 가이드 PPT를 만든다.
 *
 * 매체마다 한 슬라이드씩: 왼쪽은 DB 기준 고정 규격, 오른쪽은 캠페인에서 확정한
 * 소재·문구다. 이미지는 실제 업로드된 파일을 그대로 삽입해, 어떤 소재가 어떤
 * 비율로 크롭될지 슬라이드에서 바로 확인할 수 있게 한다. 동영상은 미리보기를
 * 심지 않고 파일명만 남긴다 — PPT 안에 동영상 데이터를 안정적으로 심는 방법이
 * 마땅치 않고, 실제로도 동영상 파일은 별도 전달되는 경우가 많다.
 */
export async function generateGuidePpt(meta: CampaignMeta, items: WorkItem[]): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  addTitleSlide(pptx, meta, items);
  for (const item of items) {
    if (!item.entry) addUnmatchedSlide(pptx, item);
    else addMediaSlide(pptx, item, meta);
  }
  addSummarySlide(pptx, items);

  const buf = await pptx.write({ outputType: 'nodebuffer' });
  return buf as Buffer;
}
