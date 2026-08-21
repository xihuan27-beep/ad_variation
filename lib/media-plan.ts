/**
 * 매체 기획 엑셀(미디어 플랜) 파서
 *
 * 실제 기획 엑셀은 오버뷰 시트 하나에 집행 매체 목록이 들어가고, 매체별 상세
 * 가이드는 별도 시트로 붙는다. 이 파서는 오버뷰 시트만 읽는다.
 *
 * 실제 파일에서 확인한 구조적 특징:
 *  - 헤더가 첫 행이 아니다 (제목·주의사항이 위에 몇 줄 있다)
 *  - 매체 열은 같은 매체의 연속 행에서 비어 있다 (첫 행에만 적는다)
 *  - 소재 전달 기한도 매체 단위로 첫 행에만 적는다
 *  - 시트 하단에 빈 행이 수백 줄 이어진다
 */

import * as XLSX from 'xlsx';

export interface MediaPlanRow {
  /** 엑셀의 No. 열 */
  no?: number;
  /** 엑셀에 적힌 매체 표기 (연속 행은 위 값을 이어받는다) */
  mediaName: string;
  /** 엑셀에 적힌 상품 표기 */
  productName: string;
  /** 라이브 일정 */
  liveSchedule?: string;
  /** 소재 전달 기한 */
  assetDeadline?: string;
  note?: string;
  /** 소재 유형 표기 (Video / Image 등) — 같은 지면의 영상·이미지 규격을 가르는 데 쓴다 */
  unit?: string;
  sheetName: string;
  /** 원본 엑셀 행 번호 (1-based) — 사용자가 엑셀에서 찾아보게 하려면 필요 */
  excelRow: number;
}

function norm(v: unknown): string {
  return String(v ?? '').trim();
}

/** 헤더 비교용 — 공백·줄바꿈을 없애고 소문자로 */
function normHeader(v: unknown): string {
  return String(v ?? '').toLowerCase().replace(/\s+/g, '');
}

/** Excel 날짜 시리얼의 기준일 (1899-12-30) */
const EXCEL_EPOCH_MS = Date.UTC(1899, 11, 30);

/**
 * 날짜 열의 값을 사람이 읽는 형태로 만든다.
 *
 * 날짜 셀이 서식을 잃으면 "9/7" 대신 시리얼 값 37141 로 들어온다. 그대로 두면
 * 화면에 숫자가 그대로 노출되므로, 날짜로 보이는 5자리 수는 되돌린다.
 * 기간·개수 같은 일반 숫자를 건드리지 않도록 범위를 좁게 잡는다 (1954~2064).
 */
