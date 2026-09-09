<template>
  <div class="page-wrapper app-container">
    <InstallPrompt />

    <!-- Top Hero / Search Section -->
    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <img src="/icons/icon-192x192.png" alt="Cantor Cristão" style="width: 46px; height: 46px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);" />
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; line-height: 1.2;">Cantor Cristão</h1>
            <p style="font-size: 0.82rem; color: var(--color-text-secondary);">581 hinos tradicionais para louvor e culto</p>
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn-icon" :title="'Alternar Tema'" @click="cycleTheme">
            <span v-if="settingsStore.theme === 'dark'">🌙</span>
            <span v-else-if="settingsStore.theme === 'sepia'">📖</span>
            <span v-else>☀️</span>
          </button>
        </div>
      </div>

      <!-- Live Search Box -->
      <div class="search-box-wrapper">
        <span class="search-icon-prefix">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="text"
          v-model="hymnStore.searchQuery"
          placeholder="Digite nº, título ou trecho da letra..."
          class="search-input"
          aria-label="Pesquisar hinos"
        />
        <button
          v-if="hymnStore.searchQuery"
          class="search-clear-btn"
          @click="hymnStore.searchQuery = ''"
          title="Limpar pesquisa"
        >
          ✕
        </button>
      </div>

      <!-- Quick Access Hub (when not searching) -->
      <div v-if="!hymnStore.searchQuery" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; margin-bottom: 1.5rem;">
        <router-link to="/favoritos" class="hymn-card" style="margin-bottom: 0; padding: 0.75rem; flex-direction: column; align-items: flex-start; gap: 0.4rem;">
          <span style="font-size: 1.25rem;">❤️</span>
          <div>
            <div style="font-size: 0.88rem; font-weight: 700;">Favoritos</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">{{ favoritesStore.favorites.length }} hinos</div>
          </div>
        </router-link>

        <router-link to="/buscar" class="hymn-card" style="margin-bottom: 0; padding: 0.75rem; flex-direction: column; align-items: flex-start; gap: 0.4rem;" @click="openQuickJump">
          <span style="font-size: 1.25rem;">🔢</span>
          <div>
            <div style="font-size: 0.88rem; font-weight: 700;">Ir p/ Hino</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">1 a 581</div>
          </div>
        </router-link>

        <div class="hymn-card" style="margin-bottom: 0; padding: 0.75rem; flex-direction: column; align-items: flex-start; gap: 0.4rem; cursor: pointer;" @click="scrollToHymns">
          <span style="font-size: 1.25rem;">📖</span>
          <div>
            <div style="font-size: 0.88rem; font-weight: 700;">Hinário</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">581 hinos</div>
          </div>
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 1rem; scrollbar-width: none;">
        <button
          class="font-btn"
          :class="{ 'btn-primary': hymnStore.selectedCategory === 'all' }"
          style="padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.82rem; white-space: nowrap; border: 1px solid var(--color-border);"
          @click="hymnStore.selectedCategory = 'all'"
        >
          Todos
        </button>
        <button
          v-for="cat in hymnStore.categories"
          :key="cat"
          class="font-btn"
          :class="{ 'btn-primary': hymnStore.selectedCategory === cat }"
          style="padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.82rem; white-space: nowrap; border: 1px solid var(--color-border);"
          @click="hymnStore.selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Hymns List -->
    <div id="hymns-list-section">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <h2 style="font-size: 1.05rem; font-weight: 700;">
          {{ hymnStore.searchQuery ? `Resultados (${displayedHymns.length})` : 'Hinos do Cantor Cristão' }}
        </h2>
        <span style="font-size: 0.8rem; color: var(--color-text-muted);">
          Total: {{ displayedHymns.length }}
        </span>
      </div>

      <div v-if="displayedHymns.length === 0" style="text-align: center; padding: 3rem 1rem; color: var(--color-text-muted);">
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Nenhum hino encontrado para "{{ hymnStore.searchQuery }}"</p>
        <p style="font-size: 0.85rem;">Tente buscar pelo número (ex: 15) ou por outra palavra da letra.</p>
      </div>

      <div v-else>
        <router-link
          v-for="hymn in displayedHymns"
          :key="hymn.id"
          :to="`/hino/${hymn.number}`"
          class="hymn-card"
        >
          <div class="hymn-number-badge">
            {{ hymn.number }}
          </div>
          <div class="hymn-info">
            <div class="hymn-title-text">{{ hymn.title }}</div>
            <div class="hymn-firstline-text">{{ hymn.first_line }}</div>
          </div>
          <div class="hymn-category-tag">
            {{ hymn.category }}
          </div>
        </router-link>
      </div>
    </div>

    <!-- Floating Action Button for Fast Jump -->
    <button class="quick-jump-fab" @click="isQuickJumpOpen = true" title="Ir para hino">
      <span>Nº</span>
    </button>

    <QuickJumpModal :isOpen="isQuickJumpOpen" @close="isQuickJumpOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHymnStore } from '../stores/hymnStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useSettingsStore } from '../stores/settingsStore';
import QuickJumpModal from '../components/QuickJumpModal.vue';
import InstallPrompt from '../components/InstallPrompt.vue';

const hymnStore = useHymnStore();
const favoritesStore = useFavoritesStore();
const settingsStore = useSettingsStore();

const isQuickJumpOpen = ref(false);

const displayedHymns = computed(() => {
  return hymnStore.filteredHymns;
});

const cycleTheme = () => {
  if (settingsStore.theme === 'dark') settingsStore.setTheme('sepia');
  else if (settingsStore.theme === 'sepia') settingsStore.setTheme('light');
  else settingsStore.setTheme('dark');
};

const openQuickJump = () => {
  isQuickJumpOpen.value = true;
};

const scrollToHymns = () => {
  document.getElementById('hymns-list-section')?.scrollIntoView({ behavior: 'smooth' });
};
</script>
