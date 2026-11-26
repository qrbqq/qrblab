import {useEffect, useState} from 'react';
import {ArrowUpRight, ImageOff, Maximize2} from 'lucide-react';
import type {LabLogEntry} from '../data/labLog';
import {siteCopy} from '../data/siteConfig';
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

  return (
    <article
      className={`glass-card rounded-3xl ${
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
      }`}
    >
      {/* Author Identity Header: @qrbqq + Verified Badge + · {relativeTime} */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <FounderAvatar
            sizeClass={compact ? 'h-8 w-8' : 'h-9 w-9'}
            paddingClass={compact ? 'p-1.5' : 'p-1.5'}
            className="border border-white/[0.16]"
            alt="@qrbqq"
          />

          <div className="min-w-0 flex flex-col">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono-tabular text-sm font-semibold text-[#F5F5F5]">
                @qrbqq
              </span>
              <VerifiedBadge size={17} />
              <span aria-hidden="true" className="text-xs text-white/30">
                ·
              </span>
              <time
                dateTime={entry.timestamp}
                title={exactFormattedTime}
                className="font-mono-tabular text-xs text-[#8A8A8A] tabular-nums transition-colors hover:text-[#F5F5F5]"
              >
                {relativeTime}
              </time>
            </div>
          </div>
        </div>

        {safeSourceUrl ? (
          <a
            href={safeSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <span>{siteCopy.labLog.sourceLink}</span>
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </a>
        ) : null}
      </div>

      {/* Dispatch Body */}
      <p
        className={`font-body-prose mt-3.5 text-[var(--text-primary)] ${
          compact ? 'text-sm' : 'text-sm sm:text-[15px]'
        }`}
      >
        {caption}
      </p>

      {/* Optional Tags */}
      {entry.tags && entry.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono-tabular text-[11px] text-[var(--text-secondary)]">
          {entry.tags.map((tag, index) => (
            <span key={tag} className="inline-flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              <span>#{tag}</span>
            </span>
          ))}
        </div>
      ) : null}

      {/* Optional Media Attachment (Never renders empty image box when absent) */}
      {imageUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)]">
          {!imageFailed ? (
            <button
              type="button"
              onClick={() => onInspectImage?.(imageUrl, caption)}
              aria-label={siteCopy.labLog.zoomImage}
              className="group relative block w-full overflow-hidden text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <img
                src={imageUrl}
                alt={caption}
                referrerPolicy="no-referrer"
                onError={() => setImageFailed(true)}
                className={`w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.01] ${
                  compact ? 'max-h-64' : 'max-h-[460px]'
                }`}
              />
              <span
                aria-hidden="true"
                className="glass-surface absolute end-3 bottom-3 inline-flex h-8 w-8 items-center justify-center rounded-xl text-[var(--text-primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
            </button>
          ) : (
            <div className="flex h-40 w-full items-center justify-center gap-2 text-xs text-[var(--text-secondary)]">
              <ImageOff className="h-4 w-4" strokeWidth={1.6} />
              <span className="truncate px-2">{entry.image}</span>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}
