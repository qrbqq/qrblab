import type {LocalizedText, ResearchPaper} from '../data/papers';
import {getLocalizedText, getPaperFolder, getPaperSummary} from './papers';

export interface SearchResult {
  paper: ResearchPaper;
  score: number;
  filename: string;
  folder: string;
  matchedTitle: string;
}

const ARABIC_DIACRITICS_REGEX = /[\u064B-\u065F\u0670\u0640]/g;

/**
 * Normalizes both English (case-insensitive, collapsed whitespace) and Arabic
 * (diacritics/tatweel stripped, Alef/Teh Marbuta/Alef Maksura/Hamza normalized)
 * so instant search feels crisp and accurate from the first character.
 */
export function normalizeSearchText(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ');
}

export function extractPdfFilename(pdfPath: string): string {
  const clean = pdfPath.trim().split('?')[0]?.split('#')[0] ?? '';
  const parts = clean.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? clean;
}

function collectLocalizedValues(
  field: LocalizedText | string | undefined,
): string[] {
  if (!field) {
    return [];
  }
  if (typeof field === 'string') {
    const trimmed = field.trim();
    return trimmed ? [trimmed] : [];
  }
  const values: string[] = [];
  for (const val of Object.values(field)) {
    if (typeof val === 'string' && val.trim().length > 0) {
      values.push(val.trim());
    }
  }
  return values;
}

const CONTAINS_ARABIC_REGEX = /[\u0600-\u06FF]/;

function pickMatchedDisplayTitle(
  paper: ResearchPaper,
  rawQuery: string,
  normalizedQuery: string,
): string {
  if (
    CONTAINS_ARABIC_REGEX.test(rawQuery) &&
    typeof paper.title === 'object' &&
    paper.title?.ar &&
    normalizeSearchText(paper.title.ar).includes(normalizedQuery)
  ) {
    return paper.title.ar.trim();
  }
  return getLocalizedText(paper.title);
}

/**
 * Ranks local static papers against a live query.
 * Priority:
 *   0 — Exact title / filename / slug match
 *   1 — Prefix match (title, filename, or slug starts with query)
 *   2 — Word-boundary prefix match inside title / filename / folder / tags
 *   3 — Substring match anywhere in title, filename, slug, folder, category, tags, summary, explanation, or authors
 */
export function searchPapers(
  items: readonly ResearchPaper[],
  query: string,
): SearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const paper of items) {
    const filename = extractPdfFilename(paper.pdfPath);
    const folder = getPaperFolder(paper);
    const titleValues = collectLocalizedValues(paper.title).map(normalizeSearchText).filter(Boolean);
    const filenameCandidates = [filename, filename.replace(/\.pdf$/i, '')]
      .map(normalizeSearchText)
      .filter(Boolean);
    const slugNormalized = normalizeSearchText(paper.slug);
    const primaryCandidates = [...titleValues, ...filenameCandidates, slugNormalized].filter(Boolean);

    let bestTier: number | null = null;

    for (const candidate of [...titleValues, ...filenameCandidates]) {
      if (candidate === normalizedQuery) {
        bestTier = 0;
        break;
      }
      if (candidate.startsWith(normalizedQuery)) {
        bestTier = bestTier === null ? 1 : Math.min(bestTier, 1);
      }
    }

    if (bestTier === null && slugNormalized) {
      if (slugNormalized === normalizedQuery || slugNormalized.startsWith(normalizedQuery)) {
        bestTier = 2;
      }
    }

    if (bestTier === null) {
      const wordCandidates = [
        ...primaryCandidates,
        ...collectLocalizedValues(paper.folder).map(normalizeSearchText),
        ...collectLocalizedValues(paper.category).map(normalizeSearchText),
        ...paper.tags.map(normalizeSearchText),
      ].filter(Boolean);

      for (const candidate of wordCandidates) {
        const tokens = candidate.split(/[\s\-_/.]+/).filter(Boolean);
        if (tokens.some((token) => token.startsWith(normalizedQuery))) {
          bestTier = 3;
          break;
        }
      }
    }

    if (bestTier === null) {
      const allSearchable = [
        ...primaryCandidates,
        ...collectLocalizedValues(paper.folder).map(normalizeSearchText),
        ...collectLocalizedValues(paper.category).map(normalizeSearchText),
        ...collectLocalizedValues(paper.shortDescription).map(normalizeSearchText),
        ...collectLocalizedValues(paper.abstract).map(normalizeSearchText),
        ...collectLocalizedValues(paper.explanation).map(normalizeSearchText),
        normalizeSearchText(getPaperSummary(paper)),
        ...paper.tags.map(normalizeSearchText),
        ...paper.authors.map(normalizeSearchText),
      ].filter(Boolean);

      if (allSearchable.some((text) => text.includes(normalizedQuery))) {
        bestTier = 4;
      }
    }

    if (bestTier !== null) {
      results.push({
        paper,
        score: bestTier,
        filename,
        folder,
        matchedTitle: pickMatchedDisplayTitle(paper, query, normalizedQuery),
      });
    }
  }

  return results.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    const dateCmp = b.paper.publishedDate.localeCompare(a.paper.publishedDate);
    if (dateCmp !== 0) {
      return dateCmp;
    }
    return a.matchedTitle.localeCompare(b.matchedTitle);
  });
}
