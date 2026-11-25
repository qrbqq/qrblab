import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeWordLensResponse,
  computeWordPointerDistance,
  evaluateStatementTimeline,
  OPTICAL_LENS_MAX_SCALE,
  OPTICAL_LENS_RADIUS_PX,
  STATEMENT_FAILSAFE_TIMEOUT_MS,
  STATEMENT_STAGE1_END_MS,
  STATEMENT_STAGE2_END_MS,
  STATEMENT_STAGE3_END_MS,
  STATEMENT_STAGE4_END_MS,
  STATEMENT_STAGE5_START_MS,
  STATEMENT_TOTAL_DURATION_MS,
  tokenizeTextWords,
} from './statementReveal';

test('statement 5-stage choreography progresses in strict order from black-cover to revealed', () => {
  // Stage 1: Black Cover
  const s1 = evaluateStatementTimeline(180);
  assert.equal(s1.phase, 'black-cover');
  assert.ok(s1.coverAlpha > 0.5);
  assert.equal(s1.particleAlpha, 0);
  assert.equal(s1.headingOpacity, 0);
  assert.equal(s1.bodyProgress, 0);

  // Stage 2: Scattered White Particles
  const s2 = evaluateStatementTimeline(STATEMENT_STAGE1_END_MS + 220);
  assert.equal(s2.phase, 'scattered-particles');
  assert.equal(s2.coverAlpha, 1);
  assert.ok(s2.particleAlpha > 0.4);
  assert.equal(s2.particleConverge, 0);
  assert.equal(s2.headingOpacity, 0);

  // Stage 3: Particle Convergence
  const s3 = evaluateStatementTimeline(STATEMENT_STAGE2_END_MS + 480);
  assert.equal(s3.phase, 'particle-converge');
  assert.equal(s3.coverAlpha, 1);
  assert.equal(s3.particleAlpha, 1);
  assert.ok(s3.particleConverge > 0.8);
  assert.equal(s3.headingOpacity, 0);

  // Stage 4: Black Cover Dissolve
  const s4 = evaluateStatementTimeline(STATEMENT_STAGE3_END_MS + 140);
  assert.equal(s4.phase, 'cover-dissolve');
  assert.ok(s4.coverAlpha < 1 && s4.coverAlpha > 0);
  assert.ok(s4.headingOpacity > 0 && s4.headingOpacity < 1);
  assert.equal(s4.bodyProgress, 0);

  // Stage 5: Statement Text Reveal
  const s5 = evaluateStatementTimeline(STATEMENT_STAGE5_START_MS + 220);
  assert.equal(s5.phase, 'text-reveal');
  assert.ok(s5.bodyProgress > 0 && s5.bodyProgress < 1);

  // Completed
  const done = evaluateStatementTimeline(STATEMENT_TOTAL_DURATION_MS);
  assert.equal(done.phase, 'revealed');
  assert.equal(done.coverAlpha, 0);
  assert.equal(done.particleAlpha, 0);
  assert.equal(done.headingOpacity, 1);
  assert.equal(done.bodyProgress, 1);
  assert.equal(done.completed, true);

  assert.ok(STATEMENT_STAGE4_END_MS < STATEMENT_TOTAL_DURATION_MS);
  assert.ok(STATEMENT_FAILSAFE_TIMEOUT_MS > STATEMENT_TOTAL_DURATION_MS);
});

test('tokenizeTextWords preserves punctuation and exact whitespace separation', () => {
  const input = 'Research Disclaimer, &  Statement.';
  const tokens = tokenizeTextWords(input);

  assert.equal(tokens.map((t) => t.text).join(''), input);
  assert.deepEqual(
    tokens.filter((t) => !t.isWhitespace).map((t) => t.text),
    ['Research', 'Disclaimer,', '&', 'Statement.'],
  );
  assert.equal(tokenizeTextWords('').length, 0);
});

test('optical lens magnification peaks inside word and falls off smoothly to 1', () => {
  const exactCenter = computeWordLensResponse(0);
  assert.equal(exactCenter.scale, OPTICAL_LENS_MAX_SCALE);
  assert.equal(exactCenter.focus, 1);
  assert.ok(exactCenter.liftY < 0);
  assert.equal(exactCenter.shiftX, 0);

  const midRight = computeWordLensResponse(
    OPTICAL_LENS_RADIUS_PX * 0.45,
    OPTICAL_LENS_RADIUS_PX,
    OPTICAL_LENS_MAX_SCALE,
    24,
  );
  assert.ok(midRight.scale > 1 && midRight.scale < OPTICAL_LENS_MAX_SCALE);
  assert.ok(midRight.focus > 0 && midRight.focus < 1);
  assert.ok(midRight.shiftX > 0);

  const midLeft = computeWordLensResponse(
    OPTICAL_LENS_RADIUS_PX * 0.45,
    OPTICAL_LENS_RADIUS_PX,
    OPTICAL_LENS_MAX_SCALE,
    -24,
  );
  assert.ok(midLeft.shiftX < 0);

  const outside = computeWordLensResponse(OPTICAL_LENS_RADIUS_PX);
  assert.equal(outside.scale, 1);
  assert.equal(outside.focus, 0);
  assert.equal(outside.liftY, 0);
  assert.equal(outside.shiftX, 0);
});

test('word pointer distance gives near-zero metric directly over word box', () => {
  const insideDist = computeWordPointerDistance(120, 50, 100, 40, 40, 20);
  assert.equal(insideDist, 0);

  const nearbyDist = computeWordPointerDistance(155, 50, 100, 40, 40, 20);
  const farDist = computeWordPointerDistance(300, 50, 100, 40, 40, 20);
  assert.ok(nearbyDist > 0 && nearbyDist < farDist);
});
