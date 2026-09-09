<template>
  <div class="page-wrapper app-container">
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.25rem;">Ajustes e Acessibilidade</h1>
      <p style="font-size: 0.88rem; color: var(--color-text-secondary);">
        Personalize sua leitura, temas e preferências para o culto
      </p>
    </div>

    <!-- 1. Theme Selection -->
    <section class="hymn-card" style="display: block; margin-bottom: 1.25rem; padding: 1.25rem;">
      <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.35rem;">Tema Visual</h2>
      <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 1rem;">
        Escolha o estilo que oferece o melhor conforto visual para você
      </p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem;">
        <button
          class="font-btn"
          :class="{ 'btn-primary': settingsStore.theme === 'dark' }"
          style="padding: 12px 6px; border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; gap: 4px;"
          @click="settingsStore.setTheme('dark')"
        >
          <span style="font-size: 1.4rem;">🌙</span>
          <span style="font-size: 0.82rem;">Escuro</span>
        </button>

        <button
          class="font-btn"
          :class="{ 'btn-primary': settingsStore.theme === 'light' }"
          style="padding: 12px 6px; border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; gap: 4px;"
          @click="settingsStore.setTheme('light')"
        >
          <span style="font-size: 1.4rem;">☀️</span>
          <span style="font-size: 0.82rem;">Claro</span>
        </button>

        <button
          class="font-btn"
          :class="{ 'btn-primary': settingsStore.theme === 'sepia' }"
          style="padding: 12px 6px; border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; gap: 4px;"
          @click="settingsStore.setTheme('sepia')"
        >
          <span style="font-size: 1.4rem;">📖</span>
          <span style="font-size: 0.82rem;">Sépia</span>
        </button>
      </div>
    </section>

    <!-- 2. Typography & Font Size Scaling (WCAG 200%) -->
    <section class="hymn-card" style="display: block; margin-bottom: 1.25rem; padding: 1.25rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
        <h2 style="font-size: 1.05rem; font-weight: 700;">Tamanho da Letra</h2>
        <span style="font-weight: 700; color: var(--color-primary); font-size: 0.95rem;">
          {{ settingsStore.fontSize }}px ({{ Math.round((settingsStore.fontSize / 18) * 100) }}%)
        </span>
      </div>
      <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin-bottom: 1rem;">
        Ajuste o tamanho ideal para ler no banco da igreja com conforto
      </p>

      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
        <button class="font-btn btn-secondary" style="height: 42px; width: 42px; padding: 0;" @click="settingsStore.decreaseFontSize">A−</button>
        <input
          type="range"
          min="14"
          max="36"
          step="1"
          :value="settingsStore.fontSize"
          @input="onSliderChange"
          style="flex: 1; accent-color: var(--color-primary); height: 6px; cursor: pointer;"
        />
        <button class="font-btn btn-secondary" style="height: 42px; width: 42px; padding: 0;" @click="settingsStore.increaseFontSize">A+</button>
      </div>

      <!-- Live Preview -->
      <div style="padding: 1rem; background: var(--color-bg); border-radius: var(--radius-md); border: 1px dashed var(--color-border);">
        <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 0.35rem; text-transform: uppercase; font-weight: 700;">
          Pré-visualização
        </div>
        <p :style="{ fontSize: settingsStore.fontSize + 'px', lineHeight: '1.6', fontWeight: '500' }">
          Mais perto quero estar, meu Deus, de Ti!<br />
          Inda que seja a dor que me una a Ti!
        </p>
      </div>
    </section>

    <!-- 3. Senior / Easy Reading Mode -->
    <section class="hymn-card" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; padding: 1.25rem;">
      <div style="padding-right: 1rem;">
        <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.25rem;">Modo Leitura Facilitada (Idosos)</h2>
        <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
          Botões e letras maiores, alto contraste e menos distrações visuais
        </p>
      </div>
      <input
        type="checkbox"
        :checked="settingsStore.seniorMode"
        @change="toggleSeniorMode"
        style="width: 24px; height: 24px; accent-color: var(--color-primary); cursor: pointer;"
      />
    </section>

    <!-- 4. Keep Screen Awake in Cult Mode -->
    <section class="hymn-card" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; padding: 1.25rem;">
      <div style="padding-right: 1rem;">
        <h2 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 0.25rem;">Manter Tela Ligada</h2>
        <p style="font-size: 0.82rem; color: var(--color-text-secondary);">
          Impede o celular de bloquear ou apagar a tela durante o hino
        </p>
      </div>
      <input
        type="checkbox"
        :checked="settingsStore.keepScreenOn"
        @change="toggleKeepScreenOn"
        style="width: 24px; height: 24px; accent-color: var(--color-primary); cursor: pointer;"
      />
    </section>

    <!-- 5. Offline Storage Status -->
    <section class="hymn-card" style="display: block; margin-bottom: 1.5rem; padding: 1.25rem;">
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
        <span style="font-size: 1.3rem;">⚡</span>
        <div>
          <h2 style="font-size: 1.05rem; font-weight: 700;">Status do Armazenamento Offline</h2>
          <p style="font-size: 0.82rem; color: var(--color-success); font-weight: 600;">
            ✓ 581 hinos prontos e disponíveis offline
          </p>
        </div>
      </div>
      <p style="font-size: 0.82rem; color: var(--color-text-secondary); margin-top: 0.5rem;">
        Todas as letras, estrofes e refrões estão armazenados localmente no seu dispositivo. Você pode abrir o app em qualquer lugar sem precisar de internet ou sinal de celular.
      </p>
    </section>

    <!-- 6. About & Copyright Notice -->
    <div style="text-align: center; padding: 1rem 0; color: var(--color-text-muted); font-size: 0.82rem;">
      <p><strong>Cantor Cristão PWA</strong> • Versão 1.0.0 (Offline-First)</p>
      <p style="margin-top: 0.25rem;">
        Hinos históricos do Cantor Cristão em domínio público. Feito com amor para a comunidade e para o culto cristão.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../stores/settingsStore';

const settingsStore = useSettingsStore();

const onSliderChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  settingsStore.setFontSize(parseInt(target.value, 10));
};

const toggleSeniorMode = (e: Event) => {
  const target = e.target as HTMLInputElement;
  settingsStore.setSeniorMode(target.checked);
};

const toggleKeepScreenOn = (e: Event) => {
  const target = e.target as HTMLInputElement;
  settingsStore.setKeepScreenOn(target.checked);
};
</script>
