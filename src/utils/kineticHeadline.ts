export interface KineticWordToken {
  word: string;
  chars: string[];
  startCharIndex: number;
  hasTrailingSpace: boolean;
}

export interface KineticHeadlineLayout {
  words: KineticWordToken[];
  totalChars: number;
  stepMs: number;
}

export const KINETIC_HEADLINE_THRESHOLD = 0.18;
export const KINETIC_CHAR_DURATION_MS = 300;
export const KINETIC_FAILSAFE_TIMEOUT_MS = 1200;
export const KINETIC_MAX_TOTAL_STAGGER_MS = 720;

/**
 * Splits a string into user-perceived grapheme clusters so multi-byte Unicode
 * characters or accents never tear mid-glyph during character masking.
 */
export function splitGraphemes(text: string): string[] {
  if (!text) {
    return [];
  }
  const IntlWithSegmenter = Intl as typeof Intl & {
    Segmenter?: new (
      locales?: string | string[],
      options?: {granularity: 'grapheme' | 'word' | 'sentence'},
    ) => {segment: (input: string) => Iterable<{segment: string}>};
  };

  if (typeof Intl !== 'undefined' && typeof IntlWithSegmenter.Segmenter === 'function') {
    const segmenter = new IntlWithSegmenter.Segmenter('en', {
      granularity: 'grapheme',
    });
    return Array.from(segmenter.segment(text), (item) => item.segment);
  }
  return Array.from(text);
}

/**
 * Computes a snappy, exhilarating per-character stagger step strictly within
 * 12ms..18ms based on total character count.
 */
export function computeCharStaggerStepMs(totalChars: number): number {
  if (!Number.isFinite(totalChars) || totalChars <= 16) {
    return 18;
  }
  if (totalChars <= 32) {
    return 15;
  }
  return 12;
}

/**
 * Computes the transition-delay in milliseconds for a single character index,
 * bounded so long headlines remain brisk and never feel sluggish.
 */
export function computeCharDelayMs(
  charIndex: number,
  stepMs: number,
  maxTotalStaggerMs = KINETIC_MAX_TOTAL_STAGGER_MS,
): number {
  if (!Number.isFinite(charIndex) || charIndex <= 0) {
    return 0;
  }
  const safeStep = Number.isFinite(stepMs) ? Math.max(0, stepMs) : 0;
  const safeMax = Number.isFinite(maxTotalStaggerMs)
    ? Math.max(0, maxTotalStaggerMs)
    : KINETIC_MAX_TOTAL_STAGGER_MS;
  return Math.min(safeMax, Math.round(charIndex * safeStep));
}

/**
 * Tokenizes a headline into word groups with per-character indices.
 * Grouping characters inside word spans prevents mid-word wrapping on narrow viewports.
 */
export function buildKineticHeadlineLayout(text: string): KineticHeadlineLayout {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return {words: [], totalChars: 0, stepMs: 16};
  }

  const rawWords = normalized.split(' ');
  const words: KineticWordToken[] = [];
  let cursor = 0;

  rawWords.forEach((word, idx) => {
    const chars = splitGraphemes(word);
    words.push({
      word,
      chars,
      startCharIndex: cursor,
      hasTrailingSpace: idx < rawWords.length - 1,
    });
    cursor += chars.length;
  });

  return {
    words,
    totalChars: cursor,
    stepMs: computeCharStaggerStepMs(cursor),
  };
}

export interface HeadlineViewportRect {
  top: number;
  bottom: number;
  height: number;
}

/**
 * Returns true if the headline has entered the viewport (>= ~18% visible or top
 * within the active reveal band) OR has already been scrolled past above.
 */
export function shouldTriggerKineticHeadline(
  rect: HeadlineViewportRect,
  viewportHeight: number,
  threshold = KINETIC_HEADLINE_THRESHOLD,
): boolean {
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    return true;
  }
  if (!Number.isFinite(rect.top) || !Number.isFinite(rect.bottom)) {
    return true;
  }
  if (rect.height <= 0) {
    return true;
  }
  // Scrolled past above the viewport (fast scroll) -> must never stay invisible
  if (rect.top < 0) {
    return true;
  }
  const visiblePx =
    Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
  const ratio = visiblePx / rect.height;
  return ratio >= threshold || rect.top <= viewportHeight * 0.88;
}
