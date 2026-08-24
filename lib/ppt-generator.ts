import PptxGenJS from 'pptxgenjs';

import { fixedSpecAreas, formatSpec, userInputAreas, hasPsdRequirement, parseAreaCount } from './spec-db';
import type { AssetArea } from './spec-db';
import {
  areaSlotKeys,
  isItemComplete,
  resolveAsset,
  suggestedAssetFor,
  type AssetRef,
  type CampaignMeta,
  type WorkItem,
} from './campaign';
import { resolveDeadline } from './business-days';

/** 실제 제작 산출물이라 흰 배경 기준으로 인쇄·공유하기 좋은 라이트 팔레트를 쓴다 (웹 화면은 다크 유지) */
const COLOR = {
  bg: 'FFFFFF',
  card: 'F4F6FB',
  border: 'D7DEEC',
  accent: '3D4FE0',
  text: '181F36',
  secondary: '565F7C',
  muted: '8791AC',
  success: '0E8F5F',
  warn: 'B0700A',
  danger: 'D23C2C',
};

const FONT = 'Malgun Gothic';
const W = 10;
const H = 5.625;
const MARGIN = 0.4;
/** 헤더(제목·부제·마감/PSD 배지·구분선) 아래, 두 컬럼이 실제로 시작하는 y 좌표 */
const COLUMN_TOP = 1.4;
const COLUMN_MAX_H = H - MARGIN - COLUMN_TOP;

function addBackground(slide: PptxGenJS.Slide): void {
  slide.background = { color: COLOR.bg };
}

function addAccentBar(pptx: PptxGenJS, slide: PptxGenJS.Slide): void {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.08, h: H,
    fill: { color: COLOR.accent },
    line: { color: COLOR.accent },
  });
}

/** 모든 슬라이드 하단에 붙는 주의 문구 — AI가 채운 값이 섞여 있을 수 있으니 검토를 유도한다 */
function addDisclaimer(slide: PptxGenJS.Slide): void {
  slide.addText('⚠ AI는 실수할 수 있습니다. 반드시 검토하십시오.', {
    x: MARGIN, y: H - 0.32, w: W - MARGIN * 2, h: 0.26,
    fontSize: 8.5, color: COLOR.warn, fontFace: FONT, align: 'center',
  });
}

