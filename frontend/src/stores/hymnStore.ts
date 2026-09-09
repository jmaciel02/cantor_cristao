import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Hymn, HymnSummary } from '../types/hymn';
import hymnsSummaryData from '../data/hymns-summary.json';
import { HymnSearchEngine } from '../services/search';
import { dbService } from '../services/db';

export const useHymnStore = defineStore('hymn', () => {
  // L1: In-memory summaries for instant UI rendering and search
  const summaries = ref<HymnSummary[]>(hymnsSummaryData as HymnSummary[]);
  const fullHymnsCache = new Map<number, Hymn>();
  const activeHymn = ref<Hymn | null>(null);
  const isLoading = ref<boolean>(false);
  const isSyncing = ref<boolean>(false);
  const searchQuery = ref<string>('');
  const selectedCategory = ref<string>('all');

  const searchEngine = new HymnSearchEngine(summaries.value);

  const categories = computed(() => {
    const set = new Set<string>();
    for (const h of summaries.value) {
      if (h.category) set.add(h.category);
    }
    return Array.from(set);
  });

  const filteredHymns = computed(() => {
    let list = summaries.value;
    if (selectedCategory.value && selectedCategory.value !== 'all') {
      list = list.filter((h) => h.category === selectedCategory.value);
    }
    if (searchQuery.value && searchQuery.value.trim()) {
      return searchEngine.search(searchQuery.value);
    }
    return list;
  });

  const getHymnById = async (id: number): Promise<Hymn | null> => {
    // 1. Check L1 Memory Cache
    if (fullHymnsCache.has(id)) {
      return fullHymnsCache.get(id)!;
    }

    isLoading.value = true;
    try {
      // 2. Check L2 IndexedDB Cache
      const cached = await dbService.getHymnById(id);
      if (cached) {
        fullHymnsCache.set(id, cached);
        return cached;
      }

      // 3. Fallback: load dynamically from canonical dataset
      const canonical = await import('../data/hymns-canonical.json');
      const all: Hymn[] = canonical.default || canonical;
      const found = all.find((h) => h.id === id) || null;

      if (found) {
        fullHymnsCache.set(id, found);
        // Persist to IndexedDB in background
        dbService.saveHymns([found]);
      }
      return found;
    } catch (err) {
      console.error(`Erro ao carregar hino ${id}:`, err);
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const getAdjacentHymns = (currentId: number): { prev: number | null; next: number | null } => {
    const prev = currentId > 1 ? currentId - 1 : null;
    const next = currentId < 581 ? currentId + 1 : null;
    return { prev, next };
  };

  // Pre-seed IndexedDB in background on app start
  const seedLocalDatabase = async () => {
    try {
      const count = await dbService.countHymns();
      if (count < 581) {
        isSyncing.value = true;
        const canonical = await import('../data/hymns-canonical.json');
        const all: Hymn[] = canonical.default || canonical;
        await dbService.saveHymns(all);
        isSyncing.value = false;
      }
    } catch (err) {
      console.warn('Seed local silencioso:', err);
      isSyncing.value = false;
    }
  };

  return {
    summaries,
    activeHymn,
    isLoading,
    isSyncing,
    searchQuery,
    selectedCategory,
    categories,
    filteredHymns,
    getHymnById,
    getAdjacentHymns,
    seedLocalDatabase
  };
});
