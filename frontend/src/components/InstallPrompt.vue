<template>
  <div v-if="showBanner" class="install-banner" role="banner">
    <div class="install-banner-text">
      <h4>Instalar o Cantor Cristão</h4>
      <p>Tenha todos os 581 hinos disponíveis mesmo sem internet no seu celular.</p>
    </div>
    <div style="display: flex; gap: 8px; align-items: center;">
      <button class="font-btn" style="color: #ffffff; opacity: 0.8;" @click="dismiss">
        Agora não
      </button>
      <button class="install-banner-btn" @click="installApp">
        Instalar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const deferredPrompt = ref<any>(null);
const showBanner = ref(false);

onMounted(() => {
  if (typeof window === 'undefined') return;

  const dismissed = sessionStorage.getItem('cc_install_dismissed');
  if (dismissed) return;

  window.addEventListener('beforeinstallprompt', (e: any) => {
    e.preventDefault();
    deferredPrompt.value = e;

    // Check interaction count: only show if user has visited hymns
    const interactions = parseInt(localStorage.getItem('cc_read_count') || '0', 10);
    if (interactions >= 2) {
      showBanner.value = true;
    }
  });

  window.addEventListener('appinstalled', () => {
    showBanner.value = false;
    deferredPrompt.value = null;
  });
});

const installApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    const choice = await deferredPrompt.value.userChoice;
    if (choice.outcome === 'accepted') {
      showBanner.value = false;
    }
    deferredPrompt.value = null;
  }
};

const dismiss = () => {
  showBanner.value = false;
  sessionStorage.setItem('cc_install_dismissed', 'true');
};
</script>
