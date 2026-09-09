import { ref, onMounted, onUnmounted } from 'vue';

export function useWakeLock() {
  const isSupported = ref(false);
  const isActive = ref(false);
  let wakeLockSentinel: any = null;

  onMounted(() => {
    isSupported.value = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  });

  const requestWakeLock = async () => {
    if (!isSupported.value) return false;
    try {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      isActive.value = true;

      wakeLockSentinel.addEventListener('release', () => {
        isActive.value = false;
        wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('Wake Lock não pôde ser ativado:', err);
      isActive.value = false;
      return false;
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockSentinel) {
      try {
        await wakeLockSentinel.release();
      } catch (err) {
        console.warn('Erro ao liberar Wake Lock:', err);
      } finally {
        wakeLockSentinel = null;
        isActive.value = false;
      }
    }
  };

  onUnmounted(() => {
    releaseWakeLock();
  });

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock
  };
}
