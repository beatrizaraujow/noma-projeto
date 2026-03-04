import { useRef, useCallback } from 'react';
import { PanInfo } from 'framer-motion';

interface SwipeGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
}

export function useSwipeGesture(config: SwipeGestureConfig) {
  const { 
    onSwipeLeft, 
    onSwipeRight, 
    onSwipeUp, 
    onSwipeDown,
    threshold = 50 
  } = config;

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const { offset, velocity } = info;

      // Horizontal swipes
      if (Math.abs(offset.x) > Math.abs(offset.y)) {
        if (offset.x > threshold || velocity.x > 500) {
          onSwipeRight?.();
        } else if (offset.x < -threshold || velocity.x < -500) {
          onSwipeLeft?.();
        }
      }
      // Vertical swipes
      else {
        if (offset.y > threshold || velocity.y > 500) {
          onSwipeDown?.();
        } else if (offset.y < -threshold || velocity.y < -500) {
          onSwipeUp?.();
        }
      }
    },
    [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]
  );

  return {
    drag: true,
    dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
    dragElastic: 0.2,
    onDragEnd: handleDragEnd,
  };
}
