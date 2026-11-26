import {useMemo, useState} from 'react';
import {EmptyStateCard} from '../components/EmptyStateCard';
import {FounderAvatar} from '../components/FounderAvatar';
import {LabLogCard} from '../components/LabLogCard';
import {ScreenshotLightbox} from '../components/ScreenshotLightbox';
import {ScrollReveal} from '../components/ScrollReveal';
import {VerifiedBadge} from '../components/VerifiedBadge';
import {siteConfig, siteCopy} from '../data/siteConfig';
import {labLogs} from '../data/labLog';
import {sortLabLogsDesc} from '../utils/labLog';

export function LabLogPage() {
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    caption: string;
  } | null>(null);

  const sortedLogs = useMemo(() => sortLabLogsDesc(labLogs), []);

  return (
    <div className="w-full pb-20">
      {/* =========================================================================
          1. KINETIC PROFILE COVER MARQUEE BANNER (Never pauses on hover)
          ========================================================================= */}
      <div className="profile-cover-marquee-container relative h-28 w-full overflow-hidden border-t border-b border-white/[0.08] bg-[#050505] md:h-36 flex items-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="profile-cover-marquee-track whitespace-nowrap flex items-center">
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-4">
              <span
                className="font-display-bebas text-2xl md:text-3xl font-bold tracking-[0.06em] text-[#E5E5E5]"
                style={{textTransform: 'none'}}
              >
                {siteConfig.profileBannerText}
              </span>
              <span className="text-white/30 text-xl font-light">·</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          2. NARROWER FOCUSED CONTAINER + PROMINENT ENLARGED IDENTITY HEADER
          ========================================================================= */}
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <header className="relative pb-8">
          {/* Prominent Enlarged Profile Emblem Circle (w-28 h-28 md:w-32 md:h-32) */}
          <div className="relative -mt-14 inline-flex md:-mt-16">
            <FounderAvatar
              sizeClass="h-28 w-28 md:h-32 md:w-32"
              paddingClass="p-5 md:p-6"
              className="border border-white/[0.16] ring-4 ring-[#050505] shadow-2xl"
              alt={siteConfig.displayName}
            />
          </div>

          {/* Display Name + Enlarged Crimson Verified Seal */}
          <div className="mt-4">
            <div className="flex items-center gap-2.5">
              <h1
                className="font-display-heading text-3xl font-bold text-[#F5F5F5] md:text-4xl"
                style={{textTransform: 'none'}}
              >
                {siteConfig.displayName}
              </h1>
              <VerifiedBadge size={24} />
            </div>
            <p
              className="font-mono-tabular mt-1 text-sm text-[#8A8A8A]"
              style={{textTransform: 'none'}}
            >
              {siteConfig.handle}
            </p>
          </div>

          {/* Concise Bio */}
          <p className="font-body-prose mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            Independent personal research &amp; technical dispatches in Artificial
            Intelligence, Mechatronics, Robotics &amp; Autonomous Systems.
          </p>

          <span
            aria-hidden="true"
            className="font-mono-tabular pointer-events-none absolute end-0 bottom-3 hidden select-none text-[11px] text-white/20 sm:block"
          >
            +
          </span>
        </header>
      </div>

      <div className="h-px w-full bg-white/[0.08]" />

      {/* =========================================================================
          3. BORDERLESS UNBOXED PROFILE FEED (All dispatches)
          ========================================================================= */}
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <section aria-label={siteCopy.labLog.title} className="mt-6">
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
            <div className="divide-y divide-white/[0.08]">
              {sortedLogs.map((entry, index) => (
                <div key={entry.id} className="relative">
                  <LabLogCard
                    entry={entry}
                    onInspectImage={(url, caption) =>
                      setLightboxImage({url, caption})
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

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
