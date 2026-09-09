<template>
  <div class="page-wrapper app-container">
    <div style="margin-bottom: 1.25rem;">
      <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem;">Buscar Hinos</h1>
      <p style="font-size: 0.88rem; color: var(--color-text-secondary);">
        Pesquise por número, título, primeira linha ou palavras da letra
      </p>
    </div>

    <!-- Search Input -->
    <div class="search-box-wrapper">
      <span class="search-icon-prefix">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </span>
      <input
        ref="searchInputRef"
        type="text"
        v-model="hymnStore.searchQuery"
        placeholder="Ex: 15, graça, mais perto quero estar..."
        class="search-input"
        aria-label="Campo de busca de hinos"
      />
      <button
        v-if="hymnStore.searchQuery"
        class="search-clear-btn"
        @click="hymnStore.searchQuery = ''"
        title="Limpar campo"
      >
        ✕
      </button>
    </div>

    <!-- Search Suggestions Chips -->
    <div v-if="!hymnStore.searchQuery" style="margin-bottom: 1.5rem;">
      <div style="font-size: 0.82rem; font-weight: 600; color: var(--color-text-muted); margin-bottom: 0.6rem;">
        SUGESTÕES FREQUENTES
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        <button
          v-for="term in ['15', '212', 'graça', 'cruz', 'salvação', 'vitória', 'louvor', 'rocha']"
          :key="term"
          class="font-btn"
          style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-full); padding: 5px 12px; font-size: 0.82rem;"
          @click="hymnStore.searchQuery = term"
        >
          {{ term }}
        </button>
      </div>
    </div>

    <!-- Results List -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <span style="font-size: 0.88rem; font-weight: 700;">
          {{ displayedHymns.length }} hinos encontrados
        </span>
      </div>

      <div v-if="displayedHymns.length === 0" style="text-align: center; padding: 3rem 1rem; color: var(--color-text-muted);">
        <p style="font-size: 1.05rem;">Nenhum hino encontrado para "{{ hymnStore.searchQuery }}"</p>
        <p style="font-size: 0.85rem; margin-top: 0.4rem;">Tente pesquisar sem acentos ou apenas pelo número do hino.</p>
      </div>

      <div v-else>
        <router-link
          v-for="hymn in displayedHymns"
          :key="hymn.id"
          :to="`/hino/${hymn.number}`"
          class="hymn-card"
        >
          <div class="hymn-number-badge">{{ hymn.number }}</div>
          <div class="hymn-info">
            <div class="hymn-title-text">{{ hymn.title }}</div>
            <div class="hymn-firstline-text">{{ hymn.first_line }}</div>
          </div>
          <div class="hymn-category-tag">{{ hymn.category }}</div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHymnStore } from '../stores/hymnStore';

const hymnStore = useHymnStore();
const searchInputRef = ref<HTMLInputElement | null>(null);

const displayedHymns = computed(() => {
  return hymnStore.filteredHymns;
});

onMounted(() => {
  searchInputRef.value?.focus();
});
</script>
