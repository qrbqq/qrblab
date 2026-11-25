import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeStaggerDelayMs,
  SCROLL_REVEAL_MAX_STAGGER_MS,
  SCROLL_REVEAL_STAGGER_MS,
  shouldRevealFromGeometry,
} from './scrollReveal';

test('computeStaggerDelayMs computes tight Apple-like stagger increments with cap', () => {
  assert.equal(computeStaggerDelayMs(0), 0);
  assert.equal(computeStaggerDelayMs(-2), 0);
  assert.equal(computeStaggerDelayMs(1), SCROLL_REVEAL_STAGGER_MS);
  assert.equal(computeStaggerDelayMs(3), SCROLL_REVEAL_STAGGER_MS * 3);
  assert.equal(computeStaggerDelayMs(20), SCROLL_REVEAL_MAX_STAGGER_MS);
});

test('shouldRevealFromGeometry reveals visible or scrolled-past elements and holds far below-fold elements', () => {
  // Inside initial viewport
  assert.equal(
    shouldRevealFromGeometry({top: 120, bottom: 260, height: 140}, 900, 60),
    true,
  );
  // Within 60px bottom trigger margin
  assert.equal(
    shouldRevealFromGeometry({top: 940, bottom: 1080, height: 140}, 900, 60),
    true,
  );
  // Scrolled quickly past above viewport (top < 0)
  assert.equal(
    shouldRevealFromGeometry({top: -320, bottom: -180, height: 140}, 900, 60),
    true,
  );
  // Below the fold beyond margin
  assert.equal(
    shouldRevealFromGeometry({top: 1120, bottom: 1280, height: 160}, 900, 60),
    false,
  );
});
