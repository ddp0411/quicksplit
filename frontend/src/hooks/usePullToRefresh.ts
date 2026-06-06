import { useRef, useEffect, useCallback } from 'react';

const THRESHOLD = 65;

export function usePullToRefresh(onRefresh: () => void, enabled = true) {
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const indicatorRef = useRef<HTMLDivElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return;
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, [enabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY.current === null || !enabled) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY === 0) {
      pulling.current = true;
      const progress = Math.min(delta / THRESHOLD, 1);
      if (indicatorRef.current) {
        indicatorRef.current.style.transform = `translateY(${Math.min(delta * 0.4, 28)}px)`;
        indicatorRef.current.style.opacity = String(progress);
      }
    }
  }, [enabled]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (startY.current === null || !enabled) return;
    const delta = e.changedTouches[0].clientY - startY.current;
    if (pulling.current && delta >= THRESHOLD) {
      onRefresh();
    }
    startY.current = null;
    pulling.current = false;
    if (indicatorRef.current) {
      indicatorRef.current.style.transform = '';
      indicatorRef.current.style.opacity = '0';
    }
  }, [enabled, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { indicatorRef };
}
