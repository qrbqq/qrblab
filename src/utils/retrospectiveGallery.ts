export type GalleryEraKey =
  | 'GENESIS'
  | 'YOUTH'
  | 'EARLY_GENERATIVE'
  | 'PHILOSOPHICAL_RESOLVE'
  | 'MODERN_ERA'
  | 'SOLIDARITY'
  | 'SCULPTURAL_FINALE';

export type CorridorWallSide = 'left' | 'right' | 'center';

export interface GalleryExhibit {
  id: string;
  indexLabel: string;
  era: GalleryEraKey;
  seriesTitle: string;
  title: string;
  chronology: string;
  curatorNote: string;
  imagePath: string;
  aspect: 'portrait' | 'square';
  /** Monochrome vs preserved documentary color note */
  finishNote: string;
}

export interface GallerySculpture {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  materialNote: string;
  curatorNote: string;
  imagePath: string;
}

export interface CorridorStationPose {
  /** Which architectural wall hosts this exhibit */
  side: CorridorWallSide;
  /** Horizontal displacement from corridor centerline in px */
  translateX: number;
  /** Relative Z distance from camera eye in CSS 3D space (negative = ahead down corridor) */
  translateZ: number;
  /** Inward Y-axis angle facing the central aisle (+ on Left Wall, - on Right Wall, 0 at End) */
  rotateY: number;
  /** Spotlight intensity [0, 1] */
  focus: number;
  /** Smooth depth opacity [0, 1] */
  opacity: number;
  /** Paint order */
  zIndex: number;
  /** Culled when behind camera or beyond visible depth fog */
  culled: boolean;
}

export interface OrbitPhysicsState {
  /** Continuous walk coordinate [0, MAX_ORBIT_POSITION] along corridor Z-axis */
  position: number;
  /** Walk speed in stations per second */
  velocity: number;
  /** Optional smooth glide target set by step buttons/rail/keyboard */
  targetPosition: number | null;
}

export interface FinaleFogRevealState {
  /** Progressive opacity [0.045..1] rising dramatically across 55%-100% walk depth */
  finaleOpacity: number;
  /** Atmospheric blur softening distant terminus at 0% and sharpening to 0px near 100% */
  finaleBlurPx: number;
  /** Overhead spotlight brightness [0.08..1] */
  spotlightIntensity: number;
  /** Foreground dark mist veil opacity [0..0.94] */
  mistVeilOpacity: number;
}

export interface CorridorParallaxTilt {
  rotateX: number;
  rotateY: number;
}

let corridorWalkCompletedInMemory = false;

export function hasCorridorWalkCompletedInMemory(): boolean {
  return corridorWalkCompletedInMemory;
}

export function markCorridorWalkCompletedInMemory(): void {
  corridorWalkCompletedInMemory = true;
}

export function resetCorridorWalkCompletedInMemory(): void {
  corridorWalkCompletedInMemory = false;
}

/**
 * Progressive distance fog reveal for the Twin White Pedestals, Silver & Golden 0101 busts,
 * and "WE START FROM HERE": veiled in deep mist at 0%, parting dramatically across 55%..100%.
 */
export function computeFinaleFogReveal(progress01: number): FinaleFogRevealState {
  const p = Number.isFinite(progress01) ? Math.max(0, Math.min(1, progress01)) : 0;

  // Keep terminus veiled in deep atmospheric darkness (0.045 -> 0.08) across the first half of the corridor
  const earlyHint = Math.min(1, p / 0.5) * 0.035;
  // Smooth ease-out curve from 50% to 98% depth
  const emergeLinear = Math.max(0, Math.min(1, (p - 0.5) / 0.48));
  const emergeEased = 1 - Math.pow(1 - emergeLinear, 2.4);

  const finaleOpacity = Number(
    Math.min(1, 0.045 + earlyHint + emergeEased * 0.92).toFixed(4),
  );
  const finaleBlurPx = Number(((1 - emergeEased) * 14).toFixed(2));
  const spotlightIntensity = Number(
    Math.min(1, 0.08 + emergeEased * 0.92).toFixed(4),
  );
  const mistVeilOpacity = Number(
    Math.max(0, 0.94 * (1 - emergeEased)).toFixed(4),
  );

  return {
    finaleOpacity,
    finaleBlurPx,
    spotlightIntensity,
    mistVeilOpacity,
  };
}

