import test from 'node:test';
import assert from 'node:assert/strict';
import type {ResearchPaper} from '../data/papers';
import {buildBillboardSequence} from './billboardMarquee';

function makeMockPaper(index: number): ResearchPaper {
  return {
    id: `paper-${index}`,
    slug: `monograph-${index}`,
    title: {en: `Autonomous Control Monograph ${index}`},
    explanation: {en: `Technical study ${index}`},
    authors: ['qrbqq'],
    publishedDate: `2026-10-${String((index % 28) + 1).padStart(2, '0')}`,
    version: 'v1.0',
    category: {en: 'Robotics'},
    tags: ['robotics'],
    pdfPath: `papers/monograph-${index}.pdf`,
  };
}

test('buildBillboardSequence produces a clean, hole-free sequence when papers is empty', () => {
  const result = buildBillboardSequence([]);
  const labels = result.cycleItems
    .filter((item) => item.kind === 'label')
    .map((item) => item.label);

  assert.deepEqual(labels, [
    'Artificial Intelligence',
    'Mechatronics',
    'Robotics',
    'Skills',
    'Autonomous Vehicles',
  ]);

  const emblems = result.cycleItems
    .filter((item) => item.kind === 'emblem')
    .map((item) => item.emblem);
  assert.ok(emblems.includes('brand-logo'));
  assert.ok(emblems.includes('research'));
  assert.ok(emblems.includes('verified-badge'));
  assert.equal(
    result.cycleItems.filter((item) => item.kind === 'paper').length,
    0,
  );
  assert.ok(result.halfTrackItems.length >= 16);
  assert.ok(result.durationSeconds >= 36);
});

test('buildBillboardSequence dynamically adds single and multiple papers without empty slots', () => {
  const single = buildBillboardSequence([makeMockPaper(1)]);
  const singlePapers = single.cycleItems.filter((item) => item.kind === 'paper');
  assert.equal(singlePapers.length, 1);
  assert.equal(singlePapers[0]?.paper.slug, 'monograph-1');

  const trio = buildBillboardSequence([
    makeMockPaper(1),
    makeMockPaper(2),
    makeMockPaper(3),
  ]);
  const trioPapers = trio.cycleItems.filter((item) => item.kind === 'paper');
  assert.equal(trioPapers.length, 3);
  const slugs = new Set(trioPapers.map((p) => p.paper.slug));
  assert.deepEqual(slugs, new Set(['monograph-1', 'monograph-2', 'monograph-3']));
});

test('buildBillboardSequence scales cleanly for 100+ papers and omits removed items immediately', () => {
  const catalog = Array.from({length: 105}, (_, idx) => makeMockPaper(idx + 1));
  const large = buildBillboardSequence(catalog);
  const largePapers = large.cycleItems.filter((item) => item.kind === 'paper');
  assert.equal(largePapers.length, 105);
  assert.ok(large.durationSeconds > 100);

  // Removing items reflects immediately with zero residual entries
  const reduced = buildBillboardSequence(catalog.slice(0, 2));
  const reducedSlugs = reduced.cycleItems
    .filter((item) => item.kind === 'paper')
    .map((item) => item.paper.slug);
  assert.equal(reducedSlugs.length, 2);
});
