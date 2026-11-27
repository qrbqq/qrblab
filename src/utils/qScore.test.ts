import test from 'node:test';
import assert from 'node:assert/strict';
import type {LabLogEntry} from '../data/labLog';
import {labLogs} from '../data/labLog';
import type {ResearchPaper} from '../data/papers';
import {papers} from '../data/papers';
import type {StorageLike} from './ratings';
import {
  clearQInteractions,
  computeQScore,
  formatQLabel,
  formatQNumber,
  getCurrentQScore,
  getLocalInteractionPoints,
  Q_INTERACTION_WEIGHTS,
  Q_INTERACTIONS_STORAGE_KEY,
  Q_LAB_LOG_WEIGHT,
  Q_PAPER_WEIGHT,
  recordQInteraction,
} from './qScore';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    get length() {
      return map.size;
    },
    key: (index) => Array.from(map.keys())[index] ?? null,
  };
}

function makePaper(id: string): ResearchPaper {
  return {
    id,
    slug: id,
    title: {en: `Paper ${id}`},
    explanation: {en: 'Technical summary'},
    authors: ['qrbqq'],
    publishedDate: '2026-11-01',
    version: 'v1.0',
    category: {en: 'AI'},
    tags: ['AI'],
    pdfPath: `papers/${id}.pdf`,
  };
}

function makeLog(id: string): LabLogEntry {
  return {
    id,
    timestamp: '2026-11-23T18:00:00Z',
    caption: {en: `Dispatch ${id}`},
  };
}

test('computeQScore deterministically weights papers, lab logs, and interactions', () => {
  const empty = computeQScore({
    papersCount: 0,
    labLogsCount: 0,
    interactionPoints: 0,
  });
  assert.equal(empty.total, 0);
  assert.equal(empty.formatted, '0');
  assert.equal(empty.label, 'Q · 0');

  const sample = computeQScore({
    papersCount: 10,
    labLogsCount: 6,
    interactionPoints: 12,
  });
  assert.equal(sample.paperContribution, 10 * Q_PAPER_WEIGHT);
  assert.equal(sample.labLogContribution, 6 * Q_LAB_LOG_WEIGHT);
  assert.equal(sample.interactionContribution, 12);
  assert.equal(sample.total, 1428);
  assert.equal(sample.formatted, '1,428');
  assert.equal(sample.label, 'Q · 1,428');
});

test('computeQScore clamps negative and non-finite inputs safely', () => {
  const safe = computeQScore({
    papersCount: -5,
    labLogsCount: Number.NaN,
    interactionPoints: -10,
  });
  assert.equal(safe.total, 0);
  assert.equal(safe.label, 'Q · 0');
  assert.equal(formatQNumber(-3), '0');
  assert.equal(formatQLabel(1428), 'Q · 1,428');
});

test('getCurrentQScore updates automatically when papers or labLogs arrays grow', () => {
  const storage = createMemoryStorage();

  const prodScore = getCurrentQScore({
    papersList: papers,
    labLogsList: labLogs,
    storage,
  });
  assert.equal(
    prodScore.total,
    papers.length * Q_PAPER_WEIGHT + labLogs.length * Q_LAB_LOG_WEIGHT,
  );

  const afterOnePaper = getCurrentQScore({
    papersList: [makePaper('p1')],
    labLogsList: [],
    storage,
  });
  assert.equal(afterOnePaper.total, Q_PAPER_WEIGHT);
  assert.equal(afterOnePaper.label, `Q · ${Q_PAPER_WEIGHT}`);

  const afterMoreData = getCurrentQScore({
    papersList: [makePaper('p1'), makePaper('p2')],
    labLogsList: [makeLog('l1'), makeLog('l2'), makeLog('l3')],
    storage,
  });
  assert.equal(
    afterMoreData.total,
    2 * Q_PAPER_WEIGHT + 3 * Q_LAB_LOG_WEIGHT,
  );
  assert.equal(afterMoreData.label, 'Q · 348');
});

test('recordQInteraction persists weighted interactions in storage and clearQInteractions resets them', () => {
  const storage = createMemoryStorage();

  assert.equal(getLocalInteractionPoints(storage), 0);

  const afterDownload = recordQInteraction('pdf-download', storage);
  assert.equal(afterDownload, Q_INTERACTION_WEIGHTS['pdf-download']);

  const afterCopy = recordQInteraction('citation-copy', storage);
  assert.equal(
    afterCopy,
    Q_INTERACTION_WEIGHTS['pdf-download'] + Q_INTERACTION_WEIGHTS['citation-copy'],
  );

  const afterTool = recordQInteraction('tool-trigger', storage);
  assert.equal(
    afterTool,
    Q_INTERACTION_WEIGHTS['pdf-download'] +
      Q_INTERACTION_WEIGHTS['citation-copy'] +
      Q_INTERACTION_WEIGHTS['tool-trigger'],
  );

  const current = getCurrentQScore({
    papersList: [makePaper('p1')],
    labLogsList: [makeLog('l1')],
    storage,
  });
  assert.equal(current.total, Q_PAPER_WEIGHT + Q_LAB_LOG_WEIGHT + afterTool);

  clearQInteractions(storage);
  assert.equal(getLocalInteractionPoints(storage), 0);
  assert.equal(storage.getItem(Q_INTERACTIONS_STORAGE_KEY), null);
});

test('read storage handles malformed JSON gracefully without throwing', () => {
  const storage = createMemoryStorage();
  storage.setItem(Q_INTERACTIONS_STORAGE_KEY, '{corrupt-json');
  assert.equal(getLocalInteractionPoints(storage), 0);
});
