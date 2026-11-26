import {useEffect, useRef, useState, type AnimationEvent} from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom';
import {Footer} from './components/Footer';
import {Navbar} from './components/Navbar';
import {papers} from './data/papers';
import {AboutPage} from './pages/AboutPage';
import {HomePage} from './pages/HomePage';
import {LabLogPage} from './pages/LabLogPage';
import {NotFoundPage} from './pages/NotFoundPage';
import {PaperDetailPage} from './pages/PaperDetailPage';
import {QrbLabPage} from './pages/QrbLabPage';
import {findPaperBySlug, getLocalizedText} from './utils/papers';
import {
  isExpectedRouteAnimation,
  ROUTE_ENTER_MS,
  ROUTE_EXIT_MS,
  shouldAnimateRouteChange,
  type RouteTransitionPhase,
} from './utils/routeTransition';

function LegacyPaperRedirect() {
  const {slug} = useParams<{slug: string}>();
  return <Navigate to={slug ? `/qrb-lab/${slug}` : '/qrb-lab'} replace />;
}

function getDocumentTitleForPath(pathname: string): string {
  if (pathname === '/') {
    return 'qrbqq';
  }
  if (pathname === '/qrb-lab') {
    return 'qrb lab — qrbqq';
  }
  if (pathname.startsWith('/qrb-lab/')) {
    const slug = pathname.slice('/qrb-lab/'.length);
    const paper = findPaperBySlug(papers, slug);
    if (paper) {
      return `${getLocalizedText(paper.title)} — qrb lab`;
    }
    return 'qrb lab — qrbqq';
  }
  if (pathname === '/log') {
    return 'Lab Log — qrbqq';
  }
  if (pathname === '/about') {
    return 'About — qrbqq';
  }
  return '404 — qrbqq';
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReduced(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return reduced;
}

function AppShell() {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [phase, setPhase] = useState<RouteTransitionPhase>('idle');
  const latestLocationRef = useRef(location);
  latestLocationRef.current = location;

  useEffect(() => {
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    document.documentElement.classList.add('dark');
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = 'dark';
  }, []);

  useEffect(() => {
    document.title = getDocumentTitleForPath(displayLocation.pathname);
  }, [displayLocation.pathname]);

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) {
      if (phase === 'exiting') {
        setDisplayLocation(location);
        setPhase(prefersReducedMotion ? 'idle' : 'entering');
      } else if (location.key !== displayLocation.key) {
        setDisplayLocation(location);
      }
      return;
    }

    if (
      !shouldAnimateRouteChange(
        displayLocation.pathname,
        location.pathname,
        prefersReducedMotion,
      )
    ) {
      window.scrollTo(0, 0);
      setDisplayLocation(location);
      setPhase('idle');
      return;
    }

    if (phase !== 'exiting') {
      setPhase('exiting');
    }
  }, [
    location,
    displayLocation.pathname,
    displayLocation.key,
    phase,
    prefersReducedMotion,
  ]);

  useEffect(() => {
    if (phase === 'exiting') {
      const timer = window.setTimeout(() => {
        window.scrollTo(0, 0);
        setDisplayLocation(latestLocationRef.current);
        setPhase('entering');
      }, ROUTE_EXIT_MS + 35);
      return () => window.clearTimeout(timer);
    }

    if (phase === 'entering') {
      const timer = window.setTimeout(() => {
        setPhase('idle');
      }, ROUTE_ENTER_MS + 40);
      return () => window.clearTimeout(timer);
    }
  }, [phase]);

  const handleTransitionAnimationEnd = (
    event: AnimationEvent<HTMLDivElement>,
  ) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (!isExpectedRouteAnimation(event.animationName, phase)) {
      return;
    }

    if (phase === 'exiting') {
      window.scrollTo(0, 0);
      setDisplayLocation(latestLocationRef.current);
      setPhase('entering');
    } else if (phase === 'entering') {
      setPhase('idle');
    }
  };

  const displayIsHome = displayLocation.pathname === '/';
  const transitionClass =
    phase === 'exiting'
      ? 'page-transition-exit '
      : phase === 'entering'
        ? 'page-transition-enter '
        : '';

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Navbar activePathname={displayLocation.pathname} />
      <div
        key={displayLocation.pathname}
        data-route-phase={phase}
        onAnimationEnd={handleTransitionAnimationEnd}
        className={`${transitionClass}flex flex-1 flex-col`}
      >
        <main
          className={`flex flex-1 flex-col ${displayIsHome ? '' : 'pt-20 sm:pt-24'}`}
        >
          <Routes location={displayLocation}>
            <Route path="/" element={<HomePage />} />
            <Route path="/qrb-lab" element={<QrbLabPage />} />
            <Route path="/qrb-lab/:slug" element={<PaperDetailPage />} />
            <Route path="/log" element={<LabLogPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/research" element={<Navigate to="/qrb-lab" replace />} />
            <Route path="/research/:slug" element={<LegacyPaperRedirect />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}
