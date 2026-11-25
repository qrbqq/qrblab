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
