<template>
  <div>
    <!-- 1. POPUP / MODAL AUTOMÁTICO NA ENTRADA -->
    <div v-if="showModal && !isStandalone" class="modal-overlay" @click.self="dismiss">
      <div class="modal-card" style="max-width: 420px; text-align: center; border: 2px solid var(--color-primary); position: relative; padding: 2rem 1.5rem;">
        
        <!-- Close button top right -->
        <button
          class="btn-icon"
          style="position: absolute; top: 12px; right: 12px; width: 32px; height: 32px;"
          @click="dismiss"
          title="Fechar"
        >
          ✕
        </button>

        <!-- App Icon Artwork -->
        <div style="margin: 0 auto 1rem; width: 92px; height: 92px; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.4); background: #050814; border: 2px solid rgba(253, 211, 77, 0.4); display: flex; align-items: center; justify-content: center;">
          <img src="/icons/icon-512x512.png" alt="Cantor Cristão" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>

        <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.4rem; color: var(--color-text-primary);">
          Cantor Cristão
        </h3>
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--color-primary); letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 0.85rem;">
          Hinário Oficial • 581 Hinos
        </div>

        <p style="font-size: 0.92rem; color: var(--color-text-secondary); line-height: 1.5; margin-bottom: 1.5rem;">
          Instale o aplicativo no seu celular para acessar todos os hinos <strong>100% offline</strong> durante os cultos.
        </p>

        <!-- Caso A: Navegador com prompt nativo disponível (Chrome/Android/Edge) -->
        <div v-if="hasNativePrompt">
          <button
            class="btn-primary"
            style="width: 100%; height: 54px; font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4); border-radius: var(--radius-md);"
            @click="triggerInstall"
          >
            <span>📲</span>
            <span>Instalar Aplicativo Agora</span>
          </button>
        </div>

        <!-- Caso B: iPhone / iPad (Safari) -->
        <div v-else-if="isIos" style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1rem; text-align: left; margin-bottom: 1rem;">
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.4rem;">
            COMO INSTALAR NO IPHONE:
          </div>
          <ol style="font-size: 0.85rem; color: var(--color-text-primary); line-height: 1.6; padding-left: 1.2rem; margin: 0;">
            <li>Toque no botão <strong>Compartilhar</strong> (ícone com seta ⎋ na barra do Safari).</li>
            <li>Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> ➕.</li>
            <li>Toque em <strong>"Adicionar"</strong> no canto superior direito.</li>
          </ol>
        </div>

        <!-- Caso C: Android ou Desktop onde o evento ainda não disparou ou navegador alternativo -->
        <div v-else style="background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1.1rem; text-align: left; margin-bottom: 1rem;">
          <div style="font-size: 0.88rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;">
            <span>💡</span>
            <span>COMO INSTALAR NO SEU NAVEGADOR:</span>
          </div>
          <ol style="font-size: 0.85rem; color: var(--color-text-primary); line-height: 1.6; padding-left: 1.2rem; margin: 0;">
            <li>Toque no <strong>menu de opções</strong> (os 3 pontinhos <strong>⋮</strong> no canto superior do navegador).</li>
            <li>Toque na opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
            <li>Confirme e o ícone dourado do Cantor Cristão aparecerá nos seus aplicativos!</li>
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
        <img src="/icons/icon-192x192.png" alt="Ícone" style="width: 42px; height: 42px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2);" />
        <div class="install-banner-text">
          <h4>Instalar Cantor Cristão</h4>
          <p>Tenha todos os hinos 100% offline</p>
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
import { ref, computed, onMounted } from 'vue';

const deferredPrompt = ref<any>(null);
const showModal = ref(false);
const showTopBanner = ref(false);
const isStandalone = ref(false);
const isIos = ref(false);

const hasNativePrompt = computed(() => !!deferredPrompt.value);

onMounted(() => {
  if (typeof window === 'undefined') return;

  // Check if opened as standalone installed PWA
  isStandalone.value =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  if (isStandalone.value) return;

  // Detect iOS Safari
  const ua = window.navigator.userAgent.toLowerCase();
  isIos.value = /iphone|ipad|ipod/.test(ua);

  // Listen for Chrome/Android/Edge beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredPrompt.value = e;
    showModal.value = true;
  });

  // Open the modal automatically on entrance if not in standalone mode
  const wasDismissed = sessionStorage.getItem('cc_install_dismissed');
  if (!wasDismissed) {
    setTimeout(() => {
      if (!isStandalone.value) {
        showModal.value = true;
      }
    }, 600);
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
    try {
      deferredPrompt.value.prompt();
      const choice = await deferredPrompt.value.userChoice;
      if (choice && choice.outcome === 'accepted') {
        showModal.value = false;
        showTopBanner.value = false;
      }
    } catch (err) {
      console.warn('Erro ao disparar prompt:', err);
    }
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
