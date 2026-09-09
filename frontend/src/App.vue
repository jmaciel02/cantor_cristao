<template>
  <div id="app-root">
    <router-view />
    <BottomNav v-if="showBottomNav" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BottomNav from './components/BottomNav.vue';
import { useSettingsStore } from './stores/settingsStore';
import { useFavoritesStore } from './stores/favoritesStore';
import { useHistoryStore } from './stores/historyStore';
import { useHymnStore } from './stores/hymnStore';

const route = useRoute();
const settingsStore = useSettingsStore();
const favoritesStore = useFavoritesStore();
const historyStore = useHistoryStore();
const hymnStore = useHymnStore();

const showBottomNav = computed(() => {
  // Always show bottom nav on main views; on hymn detail, it's shown unless cult mode is toggled (which is handled via CSS or component state)
  return true;
});

onMounted(async () => {
  await settingsStore.initSettings();
  await favoritesStore.loadFavorites();
  await historyStore.loadHistory();
  // Silently seed IndexedDB with all 581 hymns in background
  hymnStore.seedLocalDatabase();
});
</script>

<style>
#app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
