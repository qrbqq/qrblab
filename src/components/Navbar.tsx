import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {Search, User} from 'lucide-react';
import {siteCopy} from '../data/siteConfig';
import {resolveAssetUrl} from '../utils/papers';
import {LiveSearchOverlay} from './LiveSearchOverlay';
import {SmartNavMenu} from './SmartNavMenu';
import {Toast, type ToastMessage} from './Toast';
import {hasIntroPlayedInMemory} from '../utils/particleIntro';
import {prefersReducedMotion} from '../hooks/useScrollReveal';

interface NavbarProps {
  activePathname?: string;
}

export function Navbar({activePathname}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<number | null>(null);
  const location = useLocation();
  const currentPath = activePathname ?? location.pathname;

  const [introHidden, setIntroHidden] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isAutostart =
      window.location.search.includes('autostart=1') ||
      window.location.hash.includes('autostart=1');
    return (
      currentPath === '/' &&
      !hasIntroPlayedInMemory() &&
      !prefersReducedMotion() &&
      !isAutostart
    );
  });

  const logoSrc = resolveAssetUrl('images/logo.png', import.meta.env.BASE_URL);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const isAutostart =
      typeof window !== 'undefined' &&
      (window.location.search.includes('autostart=1') ||
        window.location.hash.includes('autostart=1'));
    if (currentPath !== '/') {
      setIntroHidden(false);
      return;
    }
    if (hasIntroPlayedInMemory() || prefersReducedMotion() || isAutostart) {
      setIntroHidden(false);
      return;
    }
    const handleIntroState = (e: Event) => {
      const detail = (e as CustomEvent<{active: boolean}>).detail;
      if (detail && typeof detail.active === 'boolean') {
        setIntroHidden(detail.active);
      }
    };
    window.addEventListener('qrblab-intro-state', handleIntroState as EventListener);
    return () => {
      window.removeEventListener('qrblab-intro-state', handleIntroState as EventListener);
    };
  }, [currentPath]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleResetToast = (text: string) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setToast({id: Date.now(), text, variant: 'success'});
    timerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const toggleSearch = () => {
    setMenuOpen(false);
    setSearchOpen((prev) => !prev);
  };

  const toggleMenu = () => {
    setSearchOpen(false);
    setMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* =========================================================================
          1. FIXED TOP-LEFT LOCKUP (Logo + Brand + Borderless Search + Borderless User Icon)
             Always accessible while scrolling, hidden during WebGL Particle Intro
          ========================================================================= */}
      <div
        style={{
          opacity: introHidden ? 0 : 1,
          pointerEvents: introHidden ? 'none' : 'auto',
          visibility: introHidden ? 'hidden' : 'visible',
        }}
        className="fixed top-4 left-4 sm:top-5 sm:left-6 z-40 flex items-center gap-3 sm:gap-4 transition-opacity duration-300"
      >
        {/* Protected Brand Lockup (100% untouched text, font, white color, size, appearance) */}
        <Link
          to="/"
          onClick={() => {
            setMenuOpen(false);
            setSearchOpen(false);
          }}
          className="inline-flex items-center gap-2.5 whitespace-nowrap py-1 transition-opacity active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
        >
          {!logoError ? (
            <img
              src={logoSrc}
              alt=""
              aria-hidden="true"
              onError={() => setLogoError(true)}
              className="brand-logo-img h-8 w-auto shrink-0 object-contain"
            />
          ) : null}
          <span
            className="normal-case text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-lg"
            style={{textTransform: 'none'}}
          >
            qrb
          </span>
        </Link>

        {/* Borderless Transparent Search Magnifying Glass Icon (🔍) */}
        <button
          type="button"
          data-live-search-trigger="true"
          onClick={toggleSearch}
          aria-label={
            searchOpen ? siteCopy.nav.searchClose : siteCopy.nav.searchOpen
          }
          aria-expanded={searchOpen}
          className={`inline-flex h-8 w-8 items-center justify-center bg-transparent border-0 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            searchOpen
              ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]'
              : 'text-white/80 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.38)]'
          }`}
        >
          <Search className="h-[18px] w-[18px]" strokeWidth={1.85} />
        </button>

        {/* Borderless Minimal 2D Line-Art Profile Silhouette Icon (👤) -> Navigates to /log */}
        <Link
          to="/log"
          onClick={() => {
            setMenuOpen(false);
            setSearchOpen(false);
          }}
          aria-label="Founder profile and Lab Log"
          aria-current={currentPath === '/log' ? 'page' : undefined}
          className={`inline-flex h-8 w-8 items-center justify-center bg-transparent border-0 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            currentPath === '/log'
              ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.45)]'
              : 'text-white/80 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.38)]'
          }`}
        >
          <User className="h-[18px] w-[18px]" strokeWidth={1.85} />
        </Link>
      </div>

      {/* =========================================================================
          2. FIXED TOP-RIGHT 3-LINE MENU BUTTON (≡)
             Pure neutral translucent glass, transforms to × when open, stays fixed on scroll
          ========================================================================= */}
      <div
        style={{
          opacity: introHidden ? 0 : 1,
          pointerEvents: introHidden ? 'none' : 'auto',
          visibility: introHidden ? 'hidden' : 'visible',
        }}
        className="fixed top-4 right-4 sm:top-5 sm:right-6 z-50 flex items-center transition-opacity duration-300"
      >
        <button
          type="button"
          data-smart-menu-trigger="true"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="smart-nav-menu"
          aria-label={
            menuOpen ? siteCopy.nav.menuClose : siteCopy.nav.menuOpen
          }
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.05] hover:bg-white/[0.1] active:scale-[0.96] border border-white/[0.14] hover:border-white/[0.28] backdrop-blur-xl shadow-xs text-white/80 hover:text-white transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 4px 16px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Animated 3-line hamburger morphing cleanly into X */}
          <div className="relative h-3.5 w-4 flex flex-col justify-between" aria-hidden="true">
            <span
              className={`block h-[1.5px] w-full bg-current transition-all duration-200 origin-center ${
                menuOpen ? 'translate-y-[6px] rotate-45' : ''
              }`}
            />
            <span
              className={`block h-[1.5px] w-full bg-current transition-all duration-150 ${
                menuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block h-[1.5px] w-full bg-current transition-all duration-200 origin-center ${
                menuOpen ? '-translate-y-[6px] -rotate-45' : ''
              }`}
            />
          </div>
        </button>
      </div>

      {/* Global Live Search Overlay */}
      <LiveSearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Smart Dynamic Auto-Sorted Navigation Menu Drawer */}
      <SmartNavMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activePathname={currentPath}
        onResetSuccess={handleResetToast}
      />

      <Toast toast={toast} />
    </>
  );
}
