import { ref } from 'vue';

export interface SwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function useSwipe(options: SwipeOptions = {}) {
  const threshold = options.threshold || 50;
  const startX = ref(0);
  const startY = ref(0);
  const isSwiping = ref(false);

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) return;
    startX.value = e.touches[0].clientX;
    startY.value = e.touches[0].clientY;
    isSwiping.value = true;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (!isSwiping.value) return;
    isSwiping.value = false;

    if (e.changedTouches.length !== 1) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - startX.value;
    const diffY = endY - startY.value;

    // Check if horizontal movement is dominant
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
      if (diffX < 0 && options.onSwipeLeft) {
        options.onSwipeLeft();
      } else if (diffX > 0 && options.onSwipeRight) {
        options.onSwipeRight();
      }
    }
  };

  return {
    onTouchStart,
    onTouchEnd
  };
}
