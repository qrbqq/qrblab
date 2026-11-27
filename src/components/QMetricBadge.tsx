import type {QScoreBreakdown} from '../utils/qScore';

interface QMetricBadgeProps {
  score: QScoreBreakdown;
  variant?: 'glass' | 'inline';
  className?: string;
}

/**
 * Neutral monochrome Q platform metric badge (`Q · [Dynamic Number]`).
 * Styled in Oxanium tabular typography with a subtle frosted-glass finish on /log,
 * or clean unboxed inline typography for secondary placements.
 */
export function QMetricBadge({
  score,
  variant = 'glass',
  className = '',
}: QMetricBadgeProps) {
  const detailTooltip = `${score.label} (${score.papersCount} papers · ${score.labLogsCount} dispatches)`;

  if (variant === 'inline') {
    return (
      <span
        data-testid="q-metric-badge-inline"
        data-q-score={score.total}
        title={detailTooltip}
        aria-label={`Q score ${score.formatted}`}
        className={`font-mono-tabular inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium tracking-wide tabular-nums text-[var(--text-secondary)] ${className}`}
        style={{textTransform: 'none'}}
      >
        <span className="font-semibold text-[var(--text-primary)]">Q</span>
        <span aria-hidden="true" className="text-white/30">
          ·
        </span>
        <span className="tabular-nums">{score.formatted}</span>
      </span>
    );
  }

  return (
    <span
      data-testid="q-metric-badge"
      data-q-score={score.total}
      title={detailTooltip}
      aria-label={`Q score ${score.formatted}`}
      className={`font-mono-tabular inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/[0.14] bg-white/[0.045] px-2.5 py-1 text-xs font-medium tracking-wide tabular-nums text-[#E5E5E5] backdrop-blur-md transition-[border-color,background-color] duration-150 hover:border-white/[0.22] hover:bg-white/[0.07] sm:text-[13px] ${className}`}
      style={{
        textTransform: 'none',
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 6px 18px rgba(0, 0, 0, 0.45)',
      }}
    >
      <span className="font-semibold text-[#F5F5F5]">Q</span>
      <span aria-hidden="true" className="text-white/35">
        ·
      </span>
      <span className="tabular-nums text-[#E5E5E5]">{score.formatted}</span>
    </span>
  );
}
