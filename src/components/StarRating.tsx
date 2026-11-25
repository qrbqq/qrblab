import {useState} from 'react';
import {Star} from 'lucide-react';
import {siteCopy} from '../data/i18n';

interface StarRatingProps {
  value: number | null;
  onChange?: (stars: number) => void;
  onClear?: () => void;
  readOnly?: boolean;
}

export function StarRating({
  value,
  onChange,
  onClear,
  readOnly = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (readOnly) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
        <Star
          className={`h-3.5 w-3.5 ${
            value !== null
              ? 'fill-[#F59E0B] text-[#F59E0B]'
              : 'text-[var(--text-secondary)]/60'
          }`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        {value !== null ? (
          <span className="tabular-nums text-[var(--text-primary)]">
            {value.toFixed(1)} · {siteCopy.qrbLab.ratingYourLabel}
          </span>
        ) : (
          <span>{siteCopy.qrbLab.ratingUnrated}</span>
        )}
      </div>
    );
  }

  const activeScore = hovered ?? value ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label={siteCopy.paperDetail.rateHeading}
        className="inline-flex items-center gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= activeScore;
          const label = siteCopy.paperDetail.rateAriaLabel.replace(
            '{n}',
            String(starIndex),
          );
          return (
            <button
              key={starIndex}
              type="button"
              onClick={() => onChange?.(starIndex)}
              onMouseEnter={() => setHovered(starIndex)}
              aria-label={label}
              aria-pressed={value === starIndex}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <Star
                className={`h-5 w-5 transition-colors ${
                  isFilled
                    ? 'fill-[#F59E0B] text-[#F59E0B]'
                    : 'text-[var(--text-secondary)]/45 hover:text-[#F59E0B]'
                }`}
                strokeWidth={1.65}
              />
            </button>
          );
        })}
      </div>

      <span className="font-mono-tabular text-sm font-medium text-[var(--text-primary)]">
        {value !== null ? `${value}.0 / 5` : siteCopy.qrbLab.ratingUnrated}
      </span>

      {value !== null && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="min-h-[36px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          {siteCopy.paperDetail.clearRating}
        </button>
      ) : null}
    </div>
  );
}