function addTitleSlide(pptx: PptxGenJS, meta: CampaignMeta, items: WorkItem[]): void {
  const slide = pptx.addSlide();
  addBackground(slide);
  addAccentBar(pptx, slide);

  slide.addText('소재 제작 가이드', {
    x: MARGIN, y: 1.5, w: W - MARGIN * 2, h: 0.8,
    fontSize: 32, bold: true, color: COLOR.text, fontFace: FONT,
  });
  slide.addText(meta.brand, {
    x: MARGIN, y: 2.3, w: W - MARGIN * 2, h: 0.5,
    fontSize: 18, color: COLOR.secondary, fontFace: FONT,
  });
  if (meta.mainCopy) {
    slide.addText(meta.mainCopy, {
      x: MARGIN, y: 2.75, w: W - MARGIN * 2, h: 0.4,
      fontSize: 13, italic: true, color: COLOR.muted, fontFace: FONT,
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
      x: MARGIN, y: 4.0, w: W - MARGIN * 2, h: 0.9,
      fontSize: 11, color: COLOR.secondary, fontFace: FONT, lineSpacingMultiple: 1.4,
    }
  );
  addDisclaimer(slide);
}

/** 매체 슬라이드 공통 머리글. continued=true 면 앞 슬라이드에 다 못 담아 이어지는 슬라이드다 */
function addHeader(pptx: PptxGenJS, slide: PptxGenJS.Slide, item: WorkItem, continued = false): void {
  addBackground(slide);
  addAccentBar(pptx, slide);

  const title = (item.rawProductName || item.rawMediaName) + (continued ? ' (계속)' : '');
  slide.addText(title, {
    x: MARGIN, y: 0.22, w: W - MARGIN * 2, h: 0.45,
    fontSize: 20, bold: true, color: COLOR.text, fontFace: FONT,
  });

  const subParts = [item.rawMediaName, item.liveSchedule ? `라이브 ${item.liveSchedule}` : ''].filter(Boolean);
  slide.addText(subParts.join('  ·  '), {
    x: MARGIN, y: 0.68, w: W - MARGIN * 2, h: 0.24,
    fontSize: 10.5, color: COLOR.secondary, fontFace: FONT,
  });

  const badgeParts: PptxGenJS.TextProps[] = [];
  if (item.deadline) {
    const resolved = resolveDeadline(item.deadline, item.liveSchedule);
    badgeParts.push({ text: `⚠ 소재 전달 기한 ${resolved.display}`, options: { color: COLOR.danger, bold: true } });
  }
  if (item.entry && hasPsdRequirement(item.entry)) {
    if (badgeParts.length) badgeParts.push({ text: '     ', options: {} });
    badgeParts.push({ text: '⚠ PSD 템플릿 참고 필요', options: { color: COLOR.warn, bold: true } });
  }
  if (badgeParts.length) {
    slide.addText(badgeParts, { x: MARGIN, y: 0.94, w: W - MARGIN * 2, h: 0.24, fontSize: 9.5, fontFace: FONT });
  }

  slide.addShape(pptx.ShapeType.line, {
    x: MARGIN, y: 1.26, w: W - MARGIN * 2, h: 0,
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
      fontSize: 13, color: COLOR.warn, fontFace: FONT, valign: 'middle',
    }
  );
  addDisclaimer(slide);
}

/** 한 슬라이드에 다 못 들어가는 항목 목록을, 높이를 재며 여러 페이지로 나눈다 — 항목을 조용히 잘라내지 않기 위함 */
function paginate<T>(blocks: T[], heightOf: (b: T) => number, maxHeight: number): T[][] {
  const pages: T[][] = [];
  let page: T[] = [];
  let y = 0;
  for (const b of blocks) {
    const h = heightOf(b) + 0.06;
    if (page.length > 0 && y + h > maxHeight) {
      pages.push(page);
      page = [];
      y = 0;
    }
    page.push(b);
    y += h;
  }
  pages.push(page);
  return pages;
}

/** DB 고정 규격 영역 하나 — specLabel에 "최소 N개" 같은 수량 요건이 있으면 N개 블록으로 펼친다 */
interface FixedBlock {
  area: AssetArea;
  slotIdx: number;
  slotCount: number;
}
function fixedBlocksOf(areas: AssetArea[]): FixedBlock[] {
  const out: FixedBlock[] = [];
  for (const area of areas) {
    const n = parseAreaCount(area.specLabel);
    for (let i = 0; i < n; i++) out.push({ area, slotIdx: i, slotCount: n });
  }
  return out;
}
/**
 * 박스를 그릴 때 쓸 가로:세로 비율. widthPx/heightPx가 없어도(예: "16:9"만 있고
 * 픽셀 치수는 안 적힌 동영상 규격) ratio 문자열에서 뽑아 쓴다 — 그래야 같은
 * "동영상" 영역인데 어떤 상품은 박스가 뜨고 어떤 상품은 텍스트만 뜨는 일이 없다.
 */
function effectiveBoxRatio(a: AssetArea): number | null {
  if (a.widthPx && a.heightPx) return a.widthPx / a.heightPx;
  const m = a.ratio?.match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) / Number(m[2]) : null;
}

/** 비율 정보(치수 또는 ratio 문자열)가 있으면 이미지든 동영상이든 박스로 그린다 */
function fixedBlockHeight(b: FixedBlock): number {
  return effectiveBoxRatio(b.area) !== null ? 1.25 : 0.75;
}

/**
 * 왼쪽 컬럼 — DB 기준 고정 규격 한 페이지분.
 *
 * IMAGE 영역은 이 DB에서 압도적으로 isUserInput: false 다 — 매체마다 파일을
 * 새로 고르는 게 아니라, 캠페인이 올린 비주얼(또는 로고)을 그 규격대로
 * 크롭해서 쓰는 구조이기 때문이다. 그래서 실제 소재가 들어갈 자리를 텍스트가
 * 아니라 업로드된 이미지를 그 비율로 크롭한 실제 미리보기로 보여준다. 동영상은
 * 실제 파일을 심지 않지만, 이미지와 똑같이 규격 비율의 박스를 그려 크기감을 준다.
 * 규격 숫자(2번째 줄)가 실무에서 가장 자주 보는 정보라 글자를 크게 둔다.
 */
