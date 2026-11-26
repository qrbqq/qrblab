import type {
  LocalizedList,
  LocalizedText,
  ResearchPaper,
} from '../data/papers';
import type {SiteConfig} from '../data/siteConfig';
import {
  isSafeExternalUrl,
  isValidEmailAddress,
  sanitizeSafeUrl,
} from './url';

export interface ActiveChannel {
  key: 'email' | 'github' | 'discord' | 'instagram' | 'x' | 'website';
  href: string;
  label: string;
}

export function getLocalizedText(text: LocalizedText | string | undefined): string {
  if (!text) {
    return '';
  }
  if (typeof text === 'string') {
    return text;
  }
  if (typeof text.en === 'string' && text.en.trim().length > 0) {
    return text.en;
  }
  for (const value of Object.values(text)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }
  return '';
}

export function getLocalizedList(
  list: LocalizedList | string[] | undefined,
): string[] {
  if (!list) {
    return [];
  }
  if (Array.isArray(list)) {
    return list;
  }
  if (Array.isArray(list.en) && list.en.length > 0) {
    return list.en;
  }
  for (const value of Object.values(list)) {
    if (Array.isArray(value) && value.length > 0) {
      return value;
    }
  }
  return [];
}

export function getPaperSummary(paper: ResearchPaper): string {
  return (
    getLocalizedText(paper.shortDescription) ||
    getLocalizedText(paper.abstract) ||
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

export function getPaperFolder(paper: ResearchPaper): string {
  const folderName = getLocalizedText(paper.folder).trim();
  if (folderName) {
    return folderName;
  }
  return getLocalizedText(paper.category).trim();
}

export function extractCategories(items: readonly ResearchPaper[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];

  for (const paper of items) {
    const categoryName = getLocalizedText(paper.category).trim();
    if (categoryName && !seen.has(categoryName)) {
      seen.add(categoryName);
      categories.push(categoryName);
    }
  }

  return categories;
}

export function extractFolders(items: readonly ResearchPaper[]): string[] {
  const seen = new Set<string>();
  const folders: string[] = [];

  for (const paper of items) {
    const folderName = getPaperFolder(paper);
    if (folderName && !seen.has(folderName)) {
      seen.add(folderName);
      folders.push(folderName);
    }
  }

  return folders;
}

export function filterPapers(
  items: readonly ResearchPaper[],
  options: {
    query: string;
    category: string | null;
  },
): ResearchPaper[] {
  const normalizedQuery = options.query.trim().toLowerCase();
  const activeCategory = options.category?.trim() || null;

  return sortPapersByDateDesc(items).filter((paper) => {
    const folderText = getPaperFolder(paper);
    const categoryText = getLocalizedText(paper.category).trim();
    if (
      activeCategory &&
      folderText !== activeCategory &&
      categoryText !== activeCategory
    ) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const titleEn = getLocalizedText(paper.title).toLowerCase();
    const titleAr =
      typeof paper.title === 'object' && paper.title?.ar
        ? paper.title.ar.toLowerCase()
        : '';
    const summary = getPaperSummary(paper).toLowerCase();
    const explanation = getLocalizedText(paper.explanation).toLowerCase();
    const category = categoryText.toLowerCase();
    const folder = folderText.toLowerCase();
    const tags = paper.tags.map((tag) => tag.toLowerCase());
    const authors = paper.authors.map((author) => author.toLowerCase());
    const slug = paper.slug.toLowerCase();

    return (
      titleEn.includes(normalizedQuery) ||
      titleAr.includes(normalizedQuery) ||
      summary.includes(normalizedQuery) ||
      explanation.includes(normalizedQuery) ||
      category.includes(normalizedQuery) ||
      folder.includes(normalizedQuery) ||
      slug.includes(normalizedQuery) ||
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
  return sanitizeSafeUrl(relativePath, baseUrl);
}

export function formatPaperDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function formatPlainCitation(
  paper: ResearchPaper,
  brandName = 'qrblab',
): string {
  const authors = paper.authors.join(', ');
  const year = paper.publishedDate.slice(0, 4);
  const title = getLocalizedText(paper.title);
  const doiPart = paper.doi ? ` DOI: ${paper.doi}.` : '';
  return `${authors} (${year}). "${title}." ${brandName} (${paper.version}).${doiPart}`;
}

export function formatBibtexCitation(
  paper: ResearchPaper,
  brandName = 'qrblab',
): string {
  const year = paper.publishedDate.slice(0, 4);
  const citationKey = paper.slug.replace(/[^a-zA-Z0-9]+/g, '_');
  const authors = paper.authors.join(' and ');
  const title = getLocalizedText(paper.title);
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
  if (email && isValidEmailAddress(email)) {
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
    if (url && isSafeExternalUrl(url)) {
      channels.push({
        key,
        href: url,
        label: url,
      });
    }
  }

  return channels;
}
