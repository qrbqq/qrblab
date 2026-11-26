import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildKineticHeadlineLayout,
  computeCharDelayMs,
  computeCharStaggerStepMs,
  KINETIC_MAX_TOTAL_STAGGER_MS,
  shouldTriggerKineticHeadline,
} from './kineticHeadline';

test('buildKineticHeadlineLayout splits words and characters while preserving word boundaries', () => {
  const layout = buildKineticHeadlineLayout('  Latest   from Lab Log  ');
  assert.equal(layout.words.length, 4);
  assert.deepEqual(
    layout.words.map((w) => ({
      word: w.word,
      hasTrailingSpace: w.hasTrailingSpace,
      start: w.startCharIndex,
    })),
    [
      {word: 'Latest', hasTrailingSpace: true, start: 0},
      {word: 'from', hasTrailingSpace: true, start: 6},
      {word: 'Lab', hasTrailingSpace: true, start: 10},
      {word: 'Log', hasTrailingSpace: false, start: 13},
    ],
  );
  assert.equal(layout.totalChars, 16);
  assert.equal(layout.stepMs, 18);
});

test('computeCharStaggerStepMs keeps step between 12ms and 18ms and caps total delay', () => {
  assert.equal(computeCharStaggerStepMs(10), 18);
  assert.equal(computeCharStaggerStepMs(24), 15);
  assert.equal(computeCharStaggerStepMs(54), 12);

  assert.equal(computeCharDelayMs(0, 15), 0);
  assert.equal(computeCharDelayMs(5, 15), 75);
  assert.equal(computeCharDelayMs(100, 15), KINETIC_MAX_TOTAL_STAGGER_MS);
});

test('shouldTriggerKineticHeadline triggers on entry, on fast scroll past top, and holds below fold', () => {
  // Fully inside viewport
  assert.equal(
    shouldTriggerKineticHeadline({top: 240, bottom: 320, height: 80}, 900),
    true,
  );
  // Partially entering bottom (~20% visible)
  assert.equal(
    shouldTriggerKineticHeadline({top: 880, bottom: 980, height: 100}, 900),
    true,
  );
  // Fast scrolled past above viewport
  assert.equal(
    shouldTriggerKineticHeadline({top: -150, bottom: -50, height: 100}, 900),
    true,
  );
  // Still well below viewport
  assert.equal(
    shouldTriggerKineticHeadline({top: 1050, bottom: 1150, height: 100}, 900),
    false,
  );
});
