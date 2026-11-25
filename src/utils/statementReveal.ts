export type StatementRevealPhase =
  | 'idle'
  | 'black-cover'
  | 'scattered-particles'
  | 'particle-converge'
  | 'cover-dissolve'
  | 'text-reveal'
  | 'revealed';

export interface StatementTimelineSample {
  phase: StatementRevealPhase;
  coverAlpha: number;
  particleAlpha: number;
  particleConverge: number;
  turbulence: number;
  headingOpacity: number;
  bodyProgress: number;
  completed: boolean;
}

export interface WordLensResponse {
  scale: number;
  focus: number;
  liftY: number;
  shiftX: number;
}

export interface StatementTextToken {
  text: string;
  isWhitespace: boolean;
}

/**
 * Tight ~2.65s 5-stage choreography:
 *   0..320ms      -> Stage 1: Black Cover (#000000 shroud covers card)
 *   320..760ms    -> Stage 2: Scattered Title Particles (white pinpoint particles over #000000)
 *   760..1820ms   -> Stage 3: Particle Convergence (form exact heading + crisp hold)
 *   1820..2320ms  -> Stage 4: Black Cover Dissolve (cover fades, aligning with real DOM heading)
 *   2140..2660ms  -> Stage 5: Statement Text Reveal (real DOM paragraphs reveal inside card)
 */
export const STATEMENT_STAGE1_END_MS = 320;
export const STATEMENT_STAGE2_END_MS = 760;
export const STATEMENT_STAGE3_CONVERGE_END_MS = 1620;
export const STATEMENT_STAGE3_END_MS = 1820;
export const STATEMENT_STAGE4_END_MS = 2320;
export const STATEMENT_STAGE5_START_MS = 2140;
export const STATEMENT_TOTAL_DURATION_MS = 2660;
export const STATEMENT_FAILSAFE_TIMEOUT_MS = 3500;
export const STATEMENT_INTERSECTION_THRESHOLD = 0.22;

export const OPTICAL_LENS_RADIUS_PX = 64;
export const OPTICAL_LENS_MAX_SCALE = 1.15;

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 3);
}

function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutQuint(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 5);
}

function smoothStep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) {
    return x >= edge1 ? 1 : 0;
  }
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function evaluateStatementTimeline(
  elapsedMs: number,
): StatementTimelineSample {
  const t = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);

  if (t >= STATEMENT_TOTAL_DURATION_MS) {
    return {
      phase: 'revealed',
      coverAlpha: 0,
      particleAlpha: 0,
      particleConverge: 1,
      turbulence: 0,
      headingOpacity: 1,
      bodyProgress: 1,
      completed: true,
    };
  }

  // Stage 1: Black Cover fades/sweeps completely over card
  if (t < STATEMENT_STAGE1_END_MS) {
    const p = t / STATEMENT_STAGE1_END_MS;
    return {
      phase: 'black-cover',
      coverAlpha: easeOutCubic(p),
      particleAlpha: 0,
      particleConverge: 0,
      turbulence: 0.28,
      headingOpacity: 0,
      bodyProgress: 0,
      completed: false,
    };
  }

  // Stage 2: Scattered white pinpoint particles emerge over #000000 shroud
  if (t < STATEMENT_STAGE2_END_MS) {
    const p = (t - STATEMENT_STAGE1_END_MS) / (STATEMENT_STAGE2_END_MS - STATEMENT_STAGE1_END_MS);
    return {
      phase: 'scattered-particles',
      coverAlpha: 1,
      particleAlpha: easeOutCubic(p),
      particleConverge: 0,
      turbulence: 0.28,
      headingOpacity: 0,
      bodyProgress: 0,
      completed: false,
    };
  }

  // Stage 3: Particles converge smoothly into "Research Disclaimer & Project Statement"
  if (t < STATEMENT_STAGE3_END_MS) {
    const convergeSpan = STATEMENT_STAGE3_CONVERGE_END_MS - STATEMENT_STAGE2_END_MS;
    const rawConverge = clamp01((t - STATEMENT_STAGE2_END_MS) / convergeSpan);
    const particleConverge = easeOutQuint(rawConverge);
    const turbulence =
      t < STATEMENT_STAGE3_CONVERGE_END_MS
        ? Math.sin(rawConverge * Math.PI) * 0.42
        : 0.02;

    return {
      phase: 'particle-converge',
      coverAlpha: 1,
      particleAlpha: 1,
      particleConverge,
      turbulence,
      headingOpacity: 0,
      bodyProgress: 0,
      completed: false,
    };
  }

  // Stage 4 + Stage 5 overlap smoothly at 2140ms: Black Cover dissolves -> real DOM text reveals
  const coverDissolveP = clamp01(
    (t - STATEMENT_STAGE3_END_MS) / (STATEMENT_STAGE4_END_MS - STATEMENT_STAGE3_END_MS),
  );
  const coverAlpha = 1 - easeInOutCubic(coverDissolveP);
  const headingOpacity = smoothStep(
    STATEMENT_STAGE3_END_MS + 40,
    STATEMENT_STAGE4_END_MS - 40,
    t,
  );
  const particleAlpha = 1 - smoothStep(STATEMENT_STAGE3_END_MS + 60, STATEMENT_STAGE4_END_MS, t);
  const bodyProgress =
    t < STATEMENT_STAGE5_START_MS
      ? 0
      : easeOutCubic(
          (t - STATEMENT_STAGE5_START_MS) /
            (STATEMENT_TOTAL_DURATION_MS - STATEMENT_STAGE5_START_MS),
        );

  const phase: StatementRevealPhase =
    t < STATEMENT_STAGE5_START_MS ? 'cover-dissolve' : 'text-reveal';

  return {
    phase,
    coverAlpha,
    particleAlpha,
    particleConverge: 1,
    turbulence: 0.015,
    headingOpacity,
    bodyProgress,
    completed: false,
  };
}

