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
}: EmptyStateCardProps) {
  const actionClass =
    'normal-case mt-6 inline-flex min-h-[40px] items-center justify-center border-b border-white/25 pb-1 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)] whitespace-nowrap';

  return (
    <div className="border-t border-white/[0.08] py-14 text-center sm:py-16">
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
          <Link to={actionTo} className={actionClass}>
            {actionLabel}
          </Link>
        ) : null}
        {actionLabel && onActionClick ? (
          <button type="button" onClick={onActionClick} className={actionClass}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
