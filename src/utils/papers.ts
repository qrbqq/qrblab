import type {
  LocalizedList,
  LocalizedText,
  ResearchPaper,
  SupportedLanguage,
} from '../data/papers';
import type {SiteConfig} from '../data/siteConfig';
import {LANG_STORAGE_KEY, type StorageLike} from './ratings';

export interface ActiveChannel {
  key: 'email' | 'github' | 'discord' | 'instagram' | 'x' | 'website';
  href: string;
  label: string;
}

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'en',
  'ar',
  'fr',
  'de',
  'es',
];

function getDefaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return (
    value === 'en' ||
    value === 'ar' ||
    value === 'fr' ||
    value === 'de' ||
    value === 'es'
  );
}

export function readStoredLanguage(
  storage: StorageLike | null = getDefaultStorage(),
): SupportedLanguage {
  if (!storage) {
    return 'en';
  }
  try {
    const raw = storage.getItem(LANG_STORAGE_KEY);
    return isSupportedLanguage(raw) ? raw : 'en';
  } catch {
    return 'en';
  }
}

export function saveStoredLanguage(
  lang: SupportedLanguage,
  storage: StorageLike | null = getDefaultStorage(),
): void {
  if (!storage) {
    return;
  }
  try {
    storage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Ignore storage errors cleanly
  }
}

export function getDirection(lang: SupportedLanguage): 'ltr' | 'rtl' {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

export function getLocalizedText(
  text: LocalizedText | undefined,
  lang: SupportedLanguage,
): string {
  if (!text) {
    return '';
  }
  const candidate = text[lang];
  if (typeof candidate === 'string' && candidate.trim().length > 0) {
    return candidate;
  }
  if (typeof text.en === 'string' && text.en.trim().length > 0) {
    return text.en;
  }
  return text.ar ?? '';
}

export function getLocalizedList(
  list: LocalizedList | undefined,
  lang: SupportedLanguage,
): string[] {
  if (!list) {
    return [];
  }
  const candidate = list[lang];
  if (Array.isArray(candidate) && candidate.length > 0) {
    return candidate;
  }
  if (Array.isArray(list.en) && list.en.length > 0) {
    return list.en;
  }
  return list.ar ?? [];
}

export function getPaperSummary(
  paper: ResearchPaper,
  lang: SupportedLanguage,
): string {
  return (
    getLocalizedText(paper.shortDescription, lang) ||
    getLocalizedText(paper.abstract, lang) ||
    ''
  );
}

export function sortPapersByDateDesc(items: readonly ResearchPaper[]): ResearchPaper[] {
  return [...items].sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
}

export function getLatestPapers(
  items: readonly ResearchPaper[],
  limit = 3,
): ResearchPaper[] {
  if (limit <= 0) {
    return [];
  }
  return sortPapersByDateDesc(items).slice(0, limit);
}

export function extractCategories(
  items: readonly ResearchPaper[],
  lang: SupportedLanguage,
): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];

  for (const paper of items) {
    const categoryName = getLocalizedText(paper.category, lang).trim();
    if (categoryName && !seen.has(categoryName)) {
      seen.add(categoryName);
      categories.push(categoryName);
    }
  }

  return categories;
}

export function filterPapers(
  items: readonly ResearchPaper[],
  options: {
    query: string;
    category: string | null;
    lang: SupportedLanguage;
  },
): ResearchPaper[] {
  const normalizedQuery = options.query.trim().toLowerCase();
  const activeCategory = options.category?.trim() || null;

  return sortPapersByDateDesc(items).filter((paper) => {
    const categoryText = getLocalizedText(paper.category, options.lang).trim();
    if (activeCategory && categoryText !== activeCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const title = getLocalizedText(paper.title, options.lang).toLowerCase();
    const summary = getPaperSummary(paper, options.lang).toLowerCase();
    const explanation = getLocalizedText(paper.explanation, options.lang).toLowerCase();
    const category = categoryText.toLowerCase();
    const tags = paper.tags.map((tag) => tag.toLowerCase());
    const authors = paper.authors.map((author) => author.toLowerCase());

    return (
      title.includes(normalizedQuery) ||
      summary.includes(normalizedQuery) ||
      explanation.includes(normalizedQuery) ||
      category.includes(normalizedQuery) ||
      tags.some((tag) => tag.includes(normalizedQuery)) ||
      authors.some((author) => author.includes(normalizedQuery))
    );
  });
}

export function findPaperBySlug(
  items: readonly ResearchPaper[],
  slug: string | undefined,
): ResearchPaper | undefined {
  if (!slug) {
    return undefined;
  }
  return items.find((paper) => paper.slug === slug);
}

export function resolveAssetUrl(relativePath: string, baseUrl = './'): string {
  const trimmedPath = relativePath.trim();
  if (!trimmedPath) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmedPath)) {
    return trimmedPath;
  }
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanPath = trimmedPath.replace(/^\/+/, '');
  return `${cleanBase}${cleanPath}`;
}

const DATE_LOCALES: Record<SupportedLanguage, string> = {
  en: 'en-US',
  ar: 'ar-SA',
  fr: 'fr-FR',
  de: 'de-DE',
  es: 'es-ES',
};

export function formatPaperDate(
  isoDate: string,
  lang: SupportedLanguage,
): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat(DATE_LOCALES[lang], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function formatPlainCitation(
  paper: ResearchPaper,
  lang: SupportedLanguage,
  brandName = 'qrblab',
): string {
  const authors = paper.authors.join(', ');
  const year = paper.publishedDate.slice(0, 4);
  const title = getLocalizedText(paper.title, lang);
  const doiPart = paper.doi ? ` DOI: ${paper.doi}.` : '';
  return `${authors} (${year}). "${title}." ${brandName} (${paper.version}).${doiPart}`;
}

export function formatBibtexCitation(
  paper: ResearchPaper,
  lang: SupportedLanguage,
  brandName = 'qrblab',
): string {
  const year = paper.publishedDate.slice(0, 4);
  const citationKey = paper.slug.replace(/[^a-zA-Z0-9]+/g, '_');
  const authors = paper.authors.join(' and ');
  const title = getLocalizedText(paper.title, lang);
  const lines = [
    `@techreport{${citationKey},`,
    `  title = {${title}},`,
    `  author = {${authors}},`,
    `  institution = {${brandName}},`,
    `  year = {${year}},`,
    `  note = {${paper.version}}`,
  ];
  if (paper.doi) {
    lines[lines.length - 1] = `${lines[lines.length - 1]},`;
    lines.push(`  doi = {${paper.doi}}`);
  }
  lines.push('}');
  return lines.join('\n');
}

export function getActiveChannels(config: SiteConfig): ActiveChannel[] {
  const channels: ActiveChannel[] = [];
  const email = config.contactEmail.trim();
  if (email) {
    channels.push({
      key: 'email',
      href: `mailto:${email}`,
      label: email,
    });
  }

  const socialOrder: Array<keyof SiteConfig['socialLinks']> = [
    'github',
    'discord',
    'instagram',
    'x',
    'website',
  ];

  for (const key of socialOrder) {
    const url = config.socialLinks[key].trim();
    if (url) {
      channels.push({
        key,
        href: url,
        label: url,
      });
    }
  }

  return channels;
}
