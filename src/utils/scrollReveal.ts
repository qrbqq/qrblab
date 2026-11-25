import {MOTION_STAGGER} from './motion';

export const SCROLL_REVEAL_ROOT_MARGIN = '0px 0px 60px 0px';
export const SCROLL_REVEAL_THRESHOLD = 0.05;
export const SCROLL_REVEAL_STAGGER_MS = MOTION_STAGGER.stepMs;
export const SCROLL_REVEAL_MAX_STAGGER_MS = MOTION_STAGGER.maxMs;

export interface RevealGeometryRect {
  top: number;
  bottom: number;
  height: number;
}

export function computeStaggerDelayMs(
  index: number,
  stepMs = SCROLL_REVEAL_STAGGER_MS,
  maxMs = SCROLL_REVEAL_MAX_STAGGER_MS,
): number {
  if (!Number.isFinite(index) || index <= 0) {
    return 0;
  }
  const safeStep = Number.isFinite(stepMs) ? Math.max(0, stepMs) : 0;
  const safeMax = Number.isFinite(maxMs) ? Math.max(0, maxMs) : 0;
  return Math.min(safeMax, Math.round(index * safeStep));
}

/**
 * Determines whether an element is already inside, scrolled past above,
 * or within the bottom trigger margin of the viewport.
 */
export function shouldRevealFromGeometry(
  rect: RevealGeometryRect,
  viewportHeight: number,
  marginBottomPx = 60,
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
  return rect.top <= viewportHeight + Math.max(0, marginBottomPx);
}
