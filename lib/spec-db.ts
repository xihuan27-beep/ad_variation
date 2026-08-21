/**
 * 마스터 스펙 조회 레이어
 *
 * lib/spec-data.ts 의 계층 구조(매체 > 상품 > 영역)를 앱에서 쓰기 좋은
 * 평탄한 형태로 펼치고, 엑셀에 적힌 임의 표기를 정식 상품으로 연결한다.
 */

import Fuse from 'fuse.js';
import { MEDIA_DATA } from './spec-data';
import type { AssetArea, AssetAreaType } from './spec-data';

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

const ENTRIES: SpecEntry[] = MEDIA_DATA.flatMap((media) =>
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

/** 여러 검색어 변형 중 가장 높은 점수의 결과를 고른다 */
function bestOf(fuse: Fuse<SpecEntry>, queries: string[]): { entry: SpecEntry; score: number } | null {
  let best: { entry: SpecEntry; score: number } | null = null;
  for (const q of queries) {
    const [hit] = fuse.search(q, { limit: 1 });
    if (!hit) continue;
    const score = 1 - (hit.score ?? 1);
    if (!best || score > best.score) best = { entry: hit.item, score };
  }
  return best;
}

/**
 * 매체를 특정하지 못한 채 DB 전체에서 찾은 결과를 받아들이는 최소 점수.
 * 이보다 낮으면 매칭 실패로 처리한다.
 */
const MIN_CROSS_MEDIA_SCORE = 0.5;

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
export function matchSpec(mediaName: string, productName?: string): SpecMatch | null {
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

    const best = bestOf(productFuseFor(media), variants);
    if (best) return best;

    const loose = bestOf(looseProductFuseFor(media), variants);
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
  const best = bestOf(globalProductFuse, queryVariants(fallbackQuery));
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
