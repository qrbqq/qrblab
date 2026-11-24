import {useMemo, useState} from 'react';
import {EmptyStateCard} from '../components/EmptyStateCard';
import {LabLogCard} from '../components/LabLogCard';
import {ScreenshotLightbox} from '../components/ScreenshotLightbox';
import {useLanguage} from '../context/LanguageContext';
import {labLogs} from '../data/labLog';
import {sortLabLogsDesc} from '../utils/labLog';

export function LabLogPage() {
  const {t} = useLanguage();
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    caption: string;
  } | null>(null);

  const sortedLogs = useMemo(() => sortLabLogsDesc(labLogs), []);
  const countLabel =
    sortedLogs.length === 1 ? t.labLog.countSingular : t.labLog.countPlural;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-10 flex flex-col gap-6 border-b border-[var(--border-hairline)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
            {t.labLog.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl text-balance">
            {t.labLog.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            {t.labLog.subtitle}
          </p>
        </div>

        {sortedLogs.length > 0 ? (
          <p className="font-mono-tabular shrink-0 text-sm font-medium text-[var(--text-secondary)] tabular-nums">
            {sortedLogs.length} {countLabel}
          </p>
        ) : null}
      </header>

      {sortedLogs.length === 0 ? (
        <EmptyStateCard
          eyebrow={t.labLog.emptyStatus}
          title={t.labLog.emptyTitle}
          description={t.labLog.emptyDescription}
          actionLabel={t.labLog.emptyHint}
          actionTo="/research"
        />
      ) : (
        <div className="mx-auto max-w-3xl">
          <div className="relative space-y-5 before:pointer-events-none before:absolute before:inset-y-6 before:start-5 before:hidden before:w-px before:bg-[var(--border-hairline)] sm:before:block sm:ps-12">
            {sortedLogs.map((entry) => (
              <div key={entry.id} className="relative">
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
              </div>
            ))}
          </div>
        </div>
      )}

      <ScreenshotLightbox
        images={lightboxImage ? [lightboxImage.url] : []}
        activeIndex={lightboxImage ? 0 : null}
        title={lightboxImage?.caption || t.labLog.title}
        onClose={() => setLightboxImage(null)}
        onSelectIndex={() => {}}
      />
    </div>
  );
}
