import type {CSSProperties} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {papers} from '../data/papers';
import {
  handleSpotlightMouseMove,
  useScrollReveal,
} from '../hooks/useScrollReveal';
import {
  formatPaperDate,
  getLatestPapers,
  getLocalizedText,
  getPaperSummary,
  resolveAssetUrl,
} from '../utils/papers';
import {getPaperRating} from '../utils/ratings';
import {ArchitecturalFrame} from './ArchitecturalFrame';
import {StarRating} from './StarRating';

interface LatestPublicationsSectionProps {
  id?: string;
}

export function LatestPublicationsSection({
  id = 'publications',
}: LatestPublicationsSectionProps) {
  const {lang, t} = useLanguage();
  const {ref, isVisible} = useScrollReveal<HTMLDivElement>({
    threshold: 0.01,
  });

  const latestPapers = getLatestPapers(papers, 3);

  return (
    <ArchitecturalFrame
      id={id}
      ariaLabel={t.home.latestHeading}
      livingBorder
    >
      <div ref={ref}>
        <div
          data-revealed={isVisible}
          className="home-reveal-item mb-6 flex flex-col gap-2 sm:mb-8"
        >
          <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
            {t.home.latestEyebrow}
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t.home.latestHeading}
          </h2>

          <p className="text-sm text-[var(--text-secondary)]">
            {t.home.latestSubheading}
          </p>
        </div>

        {latestPapers.length === 0 ? (
          <div
            data-revealed={isVisible}
            onMouseMove={handleSpotlightMouseMove}
            className="home-reveal-item home-spotlight-card glass-card rounded-3xl p-7 text-center sm:p-9"
          >
            <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
              <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
                {t.home.latestEmptyStatus}
              </p>
              <span
                aria-hidden="true"
                className="my-3.5 h-px w-10 bg-[var(--border-strong)]"
              />
              <h3 className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
                {t.home.latestEmptyTitle}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                {t.home.latestEmptyDescription}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {latestPapers.map((paper, index) => {
              const title = getLocalizedText(paper.title, lang);
              const category = getLocalizedText(paper.category, lang);
              const summary = getPaperSummary(paper, lang);
              const formattedDate = formatPaperDate(paper.publishedDate, lang);
              const thumbUrl = paper.thumbnail
                ? resolveAssetUrl(paper.thumbnail, import.meta.env.BASE_URL)
                : '';
              const storedRating = getPaperRating(paper.slug);

              return (
                <Link
                  key={paper.id}
                  to={`/research/${paper.slug}`}
                  data-revealed={isVisible}
                  style={{'--reveal-delay': `${index * 70}ms`} as CSSProperties}
                  onMouseMove={handleSpotlightMouseMove}
                  className="home-reveal-item home-spotlight-card glass-card group flex h-full flex-col justify-between rounded-3xl p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  <div className="relative z-10">
                    <div className="mb-4 overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)]">
                      {thumbUrl ? (
                        <img
                          src={thumbUrl}
                          alt={title}
                          referrerPolicy="no-referrer"
                          className="aspect-video w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 bg-[var(--bg-surface-elevated)] px-4 text-center">
                          <span className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
                            {paper.version}
                          </span>
                          <span className="text-xs font-medium text-[var(--text-secondary)]">
                            {category}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)]">
                        {category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={paper.publishedDate} className="tabular-nums">
                        {formattedDate}
                      </time>
                    </div>

                    <h3 className="mt-2.5 text-base font-bold leading-snug tracking-tight text-[var(--text-primary)]">
                      {title}
                    </h3>

                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {summary}
                    </p>
                  </div>

                  <div className="relative z-10 mt-5 flex items-center justify-between gap-3 border-t border-[var(--border-hairline)] pt-3.5">
                    <StarRating value={storedRating?.stars ?? null} readOnly />
                    <ArrowRight
                      className="home-card-code h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)] rtl:rotate-180"
                      strokeWidth={1.75}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </ArchitecturalFrame>
  );
}
