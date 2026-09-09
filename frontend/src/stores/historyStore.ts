import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { HistoryItem, Hymn } from '../types/hymn';
import { dbService } from '../services/db';

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryItem[]>([]);
  const isLoaded = ref(false);

  const loadHistory = async () => {
    history.value = await dbService.getHistory();
    isLoaded.value = true;
  };

  const addHymnToHistory = async (hymn: Hymn) => {
    const item: HistoryItem = {
      id: hymn.id,
      number: hymn.number,
      title: hymn.title,
      first_line: hymn.first_line,
      viewedAt: Date.now()
    };
    await dbService.addHistory(item);
    history.value = [item, ...history.value.filter((h) => h.id !== item.id)].slice(0, 30);
  };

  const clearHistory = async () => {
    await dbService.clearHistory();
    history.value = [];
  };

  return {
    history,
    isLoaded,
    loadHistory,
    addHymnToHistory,
    clearHistory
  };
});
