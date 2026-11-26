import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import {siteCopy} from '../data/siteConfig';
import {papers} from '../data/papers';
import {getLatestPapers} from '../utils/papers';
import {ArchitecturalFrame} from './ArchitecturalFrame';
import {KineticHeadline} from './KineticHeadline';
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
      spacing="preview"
    >
      <div>
        <div className="mb-8 flex flex-col gap-2 sm:mb-10">
          <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
            <p className="font-eyebrow-mono shrink-0 text-[11px] font-medium text-[var(--text-eyebrow)]">
              {siteCopy.home.latestEyebrow}
            </p>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-[var(--border-hairline)]"
            />
          </ScrollReveal>

          <KineticHeadline
            as="h2"
            text={siteCopy.home.latestHeading}
            className="text-3xl text-[var(--text-primary)] sm:text-4xl lg:text-[3rem]"
          />

          <ScrollReveal staggerIndex={2}>
            <p className="font-editorial-body text-sm text-[var(--text-secondary)]">
              {siteCopy.home.latestSubheading}
            </p>
          </ScrollReveal>
        </div>

        {latestPapers.length === 0 ? (
          <ScrollReveal staggerIndex={2}>
            <div className="border-t border-b border-white/[0.08] py-10 text-start">
              <p className="font-eyebrow-mono text-[11px] font-medium text-[var(--text-eyebrow)]">
                {siteCopy.home.latestEmptyStatus}
              </p>
              <h3 className="font-display-card mt-2.5 text-base font-semibold text-[var(--text-primary)]">
                {siteCopy.home.latestEmptyTitle}
              </h3>
              <p className="font-editorial-body mt-1.5 max-w-xl text-sm text-[var(--text-secondary)]">
                {siteCopy.home.latestEmptyDescription}
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

        <ScrollReveal staggerIndex={3} className="mt-8 sm:mt-10">
          <Link
            to="/qrb-lab"
            className="group inline-flex min-h-[44px] items-center gap-2.5 border-b border-white/[0.16] pb-1.5 text-sm font-medium text-[var(--text-primary)] transition-colors duration-200 hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
          >
            <span>{siteCopy.home.exploreArchive}</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
              strokeWidth={1.75}
            />
          </Link>
        </ScrollReveal>
      </div>
    </ArchitecturalFrame>
  );
}
