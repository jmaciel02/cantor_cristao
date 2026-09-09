<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close" role="dialog" aria-modal="true">
    <div class="modal-card">
      <h3 class="modal-title">Ir para o Hino</h3>
      <p class="modal-desc">Digite o número do hino (1 a 581)</p>

      <div style="margin-bottom: 1.25rem;">
        <input
          ref="inputRef"
          type="number"
          min="1"
          max="581"
          v-model="inputNumber"
          placeholder="Ex: 15, 212, 581"
          class="search-input"
          style="padding: 0 1rem; text-align: center; font-size: 1.6rem; font-weight: 700; height: 58px;"
          @keydown.enter="jump"
          @keydown.esc="close"
        />
      </div>

      <!-- Preview of corresponding hymn -->
      <div
        v-if="previewHymn"
        style="padding: 0.75rem 1rem; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); margin-bottom: 1.25rem; text-align: center;"
      >
        <div style="font-size: 0.82rem; color: var(--color-primary); font-weight: 700;">HINO {{ previewHymn.number }}</div>
        <div style="font-size: 1.05rem; font-weight: 600; margin-top: 2px;">{{ previewHymn.title }}</div>
      </div>

      <!-- Compact Quick Keypad -->
      <div class="numpad-grid">
        <button v-for="d in [1, 2, 3, 4, 5, 6, 7, 8, 9]" :key="d" class="numpad-btn" @click="appendDigit(d)">
          {{ d }}
        </button>
        <button class="numpad-btn" style="font-size: 0.9rem;" @click="clearDigits">Limpar</button>
        <button class="numpad-btn" @click="appendDigit(0)">0</button>
        <button class="numpad-btn" style="font-size: 1.1rem;" @click="backspace">⌫</button>
      </div>

      <div class="modal-actions">
        <button class="btn-secondary" @click="close">Cancelar</button>
        <button class="btn-primary" :disabled="!isValid" @click="jump">
          Abrir Hino
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useHymnStore } from '../stores/hymnStore';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const router = useRouter();
const hymnStore = useHymnStore();

const inputNumber = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      inputNumber.value = '';
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  }
);

const numericVal = computed(() => parseInt(inputNumber.value, 10));

const isValid = computed(() => {
  const num = numericVal.value;
  return !isNaN(num) && num >= 1 && num <= 581;
});

const previewHymn = computed(() => {
  if (!isValid.value) return null;
  return hymnStore.summaries.find((h) => h.number === numericVal.value) || null;
});

const appendDigit = (d: number) => {
  if (inputNumber.value.length < 3) {
    const next = inputNumber.value + String(d);
    if (parseInt(next, 10) <= 581) {
      inputNumber.value = next;
    }
  }
};

const backspace = () => {
  inputNumber.value = inputNumber.value.slice(0, -1);
};

const clearDigits = () => {
  inputNumber.value = '';
};

const close = () => {
  emit('close');
};

const jump = () => {
  if (isValid.value) {
    const target = numericVal.value;
    close();
    router.push(`/hino/${target}`);
  }
};
</script>
