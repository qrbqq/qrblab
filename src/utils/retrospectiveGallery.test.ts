import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clampOrbitPosition,
  computeCorridorParallax,
  computeCorridorPose,
  computeFinaleFogReveal,
  FINALE_STATION_INDEX,
  getInspectionItems,
  getStationWallSide,
  hasCorridorWalkCompletedInMemory,
  markCorridorWalkCompletedInMemory,
  MAX_ORBIT_POSITION,
  type OrbitPhysicsState,
  resetCorridorWalkCompletedInMemory,
  RETROSPECTIVE_EXHIBITS,
  stepOrbitInertia,
  TERMINAL_SCULPTURES,
} from './retrospectiveGallery.ts';

test('catalog maps all 12 alternating exhibits (Left 01..11, Right 02..12) and 2 twin pedestal sculptures', () => {
  assert.equal(RETROSPECTIVE_EXHIBITS.length, 12);
  assert.equal(TERMINAL_SCULPTURES.length, 2);
  assert.equal(RETROSPECTIVE_EXHIBITS[0].id, 'childhood-early');
  assert.equal(RETROSPECTIVE_EXHIBITS[11].id, 'solidarity-gaza');
  assert.equal(RETROSPECTIVE_EXHIBITS[11].seriesTitle, "DON'T FORGET GAZA");
  assert.equal(getStationWallSide(0), 'left'); // EXH 01
  assert.equal(getStationWallSide(1), 'right'); // EXH 02
  assert.equal(getStationWallSide(10), 'left'); // EXH 11
  assert.equal(getStationWallSide(11), 'right'); // EXH 12 Don't Forget Gaza
  assert.equal(getStationWallSide(FINALE_STATION_INDEX), 'center');
  assert.equal(TERMINAL_SCULPTURES[0].code, '00');
  assert.equal(TERMINAL_SCULPTURES[1].code, '0101');
  assert.equal(getInspectionItems().length, 14);
});

test('computeCorridorPose places exhibits on opposing Left/Right walls and Terminal Pavilion straight ahead along Z', () => {
  const leftFirst = computeCorridorPose(0, 0, 1440);
  assert.equal(leftFirst.side, 'left');
  assert.ok(leftFirst.translateX < 0);
  assert.ok(leftFirst.rotateY > 0);
  assert.ok(leftFirst.translateZ < 0);
  assert.equal(leftFirst.culled, false);

  const rightSecond = computeCorridorPose(1, 0, 1440);
  assert.equal(rightSecond.side, 'right');
  assert.ok(rightSecond.translateX > 0);
  assert.ok(rightSecond.rotateY < 0);
  assert.ok(rightSecond.translateZ < leftFirst.translateZ);

  const finaleFromEntrance = computeCorridorPose(FINALE_STATION_INDEX, 0, 1440);
  assert.equal(finaleFromEntrance.side, 'center');
  assert.equal(finaleFromEntrance.translateX, 0);
  assert.equal(finaleFromEntrance.rotateY, 0);
  assert.equal(finaleFromEntrance.culled, false);

  // Walking to FINALE brings the Twin Pedestals directly into foreground focus
  const finaleAtEnd = computeCorridorPose(FINALE_STATION_INDEX, FINALE_STATION_INDEX, 1440);
  assert.equal(finaleAtEnd.opacity, 1);
  assert.equal(finaleAtEnd.focus, 1);
  assert.ok(finaleAtEnd.translateZ > finaleFromEntrance.translateZ);

  // Earlier exhibits behind the camera cull out cleanly
  const passedBehind = computeCorridorPose(0, 8, 1440);
  assert.equal(passedBehind.culled, true);
});

test('computeFinaleFogReveal veils terminus at 0% and brings statues and pedestals into sharp focus at 100%', () => {
  const atStart = computeFinaleFogReveal(0);
  assert.ok(atStart.finaleOpacity >= 0.03 && atStart.finaleOpacity <= 0.08);
  assert.ok(atStart.finaleBlurPx >= 10);
  assert.ok(atStart.mistVeilOpacity >= 0.9);
  assert.ok(atStart.spotlightIntensity <= 0.12);

  const atMid = computeFinaleFogReveal(0.55);
  assert.ok(atMid.finaleOpacity > atStart.finaleOpacity);
  assert.ok(atMid.finaleOpacity < 0.55);

  const atEnd = computeFinaleFogReveal(1);
  assert.equal(atEnd.finaleOpacity, 1);
  assert.equal(atEnd.finaleBlurPx, 0);
  assert.equal(atEnd.mistVeilOpacity, 0);
  assert.equal(atEnd.spotlightIntensity, 1);
});

test('computeCorridorParallax clamps camera tilt strictly within ±2 degrees', () => {
  const rightTop = computeCorridorParallax(4, -5);
  assert.equal(rightTop.rotateY, 2);
  assert.equal(rightTop.rotateX, 1.5);

  const leftBottom = computeCorridorParallax(-4, 5);
  assert.equal(leftBottom.rotateY, -2);
  assert.equal(leftBottom.rotateX, -1.5);

  const center = computeCorridorParallax(0, 0);
  assert.equal(center.rotateX, 0);
  assert.equal(center.rotateY, 0);
});

test('in-memory corridor walk flag starts false, persists once marked, and resets cleanly', () => {
  resetCorridorWalkCompletedInMemory();
  assert.equal(hasCorridorWalkCompletedInMemory(), false);
  markCorridorWalkCompletedInMemory();
  assert.equal(hasCorridorWalkCompletedInMemory(), true);
  resetCorridorWalkCompletedInMemory();
  assert.equal(hasCorridorWalkCompletedInMemory(), false);
});

test('stepOrbitInertia glides cleanly along Z-axis walk targets and damps momentum to rest', () => {
  let state: OrbitPhysicsState = {
    position: 0,
    velocity: 0,
    targetPosition: FINALE_STATION_INDEX,
  };
  for (let i = 0; i < 120; i += 1) {
    const res = stepOrbitInertia(state, 16);
    state = res.next;
    if (res.settled) break;
  }
  assert.equal(state.position, FINALE_STATION_INDEX);
  assert.equal(state.targetPosition, null);

  let burst: OrbitPhysicsState = {
    position: 11.5,
    velocity: 25,
    targetPosition: null,
  };
  for (let i = 0; i < 60; i += 1) {
    const res = stepOrbitInertia(burst, 16);
    burst = res.next;
    assert.ok(burst.position <= MAX_ORBIT_POSITION);
    assert.ok(burst.position >= 0);
  }
  assert.equal(clampOrbitPosition(-5), 0);
  assert.equal(clampOrbitPosition(99), MAX_ORBIT_POSITION);
});
