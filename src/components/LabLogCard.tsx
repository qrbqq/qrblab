import {useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight, ImageOff, Maximize2, VideoOff} from 'lucide-react';
import type {LabLogEntry} from '../data/labLog';
import {siteConfig, siteCopy} from '../data/siteConfig';
import {
  formatLabLogTimestamp,
  formatRelativeTime,
  getLabLogCaption,
  resolveLabLogImages,
  resolveLabLogVideo,
  resolveProfileIdentity,
  sanitizeExternalUrl,
} from '../utils/labLog';
import {resolveAssetUrl} from '../utils/papers';
import {FounderAvatar} from './FounderAvatar';
import {VerifiedBadge} from './VerifiedBadge';

interface LabLogCardProps {
  entry: LabLogEntry;
  onInspectImage?: (
    imageUrl: string,
    caption: string,
    galleryImages?: string[],
    activeIndex?: number,
  ) => void;
  compact?: boolean;
  connectsFromPrev?: boolean;
  connectsToNext?: boolean;
  showBottomBorder?: boolean;
}

export function LabLogCard({
  entry,
  onInspectImage,
  compact = false,
  connectsFromPrev = false,
  connectsToNext = false,
  showBottomBorder = false,
}: LabLogCardProps) {
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [videoFailed, setVideoFailed] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const caption = getLabLogCaption(entry);
  const exactFormattedTime = formatLabLogTimestamp(entry.timestamp);
  const relativeTime = formatRelativeTime(entry.timestamp, nowMs);
  const safeSourceUrl = sanitizeExternalUrl(entry.sourceUrl);
  const profileIdentity = useMemo(
    () => resolveProfileIdentity(siteConfig),
    [],
  );

  const rawImagePaths = useMemo(() => resolveLabLogImages(entry), [entry]);
  const resolvedImageUrls = useMemo(
    () => rawImagePaths.map((p) => resolveAssetUrl(p, import.meta.env.BASE_URL)),
    [rawImagePaths],
  );

  const rawVideoPath = useMemo(() => resolveLabLogVideo(entry), [entry]);
  const resolvedVideoUrl = useMemo(
    () =>
      rawVideoPath
        ? resolveAssetUrl(rawVideoPath, import.meta.env.BASE_URL)
        : '',
    [rawVideoPath],
  );

  const badgeLabel = `Verified ${profileIdentity.displayName}`;

  const topPadClass = connectsFromPrev
    ? 'pt-3.5'
    : compact
      ? 'pt-5 sm:pt-6'
      : 'pt-6 sm:pt-8';
  const bottomPadClass = connectsToNext
    ? 'pb-4'
    : compact
      ? 'pb-6 sm:pb-7'
      : 'pb-7 sm:pb-9';

  return (
    <article
      data-testid="lab-log-card"
      data-thread-id={entry.threadId || undefined}
      data-connects-prev={String(connectsFromPrev)}
      data-connects-next={String(connectsToNext)}
      className={`group/card relative flex items-stretch gap-3 sm:gap-3.5 ${
        showBottomBorder ? 'border-b border-white/[0.08]' : ''
      }`}
    >
      {/* Left Gutter: Avatar + Twitter-Style Vertical Thread Connecting Rail */}
      <div
        className={`flex shrink-0 flex-col items-center ${
          compact ? 'w-8' : 'w-9'
        }`}
      >
        {connectsFromPrev ? (
          <span
            aria-hidden="true"
            data-testid="thread-line-top"
            className="mb-1 h-2.5 w-[2px] rounded-b-full bg-white/[0.18]"
          />
        ) : (
          <span
            aria-hidden="true"
            className={compact ? 'h-5 sm:h-6' : 'h-6 sm:h-8'}
          />
        )}

        <Link
          to={profileIdentity.routePath}
          aria-label={`View ${profileIdentity.displayName} profile`}
          className="group/avatar relative z-10 inline-flex shrink-0 rounded-full transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          <FounderAvatar
            sizeClass={compact ? 'h-8 w-8' : 'h-9 w-9'}
            paddingClass="p-1.5"
            avatarSrc={profileIdentity.profileAvatar}
            alt={profileIdentity.displayName}
            className="ring-1 ring-white/[0.1] transition-all duration-200 group-hover/avatar:ring-white/30"
          />
        </Link>

        {connectsToNext ? (
          <span
            aria-hidden="true"
            data-testid="thread-line-bottom"
            className="mt-1.5 w-[2px] flex-1 rounded-t-full bg-white/[0.18]"
          />
        ) : null}
      </div>

      {/* Right Column: Author Lockup, Body, Tags & Omni-Media */}
      <div className={`min-w-0 flex-1 ${topPadClass} ${bottomPadClass}`}>
        <div className="flex items-start justify-between gap-3">
          <Link
            to={profileIdentity.routePath}
            aria-label={`View ${profileIdentity.displayName} profile`}
            className="group/author inline-flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 rounded-lg text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <span
              className="font-display-heading text-xs font-semibold text-[#F5F5F5] transition-colors group-hover/author:text-white sm:text-sm"
              style={{textTransform: 'none'}}
            >
              {profileIdentity.displayName}
            </span>
            <VerifiedBadge size={18} label={badgeLabel} />
            {profileIdentity.handle &&
            profileIdentity.handle !== profileIdentity.displayName ? (
              <span
                className="font-mono-tabular text-xs text-[#8A8A8A] transition-colors group-hover/author:text-[#C5C5C5]"
                style={{textTransform: 'none'}}
              >
                {profileIdentity.handle}
              </span>
            ) : null}
            <span aria-hidden="true" className="text-xs text-white/30">
              ·
            </span>
            <time
              dateTime={entry.timestamp}
              title={exactFormattedTime}
              className="font-mono-tabular text-xs text-[#8A8A8A] tabular-nums transition-colors group-hover/author:text-[#F5F5F5]"
            >
              {relativeTime}
            </time>
          </Link>

          {safeSourceUrl ? (
            <a
              href={safeSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[28px] shrink-0 items-center gap-1 whitespace-nowrap border-b border-white/20 pb-0.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-white hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <span>{siteCopy.labLog.sourceLink}</span>
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </a>
          ) : null}
        </div>

        {/* Dispatch Body */}
        <p
          className={`font-body-prose mt-2 max-w-3xl text-[var(--text-primary)] ${
            compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-[15px]'
          }`}
        >
          {caption}
        </p>

        {/* Optional Tags */}
        {entry.tags && entry.tags.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-tabular text-[11px] text-[var(--text-secondary)]">
            {entry.tags.map((tag, index) => (
              <span key={tag} className="inline-flex items-center gap-1.5">
                {index > 0 ? <span aria-hidden="true">·</span> : null}
                <span>#{tag}</span>
              </span>
            ))}
          </div>
        ) : null}

        {/* Multi-Image / Animated GIF Horizontal Carousel OR Single 1:1 Bounded Image */}
        {resolvedImageUrls.length === 1 ? (
          <div className="mt-3.5 w-full max-w-sm sm:max-w-md aspect-square overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0A0A]">
            {resolvedImageUrls[0] && !failedImages[0] ? (
              <button
                type="button"
                onClick={() =>
                  onInspectImage?.(
                    resolvedImageUrls[0]!,
                    caption,
                    resolvedImageUrls,
                    0,
                  )
                }
                aria-label={siteCopy.labLog.zoomImage}
                className="group relative block h-full w-full overflow-hidden text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
              >
                <img
                  src={resolvedImageUrls[0]}
                  alt={caption}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedImages((prev) => ({...prev, 0: true}))
                  }
                  className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(0)',
                  }}
                />
                <span
                  aria-hidden="true"
                  className="glass-surface absolute end-2.5 bottom-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
              </button>
            ) : (
              <div className="flex h-full w-full items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
                <ImageOff className="h-4 w-4" strokeWidth={1.6} />
                <span className="truncate px-2">{rawImagePaths[0]}</span>
              </div>
            )}
          </div>
        ) : resolvedImageUrls.length > 1 ? (
          <div
            role="region"
            aria-label="Dispatch media gallery"
            data-testid="lab-log-media-carousel"
            className="mt-3.5 flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-1"
          >
            {resolvedImageUrls.map((imgUrl, imgIndex) => (
              <div
                key={`${entry.id}-media-${imgIndex}`}
                className="relative w-64 sm:w-72 aspect-square shrink-0 snap-start overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0A0A]"
              >
                {imgUrl && !failedImages[imgIndex] ? (
                  <button
                    type="button"
                    onClick={() =>
                      onInspectImage?.(
                        imgUrl,
                        caption,
                        resolvedImageUrls,
                        imgIndex,
                      )
                    }
                    aria-label={`${siteCopy.labLog.zoomImage} (${imgIndex + 1} of ${resolvedImageUrls.length})`}
                    className="group relative block h-full w-full overflow-hidden text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    <img
                      src={imgUrl}
                      alt={`${caption} — media ${imgIndex + 1}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [imgIndex]: true,
                        }))
                      }
                      className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                      style={{
                        imageRendering: '-webkit-optimize-contrast',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)',
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className="glass-surface absolute end-2 bottom-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </span>
                  </button>
                ) : (
                  <div className="flex h-full w-full items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
                    <ImageOff className="h-4 w-4" strokeWidth={1.6} />
                    <span className="truncate px-2">
                      {rawImagePaths[imgIndex]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {/* Optional Native MP4 Video Attachment (Strict 16:9 aspect-video) */}
        {resolvedVideoUrl ? (
          <div className="mt-3.5 w-full max-w-2xl aspect-video overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0A0A]">
            {!videoFailed ? (
              <video
                src={resolvedVideoUrl}
                controls
                playsInline
                preload="metadata"
                aria-label={caption || 'Dispatch video'}
                onError={() => setVideoFailed(true)}
                className="h-full w-full bg-black object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
                <VideoOff className="h-4 w-4" strokeWidth={1.6} />
                <span className="truncate px-2">{rawVideoPath}</span>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}