function formatDateCell(v: string): string {
  if (!/^\d{5}$/.test(v)) return v;
  const serial = Number(v);
  if (serial < 20000 || serial > 60000) return v;
  const d = new Date(EXCEL_EPOCH_MS + serial * 86400000);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

/**
 * 헤더 키워드.
 *
 * 기획 엑셀은 국문/영문 양식이 모두 쓰인다. 키워드는 앞에 올수록 우선하므로
 * 좁은 표현을 먼저 둔다 — 예를 들어 'Media Guide'(가이드 링크) 열이
 * 'Media'(매체) 열로 잘못 잡히지 않도록, 실제 매체 열이 앞에 오는 순서를 이용한다.
 */
const KW = {
  media: ['매체', 'mediachannel', 'media', '채널', 'channel'],
  product: ['상품', 'product', '지면', 'unit'],
  deadline: ['전달기한', '소재전달', '기한', '마감', '데드라인', 'scheduleddelivery', 'deliverydate', 'delivery'],
  live: ['라이브', '일정', '집행', '기간', 'launchdate', 'launch', 'livedate'],
  note: ['비고', '메모', 'notes', 'note'],
  unit: ['unit', '소재유형', '소재 유형', '유형', 'assettype', 'creativetype'],
} as const;

/** No. 열은 완전일치로만 찾는다 — 'Notes' 가 'no' 로 잡히는 사고를 막는다 */
const NO_HEADERS = new Set(['no.', 'no', '번호', '#', 'no·']);

/**
 * 헤더 행에서 열 위치를 찾는다.
 * `exclude` 로 이미 배정된 열을 제외해, '소재 전달 기한' 이 '소재' 키워드 때문에
 * 상품 열로 잘못 잡히는 식의 충돌을 막는다.
 */
function findCol(headers: string[], keywords: readonly string[], exclude: Set<number> = new Set()): number {
  for (const kw of keywords) {
    const idx = headers.findIndex((h, i) => !exclude.has(i) && normHeader(h).includes(kw));
    if (idx >= 0) return idx;
  }
  return -1;
}

function hasAny(row: unknown[], keywords: readonly string[]): boolean {
  return row.some((c) => keywords.some((k) => normHeader(c).includes(k)));
}

/** 매체와 상품 열을 동시에 가진 행이 오버뷰 시트의 헤더다 */
function findHeaderRow(rows: unknown[][]): number {
  return rows.findIndex((r) => hasAny(r, KW.media) && hasAny(r, KW.product));
}

/** 시트 하나에서 집행 매체 목록을 읽는다. 오버뷰 시트가 아니면 빈 배열. */
function parseSheet(sheetName: string, rows: unknown[][]): MediaPlanRow[] {
  const headerIdx = findHeaderRow(rows);
  if (headerIdx === -1) return [];

  const headers = rows[headerIdx].map((c) => String(c ?? ''));
  const used = new Set<number>();

  const take = (keywords: readonly string[]): number => {
    const idx = findCol(headers, keywords, used);
    if (idx >= 0) used.add(idx);
    return idx;
  };

  // 배정 순서가 중요하다 — 먼저 배정된 열은 뒤에서 다시 쓰이지 않는다
  const mediaCol = take(KW.media);
  const productCol = take(KW.product);
  const noCol = headers.findIndex((h, i) => !used.has(i) && NO_HEADERS.has(normHeader(h)));
  if (noCol >= 0) used.add(noCol);
  const deadlineCol = take(KW.deadline);
  const liveCol = take(KW.live);
  const noteCol = take(KW.note);
  const unitCol = take(KW.unit);

  if (mediaCol < 0 || productCol < 0) return [];

  const out: MediaPlanRow[] = [];
  let lastMedia = '';
  let lastDeadline = '';
  let lastUnit = '';

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const media = norm(row[mediaCol]);
    const product = norm(row[productCol]);

    // 매체·상품이 모두 비면 데이터 행이 아니다 (하단 빈 행, 구분선 등)
    if (!media && !product) continue;

    // 연속 행은 위 매체를 이어받는다
    if (media) lastMedia = media;
    const deadline = deadlineCol >= 0 ? formatDateCell(norm(row[deadlineCol])) : '';
    if (deadline) lastDeadline = deadline;
    // 소재 유형도 매체 단위로 첫 행에만 적히므로 이어받는다
    const unit = unitCol >= 0 ? norm(row[unitCol]) : '';
    if (unit) lastUnit = unit;

    // 매체만 있고 상품이 없는 행은 그룹 머리글일 뿐 집행 건이 아니다
    if (!product) continue;

    const noRaw = noCol >= 0 ? norm(row[noCol]) : '';
    const noNum = Number(noRaw);

    out.push({
      no: noRaw !== '' && Number.isFinite(noNum) ? noNum : undefined,
      // 매체명에도 줄바꿈이 섞인다 (예: "Meta\n(IG/FB)")
      mediaName: lastMedia.replace(/\s*\n\s*/g, ' ').trim(),
      // 상품명에 줄바꿈·부연설명이 섞여 있어 한 줄로 정리한다
      productName: product.replace(/\s*\n\s*/g, ' ').trim(),
      liveSchedule: liveCol >= 0 ? formatDateCell(norm(row[liveCol])) || undefined : undefined,
      assetDeadline: lastDeadline || undefined,
      note: noteCol >= 0 ? norm(row[noteCol]) || undefined : undefined,
      unit: unitCol >= 0 ? lastUnit || undefined : undefined,
      sheetName,
      excelRow: i + 1,
    });
  }

  return out;
}

/**
 * 미디어 플랜 엑셀에서 집행 매체 목록을 뽑는다.
 * 오버뷰 시트를 못 찾으면 빈 배열을 돌려준다 — 호출부에서 안내해야 한다.
 */
export function parseMediaPlan(buffer: ArrayBuffer): MediaPlanRow[] {
  const wb = XLSX.read(buffer, { type: 'array' });

  // 여러 시트가 조건을 만족할 수 있으니 가장 많은 집행 건을 담은 시트를 택한다
  let best: MediaPlanRow[] = [];
  for (const name of wb.SheetNames) {
    // raw:false 로 셀의 표시 서식을 그대로 읽는다. 날짜를 raw 로 읽으면
    // "9/7" 이 시리얼 값 37141 로 들어와 화면에 그대로 노출된다.
    const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[name], {
      header: 1,
      defval: '',
      raw: false,
    });
    if (!rows.length) continue;
    const parsed = parseSheet(name, rows);
    if (parsed.length > best.length) best = parsed;
  }
  return best;
}
