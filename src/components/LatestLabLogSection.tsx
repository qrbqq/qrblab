import {useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import {siteCopy} from '../data/i18n';
import {labLogs} from '../data/labLog';
import {handleSpotlightMouseMove} from '../hooks/useScrollReveal';
import {getLatestLabLog} from '../utils/labLog';
import {ArchitecturalFrame} from './ArchitecturalFrame';
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

  const latestEntry = getLatestLabLog(labLogs);

  return (
    <ArchitecturalFrame
      id={id}
      ariaLabel={siteCopy.home.labLogHeading}
      livingBorder
      compact
    >
      <div>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <ScrollReveal
            staggerIndex={0}
            className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1"
          >
            <p className="font-mono-tabular shrink-0 text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
              {siteCopy.home.labLogEyebrow}
            </p>
            <h2 className="font-display-heading shrink-0 text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
              {siteCopy.home.labLogHeading}
            </h2>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-[var(--border-hairline)] sm:block"
            />
          </ScrollReveal>

          <ScrollReveal staggerIndex={1}>
            <Link
              to="/log"
              className="glass-surface-subtle inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <span>{siteCopy.home.viewAllLogs}</span>
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </ScrollReveal>
        </div>

        {!latestEntry ? (
          <ScrollReveal staggerIndex={2}>
            <div
              onMouseMove={handleSpotlightMouseMove}
              className="home-spotlight-card rounded-sm border-t border-b border-white/[0.08] py-8 px-4 text-start"
            >
              <div className="relative z-10 min-w-0 text-start">
                <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
                  {siteCopy.home.labLogEmptyStatus}
                </p>
                <h3 className="font-display-card mt-1.5 text-sm font-semibold text-[var(--text-primary)]">
                  {siteCopy.home.labLogEmptyTitle}
                </h3>
                <p className="font-body-prose mt-1 text-xs text-[var(--text-secondary)]">
                  {siteCopy.home.labLogEmptyDescription}
                </p>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal staggerIndex={2}>
            <LabLogCard
              entry={latestEntry}
              compact
              onInspectImage={(url, caption) => setLightboxImage({url, caption})}
            />
          </ScrollReveal>
        )}
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
