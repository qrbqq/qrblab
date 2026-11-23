import {THEME_STORAGE_KEY} from './theme';

export interface StoredPaperRating {
  stars: number;
  updatedAt: string;
}

export interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  length?: number;
  key?: (index: number) => string | null;
}

export const RATING_STORAGE_PREFIX = 'qrb-lab:rating:';
export const LANG_STORAGE_KEY = 'qrblab:lang';

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

export function clampStars(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(1, Math.min(5, Math.round(value)));
}

export function getRatingStorageKey(slug: string): string {
  return `${RATING_STORAGE_PREFIX}${slug}`;
}

export function getPaperRating(
  slug: string,
  storage: StorageLike | null = getDefaultStorage(),
): StoredPaperRating | null {
  if (!slug || !storage) {
    return null;
  }
  try {
    const raw = storage.getItem(getRatingStorageKey(slug));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<StoredPaperRating>;
    if (typeof parsed.stars !== 'number' || parsed.stars < 1 || parsed.stars > 5) {
      return null;
    }
    return {
      stars: clampStars(parsed.stars),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return null;
  }
}

export function savePaperRating(
  slug: string,
  stars: number,
  storage: StorageLike | null = getDefaultStorage(),
): StoredPaperRating | null {
  if (!slug || !storage) {
    return null;
  }
  const normalized = clampStars(stars);
  if (normalized < 1) {
    return null;
  }
  const entry: StoredPaperRating = {
    stars: normalized,
    updatedAt: new Date().toISOString(),
  };
  try {
    storage.setItem(getRatingStorageKey(slug), JSON.stringify(entry));
    return entry;
  } catch {
    return null;
  }
}

export function clearPaperRating(
  slug: string,
  storage: StorageLike | null = getDefaultStorage(),
): void {
  if (!slug || !storage) {
    return;
  }
  try {
    storage.removeItem(getRatingStorageKey(slug));
  } catch {
    // Ignore storage quota or privacy-mode failures cleanly
  }
}

export function clearAllLocalData(
  storage: StorageLike | null = getDefaultStorage(),
): number {
  if (!storage) {
    return 0;
  }

  let clearedRatings = 0;

  try {
    if (typeof storage.length === 'number' && typeof storage.key === 'function') {
      const ratingKeys: string[] = [];
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (key && key.startsWith(RATING_STORAGE_PREFIX)) {
          ratingKeys.push(key);
        }
      }
      for (const key of ratingKeys) {
        storage.removeItem(key);
        clearedRatings += 1;
      }
    }
    storage.setItem(THEME_STORAGE_KEY, 'light');
    storage.setItem(LANG_STORAGE_KEY, 'en');
  } catch {
    // Ignore storage quota or privacy-mode failures cleanly
  }

  return clearedRatings;
}
