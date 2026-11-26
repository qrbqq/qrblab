import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowUpRight, ImageOff, Maximize2} from 'lucide-react';
import type {LabLogEntry} from '../data/labLog';
import {siteConfig, siteCopy} from '../data/siteConfig';
import {
  formatLabLogTimestamp,
  formatRelativeTime,
  getLabLogCaption,
  sanitizeExternalUrl,
} from '../utils/labLog';
import {resolveAssetUrl} from '../utils/papers';
import {FounderAvatar} from './FounderAvatar';
import {VerifiedBadge} from './VerifiedBadge';

interface LabLogCardProps {
  entry: LabLogEntry;
  onInspectImage?: (imageUrl: string, caption: string) => void;
  compact?: boolean;
}

export function LabLogCard({
  entry,
  onInspectImage,
  compact = false,
}: LabLogCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
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
  const imageUrl = entry.image
    ? resolveAssetUrl(entry.image, import.meta.env.BASE_URL)
    : '';
  const safeSourceUrl = sanitizeExternalUrl(entry.sourceUrl);
  const aspectClass = entry.imageAspect === 'square' ? 'aspect-square' : 'aspect-video';

  return (
    <article
      className={`group/card relative flex flex-col ${
        compact ? 'py-6 sm:py-7' : 'py-7 sm:py-9'
      }`}
    >
      {/* Author Identity Header: @qrbqq + Crimson Verified Seal + Timestamp */}
      <div className="flex items-start justify-between gap-3">
        <Link
          to="/log"
          aria-label={`View ${siteConfig.displayName} profile`}
          className="group/author inline-flex min-w-0 items-center gap-2.5 rounded-lg text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          <div className="transition-transform duration-200 group-hover/author:scale-[1.04]">
            <FounderAvatar
              sizeClass={compact ? 'h-8 w-8' : 'h-9 w-9'}
              paddingClass="p-1.5"
              alt={siteConfig.handle}
            />
          </div>

          <div className="min-w-0 flex flex-col">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="font-mono-tabular text-xs font-semibold text-[#F5F5F5] transition-colors group-hover/author:text-white sm:text-sm"
                style={{textTransform: 'none'}}
              >
                {siteConfig.handle}
              </span>
              <VerifiedBadge size={16} />
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
            </div>
          </div>
        </Link>

        {safeSourceUrl ? (
          <a
            href={safeSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[32px] shrink-0 items-center gap-1 whitespace-nowrap border-b border-white/20 pb-0.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-white hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <span>{siteCopy.labLog.sourceLink}</span>
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </a>
        ) : null}
      </div>

      {/* Dispatch Body */}
      <p
        className={`font-body-prose mt-3 max-w-3xl text-[var(--text-primary)] ${
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

      {/* Optional Media Attachment (16:9 or 1:1, borderless unboxed unit with 1px neutral hairline frame) */}
      {imageUrl ? (
        <div className="mt-4 w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[#0A0A0A]">
          {!imageFailed ? (
            <button
              type="button"
              onClick={() => onInspectImage?.(imageUrl, caption)}
              aria-label={siteCopy.labLog.zoomImage}
              className={`group relative block w-full ${aspectClass} overflow-hidden text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]`}
            >
              <img
                src={imageUrl}
                alt={caption}
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
              />
              <span
                aria-hidden="true"
                className="glass-surface absolute end-2.5 bottom-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
            </button>
          ) : (
            <div className={`flex ${aspectClass} w-full items-center justify-center gap-2 text-xs text-[var(--text-secondary)]`}>
              <ImageOff className="h-4 w-4" strokeWidth={1.6} />
              <span className="truncate px-2">{entry.image}</span>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
