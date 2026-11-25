import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeParticleBudget,
  evaluateIntroTimeline,
  hasIntroPlayedInMemory,
  INTRO_FAILSAFE_TIMEOUT_MS,
  INTRO_TOTAL_DURATION_MS,
  isScrollLockBlockedKey,
  markIntroPlayedInMemory,
  resetIntroPlayedInMemory,
} from './particleIntro';

test('3-stage particle intro choreography progresses in strict order from deep-space to qrbqq to 0101 to complete', () => {
  const s1 = evaluateIntroTimeline(200);
  assert.equal(s1.stage, 'deep-space');
  assert.equal(s1.completed, false);
  assert.equal(s1.backdropAlpha, 1);
  assert.equal(s1.heroReveal, 0);

  const s2Form = evaluateIntroTimeline(2600);
  assert.equal(s2Form.stage, 'brand-form');
  assert.equal(s2Form.brandMix, 1);
  assert.equal(s2Form.codeMix, 0);

  const s2Dissolve = evaluateIntroTimeline(3600);
  assert.equal(s2Dissolve.stage, 'brand-dissolve');
  assert.ok(s2Dissolve.disperseMix > 0.3);

  const s3Form = evaluateIntroTimeline(5300);
  assert.equal(s3Form.stage, 'code-form');
  assert.equal(s3Form.codeMix, 1);
  assert.equal(s3Form.brandMix, 0);

  const s3Dissolve = evaluateIntroTimeline(6200);
  assert.equal(s3Dissolve.stage, 'code-dissolve');
  assert.ok(s3Dissolve.exitMix > 0);
  assert.ok(s3Dissolve.heroReveal > 0);

  const sEnd = evaluateIntroTimeline(INTRO_TOTAL_DURATION_MS);
  assert.equal(sEnd.stage, 'complete');
  assert.equal(sEnd.completed, true);
  assert.equal(sEnd.backdropAlpha, 0);
  assert.equal(sEnd.particleAlpha, 0);
  assert.equal(sEnd.heroReveal, 1);
});

test('failsafe timeout exceeds total intro duration so intro always unlocks safely', () => {
  assert.ok(INTRO_FAILSAFE_TIMEOUT_MS > INTRO_TOTAL_DURATION_MS);
});

test('computeParticleBudget scales density proportionally across desktop, mobile, low-CPU, and software WebGL', () => {
  const desktop = computeParticleBudget({
    viewportWidth: 1440,
    hardwareConcurrency: 12,
    devicePixelRatio: 3,
    isSoftwareRenderer: false,
  });
  assert.equal(desktop.dpr, 2);
  assert.ok(desktop.morphCount >= 5000);
  assert.ok(desktop.dustCount >= 1800);

  const mobile = computeParticleBudget({
    viewportWidth: 390,
    hardwareConcurrency: 4,
    devicePixelRatio: 3,
    isSoftwareRenderer: false,
  });
  assert.ok(mobile.morphCount < desktop.morphCount);
  assert.ok(mobile.dpr <= 1.75);

  const software = computeParticleBudget({
    viewportWidth: 1440,
    hardwareConcurrency: 8,
    devicePixelRatio: 2,
    isSoftwareRenderer: true,
  });
  assert.equal(software.dpr, 1);
  assert.ok(software.morphCount < mobile.morphCount);
});

test('isScrollLockBlockedKey blocks all scroll navigation keys without blocking normal typing keys', () => {
  for (const key of [
    'ArrowUp',
    'ArrowDown',
    'PageUp',
    'PageDown',
    ' ',
    'Home',
    'End',
  ]) {
    assert.equal(isScrollLockBlockedKey(key), true);
  }
  assert.equal(isScrollLockBlockedKey('Escape'), false);
  assert.equal(isScrollLockBlockedKey('a'), false);
  assert.equal(isScrollLockBlockedKey('Enter'), false);
});

test('in-memory session flag starts false on fresh load and flips after intro plays', () => {
  resetIntroPlayedInMemory();
  assert.equal(hasIntroPlayedInMemory(), false);
  markIntroPlayedInMemory();
  assert.equal(hasIntroPlayedInMemory(), true);
  resetIntroPlayedInMemory();
});
