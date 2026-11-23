import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {
  DEFAULT_THEME_PREFERENCE,
  readStoredTheme,
  resolveEffectiveTheme,
  saveStoredTheme,
  type EffectiveTheme,
  type ThemePreference,
} from '../utils/theme';

interface ThemeContextValue {
  preference: ThemePreference;
  effectiveTheme: EffectiveTheme;
  setTheme: (next: ThemePreference) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function ThemeProvider({children}: {children: ReactNode}) {
  const [preference, setPreference] = useState<ThemePreference>(() => readStoredTheme());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() =>
    readSystemPrefersDark(),
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };
    setSystemPrefersDark(media.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const effectiveTheme = resolveEffectiveTheme(preference, systemPrefersDark);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    document.documentElement.style.colorScheme = effectiveTheme;
  }, [effectiveTheme]);

  const setTheme = (next: ThemePreference) => {
    setPreference(next);
    saveStoredTheme(next);
  };

  const resetTheme = () => {
    setPreference(DEFAULT_THEME_PREFERENCE);
    saveStoredTheme(DEFAULT_THEME_PREFERENCE);
  };

  return (
    <ThemeContext.Provider
      value={{
        preference,
        effectiveTheme,
        setTheme,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
