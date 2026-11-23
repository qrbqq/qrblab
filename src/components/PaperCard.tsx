import {Link} from 'react-router-dom';
import {ArrowRight, FileText} from 'lucide-react';
import type {ResearchPaper} from '../data/papers';
import {useLanguage} from '../context/LanguageContext';
import {
  formatPaperDate,
  getLocalizedText,
  getPaperSummary,
  resolveAssetUrl,
} from '../utils/papers';
import {getPaperRating} from '../utils/ratings';
import {GlassIcon} from './GlassIcon';
import {StarRating} from './StarRating';

interface PaperCardProps {
  paper: ResearchPaper;
  staticMode?: boolean;
}

export function PaperCard({paper, staticMode = false}: PaperCardProps) {
  const {lang, t} = useLanguage();
  const formattedDate = formatPaperDate(paper.publishedDate, lang);
  const title = getLocalizedText(paper.title, lang);
  const category = getLocalizedText(paper.category, lang);
  const summary = getPaperSummary(paper, lang);
  const thumbUrl = paper.thumbnail
    ? resolveAssetUrl(paper.thumbnail, import.meta.env.BASE_URL)
    : '';
  const storedRating = getPaperRating(paper.slug);

  const cardSurfaceClass = staticMode
    ? 'static-card transition-none'
    : 'glass-card glass-card-interactive group';

  return (
    <Link
      to={`/research/${paper.slug}`}
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
            <div className="flex aspect-video w-full items-center justify-center bg-[var(--bg-surface-elevated)]">
              <GlassIcon icon={FileText} size="lg" staticMode={staticMode} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">{category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={paper.publishedDate} className="tabular-nums">
            {formattedDate}
          </time>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">{paper.version}</span>
        </div>

        <h3
          className={
            staticMode
              ? 'mt-3 text-lg font-bold leading-snug tracking-tight text-[var(--text-primary)]'
              : 'mt-3 text-lg font-bold leading-snug tracking-tight text-[var(--text-primary)] transition-opacity group-hover:opacity-75'
          }
        >
          {title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          {summary}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border-hairline)] pt-4">
        <StarRating value={storedRating?.stars ?? null} readOnly />

        <div className="flex items-center justify-between gap-4">
          <span className="truncate text-xs font-medium text-[var(--text-secondary)]">
            {paper.authors.join(', ')}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap">
            <span>{t.research.readPaper}</span>
            <ArrowRight
              className={
                staticMode
                  ? 'h-3.5 w-3.5 rtl:rotate-180'
                  : 'h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5'
              }
              strokeWidth={1.75}
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
