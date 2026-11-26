import {siteCopy} from '../data/i18n';
import {papers} from '../data/papers';
import {handleSpotlightMouseMove} from '../hooks/useScrollReveal';
import {getLatestPapers} from '../utils/papers';
import {ArchitecturalFrame} from './ArchitecturalFrame';
import {PaperCard} from './PaperCard';
import {ScrollReveal} from './ScrollReveal';

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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPapers.map((paper, index) => (
              <ScrollReveal
                key={paper.id}
                staggerIndex={index % 3}
                className="h-full"
              >
                <PaperCard paper={paper} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </ArchitecturalFrame>
  );
}
