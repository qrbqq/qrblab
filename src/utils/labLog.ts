import type {LabLogEntry} from '../data/labLog';
import {getLocalizedText} from './papers';

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

export function getLatestLabLog(entries: readonly LabLogEntry[]): LabLogEntry | null {
  if (entries.length === 0) {
    return null;
  }
  return sortLabLogsDesc(entries)[0] ?? null;
}

export function getLabLogCaption(entry: LabLogEntry): string {
  return getLocalizedText(entry.caption);
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

export function isSafeExternalUrl(rawUrl: string | undefined): boolean {
  if (!rawUrl) {
    return false;
  }
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
