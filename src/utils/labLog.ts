import type {LabLogEntry, LabLogProfileVariant} from '../data/labLog';
import {siteConfig, type SiteConfig} from '../data/siteConfig';
import {getLocalizedText} from './papers';
export {isSafeExternalUrl, sanitizeExternalUrl} from './url';

export function sortLabLogsDesc(entries: readonly LabLogEntry[]): LabLogEntry[] {
  return [...entries].sort((a, b) => {
    const timeA = Date.parse(a.timestamp);
    const timeB = Date.parse(b.timestamp);
    if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
      return timeB - timeA;
    }
    return b.timestamp.localeCompare(a.timestamp);
  });
}

export const HOME_LAB_LOG_PREVIEW_LIMIT = 3;

export function getLatestLabLogs(
  entries: readonly LabLogEntry[],
  limit = HOME_LAB_LOG_PREVIEW_LIMIT,
): LabLogEntry[] {
  return sortLabLogsDesc(entries).slice(0, Math.max(0, limit));
}

export function getLatestLabLog(entries: readonly LabLogEntry[]): LabLogEntry | null {
  if (entries.length === 0) {
    return null;
  }
  return sortLabLogsDesc(entries)[0] ?? null;
}

export function getLabLogCaption(entry: LabLogEntry): string {
  return getLocalizedText(entry.caption);
}

/**
 * Resolves ordered, deduplicated relative image/GIF paths for a Lab Log entry.
 * Supports both modern `images: string[]` arrays and legacy single `image: string`.
 */
export function resolveLabLogImages(entry: LabLogEntry): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  if (Array.isArray(entry.images)) {
    for (const raw of entry.images) {
      if (typeof raw !== 'string') continue;
      const trimmed = raw.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        result.push(trimmed);
      }
    }
  }

  if (typeof entry.image === 'string') {
    const trimmed = entry.image.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * Resolves the optional native MP4 video attachment path for a Lab Log entry.
 */
export function resolveLabLogVideo(entry: LabLogEntry): string {
  if (typeof entry.video !== 'string') {
    return '';
  }
  return entry.video.trim();
}

/**
 * Filters Lab Log entries by profile variant ('primary' defaults when entry.profile is omitted).
 */
export function filterLabLogsByProfile(
  entries: readonly LabLogEntry[],
  variant: LabLogProfileVariant,
): LabLogEntry[] {
  return entries.filter((entry) => (entry.profile ?? 'primary') === variant);
}

export interface ThreadedLabLogItem {
  entry: LabLogEntry;
  connectsFromPrev: boolean;
  connectsToNext: boolean;
}

/**
 * Computes consecutive thread connection flags for an ordered list of dispatches.
 * Consecutive dispatches sharing a non-empty `threadId` connect visually via a vertical rail.
 */
export function computeThreadConnections(
  orderedEntries: readonly LabLogEntry[],
): ThreadedLabLogItem[] {
  return orderedEntries.map((entry, index) => {
    const currentThread = typeof entry.threadId === 'string' ? entry.threadId.trim() : '';
    const prevThread =
      index > 0 && typeof orderedEntries[index - 1]?.threadId === 'string'
        ? orderedEntries[index - 1]!.threadId!.trim()
        : '';
    const nextThread =
      index < orderedEntries.length - 1 &&
      typeof orderedEntries[index + 1]?.threadId === 'string'
        ? orderedEntries[index + 1]!.threadId!.trim()
        : '';

    return {
      entry,
      connectsFromPrev: Boolean(currentThread && prevThread === currentThread),
      connectsToNext: Boolean(currentThread && nextThread === currentThread),
    };
  });
}

export interface ResolvedProfileIdentity {
  variant: LabLogProfileVariant;
  displayName: string;
  handle: string;
  profileAvatar: string;
  profileBannerText: string;
  profileCoverVideo: string;
  profileBio: string;
  badgeVariant: 'red' | 'blue';
  routePath: '/log' | '/profile-2';
}

const DEFAULT_PROFILE_BIO =
  'Independent personal research & technical dispatches in Artificial Intelligence, Mechatronics, Robotics & Autonomous Systems.';

/**
 * Resolves case-agnostic profile identity and media settings for Profile 1 or Profile 2.
 */
export function resolveProfileIdentity(
  variant: LabLogProfileVariant,
  config: SiteConfig = siteConfig,
): ResolvedProfileIdentity {
  if (variant === 'secondary') {
    const sec = config.secondaryProfile;
    return {
      variant: 'secondary',
      displayName: sec?.displayName ?? 'Profile 2',
      handle: sec?.handle ?? '@qrbqq2',
      profileAvatar: sec?.profileAvatar ?? config.profileAvatar,
      profileBannerText: sec?.profileBannerText ?? config.profileBannerText,
      profileCoverVideo: sec?.profileCoverVideo ?? config.profileCoverVideo ?? '',
      profileBio: sec?.profileBio || config.profileBio || DEFAULT_PROFILE_BIO,
      badgeVariant: 'blue',
      routePath: '/profile-2',
    };
  }

  return {
    variant: 'primary',
    displayName: config.displayName,
    handle: config.handle,
    profileAvatar: config.profileAvatar,
    profileBannerText: config.profileBannerText,
    profileCoverVideo: config.profileCoverVideo ?? '',
    profileBio: config.profileBio || DEFAULT_PROFILE_BIO,
    badgeVariant: 'red',
    routePath: '/log',
  };
}

export function formatLabLogTimestamp(isoTimestamp: string): string {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) {
    return isoTimestamp;
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(parsed);
}

/**
 * Pure client-side relative timestamp formatter comparing `nowMs` against an ISO date string.
 * Buckets:
 *   < 1 minute  -> "Just now"
 *   < 60 mins   -> "{m}m ago"
 *   < 24 hours  -> "{h}h ago"
 *   1–6 days    -> "{d}d ago"
 *   7–27 days   -> "{w}w ago" (1–3 weeks)
 *   1–11 months -> "{mo}mo ago"
 *   >= 1 year   -> "{y}y ago"
 */
export function formatRelativeTime(
  isoDateString: string,
  nowMs: number = Date.now(),
): string {
  if (!isoDateString || typeof isoDateString !== 'string') {
    return '';
  }

  const parsedMs = Date.parse(isoDateString);
  if (Number.isNaN(parsedMs)) {
    return isoDateString;
  }

  const diffMs = Math.max(0, nowMs - parsedMs);
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays <= 6) {
    return `${diffDays}d ago`;
  }

  if (diffDays <= 27) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  }

  if (diffDays < 365) {
    const months = Math.max(1, Math.min(11, Math.floor(diffDays / 30)));
    return `${months}mo ago`;
  }

  const years = Math.floor(diffDays / 365);
  return `${years}y ago`;
}
