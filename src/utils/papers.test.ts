import test from 'node:test';
import assert from 'node:assert/strict';
import {siteCopy} from '../data/i18n';
import type {ResearchPaper} from '../data/papers';
import {papers} from '../data/papers';
import {siteConfig} from '../data/siteConfig';
import {
  extractCategories,
  extractFolders,
  filterPapers,
  findPaperBySlug,
  formatBibtexCitation,
  formatPlainCitation,
  getActiveChannels,
  getLatestPapers,
  getLocalizedList,
  getLocalizedText,
  getPaperSummary,
  resolveAssetUrl,
} from './papers';
import {
  clampStars,
  clearAllLocalData,
  clearPaperRating,
  getPaperRating,
  RATING_STORAGE_PREFIX,
  savePaperRating,
  type StorageLike,
} from './ratings';

const sampleFixtures: ResearchPaper[] = [
  {
    id: 'p1',
    slug: 'bldc-foc-control',
    title: {
      en: 'Field-Oriented Control for Compact BLDC Actuators',
      ar: 'التحكم الموجه بالمجال لمشغلات BLDC المدمجة',
      fr: 'Contrôle vectoriel pour actionneurs BLDC compacts',
    },
    shortDescription: {
      en: 'Real-time current loop tuning and thermal characterization.',
      ar: 'ضبط حلقة التيار بالزمن الحقيقي والتوصيف الحراري.',
    },
    explanation: {
      en: 'Detailed Clarke-Park transform derivation and stator winding inductance model.',
      ar: 'اشتقاق مفصل لتحويل كلارك وبارك ونموذج محاثة ملفات العضو الثابت.',
    },
    highlights: {
      en: ['Closed-loop FOC benchmark'],
      ar: ['معيار التحكم المغلق FOC'],
    },
    authors: ['Tariq Al-Mansoor', 'Layla Hassan'],
    publishedDate: '2026-03-10',
    version: 'v1.0',
    category: {
      en: 'Mechatronics',
      ar: 'الميكاترونيكس',
    },
    tags: ['BLDC', 'FOC', 'Firmware'],
    pdfPath: 'papers/bldc-foc.pdf',
    thumbnail: 'images/bldc-thumb.png',
    previewImages: ['images/bldc-p1.png', 'images/bldc-p2.png'],
    doi: '10.1234/qrblab.001',
  },
  {
    id: 'p2',
    slug: 'kalman-imu-fusion',
    title: {
      en: 'Error-State Kalman Filtering for IMU Odometry',
    },
    shortDescription: {
      en: 'Sensor fusion under vibration disturbances.',
    },
    explanation: {
      en: 'Quaternion error-state kinematics and covariance propagation across MEMS IMUs.',
    },
    authors: ['Tariq Al-Mansoor'],
    publishedDate: '2026-06-18',
    version: 'v1.2',
    category: {
      en: 'Control Systems',
    },
    tags: ['Kalman', 'IMU', 'Estimation'],
    pdfPath: '/papers/kalman-imu.pdf',
  },
];

function createMemoryStorage(): StorageLike & {dump: () => Map<string, string>} {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
    get length() {
      return store.size;
    },
    key: (index) => Array.from(store.keys())[index] ?? null,
    dump: () => new Map(store),
  };
}

test('production papers array starts empty and siteConfig preserves qrblab 7-paragraph English statement', () => {
  assert.equal(papers.length, 0);
  assert.equal(siteConfig.brandName, 'qrblab');
  const paragraphs = getLocalizedList(siteConfig.projectStatement.paragraphs);
  assert.equal(paragraphs.length, 7);
  assert.ok(getLocalizedText(siteConfig.projectStatement.title).length > 0);
  assert.equal(
    siteConfig.projectStatement.paragraphs.en[
      siteConfig.projectStatement.purposeParagraphIndex
    ]?.startsWith('The purpose of qrblab'),
    true,
  );
  assert.equal(getActiveChannels(siteConfig).length, 0);
});

test('getLocalizedText and getLocalizedList resolve .en cleanly and support legacy multi-language or plain strings', () => {
  const paper = sampleFixtures[0]!;
  assert.equal(
    getLocalizedText(paper.title),
    'Field-Oriented Control for Compact BLDC Actuators',
  );
  assert.equal(getLocalizedText('Plain String Title'), 'Plain String Title');
  assert.deepEqual(
    getLocalizedList(paper.highlights),
    ['Closed-loop FOC benchmark'],
  );
  assert.deepEqual(getLocalizedList(['Direct Array']), ['Direct Array']);
});

test('getLatestPapers returns empty for empty input and sorts newest first', () => {
  assert.deepEqual(getLatestPapers([], 3), []);
  const latest = getLatestPapers(sampleFixtures, 1);
  assert.equal(latest.length, 1);
  assert.equal(latest[0]?.slug, 'kalman-imu-fusion');
});

test('extractCategories and extractFolders return unique English collections', () => {
  assert.deepEqual(extractCategories(sampleFixtures), [
    'Mechatronics',
    'Control Systems',
  ]);
  assert.deepEqual(extractFolders(sampleFixtures), [
    'Mechatronics',
    'Control Systems',
  ]);
});