function renderFixedSpecPage(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  blocks: FixedBlock[],
  meta: CampaignMeta,
  isFirstPage: boolean,
  itemIndex: number,
  overrides: Record<string, AssetRef>
): void {
  const x = MARGIN;
  const w = 4.55;
  let y = COLUMN_TOP;

  if (isFirstPage) {
    slide.addText('제작 스펙 (DB 기준)', {
      x, y, w, h: 0.3,
      fontSize: 12, bold: true, color: COLOR.accent, fontFace: FONT,
    });
    y += 0.35;
  }

  if (blocks.length === 0) {
    if (isFirstPage) {
      slide.addText('고정 규격 없음 — 전 항목 캠페인마다 입력', {
        x, y, w, h: 0.4,
        fontSize: 10, color: COLOR.muted, fontFace: FONT,
      });
    }
    return;
  }

  for (const b of blocks) {
    const a = b.area;
    const label = b.slotCount > 1 ? `${a.areaName} #${b.slotIdx + 1}` : a.areaName;
    // "집행 예시" 미리보기에서 사용자가 자동 추천을 수동으로 바꿨으면 그 소재를 우선한다 —
    // 미리보기에서 바꾼 소재가 실제 산출물(PPT)에는 반영 안 되던 문제를 고치는 부분이다.
    const overrideRef = overrides[`${itemIndex}:${a.displayOrder}`];
    const asset = overrideRef ? resolveAsset(meta, overrideRef) : suggestedAssetFor(a, meta);
    const boxRatio = effectiveBoxRatio(a);
    const hasBox = boxRatio !== null;
    const rowH = fixedBlockHeight(b);

    if (hasBox) {
      const ratio = boxRatio!;
      const boxH = 1.05;
      const boxW = Math.min(boxH * ratio, 1.6);

      if (asset) {
        slide.addImage({ data: asset.dataUrl, x, y, w: boxW, h: boxH, sizing: { type: 'cover', w: boxW, h: boxH } });
      } else {
        // 동영상이거나(항상), 이미지인데 매칭되는 비주얼이 없을 때 — 빈 박스로 크기감만 보여준다
        slide.addShape(pptx.ShapeType.rect, {
          x, y, w: boxW, h: boxH,
          fill: { color: COLOR.card },
          line: { color: COLOR.border, width: 1, dashType: 'dash' },
        });
        slide.addText(a.areaType === 'VIDEO' ? '동영상' : '이미지', {
          x, y, w: boxW, h: boxH,
          fontSize: 9, color: COLOR.muted, fontFace: FONT, align: 'center', valign: 'middle',
        });
      }

      slide.addText(
        [
          { text: label, options: { bold: true, color: COLOR.text, breakLine: true } },
          { text: formatSpec(a), options: { color: COLOR.secondary, fontSize: 11.5, breakLine: true } },
        ],
        {
          x: x + boxW + 0.12, y, w: w - boxW - 0.12, h: boxH,
          fontSize: 11, fontFace: FONT, valign: 'top', wrap: true, lineSpacingMultiple: 1.2,
        }
      );
    } else {
      slide.addText(
        [
          { text: label, options: { bold: true, color: COLOR.text, breakLine: true, bullet: true } },
          { text: formatSpec(a), options: { color: COLOR.secondary, breakLine: true, indentLevel: 1, fontSize: 11.5 } },
        ],
        {
          x, y, w, h: rowH,
          fontSize: 10.5, fontFace: FONT, valign: 'top', wrap: true, lineSpacingMultiple: 1.15,
        }
      );
    }

    y += rowH + 0.08;
  }
}

/** 확정 소재 영역 하나 — 고정 규격과 마찬가지로 수량 요건이 있으면 여러 슬롯으로 펼친다 */
interface ConfirmedBlock {
  area: AssetArea;
  key: string;
  slotIdx: number;
  slotCount: number;
}
function confirmedBlocksOf(areas: AssetArea[]): ConfirmedBlock[] {
  const out: ConfirmedBlock[] = [];
  for (const area of areas) {
    const keys = areaSlotKeys(area);
    keys.forEach((key, i) => out.push({ area, key, slotIdx: i, slotCount: keys.length }));
  }
  return out;
}
function confirmedBlockHeight(b: ConfirmedBlock): number {
  const isVisual = b.area.areaType === 'IMAGE' || b.area.areaType === 'VIDEO';
  return isVisual ? 1.3 : 0.85;
}

