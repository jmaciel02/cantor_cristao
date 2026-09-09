<template>
  <div class="page-wrapper app-container">
    <div style="margin-bottom: 1.25rem;">
      <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem;">Meus Hinos</h1>
      <p style="font-size: 0.88rem; color: var(--color-text-secondary);">
        Acesso rápido aos hinos que você salvou e cantou recentemente
      </p>
    </div>

    <!-- Tab Selector -->
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.75rem;">
      <button
        class="font-btn"
        :class="{ 'btn-primary': activeTab === 'favs' }"
        style="padding: 8px 18px; border-radius: var(--radius-full); font-size: 0.9rem;"
        @click="activeTab = 'favs'"
      >
        ❤️ Favoritos ({{ favoritesStore.favorites.length }})
      </button>

      <button
        class="font-btn"
        :class="{ 'btn-primary': activeTab === 'recents' }"
        style="padding: 8px 18px; border-radius: var(--radius-full); font-size: 0.9rem;"
        @click="activeTab = 'recents'"
      >
        🕘 Recentes ({{ historyStore.history.length }})
      </button>
    </div>

    <!-- Favorites Tab Content -->
    <div v-if="activeTab === 'favs'">
      <div v-if="favoritesStore.favorites.length === 0" style="text-align: center; padding: 3.5rem 1rem; color: var(--color-text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🤍</div>
        <p style="font-size: 1.1rem; font-weight: 600;">Nenhum hino favoritado ainda</p>
        <p style="font-size: 0.88rem; margin-top: 0.35rem; max-width: 320px; margin-left: auto; margin-right: auto;">
          Toque no ícone de coração ❤️ na tela de qualquer hino para salvar aqui e acessar rapidamente offline.
        </p>
        <router-link to="/" class="btn-primary" style="display: inline-block; margin-top: 1.5rem; padding: 10px 24px; text-decoration: none; border-radius: var(--radius-md);">
          Ver todos os hinos
        </router-link>
      </div>

      <div v-else>
        <div
          v-for="hymn in favoritesStore.favorites"
          :key="hymn.id"
          class="hymn-card"
          style="position: relative;"
        >
          <router-link :to="`/hino/${hymn.number}`" style="display: flex; align-items: center; gap: 1rem; flex: 1; text-decoration: none; color: inherit; min-width: 0;">
            <div class="hymn-number-badge">{{ hymn.number }}</div>
            <div class="hymn-info">
              <div class="hymn-title-text">{{ hymn.title }}</div>
              <div class="hymn-firstline-text">{{ hymn.first_line }}</div>
            </div>
          </router-link>

          <button
            class="btn-icon"
            style="color: var(--color-danger); margin-left: 0.5rem;"
            title="Remover dos favoritos"
            @click.stop="favoritesStore.toggleFavorite(hymn)"
          >
            ❤️
          </button>
        </div>
      </div>
    </div>

    <!-- Recents Tab Content -->
    <div v-else>
      <div v-if="historyStore.history.length === 0" style="text-align: center; padding: 3.5rem 1rem; color: var(--color-text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🕘</div>
        <p style="font-size: 1.1rem; font-weight: 600;">Nenhum hino no histórico recente</p>
        <p style="font-size: 0.88rem; margin-top: 0.35rem;">Os hinos que você abrir durante o culto aparecerão listados aqui.</p>
      </div>

      <div v-else>
        <div style="display: flex; justify-content: flex-end; margin-bottom: 0.75rem;">
          <button class="font-btn" style="font-size: 0.82rem; color: var(--color-text-muted);" @click="historyStore.clearHistory">
            Limpar histórico
          </button>
        </div>

        <router-link
          v-for="item in historyStore.history"
          :key="item.id"
          :to="`/hino/${item.number}`"
          class="hymn-card"
        >
          <div class="hymn-number-badge">{{ item.number }}</div>
          <div class="hymn-info">
            <div class="hymn-title-text">{{ item.title }}</div>
            <div class="hymn-firstline-text">{{ item.first_line }}</div>
          </div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); white-space: nowrap;">
            {{ formatTime(item.viewedAt) }}
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useHistoryStore } from '../stores/historyStore';

const favoritesStore = useFavoritesStore();
const historyStore = useHistoryStore();

const activeTab = ref<'favs' | 'recents'>('favs');

const formatTime = (ts: number) => {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
};
</script>
