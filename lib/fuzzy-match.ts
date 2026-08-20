import Fuse from 'fuse.js';
import type { MediaSpec } from './types';
import { getAllSpecs } from './master-db';

interface MatchResult {
  spec: MediaSpec;
  score: number;
}

let fuse: Fuse<MediaSpec> | null = null;

function getFuse(): Fuse<MediaSpec> {
  if (!fuse) {
    fuse = new Fuse(getAllSpecs(), {
      keys: [
        { name: 'mediaName', weight: 0.4 },
        { name: 'productName', weight: 0.4 },
        { name: 'aliases', weight: 0.2 },
      ],
      threshold: 0.5,
      includeScore: true,
    });
  }
  return fuse;
}

export function fuzzyMatch(mediaName: string, productName?: string): MatchResult | null {
  const query = productName ? `${mediaName} ${productName}` : mediaName;
  const results = getFuse().search(query);
  if (!results.length) return null;
  const best = results[0];
  return {
    spec: best.item,
    score: 1 - (best.score ?? 1),
  };
}

export function fuzzyMatchAll(mediaName: string, productName?: string): MatchResult[] {
  const query = productName ? `${mediaName} ${productName}` : mediaName;
  return getFuse()
    .search(query)
    .map((r) => ({ spec: r.item, score: 1 - (r.score ?? 1) }));
}
