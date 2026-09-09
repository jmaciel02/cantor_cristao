<template>
  <div
    class="page-wrapper app-container"
    :class="{ 'cult-mode-active': isCultMode }"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- Exit Cult Mode Floating Button -->
    <button v-if="isCultMode" class="cult-exit-btn" @click="toggleCultMode">
      <span>✕</span>
      <span>Sair do Modo Culto</span>
    </button>

    <!-- Top Action Bar (hidden in cult mode) -->
    <header v-if="!isCultMode" class="top-header">
      <button class="btn-icon" @click="goBack" title="Voltar">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <div style="font-weight: 700; font-size: 1.05rem;">
        Hino {{ hymnNumber }}
      </div>

      <div class="header-actions">
        <!-- Favorite Button -->
        <button
          class="btn-icon"
          :class="{ active: isCurrentFavorite }"
          :title="isCurrentFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'"
          @click="toggleFavorite"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" :fill="isCurrentFavorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <!-- Share Button -->
        <button class="btn-icon" @click="shareHymn" title="Compartilhar Hino">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>

        <!-- Cult Mode Toggle Button -->
        <button class="btn-icon" @click="toggleCultMode" title="Ativar Modo Culto (Tela Cheia)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" style="text-align: center; padding: 4rem 1rem;">
      <div style="font-size: 1.1rem; color: var(--color-text-secondary);">Carregando hino...</div>
    </div>

    <!-- Hymn Reader Body -->
    <main v-else-if="hymn" class="reader-container">
      <div class="reader-meta-header">
        <div class="reader-hymn-number">Hino {{ hymn.number }} • {{ hymn.category }}</div>
        <h1 class="reader-hymn-title">{{ hymn.title }}</h1>
        <div v-if="hymn.author || hymn.composer" class="reader-hymn-credits">
          <span v-if="hymn.author">Letra: {{ hymn.author }}</span>
          <span v-if="hymn.author && hymn.composer"> • </span>
          <span v-if="hymn.composer">Música: {{ hymn.composer }}</span>
        </div>
      </div>

      <!-- Stanzas -->
      <article class="lyrics-body">
        <div
          v-for="(stanza, index) in hymn.stanzas"
          :key="index"
          :class="[stanza.is_chorus ? 'chorus-block' : 'stanza-block']"
        >
          <span v-if="stanza.is_chorus" class="chorus-label">Coro</span>
          <span v-else-if="stanza.number" class="stanza-number">{{ stanza.number }}.</span>

          <div v-for="(line, lineIdx) in stanza.lines" :key="lineIdx" class="stanza-line">
            {{ line }}
          </div>
        </div>
      </article>

      <!-- Previous / Next Navigation -->
      <nav class="hymn-navigation-bar" aria-label="Navegação entre hinos">
        <button
          v-if="adjacent.prev"
          class="nav-hymn-btn"
          @click="goToHymn(adjacent.prev)"
        >
          <span>‹</span>
          <span>Hino {{ adjacent.prev }}</span>
        </button>
        <div v-else style="flex: 1;"></div>

        <button
          v-if="adjacent.next"
          class="nav-hymn-btn next"
          @click="goToHymn(adjacent.next)"
        >
          <span>Hino {{ adjacent.next }}</span>
          <span>›</span>
        </button>
      </nav>
    </main>

    <!-- Error State -->
    <div v-else style="text-align: center; padding: 4rem 1rem;">
      <h2>Hino não encontrado</h2>
      <p style="color: var(--color-text-secondary); margin-top: 0.5rem;">O hino número {{ hymnNumber }} não foi localizado.</p>
      <button class="btn-primary" style="margin-top: 1.5rem; max-width: 200px;" @click="goBack">Voltar</button>
    </div>

    <!-- Floating Font Size & Quick Adjust Bar -->
    <aside class="reader-controls-bar" :class="{ 'cult-mode': isCultMode }" aria-label="Ajustes de Leitura">
      <button class="font-btn" @click="settingsStore.decreaseFontSize" title="Diminuir fonte">A−</button>
      <button class="font-btn" @click="settingsStore.resetFontSize" title="Fonte padrão">{{ settingsStore.fontSize }}px</button>
      <button class="font-btn" @click="settingsStore.increaseFontSize" title="Aumentar fonte">A+</button>
      <div class="controls-divider"></div>
      <button class="font-btn" @click="toggleCultMode" :title="isCultMode ? 'Sair do Modo Culto' : 'Entrar no Modo Culto'">
        {{ isCultMode ? '📖 Leitura' : '⛪ Culto' }}
      </button>
    </aside>

    <!-- Toast message for link copied -->
    <div
      v-if="toastMessage"
      style="position: fixed; top: calc(var(--header-height) + 1rem); left: 50%; transform: translateX(-50%); background: var(--color-primary); color: #fff; padding: 8px 16px; border-radius: var(--radius-full); font-size: 0.85rem; font-weight: 600; z-index: 250; box-shadow: var(--shadow-md);"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Hymn } from '../types/hymn';
