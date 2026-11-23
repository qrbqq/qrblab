import {useEffect} from 'react';
import {Monitor, Moon, Sun, Trash2, X} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {useTheme} from '../context/ThemeContext';
import {LANGUAGE_ENDONYMS, translations} from '../data/i18n';
import {SUPPORTED_LANGUAGES} from '../utils/papers';
import {clearAllLocalData} from '../utils/ratings';
import type {ThemePreference} from '../utils/theme';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onResetSuccess: (message: string) => void;
}

export function SettingsModal({
  open,
  onClose,
  onResetSuccess,
}: SettingsModalProps) {
  const {lang, setLang, resetLang, t} = useLanguage();
  const {preference, setTheme, resetTheme} = useTheme();

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const themeOptions: Array<{
    key: ThemePreference;
    label: string;
    icon: typeof Sun;
  }> = [
    {key: 'light', label: t.settings.themeOptions.light, icon: Sun},
    {key: 'dark', label: t.settings.themeOptions.dark, icon: Moon},
    {key: 'system', label: t.settings.themeOptions.system, icon: Monitor},
  ];

  const handleClearAndReset = () => {
    clearAllLocalData();
    resetTheme();
    resetLang();
    onResetSuccess(translations.en.settings.clearDataSuccess);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-surface w-full max-w-lg rounded-[1.75rem] p-6 sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
          <h2
            id="settings-modal-title"
            className="text-lg font-semibold tracking-tight text-[var(--text-primary)]"
          >
            {t.settings.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.settings.closeLabel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* 1. Theme */}
          <section aria-labelledby="settings-theme-heading">
            <h3
              id="settings-theme-heading"
              className="font-mono-tabular text-xs font-medium tracking-wider uppercase text-[var(--text-secondary)]"
            >
              {t.settings.themeLabel}
            </h3>
            <div
              role="group"
              aria-label={t.settings.themeLabel}
              className="mt-2.5 grid grid-cols-3 gap-2"
            >
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = preference === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setTheme(option.key)}
                    aria-pressed={isSelected}
                    className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                      isSelected
                        ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. 5 Native Endonym Languages */}
          <section aria-labelledby="settings-language-heading">
            <h3
              id="settings-language-heading"
              className="font-mono-tabular text-xs font-medium tracking-wider uppercase text-[var(--text-secondary)]"
            >
              {t.settings.languageLabel}
            </h3>
            <div
              role="group"
              aria-label={t.settings.languageLabel}
              className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {SUPPORTED_LANGUAGES.map((code) => {
                const isSelected = lang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={isSelected}
                    lang={code}
                    dir={code === 'ar' ? 'rtl' : 'ltr'}
                    className={`inline-flex min-h-[44px] items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                      isSelected
                        ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {LANGUAGE_ENDONYMS[code]}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 3. Clear Local Data & Reset */}
          <section
            aria-labelledby="settings-data-heading"
            className="border-t border-[var(--border-hairline)] pt-5"
          >
            <h3
              id="settings-data-heading"
              className="font-mono-tabular text-xs font-medium tracking-wider uppercase text-[var(--text-secondary)]"
            >
              {t.settings.dataLabel}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
              {t.settings.clearDataHint}
            </p>
            <button
              type="button"
              onClick={handleClearAndReset}
              className="mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-2.5 text-xs font-semibold text-[var(--danger-text)] transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger-text)]"
            >
              <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>{t.settings.clearDataButton}</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
