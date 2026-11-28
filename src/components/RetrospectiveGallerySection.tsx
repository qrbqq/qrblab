import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';
import {resolveAssetUrl} from '../utils/papers';
import {
  clampOrbitPosition,
  computeCorridorParallax,
  computeCorridorPose,
  computeFinaleFogReveal,
  FINALE_STATION_INDEX,
  getCameraWorldZ,
  getInspectionItems,
  hasCorridorWalkCompletedInMemory,
  markCorridorWalkCompletedInMemory,
  MAX_ORBIT_POSITION,
  type OrbitPhysicsState,
  RETROSPECTIVE_EXHIBITS,
  stepOrbitInertia,
  TERMINAL_SCULPTURES,
} from '../utils/retrospectiveGallery';
import {prefersReducedMotion} from '../hooks/useScrollReveal';

/** Architectural Z-rib depth positions forming repeating corridor bays along the walkway */
const CORRIDOR_ARCHITECTURAL_RIBS = [
  120, -140, -400, -660, -920, -1180, -1440, -1700, -1960, -2220, -2480, -2740,
  -3000,
] as const;

export function RetrospectiveGallerySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<HTMLDivElement | null>(null);

  const initialCompleted =
    typeof window !== 'undefined' &&
    (hasCorridorWalkCompletedInMemory() || prefersReducedMotion());

  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [cameraPos, setCameraPos] = useState(() =>
    initialCompleted ? FINALE_STATION_INDEX : 0,
  );
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [activeInspectionIndex, setActiveInspectionIndex] = useState<
    number | null
  >(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const physicsRef = useRef<OrbitPhysicsState>({
    position: initialCompleted ? FINALE_STATION_INDEX : 0,
    velocity: 0,
    targetPosition: null,
  });

  const isCompletedRef = useRef(initialCompleted);
  const isCapturedRef = useRef(false);
  const activeModalOpenRef = useRef(false);
  const lastScrollYRef = useRef(
    typeof window !== 'undefined' ? window.scrollY : 0,
  );
  const finaleOverscrollRef = useRef(0);
  const touchActiveRef = useRef(false);
  const touchLastYRef = useRef(0);

  const isVisibleRef = useRef(true);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);

  const parallaxTargetRef = useRef({rotateX: 0, rotateY: 0});
  const parallaxCurrentRef = useRef({rotateX: 0, rotateY: 0});
  const parallaxRafRef = useRef<number | null>(null);

  const dragPointerIdRef = useRef<number | null>(null);
  const dragLastCoordRef = useRef({x: 0, y: 0});
  const dragLastTimeRef = useRef(0);
  const dragTotalMovementRef = useRef(0);

  const inspectionItems = useMemo(() => getInspectionItems(), []);

  useEffect(() => {
    activeModalOpenRef.current = activeInspectionIndex !== null;
  }, [activeInspectionIndex]);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize, {passive: true});
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const stopPhysicsLoop = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const stopParallaxLoop = useCallback(() => {
    if (parallaxRafRef.current !== null) {
      cancelAnimationFrame(parallaxRafRef.current);
      parallaxRafRef.current = null;
    }
  }, []);

  const ensurePhysicsLoop = useCallback(() => {
    if (rafIdRef.current !== null || !isVisibleRef.current) {
      return;
    }
    if (prefersReducedMotion() && physicsRef.current.targetPosition !== null) {
      const snapped = clampOrbitPosition(physicsRef.current.targetPosition);
      physicsRef.current = {
        position: snapped,
        velocity: 0,
        targetPosition: null,
      };
      setCameraPos(snapped);
      return;
    }

    lastFrameTimeRef.current = performance.now();

    const tick = (now: number) => {
      rafIdRef.current = null;
      if (!isVisibleRef.current) return;

      const dt = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      const {next, settled} = stepOrbitInertia(physicsRef.current, dt);
      physicsRef.current = next;
      setCameraPos(next.position);

      if (!settled) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, []);

  const ensureParallaxLoop = useCallback(() => {
    if (
      parallaxRafRef.current !== null ||
      !isVisibleRef.current ||
      prefersReducedMotion()
    ) {
      return;
    }

    const tickParallax = () => {
      parallaxRafRef.current = null;
      if (!isVisibleRef.current || !worldRef.current) return;

      const cur = parallaxCurrentRef.current;
      const tgt = parallaxTargetRef.current;
      const nextX = cur.rotateX + (tgt.rotateX - cur.rotateX) * 0.14;
      const nextY = cur.rotateY + (tgt.rotateY - cur.rotateY) * 0.14;

      parallaxCurrentRef.current = {rotateX: nextX, rotateY: nextY};
      worldRef.current.style.transform = `rotateX(${nextX.toFixed(3)}deg) rotateY(${nextY.toFixed(3)}deg)`;

      if (
        Math.abs(tgt.rotateX - nextX) > 0.015 ||
        Math.abs(tgt.rotateY - nextY) > 0.015
      ) {
        parallaxRafRef.current = requestAnimationFrame(tickParallax);
      }
    };

    parallaxRafRef.current = requestAnimationFrame(tickParallax);
  }, []);

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting);
        isVisibleRef.current = visible;
        if (!visible) {
          stopPhysicsLoop();
          stopParallaxLoop();
        } else if (
          physicsRef.current.targetPosition !== null ||
          Math.abs(physicsRef.current.velocity) > 0.004
        ) {
          ensurePhysicsLoop();
        }
      },
      {rootMargin: '120px 0px'},
    );

    observer.observe(sectionEl);
    return () => {
      observer.disconnect();
      stopPhysicsLoop();
      stopParallaxLoop();
    };
  }, [ensurePhysicsLoop, stopParallaxLoop, stopPhysicsLoop]);

  const walkToStation = useCallback(
    (index: number) => {
      const clamped = clampOrbitPosition(index);
      if (prefersReducedMotion()) {
        stopPhysicsLoop();
        physicsRef.current = {
          position: clamped,
          velocity: 0,
          targetPosition: null,
        };
        setCameraPos(clamped);
        return;
      }
      physicsRef.current = {
        ...physicsRef.current,
        targetPosition: clamped,
      };
      ensurePhysicsLoop();
    },
    [ensurePhysicsLoop, stopPhysicsLoop],
  );

  const completeAndExitCorridor = useCallback(() => {
    markCorridorWalkCompletedInMemory();
    isCompletedRef.current = true;
    isCapturedRef.current = false;
    finaleOverscrollRef.current = 0;
    setIsCompleted(true);

    const labLogEl = document.getElementById('lab-log');
    if (labLogEl) {
      labLogEl.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
      return;
    }

    const sectionEl = sectionRef.current;
    if (sectionEl) {
      const targetTop =
        window.scrollY + sectionEl.getBoundingClientRect().bottom;
      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  }, []);

  /**
   * Sticky full-viewport scroll capture & guided walk:
   * - Engages once per site load (in-memory flag) when scrolling down into #retrospective-pavilion
   * - Wheel & touch gestures drive corridor Z-axis camera walk smoothly
   * - Auto-unlocks downward into #lab-log upon finishing past 100%, clicking Skip/Continue, or pressing Escape
   */
  useEffect(() => {
    if (isCompleted) return;

    const snapCorridorFlush = (rectTop: number) => {
      const targetTop = Math.max(0, window.scrollY + rectTop);
      if (Math.abs(rectTop) > 1.5) {
        window.scrollTo({top: targetTop, behavior: 'instant'});
      }
      lastScrollYRef.current = window.scrollY;
      isCapturedRef.current = true;
    };

    const advanceWalkByDelta = (deltaPx: number) => {
      const currentTarget =
        physicsRef.current.targetPosition ?? physicsRef.current.position;

      // Walking back past entrance smoothly releases visitor upward to Marquee/Hero
      if (deltaPx < 0 && currentTarget <= 0.03) {
        isCapturedRef.current = false;
        finaleOverscrollRef.current = 0;
        return false;
      }

      // Past 100% finale beat, continued downward intent automatically unlocks downward scroll
      if (
        deltaPx > 0 &&
        physicsRef.current.position >= MAX_ORBIT_POSITION - 0.14 &&
        currentTarget >= MAX_ORBIT_POSITION - 0.06
      ) {
        finaleOverscrollRef.current += deltaPx;
        if (finaleOverscrollRef.current >= 110) {
          completeAndExitCorridor();
        }
        return true;
      }

      if (deltaPx < 0) {
        finaleOverscrollRef.current = 0;
      }

      const nextTarget = clampOrbitPosition(currentTarget + deltaPx / 225);
      physicsRef.current = {
        ...physicsRef.current,
        targetPosition: nextTarget,
      };
      ensurePhysicsLoop();
      return true;
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollYRef.current + 1;
      lastScrollYRef.current = currentY;

      if (isCompletedRef.current || activeModalOpenRef.current) return;
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      const rect = sectionEl.getBoundingClientRect();
      const vh = window.innerHeight;

      if (isCapturedRef.current) {
        // Safety valve if visitor drags browser scrollbar thumb outside corridor band
        if (rect.top < -vh * 0.52 || rect.top > vh * 0.58) {
          isCapturedRef.current = false;
          finaleOverscrollRef.current = 0;
        }
        return;
      }

      if (
        scrollingDown &&
        rect.top <= 24 &&
        rect.top >= -vh * 0.45 &&
        rect.bottom >= vh * 0.52
      ) {
        snapCorridorFlush(rect.top);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (isCompletedRef.current || activeModalOpenRef.current) return;
      const sectionEl = sectionRef.current;
      if (!sectionEl) return;

      const rect = sectionEl.getBoundingClientRect();
      const vh = window.innerHeight;

      const rawDeltaY =
        event.deltaMode === 1
          ? event.deltaY * 32
          : event.deltaMode === 2
            ? event.deltaY * vh
            : event.deltaY;
      const rawDeltaX =
        event.deltaMode === 1 ? event.deltaX * 32 : event.deltaX;
      const delta =
        Math.abs(rawDeltaX) > Math.abs(rawDeltaY) ? rawDeltaX : rawDeltaY;

      if (Math.abs(delta) < 0.5) return;

      if (!isCapturedRef.current) {
        const insideCorridorEntrance =
          delta > 0 &&
          rect.top <= 48 &&
          rect.top >= -vh * 0.42 &&
          rect.bottom >= vh * 0.52;

        if (!insideCorridorEntrance) return;
        snapCorridorFlush(rect.top);
      }

      const consumed = advanceWalkByDelta(delta);
      if (consumed) {
        event.preventDefault();
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      if (isCompletedRef.current || activeModalOpenRef.current) return;
      const touch = event.touches[0];
      if (!touch) return;
      touchActiveRef.current = true;
      touchLastYRef.current = touch.clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (
        !touchActiveRef.current ||
        isCompletedRef.current ||
        activeModalOpenRef.current
      ) {
        return;
      }
      const touch = event.touches[0];
      const sectionEl = sectionRef.current;
      if (!touch || !sectionEl) return;

      const dy = touchLastYRef.current - touch.clientY;
      touchLastYRef.current = touch.clientY;
      if (Math.abs(dy) < 0.5) return;

      const rect = sectionEl.getBoundingClientRect();
      const vh = window.innerHeight;

      if (!isCapturedRef.current) {
        const enteringDownward =
          dy > 0 &&
          rect.top <= 48 &&
          rect.top >= -vh * 0.42 &&
          rect.bottom >= vh * 0.52;
        if (!enteringDownward) return;
        snapCorridorFlush(rect.top);
      }

      const consumed = advanceWalkByDelta(dy * 1.45);
      if (consumed && event.cancelable) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      touchActiveRef.current = false;
    };

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (isCompletedRef.current || activeModalOpenRef.current) return;
      if (!isCapturedRef.current) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        completeAndExitCorridor();
      } else if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        const currentTarget =
          physicsRef.current.targetPosition ?? physicsRef.current.position;
        if (currentTarget >= MAX_ORBIT_POSITION - 0.15) {
          completeAndExitCorridor();
        } else {
          walkToStation(Math.round(currentTarget) + 1);
        }
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        const currentTarget =
          physicsRef.current.targetPosition ?? physicsRef.current.position;
        if (currentTarget <= 0.1) {
          isCapturedRef.current = false;
        } else {
          walkToStation(Math.round(currentTarget) - 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, {passive: true});
    window.addEventListener('wheel', handleWheel, {passive: false});
    window.addEventListener('touchstart', handleTouchStart, {passive: true});
    window.addEventListener('touchmove', handleTouchMove, {passive: false});
    window.addEventListener('touchend', handleTouchEnd, {passive: true});
    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [
    completeAndExitCorridor,
    ensurePhysicsLoop,
    isCompleted,
    walkToStation,
  ]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragTotalMovementRef.current = 0;
    const targetEl = event.target as HTMLElement | null;
    if (targetEl?.closest('button, a')) {
      return;
    }

    dragPointerIdRef.current = event.pointerId;
    dragLastCoordRef.current = {x: event.clientX, y: event.clientY};
    dragLastTimeRef.current = performance.now();
    setIsDragging(true);

    physicsRef.current = {
      ...physicsRef.current,
      velocity: 0,
      targetPosition: null,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleStagePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    // Smooth subtle ±2deg mouse camera parallax tilt across the 3D hall
    if (
      event.pointerType === 'mouse' &&
      stageRef.current &&
      !prefersReducedMotion()
    ) {
      const rect = stageRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const normX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        parallaxTargetRef.current = computeCorridorParallax(normX, normY);
        ensureParallaxLoop();
      }
    }

    if (dragPointerIdRef.current !== event.pointerId) return;

    const now = performance.now();
    const dx = event.clientX - dragLastCoordRef.current.x;
    const dy = event.clientY - dragLastCoordRef.current.y;
    const dt = Math.max(8, now - dragLastTimeRef.current);

    dragLastCoordRef.current = {x: event.clientX, y: event.clientY};
    dragLastTimeRef.current = now;
    dragTotalMovementRef.current += Math.hypot(dx, dy);

    const primaryDelta =
      event.pointerType === 'mouse' && Math.abs(dy) > Math.abs(dx) ? dy : -dx;
    const dragSensitivity = viewportWidth < 640 ? 150 : 210;
    const deltaStations = primaryDelta / dragSensitivity;
    const nextPos = clampOrbitPosition(
      physicsRef.current.position + deltaStations,
    );

    physicsRef.current = {
      position: nextPos,
      velocity: (deltaStations / dt) * 1000,
      targetPosition: null,
    };
    setCameraPos(nextPos);
  };

  const handleStagePointerLeave = () => {
    if (!prefersReducedMotion()) {
      parallaxTargetRef.current = {rotateX: 0, rotateY: 0};
      ensureParallaxLoop();
    }
  };

  const finishDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return;
    dragPointerIdRef.current = null;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (Math.abs(physicsRef.current.velocity) > 0.08) {
      ensurePhysicsLoop();
    }
  };

  const handleStageKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      walkToStation(Math.round(physicsRef.current.position) + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      walkToStation(Math.round(physicsRef.current.position) - 1);
    }
  };

  const openInspectionById = useCallback(
    (id: string) => {
      if (dragTotalMovementRef.current > 8) {
        dragTotalMovementRef.current = 0;
        return;
      }
      const idx = inspectionItems.findIndex((item) => item.id === id);
      if (idx !== -1) {
        setActiveInspectionIndex(idx);
      }
    },
    [inspectionItems],
  );

  useEffect(() => {
    if (activeInspectionIndex === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveInspectionIndex(null);
      } else if (event.key === 'ArrowRight') {
        setActiveInspectionIndex((prev) =>
          prev === null ? 0 : (prev + 1) % inspectionItems.length,
        );
      } else if (event.key === 'ArrowLeft') {
        setActiveInspectionIndex((prev) =>
          prev === null
            ? 0
            : (prev - 1 + inspectionItems.length) % inspectionItems.length,
        );
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeInspectionIndex, inspectionItems.length]);

  const activeStationNearest = Math.round(cameraPos);
  const isAtFinale = activeStationNearest >= FINALE_STATION_INDEX;
  const activeExhibit = isAtFinale
    ? null
    : RETROSPECTIVE_EXHIBITS[activeStationNearest];

  const activeModalItem =
    activeInspectionIndex !== null
      ? inspectionItems[activeInspectionIndex]
      : null;

  const cameraWorldZ = getCameraWorldZ(cameraPos);
  const isCompact = viewportWidth < 640;
  const isTablet = viewportWidth >= 640 && viewportWidth < 1024;
  const ribWallOffset = isCompact ? 170 : isTablet ? 312 : 426;

  const progress01 = clampOrbitPosition(cameraPos) / MAX_ORBIT_POSITION;
  const finaleFog = computeFinaleFogReveal(progress01);
  const nearFinaleCta = progress01 >= 0.9;

  return (
    <section
      ref={sectionRef}
      id="retrospective-pavilion"
      aria-label="Retrospective Memorial Pavilion and 3D Museum Corridor"
      className="relative h-[100dvh] min-h-[620px] w-full border-t border-white/[0.06] bg-[#050505]"
    >
      {/* Full-Viewport Sticky 100dvh Corridor Container */}
      <div className="sticky top-0 flex h-[100dvh] w-full flex-col overflow-hidden">
        {/* Top Curatorial Header Strip — comfortable clearance below fixed top-left QRB header */}
        <header className="relative z-20 mx-auto w-full max-w-7xl shrink-0 px-4 pt-20 pb-2 sm:px-6 sm:pt-24 sm:pb-3 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-eyebrow-mono text-[10.5px] uppercase text-[#707070] sm:text-[11px]">
                Retrospective Pavilion · Architectural Corridor
              </p>
              <h2 className="font-display-heading mt-1.5 text-xl font-semibold text-[#F5F5F5] sm:text-2xl lg:text-3xl">
                From First Light to Sovereign Form
              </h2>
            </div>

            <p className="font-eyebrow-mono text-[10.5px] text-[#A0A0A0] tabular-nums sm:text-[11px]">
              {isAtFinale
                ? 'END OF CORRIDOR · TWIN WHITE PEDESTALS'
                : `BAY ${activeExhibit?.indexLabel ?? '01'} / 12 · ${activeExhibit?.indexLabel && Number(activeExhibit.indexLabel) % 2 === 1 ? 'LEFT WALL' : 'RIGHT WALL'} · ${activeExhibit?.seriesTitle ?? 'GENESIS'}`}
            </p>
          </div>
        </header>

        {/* True 3D First-Person Walkable Corridor Viewport (perspective: 1100px) */}
        <div
          ref={stageRef}
          role="region"
          tabIndex={0}
          aria-label="First-person walkable 3D museum corridor. Scroll or drag to walk forward toward the Twin White Pedestals."
          onKeyDown={handleStageKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerLeave={handleStagePointerLeave}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          className={`museum-stage-perspective relative min-h-0 w-full flex-1 overflow-hidden select-none touch-pan-y focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white/40 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {/* Architectural Vanishing Perspective Guidelines (Floor, Ceiling, & Dark Corridor Shell) */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 680"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <defs>
              <radialGradient id="corridor-horizon-glow" cx="50%" cy="48%" r="48%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.045)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0.012)" />
                <stop offset="100%" stopColor="rgba(5,5,5,0)" />
              </radialGradient>
              <linearGradient
                id="corridor-floor-grad"
                x1="50%"
                y1="48%"
                x2="50%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0.008)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.042)" />
              </linearGradient>
            </defs>

            <rect width="1440" height="680" fill="url(#corridor-horizon-glow)" />

            <polygon
              points="500,434 940,434 1440,680 0,680"
              fill="url(#corridor-floor-grad)"
            />

            <g stroke="rgba(255,255,255,0.075)" strokeWidth="1" fill="none">
              <line x1="0" y1="0" x2="500" y2="226" />
              <line x1="1440" y1="0" x2="940" y2="226" />
              <line x1="0" y1="680" x2="500" y2="434" />
              <line x1="1440" y1="680" x2="940" y2="434" />
              <line
                x1="250"
                y1="680"
                x2="577"
                y2="434"
                stroke="rgba(255,255,255,0.05)"
              />
              <line
                x1="1190"
                y1="680"
                x2="863"
                y2="434"
                stroke="rgba(255,255,255,0.05)"
              />
              <line
                x1="500"
                y1="434"
                x2="940"
                y2="434"
                stroke="rgba(255,255,255,0.04)"
              />
            </g>
          </svg>

          {/* Subtle Atmospheric Depth Mist Veil parting progressively as visitor walks toward Terminus */}
          <div
            aria-hidden="true"
            style={{opacity: finaleFog.mistVeilOpacity}}
            className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(46%_48%_at_50%_46%,rgba(5,5,5,0.92)_0%,rgba(5,5,5,0.55)_52%,rgba(5,5,5,0)_100%)]"
          />

          {/* Peripheral Depth Scrims */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-[#050505] to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-[#050505] via-[#050505]/75 to-transparent"
          />

          {/* 3D Corridor World Space (pointer-events-none at z=0 plane so negative-Z exhibits & statues stay directly clickable) */}
          <div
            ref={worldRef}
            className="museum-stage-preserve pointer-events-none relative flex h-full w-full items-center justify-center will-change-transform"
          >
            {/* Repeating Architectural Wall Panels, Panel Seams & Recessed Ceiling Light Tracks Along Z-Axis */}
            {CORRIDOR_ARCHITECTURAL_RIBS.map((ribWorldZ) => {
              const zRel = ribWorldZ - cameraWorldZ;
              if (zRel > 140 || zRel < -3600) return null;
              const ribOpacity =
                zRel > -60
                  ? Math.max(0, 1 - (zRel + 60) / 200)
                  : Math.max(0.08, 1 - Math.abs(zRel) / 3600);

              return (
                <div
                  key={ribWorldZ}
                  aria-hidden="true"
                  style={{
                    transform: `translate3d(0px, 0px, ${zRel}px)`,
                    opacity: ribOpacity * 0.45,
                  }}
                  className="museum-stage-preserve pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  {/* Subtle Dark Matte Left Wall Bay Panel & Architectural Column Seam */}
                  <span
                    style={{
                      transform: `translate3d(${-ribWallOffset - 6}px, 0px, -130px) rotateY(90deg)`,
                    }}
                    className="museum-wall-panel absolute h-[470px] w-[260px] border-r border-white/[0.06]"
                  />
                  <span
                    style={{
                      transform: `translate3d(${-ribWallOffset}px, 0px, 0px)`,
                    }}
                    className="absolute h-[470px] w-px bg-gradient-to-b from-transparent via-white/[0.16] to-white/[0.04]"
                  />

                  {/* Subtle Dark Matte Right Wall Bay Panel & Architectural Column Seam */}
                  <span
                    style={{
                      transform: `translate3d(${ribWallOffset + 6}px, 0px, -130px) rotateY(-90deg)`,
                    }}
                    className="museum-wall-panel absolute h-[470px] w-[260px] border-l border-white/[0.06]"
                  />
                  <span
                    style={{
                      transform: `translate3d(${ribWallOffset}px, 0px, 0px)`,
                    }}
                    className="absolute h-[470px] w-px bg-gradient-to-b from-transparent via-white/[0.16] to-white/[0.04]"
                  />

                  {/* Overhead Recessed Ceiling Light Beam Track */}
                  <span
                    style={{
                      width: `${ribWallOffset * 2}px`,
                      transform: 'translate3d(0px, -230px, 0px)',
                    }}
                    className="absolute h-px bg-gradient-to-r from-white/[0.08] via-white/[0.2] to-white/[0.08]"
                  />
                </div>
              );
            })}

            {/* 12 Alternating Left Wall (01..11) & Right Wall (02..12) Frameless Museum Prints */}
            {RETROSPECTIVE_EXHIBITS.map((exhibit, index) => {
              const pose = computeCorridorPose(index, cameraPos, viewportWidth);
              if (pose.culled) {
                return null;
              }

              const assetSrc = resolveAssetUrl(
                exhibit.imagePath,
                import.meta.env.BASE_URL,
              );
              const imgBroken = Boolean(failedImages[exhibit.id]);
              const spotlightOpacity = (0.28 + pose.focus * 0.72).toFixed(3);
              const isForegroundFocus = pose.focus > 0.58;
              const absZ = Math.abs(pose.translateZ);
              const plaqueOpacity =
                absZ <= 360 ? 1 : Math.max(0, 1 - (absZ - 360) / 220);

              return (
                <article
                  key={exhibit.id}
                  data-exhibit-id={exhibit.id}
                  data-wall-side={pose.side}
                  style={{
                    transform: `translate3d(${pose.translateX}px, -14px, ${pose.translateZ}px) rotateY(${pose.rotateY}deg)`,
                    opacity: pose.opacity,
                    zIndex: pose.zIndex,
                  }}
                  className="group pointer-events-auto absolute flex w-[190px] flex-col items-center will-change-transform sm:w-[240px] lg:w-[272px]"
                >
                  {/* Recessed Overhead Wall Spotlight Cone */}
                  <div
                    aria-hidden="true"
                    style={{opacity: spotlightOpacity}}
                    className="museum-spotlight-cone -mt-12 mb-2 h-14 w-[200px] transition-opacity duration-200 sm:w-[250px]"
                  />

                  {/* Frameless Museum Wall Print Mounted Flush on Corridor Wall */}
                  <button
                    type="button"
                    onClick={() => openInspectionById(exhibit.id)}
                    aria-label={`Look closer at Exhibit ${exhibit.indexLabel}: ${exhibit.title}`}
                    className="relative block aspect-[4/5] w-full overflow-hidden border-0 bg-[#050505] p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    style={{
                      boxShadow:
                        '0 28px 54px rgba(0, 0, 0, 0.92), 0 8px 18px rgba(0, 0, 0, 0.78)',
                    }}
                  >
                    {!imgBroken ? (
                      <img
                        src={assetSrc}
                        alt={`${exhibit.seriesTitle} — ${exhibit.title}`}
                        draggable={false}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({
                            ...prev,
                            [exhibit.id]: true,
                          }))
                        }
                        className="h-full w-full object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-[#0B0B0B] p-4 text-center">
                        <span className="font-eyebrow-mono text-[11px] text-[#707070]">
                          EXH. {exhibit.indexLabel}
                        </span>
                        <span className="font-display-card mt-2 text-sm text-[#F5F5F5]">
                          {exhibit.title}
                        </span>
                      </div>
                    )}

                    {/* Soft Edge Blending & Natural Wall Lighting Gradient */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 16%, transparent 74%, rgba(5,5,5,0.48) 100%), radial-gradient(96% 96% at 50% 50%, transparent 66%, rgba(5,5,5,0.36) 100%)',
                      }}
                    />

                    {/* Minimalist Floating LOOK CLOSER Affordance */}
                    <span
                      className={`pointer-events-none absolute inset-x-0 bottom-3 flex justify-center transition-all duration-200 ${
                        isForegroundFocus
                          ? 'opacity-90 sm:opacity-0 sm:translate-y-1 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100'
                          : 'opacity-0 translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'
                      }`}
                    >
                      <span className="museum-glass-pill font-eyebrow-mono inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] tracking-[0.16em] text-[#F5F5F5]">
                        <Eye className="h-3 w-3" strokeWidth={1.75} />
                        <span>LOOK CLOSER</span>
                      </span>
                    </span>
                  </button>

                  {/* Minimalist Wall Plaque Beneath Print (fades cleanly on distant background bays) */}
                  <div
                    style={{opacity: Number(plaqueOpacity.toFixed(3))}}
                    className="mt-2.5 w-full text-center transition-opacity duration-150"
                  >
                    <p className="font-eyebrow-mono text-[9.5px] tracking-[0.15em] text-[#787878] sm:text-[10px]">
                      EXH. {exhibit.indexLabel} · {exhibit.seriesTitle}
                    </p>
                    <h3 className="font-display-card mt-0.5 text-xs font-medium text-[#F5F5F5] sm:text-sm">
                      {exhibit.title}
                    </h3>
                    <p className="mt-0.5 text-[10.5px] text-[#8A8A8A]">
                      {exhibit.chronology}
                    </p>
                  </div>

                  {/* Soft Overhead Light Wash on Floor Below Wall Exhibit */}
                  <div
                    aria-hidden="true"
                    style={{opacity: spotlightOpacity}}
                    className="museum-floor-beam mt-2 h-6 w-[180px] sm:w-[220px]"
                  />
                </article>
              );
            })}

            {/* Corridor End Destination: Progressive Mist-Revealed "WE START FROM HERE" + Twin White Pedestals */}
            {(() => {
              const finalePose = computeCorridorPose(
                FINALE_STATION_INDEX,
                cameraPos,
                viewportWidth,
              );
              if (finalePose.culled) return null;

              const silverSrc = resolveAssetUrl(
                TERMINAL_SCULPTURES[0].imagePath,
                import.meta.env.BASE_URL,
              );
              const goldSrc = resolveAssetUrl(
                TERMINAL_SCULPTURES[1].imagePath,
                import.meta.env.BASE_URL,
              );

              const effectiveFinaleOpacity = Number(
                Math.min(finalePose.opacity, finaleFog.finaleOpacity).toFixed(4),
              );

              return (
                <div
                  data-finale-pavilion="true"
                  style={{
                    transform: `translate3d(0px, -12px, ${finalePose.translateZ}px)`,
                    opacity: effectiveFinaleOpacity,
                    filter:
                      finaleFog.finaleBlurPx > 0.15
                        ? `blur(${finaleFog.finaleBlurPx}px)`
                        : undefined,
                    zIndex: finalePose.zIndex,
                  }}
                  className="pointer-events-auto absolute flex w-[340px] flex-col items-center will-change-transform sm:w-[560px] lg:w-[660px]"
                >
                  {/* Seamless Dark Rear Corridor Wall Housing Statement + Sculptures */}
                  <div
                    className="relative flex w-full flex-col items-center px-3 pt-2 pb-5 sm:px-6 sm:pt-4 sm:pb-6"
                    style={{
                      background:
                        'radial-gradient(72% 68% at 50% 44%, rgba(16, 16, 16, 0.94) 0%, rgba(7, 7, 7, 0.85) 58%, rgba(5, 5, 5, 0) 100%)',
                    }}
                  >
                    {/* Illuminated End-of-Hall Statement Directly Behind & Above Both Pedestals */}
                    <div className="mb-3 flex w-full flex-col items-center text-center sm:mb-4">
                      <p className="font-eyebrow-mono mb-1 text-[9px] tracking-[0.22em] text-[#7D7D7D] sm:text-[10px]">
                        CORRIDOR TERMINUS · DUALITY OF FORM
                      </p>
                      <p className="font-display-bebas museum-statement-halo text-4xl tracking-[0.07em] text-[#F5F5F5] sm:text-5xl lg:text-[4rem]">
                        WE START FROM HERE
                      </p>
                    </div>

                    {/* Two Separate Matte White 3D Museum Pedestals Standing Side by Side */}
                    <div className="grid w-full grid-cols-2 items-end gap-4 sm:gap-12 lg:gap-16">
                      {/* Left Matte White Pedestal: Silver Bust */}
                      <div className="group relative flex flex-col items-center">
                        <div
                          aria-hidden="true"
                          style={{opacity: finaleFog.spotlightIntensity}}
                          className="museum-spotlight-cone -mt-2 mb-1 h-10 w-28 sm:h-11 sm:w-44"
                        />

                        <button
                          type="button"
                          onClick={() => openInspectionById('statue-silver')}
                          aria-label="Inspect 00 Raw Potential silver sculpture"
                          className="relative flex w-full flex-col items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                          <div className="relative z-10 -mb-2 h-32 w-32 sm:-mb-2.5 sm:h-40 sm:w-40 lg:h-44 lg:w-44">
                            {!failedImages['statue-silver'] ? (
                              <img
                                src={silverSrc}
                                alt="00 Raw Potential monochrome silver bust on left white pedestal"
                                draggable={false}
                                loading="eager"
                                referrerPolicy="no-referrer"
                                onError={() =>
                                  setFailedImages((prev) => ({
                                    ...prev,
                                    'statue-silver': true,
                                  }))
                                }
                                className="museum-statue-blend h-full w-full object-contain object-bottom transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1"
                                style={{
                                  filter:
                                    'drop-shadow(0 16px 22px rgba(0, 0, 0, 0.85))',
                                }}
                              />
                            ) : null}

                            <span className="museum-glass-pill font-eyebrow-mono pointer-events-none absolute inset-x-0 bottom-4 mx-auto inline-flex w-max items-center gap-1 rounded-full px-2.5 py-1 text-[9px] tracking-[0.14em] text-[#F5F5F5] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                              <Eye className="h-2.5 w-2.5" strokeWidth={1.75} />
                              <span>LOOK CLOSER</span>
                            </span>
                          </div>

                          {/* Matte White 3D Pedestal Column */}
                          <div className="relative flex w-36 flex-col items-center sm:w-48 lg:w-52">
                            <div className="museum-white-pedestal-top relative z-0 h-4 w-[92%] sm:h-5" />
                            <span
                              aria-hidden="true"
                              className="pointer-events-none -mt-2 h-2 w-24 rounded-full bg-black/30 blur-[3px] sm:w-32"
                            />
                            <div className="museum-white-pedestal-column relative z-10 flex min-h-[60px] w-full flex-col items-center justify-center border-t border-white/80 px-2 py-2 text-center sm:min-h-[70px]">
                              <span className="font-eyebrow-mono text-[9.5px] font-semibold tracking-[0.14em] text-[#171717] sm:text-[11px]">
                                00
                              </span>
                              <span className="font-eyebrow-mono mt-0.5 text-[8.5px] tracking-[0.11em] text-[#3A3A3A] sm:text-[10px]">
                                RAW POTENTIAL
                              </span>
                            </div>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none mt-1 h-3 w-[108%] rounded-full bg-black/85 blur-[6px]"
                            />
                          </div>
                        </button>
                      </div>

                      {/* Right Matte White Pedestal: Golden 0101 Bust */}
                      <div className="group relative flex flex-col items-center">
                        <div
                          aria-hidden="true"
                          style={{opacity: finaleFog.spotlightIntensity}}
                          className="museum-spotlight-cone -mt-2 mb-1 h-10 w-28 sm:h-11 sm:w-44"
                        />

                        <button
                          type="button"
                          onClick={() => openInspectionById('statue-gold')}
                          aria-label="Inspect 0101 Sovereign Intellect golden sculpture"
                          className="relative flex w-full flex-col items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                          <div className="relative z-10 -mb-2 h-32 w-32 sm:-mb-2.5 sm:h-40 sm:w-40 lg:h-44 lg:w-44">
                            {!failedImages['statue-gold'] ? (
                              <img
                                src={goldSrc}
                                alt="0101 Sovereign Intellect golden bust on right white pedestal"
                                draggable={false}
                                loading="eager"
                                referrerPolicy="no-referrer"
                                onError={() =>
                                  setFailedImages((prev) => ({
                                    ...prev,
                                    'statue-gold': true,
                                  }))
                                }
                                className="museum-statue-blend h-full w-full object-contain object-bottom transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1"
                                style={{
                                  filter:
                                    'drop-shadow(0 16px 22px rgba(0, 0, 0, 0.85))',
                                }}
                              />
                            ) : null}

                            <span className="museum-glass-pill font-eyebrow-mono pointer-events-none absolute inset-x-0 bottom-4 mx-auto inline-flex w-max items-center gap-1 rounded-full px-2.5 py-1 text-[9px] tracking-[0.14em] text-[#F5F5F5] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                              <Eye className="h-2.5 w-2.5" strokeWidth={1.75} />
                              <span>LOOK CLOSER</span>
                            </span>
                          </div>

                          {/* Matte White 3D Pedestal Column */}
                          <div className="relative flex w-36 flex-col items-center sm:w-48 lg:w-52">
                            <div className="museum-white-pedestal-top relative z-0 h-4 w-[92%] sm:h-5" />
                            <span
                              aria-hidden="true"
                              className="pointer-events-none -mt-2 h-2 w-24 rounded-full bg-black/30 blur-[3px] sm:w-32"
                            />
                            <div className="museum-white-pedestal-column relative z-10 flex min-h-[60px] w-full flex-col items-center justify-center border-t border-white/80 px-2 py-2 text-center sm:min-h-[70px]">
                              <span className="font-eyebrow-mono text-[9.5px] font-semibold tracking-[0.14em] text-[#171717] sm:text-[11px]">
                                0101
                              </span>
                              <span className="font-eyebrow-mono mt-0.5 text-[8.5px] tracking-[0.09em] text-[#3A3A3A] sm:text-[10px]">
                                SOVEREIGN INTELLECT
                              </span>
                            </div>
                            <span
                              aria-hidden="true"
                              className="pointer-events-none mt-1 h-3 w-[108%] rounded-full bg-black/85 blur-[6px]"
                            />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Single Floating Minimalist Progress Hairline & Glass Skip / Continue Pill */}
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex flex-col items-center gap-2.5 px-4 sm:bottom-7">
            <div
              aria-hidden="true"
              className="relative h-px w-36 overflow-hidden bg-white/[0.14] sm:w-48"
            >
              <div
                style={{
                  transform: `scaleX(${progress01})`,
                }}
                className="absolute inset-0 origin-left bg-white/80 transition-transform duration-150"
              />
            </div>

            <button
              type="button"
              onClick={completeAndExitCorridor}
              aria-label={
                nearFinaleCta
                  ? 'Continue below to Latest from Lab Log'
                  : 'Skip 3D corridor and continue to Latest from Lab Log'
              }
              className="museum-glass-pill font-eyebrow-mono pointer-events-auto inline-flex min-h-[40px] items-center gap-2 rounded-full px-5 py-2 text-[11px] tracking-[0.14em] text-[#F5F5F5] transition-[background-color,border-color,transform] duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span>{nearFinaleCta ? 'Continue Below' : 'Skip Corridor'}</span>
              <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {/* High-Resolution Exhibit Inspection Modal */}
      {activeModalItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Exhibit ${activeModalItem.code}: ${activeModalItem.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md sm:p-6"
          onClick={() => setActiveInspectionIndex(null)}
        >
          <div
            className="museum-modal-enter relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-white/[0.16] bg-[#0B0B0B] p-4 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-white/[0.08] pb-3.5">
              <div className="min-w-0">
                <p className="font-eyebrow-mono truncate text-[11px] text-[#8A8A8A]">
                  {activeModalItem.code} · {activeModalItem.series}
                </p>
                <h3 className="font-display-heading truncate text-lg font-semibold text-[#F5F5F5] sm:text-xl">
                  {activeModalItem.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveInspectionIndex(null)}
                aria-label="Close exhibit viewer"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-white/[0.14] bg-[#141414] text-[#F5F5F5] transition-colors hover:border-white/35 hover:bg-[#1E1E1E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto lg:grid-cols-12">
              <div className="flex items-center justify-center border border-white/[0.08] bg-[#050505] p-3 lg:col-span-8">
                <img
                  src={resolveAssetUrl(
                    activeModalItem.imagePath,
                    import.meta.env.BASE_URL,
                  )}
                  alt={`${activeModalItem.series} — ${activeModalItem.title}`}
                  referrerPolicy="no-referrer"
                  className="max-h-[58vh] w-auto object-contain lg:max-h-[66vh]"
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                  }}
                />
              </div>

              <div className="flex flex-col justify-between gap-6 lg:col-span-4">
                <dl className="space-y-4">
                  <div className="border-b border-white/[0.08] pb-3">
                    <dt className="font-eyebrow-mono text-[10px] text-[#707070]">
                      ACCESSION CODE
                    </dt>
                    <dd className="font-mono-tabular mt-1 text-sm text-[#F5F5F5]">
                      {activeModalItem.code}
                    </dd>
                  </div>

                  <div className="border-b border-white/[0.08] pb-3">
                    <dt className="font-eyebrow-mono text-[10px] text-[#707070]">
                      CHRONOLOGY & PHASE
                    </dt>
                    <dd className="mt-1 text-sm text-[#F5F5F5]">
                      {activeModalItem.chronology}
                    </dd>
                  </div>

                  <div className="border-b border-white/[0.08] pb-3">
                    <dt className="font-eyebrow-mono text-[10px] text-[#707070]">
                      EDITION & FINISH
                    </dt>
                    <dd className="mt-1 text-sm text-[#D4D4D4]">
                      {activeModalItem.finish}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-eyebrow-mono text-[10px] text-[#707070]">
                      CURATOR NOTE
                    </dt>
                    <dd className="font-editorial-body mt-2 text-sm text-[#B8B8B8]">
                      {activeModalItem.note}
                    </dd>
                  </div>
                </dl>

                <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveInspectionIndex(
                        (prev) =>
                          ((prev ?? 0) - 1 + inspectionItems.length) %
                          inspectionItems.length,
                      )
                    }
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 border border-white/[0.14] bg-[#141414] px-3 py-2 text-xs font-medium text-[#F5F5F5] transition-colors hover:border-white/35 hover:bg-[#1E1E1E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                    <span>Prev Exhibit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveInspectionIndex(
                        (prev) => ((prev ?? 0) + 1) % inspectionItems.length,
                      )
                    }
                    className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 border border-white/[0.14] bg-[#141414] px-3 py-2 text-xs font-medium text-[#F5F5F5] transition-colors hover:border-white/35 hover:bg-[#1E1E1E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span>Next Exhibit</span>
                    <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
