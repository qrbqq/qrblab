import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {translations, type TranslationDictionary} from '../data/i18n';
import type {SupportedLanguage} from '../data/papers';
import {
  getDirection,
  readStoredLanguage,
  saveStoredLanguage,
} from '../utils/papers';

interface LanguageContextValue {
  lang: SupportedLanguage;
  dir: 'ltr' | 'rtl';
  setLang: (nextLang: SupportedLanguage) => void;
  resetLang: () => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({children}: {children: ReactNode}) {
  const [lang, setLangState] = useState<SupportedLanguage>(() =>
    readStoredLanguage(),
  );
  const dir = getDirection(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = (nextLang: SupportedLanguage) => {
    setLangState(nextLang);
    saveStoredLanguage(nextLang);
  };

  const resetLang = () => {
    setLangState('en');
    saveStoredLanguage('en');
  };

  const value: LanguageContextValue = {
    lang,
    dir,
    setLang,
    resetLang,
    t: translations[lang],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
