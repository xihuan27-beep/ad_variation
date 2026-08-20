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
  threshold: 0.5,
  ignoreLocation: true,
  includeScore: true,
});

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

/** 엑셀에 적힌 매체 표기를 정식 매체명으로 해석한다. */
export function resolveMedia(mediaName: string): string | null {
  const q = mediaName.trim();
  if (!q) return null;
  const [best] = mediaFuse.search(q, { limit: 1 });
  return best ? best.item.mediaName : null;
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
    const [best] = productFuseFor(media).search(product, { limit: 1 });
    if (best) return { entry: best.item, score: 1 - (best.score ?? 1) };

    const [loose] = looseProductFuseFor(media).search(product, { limit: 1 });
    if (loose) return { entry: loose.item, score: (1 - (loose.score ?? 1)) * 0.5 };

    const entry = ENTRIES.find((e) => e.mediaName === media);
    return entry ? { entry, score: 0.2 } : null;
  }

  // 매체 해석에 실패한 경우에만 전체에서 상품명으로 찾는다
  const fallbackQuery = product || mediaName.trim();
  if (!fallbackQuery) return null;
  const [best] = globalProductFuse.search(fallbackQuery, { limit: 1 });
  return best ? { entry: best.item, score: (1 - (best.score ?? 1)) * 0.8 } : null;
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
