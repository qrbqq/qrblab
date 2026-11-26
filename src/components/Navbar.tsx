import {
  useEffect,
  useRef,
  useState,
} from 'react';
import {Link, NavLink, useLocation} from 'react-router-dom';
import {Menu, Search, Settings, X} from 'lucide-react';
import {siteCopy} from '../data/i18n';
import {resolveAssetUrl} from '../utils/papers';
import {LiveSearchOverlay} from './LiveSearchOverlay';
import {SettingsModal} from './SettingsModal';
import {Toast, type ToastMessage} from './Toast';
import {hasIntroPlayedInMemory} from '../utils/particleIntro';
import {prefersReducedMotion} from '../hooks/useScrollReveal';

interface NavbarProps {
  activePathname?: string;
}

type NavKey = '/' | '/qrb-lab' | '/log' | '/about';

function resolveActiveNavKey(pathname: string): NavKey | null {
  if (pathname === '/') {
    return '/';
  }
  if (pathname === '/qrb-lab' || pathname.startsWith('/qrb-lab/')) {
    return '/qrb-lab';
  }
  if (pathname === '/log' || pathname.startsWith('/log/')) {
    return '/log';
  }
  if (pathname === '/about' || pathname.startsWith('/about/')) {
    return '/about';
  }
  return null;
}

export function Navbar({activePathname}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<number | null>(null);
  const location = useLocation();
  const currentPath = activePathname ?? location.pathname;

  const [introHidden, setIntroHidden] = useState(() => {
    if (typeof window === 'undefined') return false;
    return currentPath === '/' && !hasIntroPlayedInMemory() && !prefersReducedMotion();
  });

  const logoSrc = resolveAssetUrl('images/logo.png', import.meta.env.BASE_URL);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (currentPath !== '/') {
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
    if (!mobileMenuOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

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

  const navItems: Array<{
    to: NavKey;
    label: string;
    end: boolean;
    lowercaseStrict?: boolean;
  }> = [
    {to: '/', label: siteCopy.nav.home, end: true},
    {to: '/qrb-lab', label: siteCopy.nav.qrbLab, end: false, lowercaseStrict: true},
    {to: '/log', label: siteCopy.nav.labLog, end: false},
    {to: '/about', label: siteCopy.nav.about, end: false},
  ];

  const activeNavKey = resolveActiveNavKey(currentPath);

  const toggleSearch = () => {
    setMobileMenuOpen(false);
    setSearchOpen((prev) => !prev);
  };

  return (
    <>
      {/* Protected Brand Lockup (Absolute Top-Left, Anchored to Top of Page, Scrolls Naturally) */}
      <Link
        to="/"
        style={{
          opacity: introHidden ? 0 : 1,
          pointerEvents: introHidden ? 'none' : 'auto',
          visibility: introHidden ? 'hidden' : 'visible',
        }}
        className="absolute top-4 left-4 z-40 inline-flex items-center gap-2.5 whitespace-nowrap py-1 sm:top-5 sm:left-6 transition-opacity duration-300 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
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
        <span className="normal-case text-base font-semibold tracking-tight text-[var(--text-primary)] sm:text-lg">
          qrbqq
        </span>
      </Link>

      {/* Unboxed Individual Floating Glass Navigation Pills (Fixed top-right so they stay floating on scroll) */}
      <div
        style={{
          opacity: introHidden ? 0 : 1,
          pointerEvents: introHidden ? 'none' : 'auto',
          visibility: introHidden ? 'hidden' : 'visible',
        }}
        className="fixed top-4 right-4 z-40 flex items-center gap-2 sm:top-5 sm:right-6 font-nav-sans transition-opacity duration-300"
      >
        {/* Search button pill */}
        <button
          type="button"
          data-live-search-trigger="true"
          onClick={toggleSearch}
          aria-label={
            searchOpen ? siteCopy.nav.searchClose : siteCopy.nav.searchOpen
          }
          aria-expanded={searchOpen}
          className="floating-nav-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          <Search className="h-4 w-4" strokeWidth={1.85} />
        </button>

        {/* Desktop Nav Links (each as its own floating pill) */}
        <div className="hidden items-center gap-2 md:flex">
          <NavLink
            to="/"
            end
            className={({isActive}) => {
              const base =
                'floating-nav-chip inline-flex min-h-[40px] items-center whitespace-nowrap rounded-full px-4 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]';
              return `${base} ${
                isActive
                  ? 'floating-nav-chip-active font-semibold text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`;
            }}
          >
            {navItems[0]!.label}
          </NavLink>

          {navItems.slice(1).map((item) => {
            const isLabItem = item.to === '/qrb-lab';
            const caseClass = item.lowercaseStrict ? 'normal-case ' : '';
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({isActive}) => {
                  const match = isActive || (isLabItem && activeNavKey === '/qrb-lab');
                  const base = `${caseClass}floating-nav-chip inline-flex min-h-[40px] items-center whitespace-nowrap rounded-full px-4 text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]`;
                  return `${base} ${
                    match
                      ? 'floating-nav-chip-active font-semibold text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`;
                }}
              >
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {/* Settings button pill */}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          aria-label={siteCopy.settings.openLabel}
          className="floating-nav-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          <Settings className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {/* Mobile menu toggle pill */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={
            mobileMenuOpen ? siteCopy.nav.menuClose : siteCopy.nav.menuOpen
          }
          className="floating-nav-chip inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" strokeWidth={1.5} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen ? (
        <div
          id="mobile-nav-drawer"
          className="fixed top-16 right-4 z-40 w-64 rounded-2xl border border-white/[0.14] bg-[#0e0e0e]/95 p-2 text-[var(--text-primary)] shadow-2xl backdrop-blur-2xl md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({isActive}) => {
                  const caseClass = item.lowercaseStrict ? 'normal-case ' : '';
                  return `${caseClass}flex min-h-[44px] items-center rounded-xl px-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/12 font-semibold text-white'
                      : 'text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]'
                  }`;
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      ) : null}

      <LiveSearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onResetSuccess={handleResetToast}
      />
      <Toast toast={toast} />
    </>
  );
}
