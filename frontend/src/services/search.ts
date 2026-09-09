import Fuse, { type IFuseOptions } from 'fuse.js';
import type { HymnSummary } from '../types/hymn';

export function removeDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function cleanSearchQuery(query: string): string {
  return removeDiacritics(query)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class HymnSearchEngine {
  private hymns: HymnSummary[] = [];
  private fuse: Fuse<HymnSummary> | null = null;

  constructor(hymns: HymnSummary[] = []) {
    if (hymns.length > 0) {
      this.init(hymns);
    }
  }

  public init(hymns: HymnSummary[]) {
    this.hymns = hymns;

    const options: IFuseOptions<HymnSummary> = {
      keys: [
        { name: 'number', weight: 3.5 },
        { name: 'title', weight: 2.5 },
        { name: 'first_line', weight: 2.0 },
        { name: 'category', weight: 0.8 },
        { name: 'author', weight: 0.5 }
      ],
      threshold: 0.35, // Balanced typo tolerance
      distance: 100,
      minMatchCharLength: 2,
      shouldSort: true,
      includeScore: true
    };

    this.fuse = new Fuse(this.hymns, options);
  }

  public search(rawQuery: string, limit: number = 40): HymnSummary[] {
    if (!rawQuery || !rawQuery.trim()) {
      return this.hymns.slice(0, limit);
    }

    const trimmed = rawQuery.trim();
    const cleanQ = cleanSearchQuery(trimmed);

    // 1. Direct number check (e.g. user typed "15" or "015")
    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      const exactHymn = this.hymns.find((h) => h.number === num);
      if (exactHymn) {
        // Also find hymns containing the digit pattern (e.g. 15, 115, 150)
        const others = this.hymns
          .filter((h) => h.number !== num && String(h.number).includes(trimmed))
          .slice(0, limit - 1);
        return [exactHymn, ...others];
      }
    }

    // 2. Exact or normalized prefix matches (super fast)
    const exactMatches: HymnSummary[] = [];
    const restHymns: HymnSummary[] = [];

    for (const hymn of this.hymns) {
      const normTitle = cleanSearchQuery(hymn.title);
      const normFirstLine = cleanSearchQuery(hymn.first_line);

      if (normTitle.includes(cleanQ) || normFirstLine.includes(cleanQ)) {
        exactMatches.push(hymn);
      } else {
        restHymns.push(hymn);
      }
    }

    if (exactMatches.length >= limit) {
      return exactMatches.slice(0, limit);
    }

    // 3. Fuzzy search for remaining slots if fuse is available
    if (this.fuse) {
      const fuseResults = this.fuse.search(trimmed, { limit: limit });
      const exactSet = new Set(exactMatches.map((h) => h.id));

      for (const res of fuseResults) {
        if (!exactSet.has(res.item.id)) {
          exactMatches.push(res.item);
          exactSet.add(res.item.id);
          if (exactMatches.length >= limit) break;
        }
      }
    }

    return exactMatches.slice(0, limit);
  }
}
