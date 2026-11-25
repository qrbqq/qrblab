import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import {siteCopy} from '../data/i18n';
import type {ResearchPaper} from '../data/papers';
import {
  formatPaperDate,
  getLocalizedText,
  getPaperSummary,
  resolveAssetUrl,
} from '../utils/papers';
import {getPaperRating} from '../utils/ratings';
import {StarRating} from './StarRating';

interface PaperCardProps {
  paper: ResearchPaper;
  staticMode?: boolean;
}

export function PaperCard({paper, staticMode = false}: PaperCardProps) {
  const formattedDate = formatPaperDate(paper.publishedDate);
  const title = getLocalizedText(paper.title);
  const category = getLocalizedText(paper.category);
  const summary = getPaperSummary(paper);
  const thumbUrl = paper.thumbnail
    ? resolveAssetUrl(paper.thumbnail, import.meta.env.BASE_URL)
    : '';
  const storedRating = getPaperRating(paper.slug);

  const cardSurfaceClass = staticMode
    ? 'static-card transition-none'
    : 'glass-card glass-card-interactive group';

  return (
    <Link
      to={`/qrb-lab/${paper.slug}`}
      className={`${cardSurfaceClass} flex h-full flex-col justify-between rounded-3xl p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]`}
    >
      <div>
        <div className="mb-5 overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)]">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={title}
              referrerPolicy="no-referrer"
              className={
                staticMode
                  ? 'aspect-video w-full object-cover'
                  : 'aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]'
              }
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 bg-[var(--bg-surface-elevated)] px-4 text-center">
              <span className="font-mono-tabular text-xs font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
                {paper.version}
              </span>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {category}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">{category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={paper.publishedDate} className="font-mono-tabular tabular-nums">
            {formattedDate}
          </time>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">{paper.version}</span>
        </div>

        <h3
          className={
            staticMode
              ? 'font-display-card mt-3 text-lg font-bold text-[var(--text-primary)]'
              : 'font-display-card mt-3 text-lg font-bold text-[var(--text-primary)] transition-opacity group-hover:opacity-75'
          }
        >
          {title}
        </h3>

        <p className="font-body-prose mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">
          {summary}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border-hairline)] pt-4">
        <StarRating value={storedRating?.stars ?? null} readOnly />

        <div className="flex items-center justify-between gap-4">
          <span className="truncate text-xs font-medium text-[var(--text-secondary)]">
            {paper.authors.join(', ')}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[var(--text-primary)]">
            <span>{siteCopy.qrbLab.readPaper}</span>
            <ArrowRight
              className={
                staticMode
                  ? 'h-3.5 w-3.5'
                  : 'h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5'
              }
              strokeWidth={1.75}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
