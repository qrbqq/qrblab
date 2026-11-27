import {useEffect, useMemo, useRef, useState} from 'react';
import {EmptyStateCard} from '../components/EmptyStateCard';
import {FounderAvatar} from '../components/FounderAvatar';
import {LabLogCard} from '../components/LabLogCard';
import {QMetricBadge} from '../components/QMetricBadge';
import {ScreenshotLightbox} from '../components/ScreenshotLightbox';
import {ScrollReveal} from '../components/ScrollReveal';
import {VerifiedBadge} from '../components/VerifiedBadge';
import {siteConfig, siteCopy} from '../data/siteConfig';
import {labLogs} from '../data/labLog';
import {useQScore} from '../hooks/useQScore';
import {
  computeThreadConnections,
  resolveProfileIdentity,
  sortLabLogsDesc,
} from '../utils/labLog';
import {resolveAssetUrl} from '../utils/papers';
import {recordQInteraction} from '../utils/qScore';

export function LabLogPage() {
  const identity = useMemo(() => resolveProfileIdentity(siteConfig), []);
  const qScore = useQScore();

  const coverVideoUrl = useMemo(() => {
    const raw = identity.profileCoverVideo.trim();
    return raw ? resolveAssetUrl(raw, import.meta.env.BASE_URL) : '';
  }, [identity.profileCoverVideo]);

  const coverVideoRef = useRef<HTMLVideoElement | null>(null);
  const [coverVideoFailed, setCoverVideoFailed] = useState(false);
  const [coverVideoReady, setCoverVideoReady] = useState(false);

  useEffect(() => {
    setCoverVideoFailed(false);
    setCoverVideoReady(false);
  }, [coverVideoUrl]);

  useEffect(() => {
    const videoEl = coverVideoRef.current;
    if (!videoEl || !coverVideoUrl || coverVideoFailed) {
      return;
    }
    videoEl.muted = true;
    videoEl.defaultMuted = true;
    videoEl.play().catch(() => {});
  }, [coverVideoUrl, coverVideoFailed]);

  const [lightboxState, setLightboxState] = useState<{
    images: string[];
    activeIndex: number;
    caption: string;
  } | null>(null);

  const threadedLogs = useMemo(() => {
    const sorted = sortLabLogsDesc(labLogs);
    return computeThreadConnections(sorted);
  }, []);

  const showVideoCover = Boolean(coverVideoUrl) && !coverVideoFailed;

  return (
    <div className="w-full pb-20">
      {/* =========================================================================
          1. PROFILE COVER BANNER (Video Loop Cover OR Kinetic Marquee Fallback)
          ========================================================================= */}
      <div
        data-testid="profile-cover-banner"
        className="profile-cover-marquee-container relative flex h-28 w-full items-center overflow-hidden border-t border-b border-white/[0.08] bg-[#050505] md:h-36"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {showVideoCover ? (
          <>
            <video
              ref={coverVideoRef}
              key={coverVideoUrl}
              src={coverVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-hidden="true"
              data-testid="profile-cover-video"
              onLoadedData={() => setCoverVideoReady(true)}
              onCanPlay={() => setCoverVideoReady(true)}
              onError={() => setCoverVideoFailed(true)}
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                coverVideoReady ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[#050505]/75"
            />
          </>
        ) : (
          <div
            data-testid="profile-cover-marquee"
            className="profile-cover-marquee-track flex items-center whitespace-nowrap"
          >
            {Array.from({length: 8}).map((_, i) => (
              <div
                key={i}
                className="flex shrink-0 items-center gap-6 px-4 whitespace-nowrap"
              >
                <span
                  className="font-display-bebas whitespace-nowrap text-2xl font-bold tracking-[0.06em] text-[#E5E5E5] md:text-3xl"
                  style={{textTransform: 'none', textWrap: 'nowrap'}}
                >
                  {identity.profileBannerText}
                </span>
                <span className="text-xl font-light text-white/30">·</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          2. NARROWER FOCUSED CONTAINER + PROMINENT ENLARGED IDENTITY HEADER
          ========================================================================= */}
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <header className="relative pb-8">
          {/* Prominent Enlarged Profile Emblem Circle (w-28 h-28 md:w-32 md:h-32) */}
          <div className="relative z-10 -mt-14 inline-flex md:-mt-16">
            <FounderAvatar
              sizeClass="h-28 w-28 md:h-32 md:w-32"
              paddingClass="p-5 md:p-6"
              avatarSrc={identity.profileAvatar}
              className="border border-white/[0.16] ring-4 ring-[#050505] shadow-2xl"
              alt={identity.displayName}
            />
          </div>

          {/* Case-Agnostic Display Name + Crimson Verified Seal + Q Metric Badge */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <h1
                className="font-display-heading text-3xl font-bold text-[#F5F5F5] md:text-4xl"
                style={{textTransform: 'none'}}
              >
                {identity.displayName}
              </h1>
              <VerifiedBadge
                size={26}
                label={`Verified ${identity.displayName}`}
              />
              <QMetricBadge score={qScore} />
            </div>
            <p
              className="font-mono-tabular mt-1 text-sm text-[#8A8A8A]"
              style={{textTransform: 'none'}}
            >
              {identity.handle}
            </p>
          </div>

          {/* Concise Bio */}
          <p className="font-body-prose mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
            {identity.profileBio}
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
          3. BORDERLESS UNBOXED PROFILE FEED (All dispatches & connected threads)
          ========================================================================= */}
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <section aria-label={siteCopy.labLog.title} className="mt-6">
          {threadedLogs.length === 0 ? (
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
            <div className="flex flex-col">
              {threadedLogs.map(
                ({entry, connectsFromPrev, connectsToNext}, index) => (
                  <LabLogCard
                    key={entry.id}
                    entry={entry}
                    connectsFromPrev={connectsFromPrev}
                    connectsToNext={connectsToNext}
                    showBottomBorder={
                      !connectsToNext && index < threadedLogs.length - 1
                    }
                    onInspectImage={(url, caption, galleryImages, idx) => {
                      recordQInteraction('tool-trigger');
                      setLightboxState({
                        images:
                          galleryImages && galleryImages.length > 0
                            ? galleryImages
                            : [url],
                        activeIndex: idx ?? 0,
                        caption,
                      });
                    }}
                  />
                ),
              )}
            </div>
          )}
        </section>
      </div>

      <ScreenshotLightbox
        images={lightboxState?.images ?? []}
        activeIndex={lightboxState ? lightboxState.activeIndex : null}
        title={lightboxState?.caption || siteCopy.labLog.title}
        onClose={() => setLightboxState(null)}
        onSelectIndex={(nextIndex) =>
          setLightboxState((prev) =>
            prev ? {...prev, activeIndex: nextIndex} : null,
          )
        }
      />
    </div>
  );
}