/**
 * 오른쪽 컬럼 — 캠페인마다 확정한 소재·문구 한 페이지분.
 *
 * 값 옆에 항상 그 항목의 규격/제약 조건(formatSpec)을 같이 보여준다 — 문구가
 * 왜 그 형태인지(예: "띄어쓰기 포함 최대 14자") 근거 없이 값만 보이면 검토가 어렵다.
 * 이미지·동영상 영역은 소재를 못 골랐어도 스펙 비율의 빈 박스를 그려서, 사람이
 * 그 자리에 뭘 채워야 하는지 바로 알 수 있게 한다.
 */
function renderConfirmedPage(
  pptx: PptxGenJS,
  slide: PptxGenJS.Slide,
  blocks: ConfirmedBlock[],
  item: WorkItem,
  meta: CampaignMeta,
  isFirstPage: boolean
): void {
  const x = 5.0;
  const w = 4.6;
  let y = COLUMN_TOP;

  if (isFirstPage) {
    slide.addText('확정 소재', {
      x, y, w, h: 0.3,
      fontSize: 12, bold: true, color: COLOR.accent, fontFace: FONT,
    });
    y += 0.4;
  }

  for (const b of blocks) {
    const a = b.area;
    const label = b.slotCount > 1 ? `${a.areaName} #${b.slotIdx + 1}` : a.areaName;
    const v = item.values[b.key];
    const asset = resolveAsset(meta, v?.assetRef);
    const isVisual = a.areaType === 'IMAGE' || a.areaType === 'VIDEO';
    const rowH = confirmedBlockHeight(b);

    slide.addText(label, {
      x, y, w: 1.3, h: rowH,
      fontSize: 10.5, bold: true, color: COLOR.text, fontFace: FONT, valign: 'top',
    });

    const contentX = x + 1.35;
    const contentW = w - 1.35;

    if (isVisual) {
      const ratio = effectiveBoxRatio(a) ?? (a.areaType === 'VIDEO' ? 16 / 9 : 1);
      const boxH = Math.min(1.0, rowH - 0.2);
      const boxW = Math.min(boxH * ratio, contentW * 0.5);

      if (a.areaType === 'IMAGE' && asset) {
        slide.addImage({ data: asset.dataUrl, x: contentX, y, w: boxW, h: boxH, sizing: { type: 'cover', w: boxW, h: boxH } });
      } else {
        // 소재를 못 골랐거나(이미지) 동영상이라 미리보기를 심지 않는 경우 — 빈 박스를 그려
        // 사람이 그 자리에 무엇을 넣어야 하는지 바로 작업할 수 있게 한다
        slide.addShape(pptx.ShapeType.rect, {
          x: contentX, y, w: boxW, h: boxH,
          fill: { color: COLOR.card },
          line: { color: asset ? COLOR.accent : COLOR.warn, width: 1, dashType: asset ? 'solid' : 'dash' },
        });
        slide.addText(a.areaType === 'VIDEO' ? '동영상\n별도 첨부' : '직접 작업\n필요', {
          x: contentX, y, w: boxW, h: boxH,
          fontSize: 9, color: asset ? COLOR.accent : COLOR.warn, fontFace: FONT, align: 'center', valign: 'middle',
        });
      }

      const nameText = a.areaType === 'VIDEO' && asset ? `${asset.name} (동영상 — 별도 첨부 필요)` : asset?.name ?? '(미확정)';
      slide.addText(
        [
          { text: nameText, options: { color: asset ? COLOR.secondary : COLOR.warn, breakLine: true } },
          { text: formatSpec(a), options: { color: COLOR.muted, fontSize: 10.5, breakLine: true } },
        ],
        {
          x: contentX + boxW + 0.1, y, w: contentW - boxW - 0.1, h: boxH,
          fontSize: 10, fontFace: FONT, valign: 'top', wrap: true, lineSpacingMultiple: 1.15,
        }
      );
    } else {
      const text = v?.value?.trim() || '(미확정)';
      slide.addText(
        [
          { text, options: { color: v?.value?.trim() ? COLOR.text : COLOR.warn, breakLine: true } },
          { text: formatSpec(a), options: { color: COLOR.muted, fontSize: 10.5, breakLine: true } },
        ],
        {
          x: contentX, y, w: contentW, h: rowH,
          fontSize: 10, fontFace: FONT, valign: 'top', wrap: true, lineSpacingMultiple: 1.15,
        }
      );
    }

    y += rowH + 0.06;
  }
}

