import {useEffect} from 'react';
import {Trash2, X} from 'lucide-react';
import {siteCopy} from '../data/i18n';
import {clearAllLocalData} from '../utils/ratings';

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

  const handleClearAndReset = () => {
    clearAllLocalData();
    onResetSuccess(siteCopy.settings.clearDataSuccess);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-surface w-full max-w-md rounded-[1.75rem] p-6 sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
          <h2
            id="settings-modal-title"
            className="font-display-heading text-lg font-semibold text-[var(--text-primary)]"
          >
            {siteCopy.settings.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={siteCopy.settings.closeLabel}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <section
          aria-labelledby="settings-data-heading"
          className="mt-5"
        >
          <h3
            id="settings-data-heading"
            className="font-mono-tabular text-xs font-medium tracking-wider uppercase text-[var(--text-secondary)]"
          >
            {siteCopy.settings.dataLabel}
          </h3>
          <p className="font-body-prose mt-1.5 text-xs text-[var(--text-secondary)]">
            {siteCopy.settings.clearDataHint}
          </p>
          <button
            type="button"
            onClick={handleClearAndReset}
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-2.5 text-xs font-semibold text-[var(--danger-text)] transition-all duration-150 hover:opacity-90 active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--danger-text)]"
          >
            <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>{siteCopy.settings.clearDataButton}</span>
          </button>
        </section>
      </div>
    </div>
  );
}
