import {useEffect, useRef, useState} from 'react';
import {Link, NavLink, useLocation} from 'react-router-dom';
import {ArrowRight, Menu, Settings, X} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {siteConfig} from '../data/siteConfig';
import {resolveAssetUrl} from '../utils/papers';
import {SettingsModal} from './SettingsModal';
import {Toast, type ToastMessage} from './Toast';

export function Navbar() {
  const {t} = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<number | null>(null);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [isOverHero, setIsOverHero] = useState(isHome);
  const logoSrc = resolveAssetUrl('images/logo.png', import.meta.env.BASE_URL);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isHome) {
      setIsOverHero(false);
      return;
    }

    const updateNavMode = () => {
      const heroEl = document.getElementById('overview');
      const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight * 0.72;
      const threshold = Math.max(120, heroHeight - 72);
      setIsOverHero(window.scrollY < threshold);
    };

    updateNavMode();
    window.addEventListener('scroll', updateNavMode, {passive: true});
    window.addEventListener('resize', updateNavMode, {passive: true});
    return () => {
      window.removeEventListener('scroll', updateNavMode);
      window.removeEventListener('resize', updateNavMode);
    };
  }, [isHome]);

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

  const navItems = [
    {to: '/', label: t.nav.home, end: true},
    {to: '/log', label: t.nav.labLog, end: false},
    {to: '/research', label: t.nav.research, end: false},
    {to: '/about', label: t.nav.about, end: false},
  ];

  const isOverlay = isHome && isOverHero;

  const headerPositionClass = isHome
    ? 'fixed top-0 inset-x-0 z-40'
    : 'sticky top-0 z-40';

  const headerSurfaceClass = isOverlay
    ? 'border-b-0 bg-transparent shadow-none transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
    : 'glass-header transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]';

  return (
    <>
      <header className={`${headerPositionClass} ${headerSurfaceClass}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className={`inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 ${
              isOverlay
                ? 'focus-visible:outline-white'
                : 'focus-visible:outline-[var(--focus-ring)]'
            }`}
          >
            {!logoError ? (
              <img
                src={logoSrc}
                alt=""
                aria-hidden="true"
                onError={() => setLogoError(true)}
                className={`${
                  isOverlay ? 'brand-logo-overlay' : 'brand-logo-img'
                } h-8 w-auto shrink-0 object-contain transition-[filter] duration-300`}
              />
            ) : null}
            <span
              className={`text-base font-bold tracking-tight transition-colors duration-300 sm:text-lg ${
                isOverlay ? 'text-white' : 'text-[var(--text-primary)]'
              }`}
            >
              {siteConfig.brandName}
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className={`hidden items-center gap-1 rounded-full border p-1 transition-colors duration-300 md:flex ${
              isOverlay
                ? 'border-white/15 bg-white/10 backdrop-blur-md'
                : 'border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)]'
            }`}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({isActive}) => {
                  if (isOverlay) {
                    return `inline-flex min-h-[34px] shrink-0 items-center whitespace-nowrap rounded-full px-4 py-1 text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white ${
                      isActive
                        ? 'bg-white/22 text-white'
                        : 'text-white/85 hover:bg-white/12 hover:text-white'
                    }`;
                  }

                  return `inline-flex min-h-[34px] shrink-0 items-center whitespace-nowrap rounded-full px-4 py-1 text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--focus-ring)] ${
                    isActive
                      ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`;
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label={t.settings.openLabel}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
                isOverlay
                  ? 'border-white/20 bg-white/10 text-white backdrop-blur-md hover:border-white/35 hover:bg-white/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs hover:border-[var(--border-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]'
              }`}
            >
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>

            <Link
              to="/research"
              className={`hidden min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium shadow-xs transition-colors sm:inline-flex ${
                isOverlay
                  ? 'bg-white text-[#0B0C0F] hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                  : 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]'
              }`}
            >
              <span>{t.nav.archiveCta}</span>
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={1.75} />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={mobileMenuOpen ? t.nav.menuClose : t.nav.menuOpen}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors md:hidden ${
                isOverlay
                  ? 'border-white/20 bg-white/10 text-white backdrop-blur-md hover:border-white/35 hover:bg-white/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]'
              }`}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div
            id="mobile-nav-drawer"
            className={`border-t md:hidden ${
              isOverlay
                ? 'border-white/15 bg-[#0B0C0F]/95 text-white backdrop-blur-xl'
                : 'border-[var(--border-hairline)] bg-[var(--bg-surface)]'
            }`}
          >
            <nav
              aria-label="Mobile navigation"
              className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({isActive}) => {
                    if (isOverlay) {
                      return `flex min-h-[44px] items-center rounded-2xl px-4 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-white/16 font-semibold text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`;
                    }
                    return `flex min-h-[44px] items-center rounded-2xl px-4 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--bg-surface-elevated)] font-semibold text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]/60 hover:text-[var(--text-primary)]'
                    }`;
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ) : null}
      </header>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onResetSuccess={handleResetToast}
      />
      <Toast toast={toast} />
    </>
  );
}
