import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isExpectedRouteAnimation,
  ROUTE_ENTER_MS,
  ROUTE_EXIT_MS,
  shouldAnimateRouteChange,
} from './routeTransition';

test('route transition timings stay within snappy 120ms-240ms Apple-like bounds', () => {
  assert.ok(ROUTE_EXIT_MS >= 100 && ROUTE_EXIT_MS <= 180);
  assert.ok(ROUTE_ENTER_MS >= 160 && ROUTE_ENTER_MS <= 240);
});

test('shouldAnimateRouteChange triggers only on distinct pathnames when reduced motion is off', () => {
  assert.equal(shouldAnimateRouteChange('/', '/log', false), true);
  assert.equal(shouldAnimateRouteChange('/qrb-lab', '/qrb-lab/abc', false), true);
  assert.equal(shouldAnimateRouteChange('/qrb-lab', '/qrb-lab', false), false);
  assert.equal(shouldAnimateRouteChange('/', '/log', true), false);
});

test('isExpectedRouteAnimation prevents child animations from ending page exit/enter early', () => {
  assert.equal(isExpectedRouteAnimation('page-route-exit', 'exiting'), true);
  assert.equal(isExpectedRouteAnimation('home-hero-enter', 'exiting'), false);
  assert.equal(isExpectedRouteAnimation('page-route-enter', 'entering'), true);
  assert.equal(isExpectedRouteAnimation('home-crosshair-breathe', 'entering'), false);
  assert.equal(isExpectedRouteAnimation('page-route-enter', 'idle'), false);
});