import { useHymnStore } from '../stores/hymnStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import { useHistoryStore } from '../stores/historyStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useWakeLock } from '../composables/useWakeLock';
import { useSwipe } from '../composables/useSwipe';

const route = useRoute();
const router = useRouter();

const hymnStore = useHymnStore();
const favoritesStore = useFavoritesStore();
const historyStore = useHistoryStore();
const settingsStore = useSettingsStore();
const { requestWakeLock, releaseWakeLock } = useWakeLock();

const hymn = ref<Hymn | null>(null);
const isLoading = ref(true);
const isCultMode = ref(false);
const toastMessage = ref('');

const hymnNumber = computed(() => {
  return parseInt(route.params.id as string, 10);
});

const adjacent = computed(() => {
  return hymnStore.getAdjacentHymns(hymnNumber.value);
});

const isCurrentFavorite = computed(() => {
  return hymn.value ? favoritesStore.isFavorite(hymn.value.id) : false;
});

const loadHymn = async (num: number) => {
  if (isNaN(num) || num < 1 || num > 581) {
    hymn.value = null;
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const data = await hymnStore.getHymnById(num);
  hymn.value = data;
  isLoading.value = false;

  if (data) {
    // Add to recents
    historyStore.addHymnToHistory(data);

    // Track read interaction count for PWA prompt
    const count = parseInt(localStorage.getItem('cc_read_count') || '0', 10);
    localStorage.setItem('cc_read_count', String(count + 1));
  }
};

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadHymn(parseInt(newId as string, 10));
    }
  },
  { immediate: true }
);

// Swipe Gestures
const { onTouchStart, onTouchEnd } = useSwipe({
  threshold: 60,
  onSwipeLeft: () => {
    if (adjacent.value.next) {
      goToHymn(adjacent.value.next);
    }
  },
  onSwipeRight: () => {
    if (adjacent.value.prev) {
      goToHymn(adjacent.value.prev);
    }
  }
});

// Keyboard Navigation (Desktop Arrow Keys & Escape)
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight' && adjacent.value.next) {
    goToHymn(adjacent.value.next);
  } else if (e.key === 'ArrowLeft' && adjacent.value.prev) {
    goToHymn(adjacent.value.prev);
  } else if (e.key === 'Escape' && isCultMode.value) {
    toggleCultMode();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  if (settingsStore.keepScreenOn) {
    requestWakeLock();
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  releaseWakeLock();
});

const goToHymn = (num: number) => {
  router.push(`/hino/${num}`);
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
};

const toggleFavorite = () => {
  if (hymn.value) {
    favoritesStore.toggleFavorite(hymn.value);
  }
};

const toggleCultMode = async () => {
  isCultMode.value = !isCultMode.value;
  if (isCultMode.value) {
    await requestWakeLock();
  } else if (!settingsStore.keepScreenOn) {
    await releaseWakeLock();
  }
};

const shareHymn = async () => {
  if (!hymn.value) return;

  const title = `Hino ${hymn.value.number} — ${hymn.value.title}`;
  const url = window.location.href;

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: `Ouça e cante: ${title} (Cantor Cristão)`,
        url: url
      });
      return;
    } catch {
      // Fallback below
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(url);
    toastMessage.value = 'Link copiado para a área de transferência!';
    setTimeout(() => {
      toastMessage.value = '';
    }, 2500);
  } catch {
    toastMessage.value = 'URL: ' + url;
  }
};
</script>
