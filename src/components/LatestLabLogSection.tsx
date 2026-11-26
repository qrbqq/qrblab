import {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import {labLogs} from '../data/labLog';
import {siteCopy} from '../data/siteConfig';
import {getLatestLabLogs, HOME_LAB_LOG_PREVIEW_LIMIT} from '../utils/labLog';
import {ArchitecturalFrame} from './ArchitecturalFrame';
import {KineticHeadline} from './KineticHeadline';
import {LabLogCard} from './LabLogCard';
import {ScreenshotLightbox} from './ScreenshotLightbox';
import {ScrollReveal} from './ScrollReveal';

interface LatestLabLogSectionProps {
  id?: string;
}

export function LatestLabLogSection({
  id = 'lab-log',
}: LatestLabLogSectionProps) {
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    caption: string;
  } | null>(null);

  const recentDispatches = useMemo(
    () => getLatestLabLogs(labLogs, HOME_LAB_LOG_PREVIEW_LIMIT),
    [],
  );

  return (
    <ArchitecturalFrame
      id={id}
      ariaLabel={siteCopy.home.labLogHeading}
      livingBorder
      spacing="preview"
    >
      <div>
        <div className="mb-8 flex flex-col gap-2 sm:mb-10">
          <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
            <p className="font-eyebrow-mono shrink-0 text-[11px] font-medium text-[var(--text-eyebrow)]">
              {siteCopy.home.labLogEyebrow}
            </p>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-[var(--border-hairline)]"
            />
          </ScrollReveal>

          <KineticHeadline
            as="h2"
            text={siteCopy.home.labLogHeading}
            className="text-3xl text-[var(--text-primary)] sm:text-4xl lg:text-[3rem]"
          />
        </div>

        {recentDispatches.length === 0 ? (
          <ScrollReveal staggerIndex={2}>
            <div className="border-t border-b border-white/[0.08] py-10 text-start">
              <p className="font-eyebrow-mono text-[11px] font-medium text-[var(--text-eyebrow)]">
                {siteCopy.home.labLogEmptyStatus}
              </p>
              <h3 className="font-display-card mt-2.5 text-base font-semibold text-[var(--text-primary)]">
                {siteCopy.home.labLogEmptyTitle}
              </h3>
              <p className="font-editorial-body mt-1.5 max-w-xl text-sm text-[var(--text-secondary)]">
                {siteCopy.home.labLogEmptyDescription}
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="divide-y divide-white/[0.08] border-t border-b border-white/[0.08]">
            {recentDispatches.map((entry, index) => (
              <ScrollReveal
                key={entry.id}
                staggerIndex={Math.min(index + 1, 3)}
              >
                <LabLogCard
                  entry={entry}
                  compact
                  onInspectImage={(url, caption) => setLightboxImage({url, caption})}
                />
              </ScrollReveal>
            ))}
          </div>
        )}

        <ScrollReveal staggerIndex={3} className="mt-8 sm:mt-10">
          <Link
            to="/log"
            className="group inline-flex min-h-[44px] items-center gap-2.5 border-b border-white/[0.16] pb-1.5 text-sm font-medium text-[var(--text-primary)] transition-colors duration-200 hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
          >
            <span>{siteCopy.home.viewAllLogs}</span>
            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5"
              strokeWidth={1.75}
            />
          </Link>
        </ScrollReveal>
      </div>

      <ScreenshotLightbox
        images={lightboxImage ? [lightboxImage.url] : []}
        activeIndex={lightboxImage ? 0 : null}
        title={lightboxImage?.caption || siteCopy.home.labLogHeading}
        onClose={() => setLightboxImage(null)}
        onSelectIndex={() => {}}
      />
    </ArchitecturalFrame>
  );
}
