import {Link} from 'react-router-dom';
import type {LucideIcon} from 'lucide-react';
import {GlassIcon} from './GlassIcon';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onActionClick?: () => void;
  staticMode?: boolean;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onActionClick,
  staticMode = false,
}: EmptyStateCardProps) {
  const cardClass = staticMode ? 'static-card' : 'glass-card';
  const btnClass = staticMode
    ? 'mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface-elevated)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] whitespace-nowrap'
    : 'mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--bg-surface)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-xs transition-colors hover:bg-[var(--bg-surface-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] whitespace-nowrap';

  return (
    <div className={`${cardClass} rounded-3xl p-8 text-center sm:p-12`}>
      <div className="mx-auto flex max-w-md flex-col items-center">
        <GlassIcon
          icon={icon}
          size="lg"
          tone="neutral"
          staticMode={staticMode}
          className="mb-5"
        />
        <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
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
