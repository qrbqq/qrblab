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
  const logoSrc = resolveAssetUrl('images/logo.png', import.meta.env.BASE_URL);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    {to: '/research', label: t.nav.research, end: false},
    {to: '/about', label: t.nav.about, end: false},
  ];

  return (
    <>
      <header className="glass-header sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)]"
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
            <span className="text-base font-bold tracking-tight text-[var(--text-primary)] sm:text-lg">
              {siteConfig.brandName}
            </span>
            <span
              aria-hidden="true"
              className="hidden h-1 w-1 rounded-full bg-[var(--text-secondary)]/50 lg:inline-block"
            />
            <span className="font-mono-tabular hidden text-[10px] font-medium tracking-[0.1em] text-[var(--text-secondary)] lg:inline-block">
              {t.nav.subLabel}
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] p-1 md:flex"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({isActive}) =>
                  `inline-flex min-h-[34px] shrink-0 items-center whitespace-nowrap rounded-full px-4 py-1 text-xs font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--focus-ring)] ${
                    isActive
                      ? 'bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`
                }
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs transition-colors hover:border-[var(--border-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </button>

            <Link
              to="/research"
              className="hidden min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--btn-primary-bg)] px-4 py-1.5 text-xs font-medium text-[var(--btn-primary-text)] shadow-xs transition-colors hover:bg-[var(--btn-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:inline-flex"
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
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
            className="border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] md:hidden"
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
                  className={({isActive}) =>
                    `flex min-h-[44px] items-center rounded-2xl px-4 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[var(--bg-surface-elevated)] font-semibold text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]/60 hover:text-[var(--text-primary)]'
                    }`
                  }
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
