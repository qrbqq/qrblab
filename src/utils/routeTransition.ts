import {MOTION_DURATIONS} from './motion';

export type RouteTransitionPhase = 'idle' | 'exiting' | 'entering';

export const ROUTE_EXIT_MS = MOTION_DURATIONS.routeExit;
export const ROUTE_ENTER_MS = MOTION_DURATIONS.routeEnter;

export function shouldAnimateRouteChange(
  fromPath: string,
  toPath: string,
  prefersReducedMotion: boolean,
): boolean {
  if (prefersReducedMotion) {
    return false;
  }
  return fromPath !== toPath;
}

export function isExpectedRouteAnimation(
  animationName: string,
  phase: RouteTransitionPhase,
): boolean {
  if (phase === 'exiting') {
    return animationName === 'page-route-exit';
  }
  if (phase === 'entering') {
    return animationName === 'page-route-enter';
  }
  return false;
}
