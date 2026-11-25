import {useEffect, useRef, useState, type MouseEvent} from 'react';
import {
  SCROLL_REVEAL_ROOT_MARGIN,
  SCROLL_REVEAL_THRESHOLD,
  shouldRevealFromGeometry,
} from '../utils/scrollReveal';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  marginBottomPx?: number;
  disabled?: boolean;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = SCROLL_REVEAL_THRESHOLD,
  rootMargin = SCROLL_REVEAL_ROOT_MARGIN,
  marginBottomPx = 60,
  disabled = false,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T | null>(null);

  const [isVisible, setIsVisible] = useState<boolean>(
    () =>
      disabled ||
      prefersReducedMotion() ||
      typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    if (disabled || isVisible) {
      return;
    }

    if (
      prefersReducedMotion() ||
      typeof IntersectionObserver === 'undefined'
    ) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) {
      setIsVisible(true);
      return;
    }

    let revealed = false;
    let observer: IntersectionObserver | null = null;
    let settleTimer: number | null = null;

    const triggerReveal = () => {
      if (revealed) {
        return;
      }
      revealed = true;
      setIsVisible(true);
      observer?.disconnect();
      window.removeEventListener('scroll', checkGeometry);
      window.removeEventListener('resize', checkGeometry);
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
        settleTimer = null;
      }
    };

    const checkGeometry = () => {
      if (revealed) {
        return;
      }
      const rect = node.getBoundingClientRect();
      if (shouldRevealFromGeometry(rect, window.innerHeight, marginBottomPx)) {
        triggerReveal();
      }
    };

    // Immediate viewport & post-route-transition geometry checks
    checkGeometry();
    if (revealed) {
      return;
    }

    settleTimer = window.setTimeout(checkGeometry, 240);

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            entry.isIntersecting ||
            shouldRevealFromGeometry(
              entry.boundingClientRect,
              window.innerHeight,
              marginBottomPx,
            )
          ) {
            triggerReveal();
            break;
          }
        }
      },
      {
        threshold: [0, threshold],
        rootMargin,
      },
    );

    observer.observe(node);
    window.addEventListener('scroll', checkGeometry, {passive: true});
    window.addEventListener('resize', checkGeometry, {passive: true});

    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', checkGeometry);
      window.removeEventListener('resize', checkGeometry);
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
      }
    };
  }, [disabled, isVisible, marginBottomPx, rootMargin, threshold]);

  return {ref, isVisible};
}

export function handleSpotlightMouseMove(event: MouseEvent<HTMLElement>): void {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  target.style.setProperty('--mouse-x', `${x}px`);
  target.style.setProperty('--mouse-y', `${y}px`);
}