function addMediaSlide(
  pptx: PptxGenJS,
  item: WorkItem,
  meta: CampaignMeta,
  itemIndex: number,
  overrides: Record<string, AssetRef>
): void {
  if (!item.entry) {
    addUnmatchedSlide(pptx, item);
    return;
  }

  const fixedBlocks = fixedBlocksOf(fixedSpecAreas(item.entry));
  const confirmedBlocks = confirmedBlocksOf(userInputAreas(item.entry));
  const fixedPages = paginate(fixedBlocks, fixedBlockHeight, COLUMN_MAX_H);
  const confirmedPages = paginate(confirmedBlocks, confirmedBlockHeight, COLUMN_MAX_H);
  const pageCount = Math.max(fixedPages.length, confirmedPages.length, 1);

  for (let p = 0; p < pageCount; p++) {
    const slide = pptx.addSlide();
    addHeader(pptx, slide, item, p > 0);
    renderFixedSpecPage(pptx, slide, fixedPages[p] ?? [], meta, p === 0, itemIndex, overrides);
    renderConfirmedPage(pptx, slide, confirmedPages[p] ?? [], item, meta, p === 0);

    if (p === pageCount - 1 && !isItemComplete(item)) {
      slide.addText('⚠ 확정되지 않은 항목이 있습니다', {
        x: MARGIN, y: H - 0.6, w: W - MARGIN * 2, h: 0.24,
        fontSize: 9, color: COLOR.warn, fontFace: FONT,
      });
    }
    addDisclaimer(slide);
  }
}

function addSummarySlide(pptx: PptxGenJS, items: WorkItem[]): void {
  const slide = pptx.addSlide();
  addBackground(slide);
  addAccentBar(pptx, slide);

  slide.addText('집행 매체 요약', {
    x: MARGIN, y: 0.3, w: W - MARGIN * 2, h: 0.4,
    fontSize: 16, bold: true, color: COLOR.text, fontFace: FONT,
  });

  const rows = items.map((it) => {
    const deadlineText = it.deadline ? resolveDeadline(it.deadline, it.liveSchedule).display : '-';
    return [
      { text: it.rawProductName || it.rawMediaName, options: { color: COLOR.text, fontSize: 9.5 } },
      { text: it.rawMediaName, options: { color: COLOR.secondary, fontSize: 9.5 } },
      { text: deadlineText, options: { color: COLOR.secondary, fontSize: 9.5 } },
      {
        text: isItemComplete(it) ? '완료' : '미완료',
        options: { color: isItemComplete(it) ? COLOR.success : COLOR.warn, fontSize: 9.5, bold: true },
      },
    ];
  });

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
      fontFace: FONT,
      border: { type: 'solid', color: COLOR.border, pt: 0.5 },
      fill: { color: COLOR.card },
      autoPage: true,
    }
  );

  addDisclaimer(slide);
}

/**
 * 캠페인의 매체별 소재 제작 가이드 PPT를 만든다.
 *
 * 매체마다 최소 한 슬라이드씩: 왼쪽은 DB 기준 고정 규격, 오른쪽은 캠페인에서 확정한
 * 소재·문구다. 한 슬라이드에 다 안 들어가면(항목이 많은 상품) 자르지 않고 이어지는
 * 슬라이드를 추가한다. 이미지는 실제 업로드된 파일을 그대로 삽입해 어떤 소재가 어떤
 * 비율로 크롭될지 바로 확인할 수 있게 하고, 아직 못 고른 이미지·동영상 자리는 빈
 * 박스로 표시해 사람이 바로 작업할 수 있게 한다.
 */
export async function generateGuidePpt(
  meta: CampaignMeta,
  items: WorkItem[],
  /** "집행 예시" 미리보기에서 사용자가 수동으로 바꾼 소재. key: `${item 인덱스}:${area.displayOrder}` */
  fixedAssetOverrides: Record<string, AssetRef> = {}
): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  addTitleSlide(pptx, meta, items);
  items.forEach((item, i) => {
    addMediaSlide(pptx, item, meta, i, fixedAssetOverrides);
  });
  addSummarySlide(pptx, items);

  const buf = await pptx.write({ outputType: 'nodebuffer' });
  return buf as Buffer;
}