/**
 * Subtle ±2deg mouse parallax camera tilt for luxury 3D spatial depth.
 */
export function computeCorridorParallax(
  normX: number,
  normY: number,
): CorridorParallaxTilt {
  const safeX = Number.isFinite(normX) ? Math.max(-1, Math.min(1, normX)) : 0;
  const safeY = Number.isFinite(normY) ? Math.max(-1, Math.min(1, normY)) : 0;
  return {
    rotateX: Number((-safeY * 1.5).toFixed(3)),
    rotateY: Number((safeX * 2).toFixed(3)),
  };
}

export const RETROSPECTIVE_EXHIBITS: readonly GalleryExhibit[] = [
  {
    id: 'childhood-early',
    indexLabel: '01',
    era: 'GENESIS',
    seriesTitle: 'GENESIS',
    title: 'First Light',
    chronology: 'Early Childhood Archive',
    curatorNote:
      'Earliest preserved portrait before screens, architectures, or formal systems took shape.',
    imagePath: 'images/gallery/childhood-early.jpg',
    aspect: 'portrait',
    finishNote: 'Archival Matte Print',
  },
  {
    id: 'childhood-family',
    indexLabel: '02',
    era: 'GENESIS',
    seriesTitle: 'GENESIS',
    title: 'Shared Foundations',
    chronology: 'Family Archive',
    curatorNote:
      'A foundational frame capturing warmth, kinship, and the quiet discipline inherited early on.',
    imagePath: 'images/gallery/childhood-family.jpg',
    aspect: 'square',
    finishNote: 'Archival Matte Print',
  },
  {
    id: 'youth-cap',
    indexLabel: '03',
    era: 'YOUTH',
    seriesTitle: 'FORMATIVE YEARS',
    title: 'Restless Curiosity',
    chronology: 'Early Youth',
    curatorNote:
      'Before formal research—long nights dismantled into questions about software, motion, and form.',
    imagePath: 'images/gallery/youth-cap.jpg',
    aspect: 'portrait',
    finishNote: 'Archival Matte Print',
  },
  {
    id: 'ai-underwater',
    indexLabel: '04',
    era: 'EARLY_GENERATIVE',
    seriesTitle: 'EARLY GENERATIVE ERA',
    title: 'Submerged Caustics',
    chronology: 'First AI Experiments',
    curatorNote:
      'Exploring synthetic light refraction and optical serenity inside the earliest image synthesis workflows.',
    imagePath: 'images/gallery/ai-underwater.jpg',
    aspect: 'square',
    finishNote: 'Pigment on Linen Finish',
  },
  {
    id: 'ai-racer',
    indexLabel: '05',
    era: 'EARLY_GENERATIVE',
    seriesTitle: 'EARLY GENERATIVE ERA',
    title: 'Tunnel Focus',
    chronology: 'Synthetic Speed Study',
    curatorNote:
      'Visor-level intensity—translating engineering obsession into a single unblinking frame.',
    imagePath: 'images/gallery/ai-racer.jpg',
    aspect: 'portrait',
    finishNote: 'Pigment on Linen Finish',
  },
  {
    id: 'ai-ronaldo',
    indexLabel: '06',
    era: 'EARLY_GENERATIVE',
    seriesTitle: 'EARLY GENERATIVE ERA',
    title: 'Relentless Standard',
    chronology: 'Iconography Study',
    curatorNote:
      'An early study in relentless discipline and competitive longevity mirrored through synthetic portraiture.',
    imagePath: 'images/gallery/ai-ronaldo.jpg',
    aspect: 'square',
    finishNote: 'Pigment on Linen Finish',
  },
  {
    id: 'ai-interfaces',
    indexLabel: '07',
    era: 'EARLY_GENERATIVE',
    seriesTitle: 'EARLY GENERATIVE ERA',
    title: 'Floating Spatial Glass',
    chronology: 'Interface Prototypes',
    curatorNote:
      'Early spatial HUD sketches imagining tactile translucent glass surfaces years before their final form.',
    imagePath: 'images/gallery/ai-interfaces.jpg',
    aspect: 'portrait',
    finishNote: 'Pigment on Linen Finish',
  },
  {
    id: 'portrait-noir-contemplation',
    indexLabel: '08',
    era: 'PHILOSOPHICAL_RESOLVE',
    seriesTitle: 'PHILOSOPHICAL RESOLVE',
    title: 'Silence Before Iteration',
    chronology: 'Monochrome Studio Study I',
    curatorNote:
      'Stripped of noise and ornament: deliberate stillness prior to building sovereign instrumentation.',
    imagePath: 'images/gallery/portrait-noir-contemplation.jpg',
    aspect: 'square',
    finishNote: 'Silver Gelatin Monochrome',
  },
  {
    id: 'portrait-noir-sunglasses',
    indexLabel: '09',
    era: 'PHILOSOPHICAL_RESOLVE',
    seriesTitle: 'PHILOSOPHICAL RESOLVE',
    title: 'Obsidian Tailoring',
    chronology: 'Monochrome Studio Study II',
    curatorNote:
      'Precision as posture—darkness, reflection, and unwavering focus behind shielded optics.',
    imagePath: 'images/gallery/portrait-noir-sunglasses.jpg',
    aspect: 'square',
    finishNote: 'Silver Gelatin Monochrome',
  },
  {
    id: 'portrait-teal-modern',
    indexLabel: '10',
    era: 'MODERN_ERA',
    seriesTitle: 'MODERN ERA',
    title: 'Chromatic Departure',
    chronology: 'Contemporary Studio Portrait',
    curatorNote:
      'A brief break in pure monochrome: directional studio light catching texture, tone, and quiet resolve.',
    imagePath: 'images/gallery/portrait-teal-modern.jpg',
    aspect: 'square',
    finishNote: 'Museum Matte Chromogenic',
  },
  {
    id: 'portrait-noir-ascent',
    indexLabel: '11',
    era: 'PHILOSOPHICAL_RESOLVE',
    seriesTitle: 'PHILOSOPHICAL RESOLVE',
    title: 'Horizon Gaze',
    chronology: 'Monochrome Studio Study III',
    curatorNote:
      'Low-angle composure looking past the immediate frame toward unbuilt research horizons.',
    imagePath: 'images/gallery/portrait-noir-ascent.jpg',
    aspect: 'square',
    finishNote: 'Silver Gelatin Monochrome',
  },
  {
    id: 'solidarity-gaza',
    indexLabel: '12',
    era: 'SOLIDARITY',
    seriesTitle: "DON'T FORGET GAZA",
    title: 'Memory & Conscience',
    chronology: 'Standing Witness',
    curatorNote:
      "Every technical pursuit exists inside a human world. Never look away. Don't forget Gaza.",
    imagePath: 'images/gallery/solidarity-gaza.jpg',
    aspect: 'square',
    finishNote: 'Memorial Color Plate',
  },
] as const;

