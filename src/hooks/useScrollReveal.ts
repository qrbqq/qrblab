import {useEffect, useRef, useState, type MouseEvent} from 'react';
import {useLanguage} from '../context/LanguageContext';
import {useTheme} from '../context/ThemeContext';

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.01,
  rootMargin = '0px 0px 120px 0px',
  disabled = false,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const {lang} = useLanguage();
  const {effectiveTheme} = useTheme();
  const initialLangRef = useRef(lang);
  const initialThemeRef = useRef(effectiveTheme);

  const [isVisible, setIsVisible] = useState<boolean>(
    () => disabled || prefersReducedMotion(),
  );

  // Immediately keep content visible whenever language or theme switches
  useEffect(() => {
    if (
      lang !== initialLangRef.current ||
      effectiveTheme !== initialThemeRef.current
    ) {
      setIsVisible(true);
    }
  }, [lang, effectiveTheme]);

  // 350ms failsafe timeout so no section or card ever remains stuck at opacity: 0
  useEffect(() => {
    if (disabled || isVisible) {
      return;
    }

    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const failsafeTimer = window.setTimeout(() => {
      setIsVisible(true);
    }, 350);

    const node = ref.current;
    if (!node) {
      return () => window.clearTimeout(failsafeTimer);
    }

    const rect = node.getBoundingClientRect();
    if (rect.top <= window.innerHeight + 120) {
      setIsVisible(true);
      window.clearTimeout(failsafeTimer);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
            window.clearTimeout(failsafeTimer);
            break;
          }
        }
      },
      {threshold, rootMargin},
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(failsafeTimer);
    };
  }, [disabled, isVisible, rootMargin, threshold]);

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
