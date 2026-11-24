import {useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {labLogs} from '../data/labLog';
import {
  handleSpotlightMouseMove,
  useScrollReveal,
} from '../hooks/useScrollReveal';
import {getLatestLabLog} from '../utils/labLog';
import {ArchitecturalFrame} from './ArchitecturalFrame';
import {LabLogCard} from './LabLogCard';
import {ScreenshotLightbox} from './ScreenshotLightbox';

interface LatestLabLogSectionProps {
  id?: string;
}

export function LatestLabLogSection({
  id = 'lab-log',
}: LatestLabLogSectionProps) {
  const {t} = useLanguage();
  const {ref, isVisible} = useScrollReveal<HTMLDivElement>({
    threshold: 0.05,
  });
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    caption: string;
  } | null>(null);

  const latestEntry = getLatestLabLog(labLogs);

  return (
    <ArchitecturalFrame
      id={id}
      ariaLabel={t.home.labLogHeading}
      livingBorder
      compact
    >
      <div ref={ref}>
        <div
          data-revealed={isVisible}
          className="home-reveal-item mb-4 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
              {t.home.labLogEyebrow}
            </p>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)] sm:text-xl">
              {t.home.labLogHeading}
            </h2>
          </div>

          <Link
            to="/log"
            className="glass-surface-subtle inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <span>{t.home.viewAllLogs}</span>
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={1.75} />
          </Link>
        </div>

        {!latestEntry ? (
          <div
            data-revealed={isVisible}
            onMouseMove={handleSpotlightMouseMove}
            className="home-reveal-item home-spotlight-card glass-card rounded-2xl p-5 sm:p-6"
          >
            <div className="relative z-10 min-w-0 text-start">
              <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
                {t.home.labLogEmptyStatus}
              </p>
              <h3 className="mt-1.5 text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                {t.home.labLogEmptyTitle}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                {t.home.labLogEmptyDescription}
              </p>
            </div>
          </div>
        ) : (
          <div data-revealed={isVisible} className="home-reveal-item">
            <LabLogCard
              entry={latestEntry}
              compact
              onInspectImage={(url, caption) => setLightboxImage({url, caption})}
            />
          </div>
        )}
      </div>

      <ScreenshotLightbox
        images={lightboxImage ? [lightboxImage.url] : []}
        activeIndex={lightboxImage ? 0 : null}
        title={lightboxImage?.caption || t.home.labLogHeading}
        onClose={() => setLightboxImage(null)}
        onSelectIndex={() => {}}
      />
    </ArchitecturalFrame>
  );
}