export const TERMINAL_SCULPTURES: readonly [
  GallerySculpture,
  GallerySculpture,
] = [
  {
    id: 'statue-silver',
    code: '00',
    title: 'RAW POTENTIAL',
    subtitle: 'Raw Origin · Unformed Matter',
    materialNote: 'Brushed Silver Monochrome Cast',
    curatorNote:
      'Station Zero-Zero represents raw human capacity prior to computation—unfinished, unembellished, waiting to be forged.',
    imagePath: 'images/gallery/statue-silver.png',
  },
  {
    id: 'statue-gold',
    code: '0101',
    title: 'SOVEREIGN INTELLECT',
    subtitle: 'Binary Ascent · Pure Light',
    materialNote: 'Gilded Alloy & White "0101" Inscription',
    curatorNote:
      'Bearing pure white "0101" telemetry across the chest, the twin bust marks human agency unified with computational rigor.',
    imagePath: 'images/gallery/statue-gold.png',
  },
] as const;

/** Total corridor stops = 12 alternating left/right wall exhibits (0..11) + Twin White Pedestals Finale (12) */
export const FINALE_STATION_INDEX = RETROSPECTIVE_EXHIBITS.length; // 12
export const TOTAL_GALLERY_STATIONS = RETROSPECTIVE_EXHIBITS.length + 1; // 13
export const MAX_ORBIT_POSITION = TOTAL_GALLERY_STATIONS - 1; // 12

