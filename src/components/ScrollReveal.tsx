import type {CSSProperties, ReactNode} from 'react';
import {useScrollReveal} from '../hooks/useScrollReveal';
import {computeStaggerDelayMs} from '../utils/scrollReveal';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  staggerIndex?: number;
  delayMs?: number;
  as?:
    | 'div'
    | 'section'
    | 'header'
    | 'footer'
    | 'article'
    | 'li'
    | 'p'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'dl'
    | 'nav';
  threshold?: number;
  disabled?: boolean;
}

export function ScrollReveal({
  children,
  className = '',
  staggerIndex = 0,
  delayMs,
  as = 'div',
  threshold,
  disabled = false,
}: ScrollRevealProps) {
  const {ref, isVisible} = useScrollReveal<HTMLDivElement>({
    threshold,
    disabled,
  });

  const resolvedDelay =
    delayMs !== undefined ? delayMs : computeStaggerDelayMs(staggerIndex);

  const style =
    resolvedDelay > 0
      ? ({'--reveal-delay': `${resolvedDelay}ms`} as CSSProperties)
      : undefined;

  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      data-revealed={isVisible}
      style={style}
      className={`scroll-reveal-item ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
