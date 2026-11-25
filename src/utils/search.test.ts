import test from 'node:test';
import assert from 'node:assert/strict';
import type {ResearchPaper} from '../data/papers';
import {extractPdfFilename, normalizeSearchText, searchPapers} from './search';

const fixtures: ResearchPaper[] = [
  {
    id: '1',
    slug: 'autonomous-path-planning',
    title: {
      en: 'Autonomous Path Planning in Urban Environments',
      ar: 'تخطيط المسار الذاتي في البيئات الحضرية',
    },
    shortDescription: {
      en: 'Real-time trajectory optimization and obstacle avoidance.',
      ar: 'تحسين المسار بالزمن الحقيقي وتفادي العقبات.',
    },
    explanation: {
      en: 'Model predictive control for autonomous navigation.',
      ar: 'التحكم التنبؤي للملاحة الذاتية.',
    },
    authors: ['Author A'],
    publishedDate: '2026-04-01',
    version: 'v1.0',
    category: {en: 'Autonomous Vehicles', ar: 'المركبات ذاتية القيادة'},
    folder: {en: 'Navigation', ar: 'الملاحة'},
    tags: ['MPC', 'Planning'],
    pdfPath: 'papers/navigation/autonomous-path-planning.pdf',
  },
  {
    id: '2',
    slug: 'servo-control-notes',
    title: {
      en: 'Embedded Servo Control Notes',
      ar: 'ملاحظات التحكم في المؤازرات المدمجة',
    },
    shortDescription: {
      en: 'PID loop tuning for compact robotics and autonomous rigs.',
      ar: 'ضبط حلقات التحكم للروبوتات المدمجة.',
    },
    explanation: {
      en: 'Practical autonomous actuator notes and bench measurements.',
    },
    authors: ['Author B'],
    publishedDate: '2026-09-01',
    version: 'v1.1',
    category: {en: 'Robotics', ar: 'الروبوتات'},
    tags: ['Servo', 'PID'],
    pdfPath: 'papers/servo-control-notes.pdf',
  },
  {
    id: '3',
    slug: 'arabic-ai-optics',
    title: {
      en: 'Optical Perception Systems',
      ar: 'أنظمة الإدراك البصري',
    },
    shortDescription: {
      en: 'Vision pipelines for compact robots.',
    },
    explanation: {
      en: 'Camera calibration and inference latency.',
    },
    authors: ['Author C'],
    publishedDate: '2026-05-10',
    version: 'v1.0',
    category: {en: 'Artificial Intelligence', ar: 'الذكاء الاصطناعي'},
    tags: ['Vision', 'Optical'],
    pdfPath: 'papers/optical-perception.pdf',
  },
];

test('normalizeSearchText handles English casing and Arabic character variants cleanly', () => {
  assert.equal(normalizeSearchText('  AutOnOmOus  '), 'autonomous');
  assert.equal(normalizeSearchText('أنظمة الإدراك'), 'انظمه الادراك');
  assert.equal(normalizeSearchText('المَرْكَبَة'), 'المركبه');
});

test('extractPdfFilename extracts leaf filename from nested relative paths', () => {
  assert.equal(
    extractPdfFilename('papers/navigation/autonomous-path-planning.pdf'),
    'autonomous-path-planning.pdf',
  );
  assert.equal(extractPdfFilename('/papers/doc.pdf?v=1'), 'doc.pdf');
});

test('searchPapers prioritizes prefix matches ahead of partial substring matches from first character', () => {
  const singleChar = searchPapers(fixtures, 'a');
  assert.equal(singleChar[0]?.paper.id, '1');

  const prefixResults = searchPapers(fixtures, 'auto');
  assert.equal(prefixResults.length, 2);
  assert.equal(prefixResults[0]?.paper.id, '1'); // starts with "Autonomous..." (prefix)
  assert.equal(prefixResults[1]?.paper.id, '2'); // contains "autonomous" in summary/explanation
});

test('searchPapers supports Arabic queries with normalized Alef/Teh Marbuta and returns Arabic matchedTitle', () => {
  const results = searchPapers(fixtures, 'انظمه');
  assert.equal(results.length, 1);
  assert.equal(results[0]?.paper.id, '3');
  assert.equal(results[0]?.matchedTitle, 'أنظمة الإدراك البصري');

  const topicMatch = searchPapers(fixtures, 'تخطيط');
  assert.equal(topicMatch.length, 1);
  assert.equal(topicMatch[0]?.paper.id, '1');
});

test('searchPapers matches filenames and returns empty array for empty or unmatched queries', () => {
  const byFile = searchPapers(fixtures, 'optical-perception');
  assert.equal(byFile.length, 1);
  assert.equal(byFile[0]?.paper.id, '3');

  assert.deepEqual(searchPapers(fixtures, '   '), []);
  assert.deepEqual(searchPapers(fixtures, 'zzzz-nonexistent'), []);
});
