import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { HymnList } from '../types/hymn';
import { dbService } from '../services/db';

export const useListsStore = defineStore('lists', () => {
  const lists = ref<HymnList[]>([]);
  const isLoaded = ref(false);

  const loadLists = async () => {
    lists.value = await dbService.getLists();
    isLoaded.value = true;
  };

  const createList = async (name: string, description?: string) => {
    const newList: HymnList = {
      id: 'list_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: name.trim(),
      description: description?.trim(),
      createdAt: Date.now(),
      hymnIds: []
    };
    await dbService.saveList(newList);
    lists.value.push(newList);
    return newList;
  };

  const addHymnToList = async (listId: string, hymnId: number) => {
    const list = lists.value.find((l) => l.id === listId);
    if (list && !list.hymnIds.includes(hymnId)) {
      list.hymnIds.push(hymnId);
      await dbService.saveList(list);
    }
  };

  const removeHymnFromList = async (listId: string, hymnId: number) => {
    const list = lists.value.find((l) => l.id === listId);
    if (list) {
      list.hymnIds = list.hymnIds.filter((id) => id !== hymnId);
      await dbService.saveList(list);
    }
  };

  const deleteList = async (listId: string) => {
    await dbService.deleteList(listId);
    lists.value = lists.value.filter((l) => l.id !== listId);
  };

  return {
    lists,
    isLoaded,
    loadLists,
    createList,
    addHymnToList,
    removeHymnFromList,
    deleteList
  };
});
