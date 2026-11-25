import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {
  MOTION_DISTANCES,
  MOTION_DURATIONS,
  MOTION_EASINGS,
  MOTION_STAGGER,
  MOTION_TOKENS,
} from './motion';
import {ROUTE_ENTER_MS, ROUTE_EXIT_MS} from './routeTransition';
import {
  SCROLL_REVEAL_MAX_STAGGER_MS,
  SCROLL_REVEAL_STAGGER_MS,
} from './scrollReveal';

describe('Centralized motion tokens', () => {
  it('defines coherent non-negative durations and stagger bounds', () => {
    assert.ok(MOTION_DURATIONS.micro > 0);
    assert.ok(MOTION_DURATIONS.fast >= MOTION_DURATIONS.micro);
    assert.ok(MOTION_DURATIONS.base >= MOTION_DURATIONS.fast);
    assert.ok(MOTION_DURATIONS.reveal >= MOTION_DURATIONS.base);
    assert.ok(MOTION_STAGGER.stepMs > 0);
    assert.ok(MOTION_STAGGER.maxMs >= MOTION_STAGGER.stepMs);
    assert.equal(MOTION_TOKENS.easings, MOTION_EASINGS);
    assert.equal(MOTION_TOKENS.distances, MOTION_DISTANCES);
  });

  it('synchronizes routeTransition and scrollReveal constants to central motion system', () => {
    assert.equal(ROUTE_EXIT_MS, MOTION_DURATIONS.routeExit);
    assert.equal(ROUTE_ENTER_MS, MOTION_DURATIONS.routeEnter);
    assert.equal(SCROLL_REVEAL_STAGGER_MS, MOTION_STAGGER.stepMs);
    assert.equal(SCROLL_REVEAL_MAX_STAGGER_MS, MOTION_STAGGER.maxMs);
  });
});
