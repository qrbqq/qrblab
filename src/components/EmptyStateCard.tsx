import {Link} from 'react-router-dom';

interface EmptyStateCardProps {
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onActionClick?: () => void;
  staticMode?: boolean;
}

export function EmptyStateCard({
  eyebrow,
  title,
  description,
  actionLabel,
  actionTo,
  onActionClick,
  staticMode = false,
}: EmptyStateCardProps) {
  const cardClass = staticMode ? 'static-card' : 'glass-card';
  const btnClass = staticMode
    ? 'normal-case mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-2)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] whitespace-nowrap'
    : 'normal-case mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--btn-secondary-bg)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-xs transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--btn-secondary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] whitespace-nowrap';

  return (
    <div className={`${cardClass} rounded-3xl p-8 text-center sm:p-12`}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        {eyebrow ? (
          <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
            {eyebrow}
          </p>
        ) : null}
        <span
          aria-hidden="true"
          className="my-4 h-px w-12 bg-[var(--border-strong)]"
        />
        <h3 className="font-display-card normal-case text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="font-body-prose normal-case mt-2 text-sm text-[var(--text-secondary)]">
          {description}
        </p>
        {actionLabel && actionTo ? (
          <Link to={actionTo} className={btnClass}>
            {actionLabel}
          </Link>
        ) : null}
        {actionLabel && onActionClick ? (
          <button type="button" onClick={onActionClick} className={btnClass}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
