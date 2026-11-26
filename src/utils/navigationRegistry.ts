import {papers, type ResearchPaper} from '../data/papers';
import {labLogs, type LabLogEntry} from '../data/labLog';
import {siteCopy} from '../data/i18n';

export interface DynamicContentSection {
  id: string;
  to: string;
  label: string;
  description: string;
  lowercaseStrict?: boolean;
  itemCount: number;
  latestDate: string | null;
  latestTimestamp: number | null;
  badgeText: string;
}

export interface SectionDataSource {
  papers: ResearchPaper[];
  labLogs: LabLogEntry[];
}

export function parseDateTimestamp(dateStr?: string | null): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parsed = Date.parse(dateStr);
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatBadgeDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  if (dateStr.includes('T')) {
    return dateStr.split('T')[0] ?? dateStr;
  }
  return dateStr;
}

export function computePaperSection(papersList: ResearchPaper[]): DynamicContentSection {
  const count = papersList.length;
  let latestTimestamp: number | null = null;
  let latestDate: string | null = null;

  for (const p of papersList) {
    const t = parseDateTimestamp(p.publishedDate);
    if (t !== null && (latestTimestamp === null || t > latestTimestamp)) {
      latestTimestamp = t;
      latestDate = p.publishedDate;
    }
  }

  const badgeText = latestDate
    ? formatBadgeDate(latestDate)!
    : `${count} items`;

  return {
    id: 'qrb-lab',
    to: '/qrb-lab',
    label: siteCopy.nav.qrbLab,
    description: 'Technical papers & studies',
    lowercaseStrict: true,
    itemCount: count,
    latestDate,
    latestTimestamp,
    badgeText,
  };
}

export function computeLabLogSection(logsList: LabLogEntry[]): DynamicContentSection {
  const count = logsList.length;
  let latestTimestamp: number | null = null;
  let latestDate: string | null = null;

  for (const l of logsList) {
    const t = parseDateTimestamp(l.timestamp);
    if (t !== null && (latestTimestamp === null || t > latestTimestamp)) {
      latestTimestamp = t;
      latestDate = l.timestamp;
    }
  }

  const badgeText = latestDate
    ? formatBadgeDate(latestDate)!
    : `${count} items`;

  return {
    id: 'lab-log',
    to: '/log',
    label: siteCopy.nav.labLog,
    description: 'Dispatches & bench notes',
    lowercaseStrict: false,
    itemCount: count,
    latestDate,
    latestTimestamp,
    badgeText,
  };
}

export type SectionComputer = (source: SectionDataSource) => DynamicContentSection;

export const SECTION_COMPUTERS: Record<string, SectionComputer> = {
  'qrb-lab': (source) => computePaperSection(source.papers),
  'lab-log': (source) => computeLabLogSection(source.labLogs),
};

export function getAutoSortedSections(
  source: SectionDataSource = {papers, labLogs},
): DynamicContentSection[] {
  const sections = Object.values(SECTION_COMPUTERS).map((fn) => fn(source));

  return sections.sort((a, b) => {
    const aTime = a.latestTimestamp;
    const bTime = b.latestTimestamp;

    // Both have valid dates: newest first (descending)
    if (aTime !== null && bTime !== null) {
      if (bTime !== aTime) {
        return bTime - aTime;
      }
      return a.id.localeCompare(b.id);
    }

    // Only one has a valid date: valid date comes first
    if (aTime !== null && bTime === null) return -1;
    if (aTime === null && bTime !== null) return 1;

    // Neither has a valid date: fallback to registered order ('qrb-lab' first, then 'lab-log')
    return a.id === 'qrb-lab' ? -1 : 1;
  });
}
