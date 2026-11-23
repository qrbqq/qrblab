import type {StorageLike} from './ratings';

export type ThemePreference = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'qrblab:theme';
export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'light';

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

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

export function resolveEffectiveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean,
): EffectiveTheme {
  if (preference === 'dark') {
    return 'dark';
  }
  if (preference === 'light') {
    return 'light';
  }
  return systemPrefersDark ? 'dark' : 'light';
}

export function readStoredTheme(
  storage: StorageLike | null = getDefaultStorage(),
): ThemePreference {
  if (!storage) {
    return DEFAULT_THEME_PREFERENCE;
  }
  try {
    const raw = storage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(raw) ? raw : DEFAULT_THEME_PREFERENCE;
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

export function saveStoredTheme(
  preference: ThemePreference,
  storage: StorageLike | null = getDefaultStorage(),
): void {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Ignore storage quota or privacy-mode errors cleanly
  }
}
