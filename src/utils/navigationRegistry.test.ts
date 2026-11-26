import test from 'node:test';
import assert from 'node:assert/strict';
import type {ResearchPaper} from '../data/papers';
import type {LabLogEntry} from '../data/labLog';
import {
  computePaperSection,
  computeLabLogSection,
  getAutoSortedSections,
  parseDateTimestamp,
  formatBadgeDate,
} from './navigationRegistry';

const mockPaperA: ResearchPaper = {
  id: 'p-1',
  slug: 'p-1',
  title: {en: 'Paper 1'},
  explanation: {en: 'Explanation 1'},
  publishedDate: '2026-03-10',
  authors: ['Author A'],
  version: 'v1.0',
  category: {en: 'Cat'},
  tags: ['Tag'],
  pdfPath: 'papers/1.pdf',
};

const mockPaperB: ResearchPaper = {
  id: 'p-2',
  slug: 'p-2',
  title: {en: 'Paper 2'},
  explanation: {en: 'Explanation 2'},
  publishedDate: '2026-12-01',
  authors: ['Author B'],
  version: 'v1.0',
  category: {en: 'Cat'},
  tags: ['Tag'],
  pdfPath: 'papers/2.pdf',
};

const mockLogA: LabLogEntry = {
  id: 'log-1',
  timestamp: '2026-11-23T18:00:00Z',
  caption: {en: 'Dispatch 1'},
};

test('parseDateTimestamp and formatBadgeDate extract clean timestamps and YYYY-MM-DD badges', () => {
  assert.equal(parseDateTimestamp(''), null);
  assert.equal(parseDateTimestamp('invalid'), null);
  assert.ok((parseDateTimestamp('2026-03-10') ?? 0) > 0);
  assert.equal(formatBadgeDate('2026-11-23T18:00:00Z'), '2026-11-23');
  assert.equal(formatBadgeDate('2026-03-10'), '2026-03-10');
});

test('getAutoSortedSections returns default registered order with 0 items for empty production data', () => {
  const sections = getAutoSortedSections({papers: [], labLogs: []});
  assert.equal(sections.length, 2);
  assert.equal(sections[0]?.id, 'qrb-lab');
  assert.equal(sections[0]?.label, 'qrb lab');
  assert.equal(sections[0]?.badgeText, '0 items');
  assert.equal(sections[1]?.id, 'lab-log');
  assert.equal(sections[1]?.label, 'Lab Log');
  assert.equal(sections[1]?.badgeText, '0 items');
});

test('getAutoSortedSections puts Lab Log first when Lab Log has newer date than qrb lab', () => {
  // Paper is March 2026, Lab Log is November 2026 -> Lab Log must be first!
  const sections = getAutoSortedSections({
    papers: [mockPaperA],
    labLogs: [mockLogA],
  });
  assert.equal(sections[0]?.id, 'lab-log');
  assert.equal(sections[0]?.badgeText, '2026-11-23');
  assert.equal(sections[1]?.id, 'qrb-lab');
  assert.equal(sections[1]?.badgeText, '2026-03-10');
});

test('getAutoSortedSections puts qrb lab first when a paper has newer date than Lab Log', () => {
  // Paper is Dec 2026, Lab Log is Nov 2026 -> qrb lab must be first!
  const sections = getAutoSortedSections({
    papers: [mockPaperB],
    labLogs: [mockLogA],
  });
  assert.equal(sections[0]?.id, 'qrb-lab');
  assert.equal(sections[0]?.badgeText, '2026-12-01');
  assert.equal(sections[1]?.id, 'lab-log');
  assert.equal(sections[1]?.badgeText, '2026-11-23');
});

test('getAutoSortedSections places populated section above empty section', () => {
  const paperOnly = getAutoSortedSections({
    papers: [mockPaperA],
    labLogs: [],
  });
  assert.equal(paperOnly[0]?.id, 'qrb-lab');
  assert.equal(paperOnly[1]?.id, 'lab-log');

  const logOnly = getAutoSortedSections({
    papers: [],
    labLogs: [mockLogA],
  });
  assert.equal(logOnly[0]?.id, 'lab-log');
  assert.equal(logOnly[1]?.id, 'qrb-lab');
});
