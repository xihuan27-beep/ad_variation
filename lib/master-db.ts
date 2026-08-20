import masterSpecs from '@/data/master-specs.json';
import type { MediaSpec } from './types';

const db: MediaSpec[] = masterSpecs as MediaSpec[];

export function getAllSpecs(): MediaSpec[] {
  return db;
}

export function getSpecById(id: string): MediaSpec | undefined {
  return db.find((s) => s.id === id);
}

export function searchSpecs(mediaName: string, productName?: string): MediaSpec[] {
  const query = `${mediaName} ${productName || ''}`.toLowerCase().trim();
  return db.filter((spec) => {
    const target = `${spec.mediaName} ${spec.productName} ${spec.aliases.join(' ')}`.toLowerCase();
    return target.includes(query) || spec.aliases.some((a) => a.toLowerCase().includes(query));
  });
}

let inMemoryUpdates: Map<string, Partial<MediaSpec>> = new Map();

export function applyUpdate(id: string, updates: Partial<MediaSpec>): void {
  inMemoryUpdates.set(id, { ...(inMemoryUpdates.get(id) || {}), ...updates });
}

export function getEffectiveSpec(id: string): MediaSpec | undefined {
  const base = getSpecById(id);
  if (!base) return undefined;
  const updates = inMemoryUpdates.get(id);
  if (!updates) return base;
  return { ...base, ...updates, specs: { ...base.specs, ...(updates.specs || {}) } };
}
