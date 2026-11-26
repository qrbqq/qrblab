import {useMemo, useState} from 'react';
import {EmptyStateCard} from '../components/EmptyStateCard';
import {FounderAvatar} from '../components/FounderAvatar';
import {LabLogCard} from '../components/LabLogCard';
import {ScreenshotLightbox} from '../components/ScreenshotLightbox';
import {ScrollReveal} from '../components/ScrollReveal';
import {VerifiedBadge} from '../components/VerifiedBadge';
import {siteCopy} from '../data/i18n';
import {labLogs} from '../data/labLog';
import {sortLabLogsDesc} from '../utils/labLog';

export function LabLogPage() {
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    caption: string;
  } | null>(null);

  const sortedLogs = useMemo(() => sortLabLogsDesc(labLogs), []);

  return (
    <div className="w-full pb-16">
      {/* =========================================================================
          1. ARCHITECTURAL DARK-VOID BANNER (h-32 md:h-40, technical grid + radial glow)
          ========================================================================= */}
      <div
        aria-hidden="true"
        className="relative h-32 w-full overflow-hidden border-b border-white/[0.08] bg-[#050505] md:h-40"
        style={{
          backgroundImage: [
            'radial-gradient(60% 100% at 50% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 72%)',
            'linear-gradient(180deg, #0D0D0D 0%, #050505 100%)',
          ].join(', '),
        }}
      >
        {/* Ultra-faint technical coordinate hairlines fading seamlessly into #050505 */}
        <div
          className="pointer-events-none absolute inset-0 opacity-65"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.032) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)',
          }}
        />
        {/* Subtle bottom horizon hairline glow */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.16) 50%, transparent 100%)',
          }}
        />
      </div>

      {/* =========================================================================
          2. ELEVATED FOUNDER PROFILE HEADER (Crisp white Q emblem, 23px Crimson Seal)
          ========================================================================= */}
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <header className="relative pb-8">
          {/* Clean Circular Q Brand Emblem Avatar (Zero overlapping mini-circle) */}
          <div className="relative -mt-12 inline-flex md:-mt-14">
            <FounderAvatar
              sizeClass="h-24 w-24 md:h-28 md:w-28"
              paddingClass="p-4 md:p-5"
              className="border border-white/[0.16] ring-4 ring-[#050505] shadow-2xl"
              alt="qrbqq brand emblem"
            />
          </div>

          {/* Identity Hierarchy Directly Below */}
          <ScrollReveal staggerIndex={0} className="mt-4">
            <div className="flex items-center gap-2.5">
              <h1 className="font-display-hero text-2xl font-bold tracking-tight text-[#F5F5F5] sm:text-3xl">
                qrbqq
              </h1>
              <VerifiedBadge size={23} />
            </div>
            <p className="font-mono-tabular mt-1 text-sm text-[#8A8A8A]">
              @qrbqq
            </p>
          </ScrollReveal>

          {/* Clean Concise Bio (Zero unnecessary counter clutter) */}
          <ScrollReveal staggerIndex={1}>
            <p className="font-body-prose mt-3.5 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
              Independent personal research &amp; technical dispatches in Artificial
              Intelligence, Mechatronics, Robotics &amp; Autonomous Systems.
            </p>
          </ScrollReveal>

          {/* Discrete registration marks */}
          <span
            aria-hidden="true"
            className="font-mono-tabular pointer-events-none absolute end-0 bottom-3 hidden select-none text-[11px] text-white/20 sm:block"
          >
            +
          </span>
        </header>
      </div>

      {/* Subtle 1px Full-Width Architectural Divider */}
      <div className="h-px w-full bg-white/[0.08]" />

      {/* =========================================================================
          3. CHRONOLOGICAL DISPATCH FEED (Sorted Newest-First)
          ========================================================================= */}
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <section aria-label={siteCopy.labLog.title} className="mt-8">
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
            <div className="space-y-4 sm:space-y-5">
              {sortedLogs.map((entry, index) => (
                <ScrollReveal
                  key={entry.id}
                  staggerIndex={Math.min(index, 2)}
                  className="relative"
                >
                  <LabLogCard
                    entry={entry}
                    onInspectImage={(url, caption) =>
                      setLightboxImage({url, caption})
                    }
                  />
                </ScrollReveal>
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