test('getPaperSummary and filterPapers work across shortDescription, explanation, tags, and category', () => {
  assert.equal(
    getPaperSummary(sampleFixtures[0]!),
    'Real-time current loop tuning and thermal characterization.',
  );

  const thermalMatch = filterPapers(sampleFixtures, {
    query: 'thermal',
    category: null,
  });
  assert.equal(thermalMatch.length, 1);
  assert.equal(thermalMatch[0]?.id, 'p1');

  const explanationMatch = filterPapers(sampleFixtures, {
    query: 'clarke-park',
    category: null,
  });
  assert.equal(explanationMatch.length, 1);
  assert.equal(explanationMatch[0]?.id, 'p1');

  const categoryMatch = filterPapers(sampleFixtures, {
    query: 'kalman',
    category: 'Control Systems',
  });
  assert.equal(categoryMatch.length, 1);
  assert.equal(categoryMatch[0]?.id, 'p2');
});

test('findPaperBySlug locates exact slug or returns undefined', () => {
  assert.equal(findPaperBySlug(sampleFixtures, 'bldc-foc-control')?.id, 'p1');
  assert.equal(findPaperBySlug(sampleFixtures, 'missing'), undefined);
});

test('resolveAssetUrl handles relative, root-relative, and subpath GitHub Pages bases', () => {
  assert.equal(resolveAssetUrl('papers/doc.pdf', './'), './papers/doc.pdf');
  assert.equal(resolveAssetUrl('/papers/doc.pdf', './'), './papers/doc.pdf');
  assert.equal(
    resolveAssetUrl('papers/doc.pdf', '/qrblab/'),
    '/qrblab/papers/doc.pdf',
  );
  assert.equal(
    resolveAssetUrl('https://example.org/doc.pdf', './'),
    'https://example.org/doc.pdf',
  );
});

test('citation formatters emit plain text and BibTeX with qrblab attribution', () => {
  const plain = formatPlainCitation(sampleFixtures[0]!, 'qrblab');
  assert.ok(plain.includes('Tariq Al-Mansoor, Layla Hassan (2026).'));
  assert.ok(plain.includes('qrblab (v1.0)'));
  assert.ok(plain.includes('DOI: 10.1234/qrblab.001'));

  const bibtex = formatBibtexCitation(sampleFixtures[1]!, 'qrblab');
  assert.ok(bibtex.startsWith('@techreport{kalman_imu_fusion,'));
  assert.ok(bibtex.includes('institution = {qrblab}'));
  assert.ok(!bibtex.includes('doi ='));
});

test('getActiveChannels filters out empty strings and builds mailto href', () => {
  const channels = getActiveChannels({
    ...siteConfig,
    contactEmail: 'hello@qrblab.org',
    socialLinks: {
      github: 'https://github.com/qrblab',
      discord: '',
      instagram: 'https://instagram.com/qrblab',
      x: 'https://x.com/qrblab',
      website: '',
    },
  });

  assert.deepEqual(
    channels.map((c) => [c.key, c.href]),
    [
      ['email', 'mailto:hello@qrblab.org'],
      ['github', 'https://github.com/qrblab'],
      ['instagram', 'https://instagram.com/qrblab'],
      ['x', 'https://x.com/qrblab'],
    ],
  );
});

test('localStorage star rating helpers clamp, persist, read, and clear cleanly', () => {
  const storage = createMemoryStorage();
  assert.equal(getPaperRating('bldc-foc-control', storage), null);
  assert.equal(clampStars(7), 5);
  assert.equal(clampStars(0), 1);

  const saved = savePaperRating('bldc-foc-control', 4, storage);
  assert.equal(saved?.stars, 4);
  assert.equal(getPaperRating('bldc-foc-control', storage)?.stars, 4);

  clearPaperRating('bldc-foc-control', storage);
  assert.equal(getPaperRating('bldc-foc-control', storage), null);
});

test('clearAllLocalData removes all rating keys and legacy theme/lang keys', () => {
  const storage = createMemoryStorage();
  savePaperRating('paper-a', 5, storage);
  savePaperRating('paper-b', 3, storage);
  storage.setItem('qrblab:theme', 'dark');
  storage.setItem('qrblab:lang', 'ar');
  storage.setItem('unrelated-key', 'keep-me');

  const clearedCount = clearAllLocalData(storage);
  assert.equal(clearedCount, 2);
  assert.equal(storage.getItem(`${RATING_STORAGE_PREFIX}paper-a`), null);
  assert.equal(storage.getItem(`${RATING_STORAGE_PREFIX}paper-b`), null);
  assert.equal(storage.getItem('qrblab:theme'), null);
  assert.equal(storage.getItem('qrblab:lang'), null);
  assert.equal(storage.getItem('unrelated-key'), 'keep-me');
});

test('siteCopy English UI strings are all non-empty, keep strict lowercase qrb lab, and exclude language/theme settings', () => {
  assert.equal('themeLabel' in siteCopy.settings, false);
  assert.equal('languageLabel' in siteCopy.settings, false);
  assert.equal('research' in siteCopy.nav, false);
  assert.equal(siteCopy.nav.qrbLab, 'qrb lab');
  assert.equal(siteCopy.qrbLab.title, 'qrb lab');

  function assertNonEmpty(node: unknown, path: string): void {
    if (typeof node === 'string') {
      assert.ok(node.trim().length > 0, `Empty string at ${path}`);
      return;
    }
    if (Array.isArray(node)) {
      assert.ok(node.length > 0, `Empty array at ${path}`);
      node.forEach((item, index) => assertNonEmpty(item, `${path}[${index}]`));
      return;
    }
    assert.ok(node && typeof node === 'object', `Expected object at ${path}`);
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      assertNonEmpty(v, `${path}.${k}`);
    }
  }

  assertNonEmpty(siteCopy, 'siteCopy');
});