const EXHIBIT_STEP_Z = 250;
const FINALE_WORLD_Z = -(RETROSPECTIVE_EXHIBITS.length * EXHIBIT_STEP_Z + 180); // -3180

export function clampOrbitPosition(position: number): number {
  if (!Number.isFinite(position)) return 0;
  return Math.max(0, Math.min(MAX_ORBIT_POSITION, position));
}

/** Odd exhibit numbers (index 0,2,4,6,8,10 -> EXH. 01,03,05,07,09,11) hang on Left Wall; even (02..12) on Right Wall. */
export function getStationWallSide(stationIndex: number): CorridorWallSide {
  if (stationIndex >= FINALE_STATION_INDEX) return 'center';
  return stationIndex % 2 === 0 ? 'left' : 'right';
}

/** World Z coordinate along the hallway for any station [0..12] */
export function getStationWorldZ(stationIndex: number): number {
  if (stationIndex >= FINALE_STATION_INDEX) {
    return FINALE_WORLD_Z;
  }
  return -stationIndex * EXHIBIT_STEP_Z;
}

/** Camera world Z coordinate when paused/walking at continuous coordinate `cameraPosition` [0..12] */
export function getCameraWorldZ(cameraPosition: number): number {
  const clamped = clampOrbitPosition(cameraPosition);
  if (clamped <= FINALE_STATION_INDEX - 1) {
    return -clamped * EXHIBIT_STEP_Z + 250;
  }
  const frac = clamped - (FINALE_STATION_INDEX - 1);
  const lastExhibitCamZ = -(FINALE_STATION_INDEX - 1) * EXHIBIT_STEP_Z + 250; // -2500
  const finaleCamZ = FINALE_WORLD_Z + 290; // -2890 (positions Finale cleanly full-frame at zRel = -290)
  return lastExhibitCamZ + (finaleCamZ - lastExhibitCamZ) * frac;
}

/**
 * Computes deterministic 3D corridor placement for each station along opposing Left & Right walls
 * and the straight-ahead Twin White Pedestals destination at the end of the hall.
 */
