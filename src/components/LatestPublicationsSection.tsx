import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import {siteCopy} from '../data/i18n';
import {papers} from '../data/papers';
import {handleSpotlightMouseMove} from '../hooks/useScrollReveal';
import {
  formatPaperDate,
  getLatestPapers,
  getLocalizedText,
  getPaperSummary,
  resolveAssetUrl,
} from '../utils/papers';
import {getPaperRating} from '../utils/ratings';
import {ArchitecturalFrame} from './ArchitecturalFrame';
import {ScrollReveal} from './ScrollReveal';
import {StarRating} from './StarRating';

interface LatestPublicationsSectionProps {
  id?: string;
}

export function LatestPublicationsSection({
  id = 'publications',
}: LatestPublicationsSectionProps) {
  const latestPapers = getLatestPapers(papers, 3);

  return (
    <ArchitecturalFrame
      id={id}
      ariaLabel={siteCopy.home.latestHeading}
      livingBorder
    >
      <div>
        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
          <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
            <p className="font-mono-tabular shrink-0 text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
              {siteCopy.home.latestEyebrow}
            </p>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-[var(--border-hairline)]"
            />
          </ScrollReveal>

          <ScrollReveal staggerIndex={1}>
            <h2 className="font-display-heading text-2xl font-semibold text-[var(--text-primary)]">
              {siteCopy.home.latestHeading}
            </h2>
          </ScrollReveal>

          <ScrollReveal staggerIndex={2}>
            <p className="font-body-prose text-sm text-[var(--text-secondary)]">
              {siteCopy.home.latestSubheading}
            </p>
          </ScrollReveal>
        </div>

        {latestPapers.length === 0 ? (
          <ScrollReveal staggerIndex={2}>
            <div
              onMouseMove={handleSpotlightMouseMove}
              className="home-spotlight-card rounded-sm border-t border-b border-white/[0.08] py-10 px-6 text-center"
            >
              <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
                <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
                  {siteCopy.home.latestEmptyStatus}
                </p>
                <span
                  aria-hidden="true"
                  className="my-3.5 h-px w-10 bg-[var(--border-strong)]"
                />
                <h3 className="font-display-card text-base font-semibold text-[var(--text-primary)]">
                  {siteCopy.home.latestEmptyTitle}
                </h3>
                <p className="font-body-prose mt-1.5 text-sm text-[var(--text-secondary)]">
                  {siteCopy.home.latestEmptyDescription}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {latestPapers.map((paper, index) => {
              const title = getLocalizedText(paper.title);
              const category = getLocalizedText(paper.category);
              const summary = getPaperSummary(paper);
              const formattedDate = formatPaperDate(paper.publishedDate);
              const thumbUrl = paper.thumbnail
                ? resolveAssetUrl(paper.thumbnail, import.meta.env.BASE_URL)
                : '';
              const storedRating = getPaperRating(paper.slug);

              return (
                <ScrollReveal
                  key={paper.id}
                  staggerIndex={index % 3}
                  className="h-full"
                >
                  <Link
                    to={`/qrb-lab/${paper.slug}`}
                    onMouseMove={handleSpotlightMouseMove}
                    className="home-spotlight-card rounded-sm border border-white/[0.08] bg-[var(--bg-surface)] group flex h-full flex-col justify-between p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
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
                        <time
                          dateTime={paper.publishedDate}
                          className="font-mono-tabular tabular-nums"
                        >
                          {formattedDate}
                        </time>
                      </div>

                      <h3 className="font-display-card mt-2.5 text-base font-bold text-[var(--text-primary)]">
                        {title}
                      </h3>

                      <p className="font-body-prose mt-1.5 line-clamp-2 text-xs text-[var(--text-secondary)]">
                        {summary}
                      </p>
                    </div>

                    <div className="relative z-10 mt-5 flex items-center justify-between gap-3 border-t border-[var(--border-hairline)] pt-3.5">
                      <StarRating value={storedRating?.stars ?? null} readOnly />
                      <ArrowRight
                        className="home-card-code h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)]"
                        strokeWidth={1.75}
                      />
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </ArchitecturalFrame>
  );
}
