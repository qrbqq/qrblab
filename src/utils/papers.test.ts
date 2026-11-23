import test from 'node:test';
import assert from 'node:assert/strict';
import {LANGUAGE_ENDONYMS, translations} from '../data/i18n';
import type {ResearchPaper, SupportedLanguage} from '../data/papers';
import {papers} from '../data/papers';
import {siteConfig} from '../data/siteConfig';
import {
  extractCategories,
  filterPapers,
  findPaperBySlug,
  formatBibtexCitation,
  formatPlainCitation,
  getActiveChannels,
  getDirection,
  getLatestPapers,
  getLocalizedList,
  getLocalizedText,
  getPaperSummary,
  readStoredLanguage,
  resolveAssetUrl,
  saveStoredLanguage,
  SUPPORTED_LANGUAGES,
} from './papers';
import {
  clampStars,
  clearAllLocalData,
  clearPaperRating,
  getPaperRating,
  LANG_STORAGE_KEY,
  RATING_STORAGE_PREFIX,
  savePaperRating,
  type StorageLike,
} from './ratings';
import {
  readStoredTheme,
  resolveEffectiveTheme,
  saveStoredTheme,
  THEME_STORAGE_KEY,
} from './theme';

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
      ar: 'مرشح كالمان لحالة الخطأ لقياس الحركة بالقصور الذاتي',
    },
    shortDescription: {
      en: 'Sensor fusion under vibration disturbances.',
      ar: 'دمج الحساسات تحت اضطرابات الاهتزاز.',
    },
    explanation: {
      en: 'Quaternion error-state kinematics and covariance propagation across MEMS IMUs.',
      ar: 'كينماتيكا حالة الخطأ الرباعية وانتشار التغاير عبر وحدات القصور الذاتي.',
    },
    authors: ['Tariq Al-Mansoor'],
    publishedDate: '2026-06-18',
    version: 'v1.2',
    category: {
      en: 'Control Systems',
      ar: 'أنظمة التحكم',
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

test('production papers array starts empty and siteConfig preserves qrblab 7-paragraph statement across all 5 languages', () => {
  assert.equal(papers.length, 0);
  assert.equal(siteConfig.brandName, 'qrblab');
  for (const lang of SUPPORTED_LANGUAGES) {
    const paragraphs = getLocalizedList(siteConfig.projectStatement.paragraphs, lang);
    assert.equal(paragraphs.length, 7, `Expected 7 paragraphs for ${lang}`);
    assert.ok(getLocalizedText(siteConfig.projectStatement.title, lang).length > 0);
  }
  assert.equal(
    siteConfig.projectStatement.paragraphs.en[
      siteConfig.projectStatement.purposeParagraphIndex
    ]?.startsWith('The purpose of qrblab'),
    true,
  );
  assert.equal(getActiveChannels(siteConfig).length, 0);
});

test('getDirection maps LTR and RTL languages cleanly', () => {
  assert.equal(getDirection('en'), 'ltr');
  assert.equal(getDirection('fr'), 'ltr');
  assert.equal(getDirection('de'), 'ltr');
  assert.equal(getDirection('es'), 'ltr');
  assert.equal(getDirection('ar'), 'rtl');
});

test('getLocalizedText and getLocalizedList fall back gracefully to English for optional fr/de/es', () => {
  const paper = sampleFixtures[0]!;
  assert.equal(
    getLocalizedText(paper.title, 'fr'),
    'Contrôle vectoriel pour actionneurs BLDC compacts',
  );
  assert.equal(
    getLocalizedText(paper.title, 'de'),
    'Field-Oriented Control for Compact BLDC Actuators',
  );
  assert.deepEqual(
    getLocalizedList(paper.highlights, 'es'),
    ['Closed-loop FOC benchmark'],
  );
});

test('getLatestPapers returns empty for empty input and sorts newest first', () => {
  assert.deepEqual(getLatestPapers([], 3), []);
  const latest = getLatestPapers(sampleFixtures, 1);
  assert.equal(latest.length, 1);
  assert.equal(latest[0]?.slug, 'kalman-imu-fusion');
});

test('extractCategories returns unique localized categories', () => {
  assert.deepEqual(extractCategories(sampleFixtures, 'en'), [
    'Mechatronics',
    'Control Systems',
  ]);
  assert.deepEqual(extractCategories(sampleFixtures, 'ar'), [
    'الميكاترونيكس',
    'أنظمة التحكم',
  ]);
  assert.deepEqual(extractCategories(sampleFixtures, 'fr'), [
    'Mechatronics',
    'Control Systems',
  ]);
});

test('getPaperSummary and filterPapers work across shortDescription, explanation, tags, and category', () => {
  assert.equal(
    getPaperSummary(sampleFixtures[0]!, 'en'),
    'Real-time current loop tuning and thermal characterization.',
  );

  const enMatch = filterPapers(sampleFixtures, {
    query: 'thermal',
    category: null,
    lang: 'en',
  });
  assert.equal(enMatch.length, 1);
  assert.equal(enMatch[0]?.id, 'p1');

  const explanationMatch = filterPapers(sampleFixtures, {
    query: 'clarke-park',
    category: null,
    lang: 'en',
  });
  assert.equal(explanationMatch.length, 1);
  assert.equal(explanationMatch[0]?.id, 'p1');

  const arMatch = filterPapers(sampleFixtures, {
    query: 'كالمان',
    category: 'أنظمة التحكم',
    lang: 'ar',
  });
  assert.equal(arMatch.length, 1);
  assert.equal(arMatch[0]?.id, 'p2');

  const frFallbackMatch = filterPapers(sampleFixtures, {
    query: 'vectoriel',
    category: 'Mechatronics',
    lang: 'fr',
  });
  assert.equal(frFallbackMatch.length, 1);
  assert.equal(frFallbackMatch[0]?.id, 'p1');
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
  const plain = formatPlainCitation(sampleFixtures[0]!, 'en', 'qrblab');
  assert.ok(plain.includes('Tariq Al-Mansoor, Layla Hassan (2026).'));
  assert.ok(plain.includes('qrblab (v1.0)'));
  assert.ok(plain.includes('DOI: 10.1234/qrblab.001'));

  const bibtex = formatBibtexCitation(sampleFixtures[1]!, 'en', 'qrblab');
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

test('theme helpers default to light, persist preferences, and resolve system mode', () => {
  const storage = createMemoryStorage();
  assert.equal(readStoredTheme(storage), 'light');

  saveStoredTheme('dark', storage);
  assert.equal(readStoredTheme(storage), 'dark');

  assert.equal(resolveEffectiveTheme('light', true), 'light');
  assert.equal(resolveEffectiveTheme('dark', false), 'dark');
  assert.equal(resolveEffectiveTheme('system', true), 'dark');
  assert.equal(resolveEffectiveTheme('system', false), 'light');
});

test('language helpers default to en, validate supported codes, and persist cleanly', () => {
  const storage = createMemoryStorage();
  assert.equal(readStoredLanguage(storage), 'en');

  storage.setItem(LANG_STORAGE_KEY, 'invalid-code');
  assert.equal(readStoredLanguage(storage), 'en');

  saveStoredLanguage('fr', storage);
  assert.equal(readStoredLanguage(storage), 'fr');
});

test('clearAllLocalData removes all rating keys and restores light theme and en language', () => {
  const storage = createMemoryStorage();
  savePaperRating('paper-a', 5, storage);
  savePaperRating('paper-b', 3, storage);
  saveStoredTheme('dark', storage);
  saveStoredLanguage('de', storage);
  storage.setItem('unrelated-key', 'keep-me');

  const clearedCount = clearAllLocalData(storage);
  assert.equal(clearedCount, 2);
  assert.equal(storage.getItem(`${RATING_STORAGE_PREFIX}paper-a`), null);
  assert.equal(storage.getItem(`${RATING_STORAGE_PREFIX}paper-b`), null);
  assert.equal(storage.getItem(THEME_STORAGE_KEY), 'light');
  assert.equal(storage.getItem(LANG_STORAGE_KEY), 'en');
  assert.equal(storage.getItem('unrelated-key'), 'keep-me');
});

test('every English UI translation key has a non-empty counterpart across all 5 languages and native endonyms match', () => {
  assert.deepEqual(LANGUAGE_ENDONYMS, {
    en: 'English',
    ar: 'العربية',
    fr: 'Français',
    de: 'Deutsch',
    es: 'Español',
  });

  function assertTreeMatches(
    enNode: unknown,
    targetNode: unknown,
    targetLang: SupportedLanguage,
    path: string,
  ): void {
    if (typeof enNode === 'string') {
      assert.equal(
        typeof targetNode,
        'string',
        `Expected string at ${targetLang}.${path}`,
      );
      assert.ok(enNode.trim().length > 0, `Empty en string at ${path}`);
      assert.ok(
        (targetNode as string).trim().length > 0,
        `Empty ${targetLang} string at ${path}`,
      );
      return;
    }
    if (Array.isArray(enNode)) {
      assert.ok(
        Array.isArray(targetNode),
        `Expected array at ${targetLang}.${path}`,
      );
      assert.equal(
        enNode.length,
        (targetNode as unknown[]).length,
        `Length mismatch at ${targetLang}.${path}`,
      );
      enNode.forEach((item, index) =>
        assertTreeMatches(
          item,
          (targetNode as unknown[])[index],
          targetLang,
          `${path}[${index}]`,
        ),
      );
      return;
    }
    assert.ok(enNode && typeof enNode === 'object');
    assert.ok(targetNode && typeof targetNode === 'object');
    const enRecord = enNode as Record<string, unknown>;
    const targetRecord = targetNode as Record<string, unknown>;
    for (const key of Object.keys(enRecord)) {
      assert.ok(key in targetRecord, `Missing key ${targetLang}.${path}.${key}`);
      assertTreeMatches(
        enRecord[key],
        targetRecord[key],
        targetLang,
        `${path}.${key}`,
      );
    }
  }

  for (const lang of ['ar', 'fr', 'de', 'es'] as const) {
    assertTreeMatches(translations.en, translations[lang], lang, 'translations');
  }
});