export function computeCorridorPose(
  stationIndex: number,
  cameraPosition: number,
  viewportWidth = 1440,
): CorridorStationPose {
  const side = getStationWallSide(stationIndex);
  const worldZ = getStationWorldZ(stationIndex);
  const cameraZ = getCameraWorldZ(cameraPosition);
  const zRel = worldZ - cameraZ; // negative = deeper down hallway; positive = passed behind camera

  const isCompact = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;

  // Terminal Monument remains subtly visible down the vanishing corridor from further away
  const isFinale = side === 'center';
  const maxVisibleDepth = isFinale ? -3800 : -1950;
  const minNearCutoff = isFinale ? 180 : 125;

  if (zRel > minNearCutoff || zRel < maxVisibleDepth) {
    return {
      side,
      translateX: 0,
      translateZ: zRel,
      rotateY: 0,
      focus: 0,
      opacity: 0,
      zIndex: 0,
      culled: true,
    };
  }

  const wallHalfWidth = isCompact ? 154 : isTablet ? 295 : 410;
  const wallAngle = isCompact ? 50 : isTablet ? 56 : 58;

  const translateX =
    side === 'left' ? -wallHalfWidth : side === 'right' ? wallHalfWidth : 0;
  const rotateY = side === 'left' ? wallAngle : side === 'right' ? -wallAngle : 0;

  // Opacity stays crisp (1.0) until well alongside camera (> 35px) and fades smoothly into depth fog far ahead.
  // Note: for the Finale terminus, progressive reveal across 0%..100% is governed by computeFinaleFogReveal.
  let opacity = 1;
  if (zRel > 35) {
    opacity = Math.max(0, 1 - (zRel - 35) / (minNearCutoff - 35));
  } else if (isFinale) {
    opacity = 1;
  } else {
    const dist = Math.abs(zRel);
    opacity = dist < 380 ? 1 : Math.max(0, 1 - (dist - 380) / 1500);
  }

  const focusDistance = isFinale ? Math.abs(zRel + 290) : Math.abs(zRel + 250);
  const focus = Math.max(0, Math.min(1, 1 - focusDistance / 320));
  const zIndex = Math.max(1, Math.round(500 + zRel * 0.12));

  return {
    side,
    translateX,
    translateZ: Number(zRel.toFixed(2)),
    rotateY,
    focus: Number(focus.toFixed(4)),
    opacity: Number(opacity.toFixed(4)),
    zIndex,
    culled: opacity <= 0.015,
  };
}

/**
 * Advances Z-axis walking inertial momentum by one animation step (pure, deterministic).
 */
export function stepOrbitInertia(
  state: OrbitPhysicsState,
  dtMs: number,
): {next: OrbitPhysicsState; settled: boolean} {
  const dtSec = Math.max(0.001, Math.min(0.05, dtMs / 1000));

  if (state.targetPosition !== null) {
    const target = clampOrbitPosition(state.targetPosition);
    const diff = target - state.position;
    if (Math.abs(diff) < 0.002 && Math.abs(state.velocity) < 0.02) {
      return {
        next: {position: target, velocity: 0, targetPosition: null},
        settled: true,
      };
    }

    const stiffness = 1 - Math.exp(-10.5 * dtSec);
    const nextPos = clampOrbitPosition(state.position + diff * stiffness);
    return {
      next: {
        position: nextPos,
        velocity: diff * 5,
        targetPosition: target,
      },
      settled: false,
    };
  }

  let nextPos = state.position + state.velocity * dtSec;
  let nextVel = state.velocity * Math.exp(-5.4 * dtSec);

  if (nextPos <= 0) {
    nextPos = 0;
    if (nextVel < 0) nextVel = 0;
  } else if (nextPos >= MAX_ORBIT_POSITION) {
    nextPos = MAX_ORBIT_POSITION;
    if (nextVel > 0) nextVel = 0;
  }

  const settled = Math.abs(nextVel) < 0.004;
  return {
    next: {
      position: nextPos,
      velocity: settled ? 0 : nextVel,
      targetPosition: null,
    },
    settled,
  };
}

export function getInspectionItems() {
  const canvasItems = RETROSPECTIVE_EXHIBITS.map((item) => ({
    kind: 'canvas' as const,
    id: item.id,
    code: item.indexLabel,
    series: item.seriesTitle,
    title: item.title,
    chronology: item.chronology,
    finish: item.finishNote,
    note: item.curatorNote,
    imagePath: item.imagePath,
  }));

  const statueItems = TERMINAL_SCULPTURES.map((statue) => ({
    kind: 'sculpture' as const,
    id: statue.id,
    code: statue.code,
    series: 'TERMINAL SCULPTURAL PAVILION',
    title: statue.title,
    chronology: statue.subtitle,
    finish: statue.materialNote,
    note: statue.curatorNote,
    imagePath: statue.imagePath,
  }));

  return [...canvasItems, ...statueItems];
}
