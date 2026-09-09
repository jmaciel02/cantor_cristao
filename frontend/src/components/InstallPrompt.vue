<template>
  <div>
    <!-- 1. POPUP / MODAL AUTOMÁTICO NA ENTRADA -->
    <div v-if="showModal && !isStandalone" class="modal-overlay" @click.self="dismiss">
      <div class="modal-card" style="max-width: 400px; text-align: center; border: 2px solid var(--color-primary);">
        
        <!-- App Icon Artwork -->
        <div style="margin: 0 auto 1.25rem; width: 88px; height: 88px; border-radius: 22px; overflow: hidden; box-shadow: var(--shadow-lg); background: #0b1329; display: flex; align-items: center; justify-content: center;">
          <img src="/icons/icon-192x192.png" alt="Cantor Cristão" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>

        <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--color-text-primary);">
          Instalar o Cantor Cristão
        </h3>

        <p style="font-size: 0.92rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 1.5rem;">
          Tenha todos os <strong>581 hinos</strong> disponíveis na palma da mão, funcionando <strong>100% sem internet</strong> no banco da igreja.
        </p>

        <!-- Se for Android / Chrome / Edge -->
        <div v-if="deferredPrompt || !isIos">
          <button
            class="btn-primary"
            style="width: 100%; height: 54px; font-size: 1.05rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);"
            @click="triggerInstall"
          >
            <span>📲</span>
            <span>Instalar Aplicativo Agora</span>
          </button>
        </div>

        <!-- Se for iPhone / Safari iOS -->
        <div v-else style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1rem; text-align: left; margin-bottom: 1.25rem;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem;">
            COMO INSTALAR NO IPHONE:
          </div>
          <ol style="font-size: 0.82rem; color: var(--color-text-primary); line-height: 1.6; padding-left: 1.2rem; margin: 0;">
            <li>Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima ⎋ na barra do Safari).</li>
            <li>Role a lista para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> ➕.</li>
            <li>Toque em <strong>"Adicionar"</strong> no canto superior direito.</li>
          </ol>
        </div>

        <button
          class="font-btn"
          style="margin-top: 1rem; width: 100%; color: var(--color-text-muted); font-size: 0.88rem;"
          @click="dismiss"
        >
          Continuar no navegador
        </button>
      </div>
    </div>

    <!-- 2. BANNER FIXO TOPO CASO DISPENSE O MODAL -->
    <div v-if="showTopBanner && !isStandalone" class="install-banner" style="margin-bottom: 1.25rem;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <img src="/icons/icon-192x192.png" alt="Ícone" style="width: 40px; height: 40px; border-radius: 10px;" />
        <div class="install-banner-text">
          <h4>Instalar Cantor Cristão</h4>
          <p>Disponível 100% offline</p>
        </div>
      </div>
      <div style="display: flex; gap: 6px;">
        <button class="install-banner-btn" @click="openModal">
          Instalar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const deferredPrompt = ref<any>(null);
const showModal = ref(false);
const showTopBanner = ref(false);
const isStandalone = ref(false);
const isIos = ref(false);

onMounted(() => {
  if (typeof window === 'undefined') return;

  // Check if already opened in standalone PWA app mode
  isStandalone.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  if (isStandalone.value) return;

  // Detect iOS Safari
  const ua = window.navigator.userAgent.toLowerCase();
  isIos.value = /iphone|ipad|ipod/.test(ua);

  // Check dismissal
  const wasDismissed = sessionStorage.getItem('cc_install_dismissed');

  // If Chrome / Android / Edge: listen for prompt
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredPrompt.value = e;

    if (!wasDismissed) {
      showModal.value = true;
    } else {
      showTopBanner.value = true;
    }
  });

  // If iOS Safari or prompt not fired within 1.5s, show friendly prompt anyway
  if (!wasDismissed) {
    setTimeout(() => {
      if (!isStandalone.value && !showModal.value) {
        showModal.value = true;
      }
    }, 800);
  } else {
    showTopBanner.value = true;
  }

  window.addEventListener('appinstalled', () => {
    showModal.value = false;
    showTopBanner.value = false;
    isStandalone.value = true;
    deferredPrompt.value = null;
  });
});

const triggerInstall = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    const choice = await deferredPrompt.value.userChoice;
    if (choice.outcome === 'accepted') {
      showModal.value = false;
      showTopBanner.value = false;
    }
    deferredPrompt.value = null;
  } else {
    // If prompt couldn't trigger directly (e.g. desktop browser), show browser hint
    alert('Para instalar: Clique no ícone de computador/instalação na barra de endereço do seu navegador ou no menu de opções.');
  }
};

const openModal = () => {
  showModal.value = true;
};

const dismiss = () => {
  showModal.value = false;
  showTopBanner.value = true;
  sessionStorage.setItem('cc_install_dismissed', 'true');
};
</script>
