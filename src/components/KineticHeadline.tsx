import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';
import {
  buildKineticHeadlineLayout,
  computeCharDelayMs,
  KINETIC_FAILSAFE_TIMEOUT_MS,
  KINETIC_HEADLINE_THRESHOLD,
  shouldTriggerKineticHeadline,
} from '../utils/kineticHeadline';

interface KineticHeadlineProps {
  as?: 'h1' | 'h2';
  text: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  headingRef?: Ref<HTMLHeadingElement>;
  /**
   * Optional readiness gate (e.g. hold until initial intro overlay reveals hero,
   * or until StatementCard shroud dissolves). Defaults to true.
   */
  triggerReady?: boolean;
  threshold?: number;
}

function detectReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const KineticHeadline = memo(function KineticHeadline({
  as = 'h2',
  text,
  id,
  className = '',
  style,
  headingRef,
  triggerReady = true,
  threshold = KINETIC_HEADLINE_THRESHOLD,
}: KineticHeadlineProps) {
  const localRef = useRef<HTMLHeadingElement | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() =>
    detectReducedMotion(),
  );
  const [assembled, setAssembled] = useState<boolean>(
    () =>
      detectReducedMotion() ||
      typeof IntersectionObserver === 'undefined',
  );
  const hasAssembledRef = useRef<boolean>(assembled);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      setIsReducedMotion(mq.matches);
      if (mq.matches) {
        hasAssembledRef.current = true;
        setAssembled(true);
      }
    };
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setRefs = useCallback(
    (node: HTMLHeadingElement | null) => {
      localRef.current = node;
      if (!headingRef) {
        return;
      }
      if (typeof headingRef === 'function') {
        headingRef(node);
      } else {
        (headingRef as {current: HTMLHeadingElement | null}).current = node;
      }
    },
    [headingRef],
  );

  useEffect(() => {
    if (hasAssembledRef.current || assembled) {
      return;
    }

    if (isReducedMotion || typeof IntersectionObserver === 'undefined') {
      hasAssembledRef.current = true;
      setAssembled(true);
      return;
    }

    if (!triggerReady) {
      return;
    }

    const node = localRef.current;
    if (!node) {
      hasAssembledRef.current = true;
      setAssembled(true);
      return;
    }

    let disposed = false;
    let rafOne: number | null = null;
    let rafTwo: number | null = null;
    let settleCheckTimer: number | null = null;
    let failsafeTimer: number | null = null;
    let observer: IntersectionObserver | null = null;

    const cleanup = () => {
      observer?.disconnect();
      window.removeEventListener('scroll', checkScrollGeometry);
      window.removeEventListener('resize', checkScrollGeometry);
      if (rafOne !== null) window.cancelAnimationFrame(rafOne);
      if (rafTwo !== null) window.cancelAnimationFrame(rafTwo);
      if (settleCheckTimer !== null) window.clearTimeout(settleCheckTimer);
      if (failsafeTimer !== null) window.clearTimeout(failsafeTimer);
    };

    const triggerAssemble = (immediateFrame = false) => {
      if (disposed || hasAssembledRef.current) {
        return;
      }
      hasAssembledRef.current = true;
      observer?.disconnect();
      window.removeEventListener('scroll', checkScrollGeometry);
      window.removeEventListener('resize', checkScrollGeometry);

      if (immediateFrame) {
        setAssembled(true);
        cleanup();
        return;
      }

      // Double-rAF ensures the browser commits the initial translateY(115%) frame
      // before transitioning to translateY(0%), so above-the-fold headlines animate smoothly.
      rafOne = window.requestAnimationFrame(() => {
        if (disposed) return;
        rafTwo = window.requestAnimationFrame(() => {
          if (disposed) return;
          setAssembled(true);
          if (failsafeTimer !== null) {
            window.clearTimeout(failsafeTimer);
            failsafeTimer = null;
          }
        });
      });
    };

    const checkScrollGeometry = () => {
      if (disposed || hasAssembledRef.current) {
        return;
      }
      const rect = node.getBoundingClientRect();
      if (shouldTriggerKineticHeadline(rect, window.innerHeight, threshold)) {
        triggerAssemble(false);
      }
    };

    // Immediate viewport check (double-rAF so entry still animates bottom-to-top)
    checkScrollGeometry();
    if (hasAssembledRef.current) {
      // Failsafe in case rAF is throttled in background tab
      failsafeTimer = window.setTimeout(() => {
        if (!disposed) {
          setAssembled(true);
        }
      }, KINETIC_FAILSAFE_TIMEOUT_MS);
      return cleanup;
    }

    // Check again after route-transition settle (~240ms)
    settleCheckTimer = window.setTimeout(checkScrollGeometry, 240);

    // 1.2s fallback timeout: if headline is near/inside/past viewport or failsafe triggers after scroll
    failsafeTimer = window.setTimeout(() => {
      if (disposed || hasAssembledRef.current) {
        return;
      }
      const rect = node.getBoundingClientRect();
      if (
        shouldTriggerKineticHeadline(rect, window.innerHeight, 0) ||
        rect.top <= window.innerHeight * 1.05
      ) {
        triggerAssemble(true);
      }
    }, KINETIC_FAILSAFE_TIMEOUT_MS);

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            (entry.isIntersecting &&
              (entry.intersectionRatio >= threshold ||
                entry.boundingClientRect.top <= window.innerHeight * 0.88)) ||
            entry.boundingClientRect.top < 0
          ) {
            triggerAssemble(false);
            break;
          }
        }
      },
      {
        threshold: [0, threshold, 0.35],
      },
    );

    observer.observe(node);
    window.addEventListener('scroll', checkScrollGeometry, {passive: true});
    window.addEventListener('resize', checkScrollGeometry, {passive: true});

    return cleanup;
  }, [assembled, isReducedMotion, threshold, triggerReady]);

  const layout = useMemo(() => buildKineticHeadlineLayout(text), [text]);
  const Tag = as;

  return (
    <Tag
      ref={setRefs}
      id={id}
      aria-label={text}
      data-kinetic-headline="true"
      data-assembled={assembled ? 'true' : 'false'}
      style={style}
      className={`font-display-bebas ${className}`.trim()}
    >
      <span aria-hidden="true" className="inline">
        {layout.words.map((wordToken, wordIdx) => (
          <Fragment key={`${wordToken.word}-${wordIdx}`}>
            <span data-kinetic-word="true" className="kinetic-word">
              {wordToken.chars.map((char, charOffset) => {
                const globalCharIdx = wordToken.startCharIndex + charOffset;
                const delayMs = isReducedMotion
                  ? 0
                  : computeCharDelayMs(globalCharIdx, layout.stepMs);

                return (
                  <span key={`${char}-${charOffset}`} className="kinetic-char-mask">
                    <span
                      className="kinetic-char"
                      style={
                        delayMs > 0
                          ? ({'--char-delay': `${delayMs}ms`} as CSSProperties)
                          : undefined
                      }
                    >
                      {char}
                    </span>
                  </span>
                );
              })}
            </span>
            {wordToken.hasTrailingSpace ? ' ' : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
});
