import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {Link} from 'react-router-dom';
import {RotateCcw} from 'lucide-react';
import {siteConfig, siteCopy} from '../data/siteConfig';
import {prefersReducedMotion} from '../hooks/useScrollReveal';
import {useQScore} from '../hooks/useQScore';
import {resolveProfileIdentity} from '../utils/labLog';
import {getAutoSortedSections} from '../utils/navigationRegistry';
import {clearAllLocalData} from '../utils/ratings';
import {VerifiedBadge} from './VerifiedBadge';

interface SmartNavMenuProps {
  open: boolean;
  onClose: () => void;
  activePathname: string;
  onResetSuccess: (message: string) => void;
}

const MENU_EXIT_DURATION_MS = 190;

export function SmartNavMenu({
  open,
  onClose,
  activePathname,
  onResetSuccess,
}: SmartNavMenuProps) {
  const [isRendered, setIsRendered] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const qScore = useQScore();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    if (open) {
      setIsRendered(true);
      setIsClosing(false);
      return;
    }

    if (isRendered) {
      if (prefersReducedMotion()) {
        setIsClosing(false);
        setIsRendered(false);
        return;
      }
      setIsClosing(true);
      exitTimerRef.current = window.setTimeout(() => {
        setIsClosing(false);
        setIsRendered(false);
        exitTimerRef.current = null;
      }, MENU_EXIT_DURATION_MS);
    }

    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [open, isRendered]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    const handlePointerDownOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (target.closest('[data-smart-menu-trigger="true"]')) return;
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDownOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDownOutside);
    };
  }, [open, onClose]);

  if (!isRendered) {
    return null;
  }

  const primaryProfile = resolveProfileIdentity(siteConfig);
  const dynamicSections = getAutoSortedSections().filter(
    (section) => section.id !== 'lab-log',
  );

  const isHomeActive = activePathname === '/';
  const isProfile1Active =
    activePathname === '/log' || activePathname.startsWith('/log/');
  const isAboutActive =
    activePathname === '/about' || activePathname.startsWith('/about/');

  const chipMotionClass = isClosing ? 'visionos-chip-exit' : 'visionos-chip-enter';
  const backdropMotionClass = isClosing
    ? 'smart-backdrop-exit'
    : 'smart-backdrop-enter';

  const getChipDelayStyle = (index: number): CSSProperties | undefined =>
    isClosing
      ? undefined
      : ({'--chip-delay': `${index * 28}ms`} as CSSProperties);

  const handleClearLocalData = () => {
    clearAllLocalData();
    onResetSuccess(siteCopy.settings.clearDataSuccess);
  };

  let chipIndex = 0;

  return (
    <>
      {/* Subtle translucent backdrop scrim for touch & outside click dismissal */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[3px] ${backdropMotionClass}`}
      />

      {/* Transparent container holding separated VisionOS floating frosted-glass chips */}
      <div
        id="smart-nav-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        data-state={isClosing ? 'closing' : 'open'}
        className="fixed top-16 right-4 sm:top-20 sm:right-6 z-50 w-76 sm:w-80 max-w-[calc(100vw-2rem)] text-[var(--text-primary)]"
      >
        <nav aria-label="Main Navigation" className="flex flex-col gap-2">
          {/* 1. Pinned Home Chip */}
          <Link
            to="/"
            onClick={onClose}
            aria-current={isHomeActive ? 'page' : undefined}
            data-active={isHomeActive ? 'true' : 'false'}
            style={getChipDelayStyle(chipIndex++)}
            className={`visionos-nav-chip ${chipMotionClass} group flex min-h-[52px] items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold tracking-tight text-white">
                {siteCopy.nav.home}
              </span>
              <span className="truncate text-[11px] text-white/55">
                Overview &amp; void index
              </span>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap font-mono-tabular text-[10px] uppercase tracking-wider ${
                isHomeActive ? 'font-semibold text-white/90' : 'text-white/45'
              }`}
            >
              Pinned
            </span>
          </Link>

          {/* 2. Profile 1 Chip (Counter 1 + Deep Crimson Verified Seal) */}
          <Link
            to="/log"
            onClick={onClose}
            aria-current={isProfile1Active ? 'page' : undefined}
            data-active={isProfile1Active ? 'true' : 'false'}
            style={getChipDelayStyle(chipIndex++)}
            className={`visionos-nav-chip ${chipMotionClass} group flex min-h-[52px] items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
          >
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <span
                  className="whitespace-nowrap text-sm font-semibold tracking-tight text-white"
                  style={{textTransform: 'none'}}
                >
                  Profile 1
                </span>
                <span className="font-mono-tabular text-[11px] font-medium tabular-nums text-white/65">
                  1
                </span>
                <VerifiedBadge size={16} label="Verified Profile 1" />
              </div>
              <span
                className="truncate text-[11px] text-white/55"
                style={{textTransform: 'none'}}
              >
                {primaryProfile.displayName} · {primaryProfile.handle}
              </span>
            </div>
            <span
              data-testid="smart-menu-q-score"
              className={`shrink-0 whitespace-nowrap font-mono-tabular text-[10px] tabular-nums tracking-wider ${
                isProfile1Active
                  ? 'font-semibold text-white/90'
                  : 'text-white/65'
              }`}
              style={{textTransform: 'none'}}
            >
              {qScore.label}
            </span>
          </Link>

          {/* 3. Dynamic qrb lab Chip */}
          {dynamicSections.map((section) => {
            const isMatch =
              section.id === 'qrb-lab'
                ? activePathname === '/qrb-lab' ||
                  activePathname.startsWith('/qrb-lab/')
                : activePathname === section.to ||
                  activePathname.startsWith(`${section.to}/`);

            return (
              <Link
                key={section.id}
                to={section.to}
                onClick={onClose}
                aria-current={isMatch ? 'page' : undefined}
                data-active={isMatch ? 'true' : 'false'}
                style={getChipDelayStyle(chipIndex++)}
                className={`visionos-nav-chip ${chipMotionClass} group flex min-h-[52px] items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
              >
                <div className="flex min-w-0 flex-col">
                  <span
                    className={`${
                      section.lowercaseStrict ? 'normal-case font-sans ' : ''
                    }truncate text-sm font-semibold tracking-tight text-white`}
                    style={
                      section.lowercaseStrict
                        ? {textTransform: 'none'}
                        : undefined
                    }
                  >
                    {section.label}
                  </span>
                  <span className="truncate text-[11px] text-white/55">
                    {section.description}
                  </span>
                </div>
                <span
                  className={`shrink-0 whitespace-nowrap font-mono-tabular text-[10px] tabular-nums tracking-wider ${
                    isMatch
                      ? 'font-semibold text-white/90'
                      : section.latestTimestamp !== null
                        ? 'text-white/75'
                        : 'text-white/45'
                  }`}
                >
                  {section.badgeText}
                </span>
              </Link>
            );
          })}

          {/* 4. Fixed About Chip */}
          <Link
            to="/about"
            onClick={onClose}
            aria-current={isAboutActive ? 'page' : undefined}
            data-active={isAboutActive ? 'true' : 'false'}
            style={getChipDelayStyle(chipIndex++)}
            className={`visionos-nav-chip ${chipMotionClass} group flex min-h-[52px] items-center justify-between gap-3 rounded-2xl px-4 py-3 text-xs active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
          >
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold tracking-tight text-white">
                {siteCopy.nav.about}
              </span>
              <span className="truncate text-[11px] text-white/55">
                Platform charter &amp; mission
              </span>
            </div>
            <span
              className={`shrink-0 whitespace-nowrap font-mono-tabular text-[10px] uppercase tracking-wider ${
                isAboutActive ? 'font-semibold text-white/90' : 'text-white/45'
              }`}
            >
              Info
            </span>
          </Link>

          {/* 5. Discreet Local Data Reset Chip */}
          <button
            type="button"
            onClick={handleClearLocalData}
            aria-label={siteCopy.settings.clearDataButton}
            style={getChipDelayStyle(chipIndex++)}
            className={`visionos-nav-chip ${chipMotionClass} flex min-h-[46px] w-full items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-xs text-white/65 hover:text-white active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 shrink-0 text-white/50" />
              <span className="truncate">Clear local ratings</span>
            </span>
            <span className="shrink-0 whitespace-nowrap font-mono-tabular text-[10px] uppercase tracking-wider text-white/40">
              Reset
            </span>
          </button>
        </nav>
      </div>
    </>
  );
}
