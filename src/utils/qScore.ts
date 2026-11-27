import {labLogs, type LabLogEntry} from '../data/labLog';
import {papers, type ResearchPaper} from '../data/papers';
import type {StorageLike} from './ratings';

export const Q_PAPER_WEIGHT = 120;
export const Q_LAB_LOG_WEIGHT = 36;

export const Q_INTERACTION_WEIGHTS = {
  'pdf-download': 8,
  'pdf-open': 4,
  'citation-copy': 3,
  'paper-rate': 3,
  'search-query': 1,
  'tool-trigger': 2,
} as const;

export type QInteractionType = keyof typeof Q_INTERACTION_WEIGHTS;

export const Q_INTERACTIONS_STORAGE_KEY = 'qrb-lab:q-interactions';
export const Q_SCORE_UPDATED_EVENT = 'qrb-lab:q-score-updated';

export interface StoredQInteractions {
  points: number;
  count: number;
  updatedAt: string;
}

export interface QScoreInput {
  papersCount: number;
  labLogsCount: number;
  interactionPoints?: number;
}

export interface QScoreBreakdown {
  total: number;
  formatted: string;
  label: string;
  papersCount: number;
  labLogsCount: number;
  paperContribution: number;
  labLogContribution: number;
  interactionContribution: number;
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function dispatchQScoreUpdated(): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.dispatchEvent(new CustomEvent(Q_SCORE_UPDATED_EVENT));
  } catch {
    // Ignore environments without CustomEvent support
  }
}

function clampNonNegativeInt(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, Math.floor(value));
}

export function formatQNumber(score: number): string {
  const safe = clampNonNegativeInt(score);
  return new Intl.NumberFormat('en-US').format(safe);
}

export function formatQLabel(score: number): string {
  return `Q · ${formatQNumber(score)}`;
}

export function computeQScore(input: QScoreInput): QScoreBreakdown {
  const papersCount = clampNonNegativeInt(input.papersCount);
  const labLogsCount = clampNonNegativeInt(input.labLogsCount);
  const interactionContribution = clampNonNegativeInt(
    input.interactionPoints ?? 0,
  );

  const paperContribution = papersCount * Q_PAPER_WEIGHT;
  const labLogContribution = labLogsCount * Q_LAB_LOG_WEIGHT;
  const total =
    paperContribution + labLogContribution + interactionContribution;
  const formatted = formatQNumber(total);

  return {
    total,
    formatted,
    label: `Q · ${formatted}`,
    papersCount,
    labLogsCount,
    paperContribution,
    labLogContribution,
    interactionContribution,
  };
}

export function readStoredQInteractions(
  storage: StorageLike | null = getDefaultStorage(),
): StoredQInteractions {
  if (!storage) {
    return {points: 0, count: 0, updatedAt: ''};
  }
  try {
    const raw = storage.getItem(Q_INTERACTIONS_STORAGE_KEY);
    if (!raw) {
      return {points: 0, count: 0, updatedAt: ''};
    }
    const parsed = JSON.parse(raw) as Partial<StoredQInteractions>;
    return {
      points: clampNonNegativeInt(
        typeof parsed.points === 'number' ? parsed.points : 0,
      ),
      count: clampNonNegativeInt(
        typeof parsed.count === 'number' ? parsed.count : 0,
      ),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return {points: 0, count: 0, updatedAt: ''};
  }
}

export function getLocalInteractionPoints(
  storage: StorageLike | null = getDefaultStorage(),
): number {
  return readStoredQInteractions(storage).points;
}

export function recordQInteraction(
  type: QInteractionType,
  storage: StorageLike | null = getDefaultStorage(),
): number {
  const weight = Q_INTERACTION_WEIGHTS[type] ?? 0;
  if (!storage || weight <= 0) {
    return readStoredQInteractions(storage).points;
  }

  const current = readStoredQInteractions(storage);
  const next: StoredQInteractions = {
    points: current.points + weight,
    count: current.count + 1,
    updatedAt: new Date().toISOString(),
  };

  try {
    storage.setItem(Q_INTERACTIONS_STORAGE_KEY, JSON.stringify(next));
    dispatchQScoreUpdated();
    return next.points;
  } catch {
    return current.points;
  }
}

export function clearQInteractions(
  storage: StorageLike | null = getDefaultStorage(),
): void {
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(Q_INTERACTIONS_STORAGE_KEY);
    dispatchQScoreUpdated();
  } catch {
    // Ignore storage quota or privacy-mode failures cleanly
  }
}

export interface QScoreSourceData {
  papersList?: readonly ResearchPaper[];
  labLogsList?: readonly LabLogEntry[];
  storage?: StorageLike | null;
}

export function getCurrentQScore(
  source: QScoreSourceData = {},
): QScoreBreakdown {
  const papersList = source.papersList ?? papers;
  const labLogsList = source.labLogsList ?? labLogs;
  const storage =
    source.storage !== undefined ? source.storage : getDefaultStorage();

  return computeQScore({
    papersCount: papersList.length,
    labLogsCount: labLogsList.length,
    interactionPoints: getLocalInteractionPoints(storage),
  });
}
