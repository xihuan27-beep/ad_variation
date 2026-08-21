/**
 * 마스터 스펙 조회 레이어
 *
 * lib/spec-data.ts 의 계층 구조(매체 > 상품 > 영역)를 앱에서 쓰기 좋은
 * 평탄한 형태로 펼치고, 엑셀에 적힌 임의 표기를 정식 상품으로 연결한다.
 */

import Fuse from 'fuse.js';
import { MEDIA_DATA } from './spec-data';
import type { AssetArea, AssetAreaType } from './spec-data';
import { META_PLACEMENT_PRODUCTS } from './meta-specs.generated';

export type { AssetArea, AssetAreaType };

/** 매체 + 상품을 하나로 펼친 조회 단위 */
export interface SpecEntry {
  id: string;
  mediaName: string;
  mediaAliases: string[];
  productName: string;
  productAliases: string[];
  areas: AssetArea[];
  /** 검색용: 매체·상품·별칭을 모두 합친 문자열 */
  searchText: string;
}

function makeId(mediaName: string, productName: string): string {
  return `${mediaName}::${productName}`
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Meta 게재위치별 규격은 가이드 PDF 에서 자동 생성한다 (lib/meta-specs.generated.ts).
 * 손으로 옮기기에는 형식 × 게재위치 조합이 너무 많아 실수가 나기 쉽다.
 */
const WITH_GENERATED = MEDIA_DATA.map((media) =>
  media.mediaName === 'Meta'
    ? { ...media, products: [...media.products, ...META_PLACEMENT_PRODUCTS] }
    : media
);

const ENTRIES: SpecEntry[] = WITH_GENERATED.flatMap((media) =>
  media.products.map((product) => ({
    id: makeId(media.mediaName, product.name),
    mediaName: media.mediaName,
    mediaAliases: media.mediaAliases,
    productName: product.name,
    productAliases: product.aliases,
    areas: [...product.areas].sort((a, b) => a.displayOrder - b.displayOrder),
    searchText: [media.mediaName, ...media.mediaAliases, product.name, ...product.aliases].join(' '),
  }))
);

export function getAllEntries(): SpecEntry[] {
  return ENTRIES;
}

export function getEntryById(id: string): SpecEntry | undefined {
  return ENTRIES.find((e) => e.id === id);
}

export function getMediaNames(): string[] {
  return Array.from(new Set(ENTRIES.map((e) => e.mediaName)));
}

/** 사용자가 캠페인마다 직접 입력해야 하는 영역 */
export function userInputAreas(entry: SpecEntry): AssetArea[] {
  return entry.areas.filter((a) => a.isUserInput);
}

/** DB가 고정으로 제공하는 규격 영역 */
export function fixedSpecAreas(entry: SpecEntry): AssetArea[] {
  return entry.areas.filter((a) => !a.isUserInput);
}

/** 영상 소재가 포함된 상품인지 */
export function hasVideo(entry: SpecEntry): boolean {
  return entry.areas.some((a) => a.areaType === 'VIDEO');
}

const PRODUCT_KEYS = [
  { name: 'productName', weight: 0.6 },
  { name: 'productAliases', weight: 0.4 },
];

const PRODUCT_OPTS = { keys: PRODUCT_KEYS, threshold: 0.5, ignoreLocation: true, includeScore: true };

/** 매체 단위 후보 좁히기용 */
interface MediaKey {
  mediaName: string;
  aliases: string[];
}

const MEDIA_KEYS: MediaKey[] = Array.from(
  ENTRIES.reduce((acc, e) => {
    if (!acc.has(e.mediaName)) acc.set(e.mediaName, { mediaName: e.mediaName, aliases: e.mediaAliases });
    return acc;
  }, new Map<string, MediaKey>()).values()
);

const mediaFuse = new Fuse(MEDIA_KEYS, {
  keys: [
    { name: 'mediaName', weight: 0.5 },
    { name: 'aliases', weight: 0.5 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
});

/** 공백·기호를 지우고 소문자로 — "NaverGFA" 와 "Naver GFA" 를 같게 본다 */
function normKey(s: string): string {
  return s.toLowerCase().replace(/[\s_\-·/()]+/g, '');
}

/** 정규화 완전일치용 사전. 매체명과 모든 별칭을 담는다. */
const MEDIA_EXACT = new Map<string, string>();
for (const m of MEDIA_KEYS) {
  MEDIA_EXACT.set(normKey(m.mediaName), m.mediaName);
  for (const a of m.aliases) MEDIA_EXACT.set(normKey(a), m.mediaName);
}

/**
 * 퍼지 매체 해석을 받아들이는 최소 점수.
 * 짧은 표기는 bitap 매칭이 쉽게 오작동하므로 (예: "OOH" ↔ "Webtoon" 이 0.77)
 * 오탈자 교정 용도로만 남기고 기준을 높게 잡는다.
 */
const MIN_MEDIA_SCORE = 0.85;

/** 정규화 후 한쪽이 다른 쪽을 포함하면 같은 매체로 본다 ("GFA" → "Naver GFA") */
function containmentMatch(q: string): string | null {
  const nq = normKey(q);
  if (nq.length < 2) return null;

  let best: { name: string; diff: number } | null = null;
  for (const [key, name] of MEDIA_EXACT) {
    if (key.length < 2) continue;
    if (!key.includes(nq) && !nq.includes(key)) continue;
    const diff = Math.abs(key.length - nq.length);
    if (!best || diff < best.diff) best = { name, diff };
  }
  return best ? best.name : null;
}

const globalProductFuse = new Fuse(ENTRIES, PRODUCT_OPTS);

const byMediaFuse = new Map<string, Fuse<SpecEntry>>();
function productFuseFor(mediaName: string): Fuse<SpecEntry> {
  let f = byMediaFuse.get(mediaName);
  if (!f) {
    f = new Fuse(ENTRIES.filter((e) => e.mediaName === mediaName), PRODUCT_OPTS);
    byMediaFuse.set(mediaName, f);
  }
  return f;
}

/** 매체 안에서 상품을 못 찾았을 때 쓰는 느슨한 검색 — 매체를 이탈하는 것보다 낫다 */
const byMediaLooseFuse = new Map<string, Fuse<SpecEntry>>();
function looseProductFuseFor(mediaName: string): Fuse<SpecEntry> {
  let f = byMediaLooseFuse.get(mediaName);
  if (!f) {
    f = new Fuse(ENTRIES.filter((e) => e.mediaName === mediaName), { ...PRODUCT_OPTS, threshold: 0.85 });
    byMediaLooseFuse.set(mediaName, f);
  }
  return f;
}

export interface SpecMatch {
  entry: SpecEntry;
  /** 0~1, 높을수록 정확한 매칭 */
  score: number;
}

/**
 * 상품명 검색어의 변형을 만든다.
 *
 * 기획 엑셀의 상품 표기에는 DB 상품명에 없는 수식어가 자주 붙는다
 * ("택시 핀테마 (1/3)", "대리 핀테마 (성인타게팅)", "New 택시 호출중 배너").
 * 원문 그대로만 검색하면 이미 DB에 있는 상품인데도 점수가 크게 떨어진다.
 * 원문과 정리본을 모두 검색해 가장 높은 점수를 쓴다.
 */
function queryVariants(product: string): string[] {
  const variants = [product];

  // 괄호 안 수식어 제거 — 회차 (1/3), 타게팅 (성인타게팅), 조합 (VA+DA) 등
  const noParens = product.replace(/[([{][^)\]}]*[)\]}]/g, ' ').replace(/\s+/g, ' ').trim();
  if (noParens && noParens !== product) variants.push(noParens);

  // 구분자를 공백으로 풀고 관용적인 접두어를 떼어 낸다
  const loosened = noParens
    .replace(/[_/\-—·]+/g, ' ')
    .replace(/^(new|신규)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (loosened && !variants.includes(loosened)) variants.push(loosened);

  return variants;
}

/** 여러 검색어 변형의 결과를 합쳐 점수 내림차순으로 돌려준다 */
function rank(fuse: Fuse<SpecEntry>, queries: string[], limit = 8): SpecMatch[] {
  const byId = new Map<string, SpecMatch>();
  for (const q of queries) {
    for (const hit of fuse.search(q, { limit })) {
      const score = 1 - (hit.score ?? 1);
      const prev = byId.get(hit.item.id);
      if (!prev || score > prev.score) byId.set(hit.item.id, { entry: hit.item, score });
    }
  }
  return [...byId.values()].sort((a, b) => b.score - a.score);
}

/**
 * 생성된 Meta 상품명에서 광고 형식을 읽는다 ("인지도 — 동영상 (Facebook 피드)").
 * 한 지면에 이미지·동영상·슬라이드·컬렉션 규격이 모두 있으므로, 엑셀이 말하는
 * 소재 유형과 맞는 형식을 골라야 한다.
 */
function productFormat(entry: SpecEntry): '이미지' | '동영상' | '슬라이드' | '컬렉션' | null {
  const m = entry.productName.match(/—\s*(이미지|동영상|슬라이드|컬렉션)\s*\(/);
  return (m?.[1] as '이미지' | '동영상' | '슬라이드' | '컬렉션') ?? null;
}

/** 검색어가 슬라이드·컬렉션을 명시했는지 — 명시했으면 그 형식을 존중한다 */
function mentionsCompositeFormat(product?: string): boolean {
  return /슬라이드|캐러셀|carousel|컬렉션|collection/i.test(product ?? '');
}

/** 엑셀의 소재 유형 표기를 영역 유형으로 해석한다 */
function unitToAreaType(unit?: string): AssetAreaType | null {
  if (!unit) return null;
  if (/video|동영상|비디오|영상/i.test(unit)) return 'VIDEO';
  if (/image|이미지|배너|정지|still/i.test(unit)) return 'IMAGE';
  return null;
}

function hasAreaType(entry: SpecEntry, t: AssetAreaType): boolean {
  return entry.areas.some((a) => a.areaType === t);
}

/**
 * 소재 유형이 주어지면 그 유형의 소재를 실제로 요구하는 상품을 우선한다.
 *
 * 같은 지면이라도 영상용·이미지용 규격이 따로 있다. 유형을 무시하면
 * 동영상 지면에 이미지 규격이 확신 매칭으로 붙어 경고 없이 잘못된 규격을
 * 보여주게 된다 (예: "FB Instream" 동영상 행 → 인스트림 '이미지' 규격).
 */
function preferUnit(candidates: SpecMatch[], unit?: string, product?: string): SpecMatch | null {
  if (candidates.length === 0) return null;
  const want = unitToAreaType(unit);
  if (!want) return candidates[0];

  // 엑셀이 "Image"/"Video" 라고만 적었다면 단일 소재 형식을 뜻한다.
  // 슬라이드·컬렉션은 소재를 여러 장 묶는 별도 형식이라, 검색어가 그것을
  // 명시하지 않았는데 먼저 고르면 엉뚱한 규격을 보여주게 된다.
  if (!mentionsCompositeFormat(product)) {
    const wantFormat = want === 'VIDEO' ? '동영상' : '이미지';
    const exact = candidates.find((c) => productFormat(c.entry) === wantFormat);
    // 형식이 맞더라도 이름이 훨씬 잘 맞는 후보를 밀어내면 안 된다.
    // 별칭이 정확히 일치한 상품(1.00)을 형식만 맞는 0.3짜리로 바꾸면 손해다.
    if (exact && exact.score >= candidates[0].score - FORMAT_PREFERENCE_MARGIN) return exact;
  }

  const fit = candidates.find((c) => hasAreaType(c.entry, want));
  if (fit) return fit;

  // 유형이 맞는 상품이 없다 — 최선의 후보를 주되 확신을 낮춰 확인을 유도한다
  return { entry: candidates[0].entry, score: candidates[0].score * 0.5 };
}

/**
 * 매체를 특정하지 못한 채 DB 전체에서 찾은 결과를 받아들이는 최소 점수.
 * 이보다 낮으면 매칭 실패로 처리한다.
 */
const MIN_CROSS_MEDIA_SCORE = 0.5;

/**
 * 소재 유형이 맞는 상품을 우선할 때 감수할 수 있는 점수 차.
 * 이보다 크게 벌어지면 이름이 더 잘 맞는 쪽을 택한다.
 */
const FORMAT_PREFERENCE_MARGIN = 0.25;

/** 이 점수 미만이면 화면에서 "확인 필요"로 표시한다 */
export const LOW_CONFIDENCE_SCORE = 0.6;

/**
 * 엑셀에 적힌 매체 표기를 정식 매체명으로 해석한다.
 *
 * 정규화 완전일치를 먼저 본다. 짧은 매체 표기는 퍼지 매칭이 쉽게 오작동하는데
 * (예: "OOH" 가 "Webtoon" 에 높은 점수로 붙는다), 실제 표기는 대개 표기 흔들림
 * 수준이라 완전일치로 대부분 해결된다. 퍼지는 그 다음의 보조 수단이다.
 */
export function resolveMedia(mediaName: string): string | null {
  const q = mediaName.trim();
  if (!q) return null;

  const exact = MEDIA_EXACT.get(normKey(q));
  if (exact) return exact;

  const contained = containmentMatch(q);
  if (contained) return contained;

  const [best] = mediaFuse.search(q, { limit: 1 });
  if (!best) return null;
  return 1 - (best.score ?? 1) >= MIN_MEDIA_SCORE ? best.item.mediaName : null;
}

/**
 * 엑셀에 적힌 매체·상품 표기를 마스터 DB의 정식 상품으로 연결한다.
 *
 * 매체와 상품을 한 문자열로 합쳐 검색하면 서로의 점수를 희석시켜
 * ("네이버 GFA 스마트채널" → 매칭 실패) 정확도가 떨어진다. 엑셀이 매체·상품을
 * 별도 컬럼으로 갖는 구조를 그대로 살려, 매체로 후보를 좁힌 뒤 상품을 매칭한다.
 */
export function matchSpec(mediaName: string, productName?: string, unit?: string): SpecMatch | null {
  const media = resolveMedia(mediaName);
  const product = productName?.trim();

  // 매체가 확인되면 그 매체 안에서만 상품을 고른다.
  // 상품명이 애매하다고 다른 매체의 상품을 제안하면 담당자를 더 크게 오도한다.
  if (media) {
    if (!product) {
      const entry = ENTRIES.find((e) => e.mediaName === media);
      return entry ? { entry, score: 0.4 } : null;
    }
    const variants = queryVariants(product);

    const best = preferUnit(rank(productFuseFor(media), variants), unit, product);
    if (best) return best;

    const loose = preferUnit(rank(looseProductFuseFor(media), variants), unit, product);
    if (loose) return { entry: loose.entry, score: loose.score * 0.5 };

    const entry = ENTRIES.find((e) => e.mediaName === media);
    return entry ? { entry, score: 0.2 } : null;
  }

  // 매체 해석에 실패한 경우에만 전체에서 상품명으로 찾는다.
  // 이 경로는 DB 전체를 뒤지는 추측이므로 기준을 높게 잡는다. 근거가 약한 결과를
  // 돌려주면 DB에 아예 없는 매체(예: OOH)에 엉뚱한 매체의 규격이 붙어,
  // 매칭 실패보다 훨씬 위험하다.
  const fallbackQuery = product || mediaName.trim();
  if (!fallbackQuery) return null;
  const best = preferUnit(rank(globalProductFuse, queryVariants(fallbackQuery)), unit, product);
  if (!best) return null;
  const score = best.score * 0.8;
  return score >= MIN_CROSS_MEDIA_SCORE ? { entry: best.entry, score } : null;
}

export function matchSpecAll(mediaName: string, productName?: string, limit = 5): SpecMatch[] {
  const media = resolveMedia(mediaName);
  const product = productName?.trim();
  const fuse = media ? productFuseFor(media) : globalProductFuse;
  const query = product || mediaName.trim();
  if (!query) return [];
  return fuse.search(query, { limit }).map((r) => ({ entry: r.item, score: 1 - (r.score ?? 1) }));
}

/** 영역의 규격을 한 줄 텍스트로 요약한다. specLabel 이 있으면 그대로 쓴다. */
export function formatSpec(area: AssetArea): string {
  if (area.specLabel) return area.specLabel;

  const parts: string[] = [];
  if (area.widthPx && area.heightPx) parts.push(`${area.widthPx} × ${area.heightPx} px`);
  if (area.ratio) parts.push(area.ratio);
  if (area.maxDurationSec) parts.push(`최대 ${area.maxDurationSec}초`);
  if (area.maxFileSizeKb) parts.push(`${area.maxFileSizeKb}KB 이하`);
  if (area.maxChars) parts.push(`최대 ${area.maxChars}자`);
  if (area.formats?.length) parts.push(area.formats.join(', '));

  return parts.join(' / ') || '규격 정보 없음';
}

/** 가로형/세로형/정사각형 판별 — 소재 비율을 시각적으로 보여줄 때 쓴다. */
export function orientLabel(width?: number, height?: number): string {
  if (!width || !height) return '';
  if (width === height) return '정사각형';
  return width > height ? '가로형' : '세로형';
}
