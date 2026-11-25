export type IntroStage =
  | 'deep-space'
  | 'brand-form'
  | 'brand-dissolve'
  | 'code-form'
  | 'code-dissolve'
  | 'complete';

export interface IntroTimelineSample {
  stage: IntroStage;
  brandMix: number;
  disperseMix: number;
  codeMix: number;
  exitMix: number;
  turbulence: number;
  backdropAlpha: number;
  particleAlpha: number;
  heroReveal: number;
  completed: boolean;
}

export interface ParticleBudget {
  morphCount: number;
  dustCount: number;
  dpr: number;
  pointScale: number;
}

export interface ParticleBudgetInput {
  viewportWidth: number;
  hardwareConcurrency?: number;
  devicePixelRatio?: number;
  isSoftwareRenderer?: boolean;
}

export const INTRO_TOTAL_DURATION_MS = 6600;
export const INTRO_FAILSAFE_TIMEOUT_MS = 7400;

const BLOCKED_SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  ' ',
  'Spacebar',
  'Home',
  'End',
]);

let introPlayedInSessionMemory = false;

export function hasIntroPlayedInMemory(): boolean {
  return introPlayedInSessionMemory;
}

export function markIntroPlayedInMemory(): void {
  introPlayedInSessionMemory = true;
}

export function resetIntroPlayedInMemory(): void {
  introPlayedInSessionMemory = false;
}

export function isScrollLockBlockedKey(key: string): boolean {
  return BLOCKED_SCROLL_KEYS.has(key);
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.min(1, value));
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeOutQuint(t: number): number {
  const x = clamp01(t);
  return 1 - Math.pow(1 - x, 5);
}

export function computeParticleBudget({
  viewportWidth,
  hardwareConcurrency = 8,
  devicePixelRatio = 1,
  isSoftwareRenderer = false,
}: ParticleBudgetInput): ParticleBudget {
  const safeDpr = Number.isFinite(devicePixelRatio)
    ? Math.max(1, Math.min(2, devicePixelRatio))
    : 1;

  if (isSoftwareRenderer) {
    return {
      morphCount: 1600,
      dustCount: 600,
      dpr: 1,
      pointScale: 1.15,
    };
  }

  const isMobileViewport = viewportWidth < 768;
  const isConstrainedCpu = hardwareConcurrency > 0 && hardwareConcurrency <= 4;

  if (isMobileViewport) {
    return {
      morphCount: 2200,
      dustCount: 800,
      dpr: Math.min(safeDpr, 1.75),
      pointScale: 1.0,
    };
  }

  if (isConstrainedCpu) {
    return {
      morphCount: 3400,
      dustCount: 1200,
      dpr: Math.min(safeDpr, 1.75),
      pointScale: 1.0,
    };
  }

  return {
    morphCount: 5200,
    dustCount: 2000,
    dpr: safeDpr,
    pointScale: 1.0,
  };
}

/**
 * Deterministic 3-stage choreography:
 *   0..900ms      -> Stage 1: Deep Space Void
 *   900..2350ms   -> Stage 2a: Converge into lowercase `qrbqq`
 *   2350..3100ms  -> Stage 2b: Luminous hold on `qrbqq`
 *   3100..3950ms  -> Stage 2c: Dissolve outward into cosmic dispersion
 *   3950..5100ms  -> Stage 3a: Converge into `0101`
 *   5100..5750ms  -> Stage 3b: Crisp hold on `0101`
 *   5750..6600ms  -> Stage 3c: Disperse & fade out, revealing active hero
 */
export function evaluateIntroTimeline(elapsedMs: number): IntroTimelineSample {
  const t = Math.max(0, elapsedMs);

  if (t >= INTRO_TOTAL_DURATION_MS) {
    return {
      stage: 'complete',
      brandMix: 0,
      disperseMix: 0,
      codeMix: 0,
      exitMix: 1,
      turbulence: 0,
      backdropAlpha: 0,
      particleAlpha: 0,
      heroReveal: 1,
      completed: true,
    };
  }

  if (t < 900) {
    const fadeIn = easeOutQuint(t / 450);
    return {
      stage: 'deep-space',
      brandMix: 0,
      disperseMix: 0,
      codeMix: 0,
      exitMix: 0,
      turbulence: 0.35,
      backdropAlpha: 1,
      particleAlpha: 0.55 + 0.45 * fadeIn,
      heroReveal: 0,
      completed: false,
    };
  }

  if (t < 2350) {
    const p = (t - 900) / (2350 - 900);
    const brandMix = easeInOutCubic(p);
    const turbulence = Math.sin(p * Math.PI) * 0.55;
    return {
      stage: 'brand-form',
      brandMix,
      disperseMix: 0,
      codeMix: 0,
      exitMix: 0,
      turbulence,
      backdropAlpha: 1,
      particleAlpha: 1,
      heroReveal: 0,
      completed: false,
    };
  }

  if (t < 3100) {
    return {
      stage: 'brand-form',
      brandMix: 1,
      disperseMix: 0,
      codeMix: 0,
      exitMix: 0,
      turbulence: 0.04,
      backdropAlpha: 1,
      particleAlpha: 1,
      heroReveal: 0,
      completed: false,
    };
  }

  if (t < 3950) {
    const p = (t - 3100) / (3950 - 3100);
    const disperseMix = easeInOutCubic(p);
    return {
      stage: 'brand-dissolve',
      brandMix: 1 - disperseMix,
      disperseMix,
      codeMix: 0,
      exitMix: 0,
      turbulence: Math.sin(p * Math.PI) * 0.9,
      backdropAlpha: 1,
      particleAlpha: 1,
      heroReveal: 0,
      completed: false,
    };
  }

  if (t < 5100) {
    const p = (t - 3950) / (5100 - 3950);
    const codeMix = easeInOutCubic(p);
    return {
      stage: 'code-form',
      brandMix: 0,
      disperseMix: 1 - codeMix,
      codeMix,
      exitMix: 0,
      turbulence: Math.sin(p * Math.PI) * 0.65,
      backdropAlpha: 1,
      particleAlpha: 1,
      heroReveal: 0,
      completed: false,
    };
  }

  if (t < 5750) {
    return {
      stage: 'code-form',
      brandMix: 0,
      disperseMix: 0,
      codeMix: 1,
      exitMix: 0,
      turbulence: 0.04,
      backdropAlpha: 1,
      particleAlpha: 1,
      heroReveal: 0,
      completed: false,
    };
  }

  const p = (t - 5750) / (INTRO_TOTAL_DURATION_MS - 5750);
  const exitMix = easeInOutCubic(p);
  const backdropAlpha = 1 - easeInOutCubic(clamp01((p - 0.12) / 0.88));
  const particleAlpha = 1 - easeInOutCubic(clamp01((p - 0.25) / 0.75));
  const heroReveal = easeOutQuint(clamp01((p - 0.2) / 0.8));

  return {
    stage: 'code-dissolve',
    brandMix: 0,
    disperseMix: 0,
    codeMix: 1 - exitMix,
    exitMix,
    turbulence: Math.sin(p * Math.PI) * 0.85,
    backdropAlpha,
    particleAlpha,
    heroReveal,
    completed: false,
  };
}