/**
 * Splits prose into alternating word and whitespace tokens so inline-block
 * word spans preserve identical line wrapping and inter-word spacing.
 */
export function tokenizeTextWords(text: string): StatementTextToken[] {
  if (!text) {
    return [];
  }
  const parts = text.split(/(\s+)/);
  const tokens: StatementTextToken[] = [];
  for (const part of parts) {
    if (!part) {
      continue;
    }
    tokens.push({
      text: part,
      isWhitespace: /^\s+$/.test(part),
    });
  }
  return tokens;
}

/**
 * Computes smooth radial optical magnifying lens response for a single word.
 */
export function computeWordLensResponse(
  distancePx: number,
  radiusPx = OPTICAL_LENS_RADIUS_PX,
  maxScale = OPTICAL_LENS_MAX_SCALE,
  horizontalDeltaPx = 0,
): WordLensResponse {
  if (
    !Number.isFinite(distancePx) ||
    !Number.isFinite(radiusPx) ||
    radiusPx <= 0 ||
    distancePx >= radiusPx
  ) {
    return {scale: 1, focus: 0, liftY: 0, shiftX: 0};
  }

  const d = Math.max(0, distancePx);
  const norm = 1 - d / radiusPx;
  const falloff = norm * norm * (3 - 2 * norm);
  const sharpened = Math.pow(falloff, 1.45);

  const dirRatio = Math.max(-1, Math.min(1, horizontalDeltaPx / (radiusPx * 0.55)));
  const shiftMag = Math.sin(clamp01(Math.abs(dirRatio)) * Math.PI) * 3.2;
  const shiftX = dirRatio === 0 ? 0 : Math.sign(dirRatio) * shiftMag * falloff;

  return {
    scale: Number((1 + (maxScale - 1) * sharpened).toFixed(4)),
    focus: Number(sharpened.toFixed(4)),
    liftY: Number((-0.75 * sharpened).toFixed(3)),
    shiftX: Number(shiftX.toFixed(3)),
  };
}

export function computeWordPointerDistance(
  cursorX: number,
  cursorY: number,
  left: number,
  top: number,
  width: number,
  height: number,
): number {
  const right = left + width;
  const bottom = top + height;
  const clampedX = Math.max(left, Math.min(right, cursorX));
  const clampedY = Math.max(top, Math.min(bottom, cursorY));
  const edgeDist = Math.hypot(cursorX - clampedX, cursorY - clampedY);

  const centerX = left + width * 0.5;
  const centerY = top + height * 0.5;
  const centerDist = Math.hypot(cursorX - centerX, cursorY - centerY);

  return edgeDist * 0.8 + centerDist * 0.2;
}

export function isFineHoverPointerEnvironment(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}
