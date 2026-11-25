import {AlertCircle, CheckCircle2} from 'lucide-react';

export interface ToastMessage {
  id: number;
  text: string;
  variant?: 'success' | 'error';
}

export function Toast({toast}: {toast: ToastMessage | null}) {
  if (!toast) {
    return null;
  }

  const isError = toast.variant === 'error';

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
    >
      <div className="glass-surface pointer-events-auto inline-flex items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
        {isError ? (
          <AlertCircle className="h-4 w-4 shrink-0 text-[var(--danger-text)]" strokeWidth={1.75} />
        ) : (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--text-primary)]" strokeWidth={1.75} />
        )}
        <span>{toast.text}</span>
      </div>
    </div>
  );
}
