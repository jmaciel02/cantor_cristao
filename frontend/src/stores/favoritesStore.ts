import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { FavoriteItem, Hymn } from '../types/hymn';
import { dbService } from '../services/db';

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<FavoriteItem[]>([]);
  const isLoaded = ref(false);

  const loadFavorites = async () => {
    favorites.value = await dbService.getFavorites();
    isLoaded.value = true;
  };

  const isFavorite = (hymnId: number): boolean => {
    return favorites.value.some((f) => f.id === hymnId);
  };

  const toggleFavorite = async (hymn: Hymn | FavoriteItem) => {
    const exists = isFavorite(hymn.id);
    if (exists) {
      await dbService.removeFavorite(hymn.id);
      favorites.value = favorites.value.filter((f) => f.id !== hymn.id);
    } else {
      const item: FavoriteItem = {
        id: hymn.id,
        number: hymn.number,
        title: hymn.title,
        first_line: hymn.first_line,
        category: hymn.category,
        savedAt: Date.now()
      };
      await dbService.addFavorite(item);
      favorites.value = [item, ...favorites.value];
    }
  };

  return {
    favorites,
    isLoaded,
    loadFavorites,
    isFavorite,
    toggleFavorite
  };
});
