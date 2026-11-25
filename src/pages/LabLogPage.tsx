import {useMemo, useState} from 'react';
import {EmptyStateCard} from '../components/EmptyStateCard';
import {LabLogCard} from '../components/LabLogCard';
import {ScreenshotLightbox} from '../components/ScreenshotLightbox';
import {ScrollReveal} from '../components/ScrollReveal';
import {siteCopy} from '../data/i18n';
import {labLogs} from '../data/labLog';
import {sortLabLogsDesc} from '../utils/labLog';

export function LabLogPage() {
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    caption: string;
  } | null>(null);

  const sortedLogs = useMemo(() => sortLabLogsDesc(labLogs), []);
  const countLabel =
    sortedLogs.length === 1
      ? siteCopy.labLog.countSingular
      : siteCopy.labLog.countPlural;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10 flex flex-col gap-6 border-b border-[var(--border-hairline)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
            <p className="font-mono-tabular shrink-0 text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
              {siteCopy.labLog.eyebrow}
            </p>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-[var(--border-hairline)]"
            />
          </ScrollReveal>
          <ScrollReveal staggerIndex={1}>
            <h1 className="font-display-hero mt-2 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
              {siteCopy.labLog.title}
            </h1>
          </ScrollReveal>
          <ScrollReveal staggerIndex={2}>
            <p className="font-body-prose mt-2 max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">
              {siteCopy.labLog.subtitle}
            </p>
          </ScrollReveal>
        </div>

        {sortedLogs.length > 0 ? (
          <ScrollReveal staggerIndex={1} className="shrink-0">
            <p className="font-mono-tabular text-sm font-medium text-[var(--text-secondary)] tabular-nums">
              {sortedLogs.length} {countLabel}
            </p>
          </ScrollReveal>
        ) : null}
      </header>

      {sortedLogs.length === 0 ? (
        <ScrollReveal staggerIndex={2}>
          <EmptyStateCard
            eyebrow={siteCopy.labLog.emptyStatus}
            title={siteCopy.labLog.emptyTitle}
            description={siteCopy.labLog.emptyDescription}
            actionLabel={siteCopy.labLog.emptyHint}
            actionTo="/qrb-lab"
          />
        </ScrollReveal>
      ) : (
        <div className="mx-auto max-w-3xl">
          <div className="relative space-y-5 before:pointer-events-none before:absolute before:inset-y-6 before:start-5 before:hidden before:w-px before:bg-[var(--border-hairline)] sm:before:block sm:ps-12">
            {sortedLogs.map((entry, index) => (
              <ScrollReveal
                key={entry.id}
                staggerIndex={Math.min(index, 2)}
                className="relative"
              >
                <span
                  aria-hidden="true"
                  className="absolute -start-[33px] top-7 hidden h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-canvas)] bg-[var(--text-primary)] sm:block"
                />
                <LabLogCard
                  entry={entry}
                  onInspectImage={(url, caption) =>
                    setLightboxImage({url, caption})
                  }
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

      <ScreenshotLightbox
        images={lightboxImage ? [lightboxImage.url] : []}
        activeIndex={lightboxImage ? 0 : null}
        title={lightboxImage?.caption || siteCopy.labLog.title}
        onClose={() => setLightboxImage(null)}
        onSelectIndex={() => {}}
      />
    </div>
  );
}
