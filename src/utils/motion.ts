export const MOTION_DURATIONS = {
  micro: 140,
  fast: 200,
  base: 320,
  reveal: 520,
  routeExit: 135,
  routeEnter: 200,
} as const;

export const MOTION_EASINGS = {
  precision: 'cubic-bezier(0.16, 1, 0.3, 1)',
  apple: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;

export const MOTION_STAGGER = {
  stepMs: 65,
  maxMs: 325,
} as const;

export const MOTION_DISTANCES = {
  revealY: 14,
  routeExitY: -6,
  routeEnterY: 8,
  cardHoverY: -2,
} as const;

export const MOTION_TOKENS = {
  durations: MOTION_DURATIONS,
  easings: MOTION_EASINGS,
  stagger: MOTION_STAGGER,
  distances: MOTION_DISTANCES,
} as const;
