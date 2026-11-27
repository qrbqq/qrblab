import {useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';
import {RotateCcw, Sparkles} from 'lucide-react';
import {siteConfig, siteCopy} from '../data/siteConfig';
import {clearAllLocalData} from '../utils/ratings';
import {getAutoSortedSections} from '../utils/navigationRegistry';
import {resolveProfileIdentity} from '../utils/labLog';
import {VerifiedBadge} from './VerifiedBadge';

interface SmartNavMenuProps {
  open: boolean;
  onClose: () => void;
  activePathname: string;
  onResetSuccess: (message: string) => void;
}

export function SmartNavMenu({
  open,
  onClose,
  activePathname,
  onResetSuccess,
}: SmartNavMenuProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

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

  if (!open) {
    return null;
  }

  const primaryProfile = resolveProfileIdentity('primary', siteConfig);
  const secondaryProfile = resolveProfileIdentity('secondary', siteConfig);

  // Filter out the legacy lab-log entry from auto-sorted list since Profile 1 & Profile 2 are dedicated
  const dynamicSections = getAutoSortedSections().filter(
    (section) => section.id !== 'lab-log',
  );
  const isHomeActive = activePathname === '/';
  const isProfile1Active =
    activePathname === '/log' || activePathname.startsWith('/log/');
  const isProfile2Active =
    activePathname === '/profile-2' || activePathname.startsWith('/profile-2/');
  const isAboutActive =
    activePathname === '/about' || activePathname.startsWith('/about/');

  const handleClearLocalData = () => {
    clearAllLocalData();
    onResetSuccess(siteCopy.settings.clearDataSuccess);
  };

  return (
    <>
      {/* Subtle backdrop scrim for touch & outside click dismissal */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200"
      />

      {/* Floating Translucent Obsidian Glass Menu Panel */}
      <div
        id="smart-nav-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className="fixed top-16 right-4 sm:top-20 sm:right-6 z-50 w-76 sm:w-84 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/[0.14] bg-[#0A0A0A]/95 p-3 text-[var(--text-primary)] shadow-2xl backdrop-blur-2xl smart-menu-enter"
        style={{
          boxShadow:
            '0 24px 60px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Subtle Panel Header */}
        <div className="flex items-center justify-between px-2.5 pt-1 pb-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono-tabular tracking-wider uppercase text-white/45">
            <Sparkles className="h-3 w-3 text-white/50" />
            <span>Navigation System</span>
          </div>
          <span className="font-mono-tabular text-[9px] uppercase tracking-widest text-white/35">
            Verified
          </span>
        </div>

        <nav aria-label="Main Navigation" className="flex flex-col gap-1">
          {/* =========================================================================
              1. PINNED HOME (Always pinned first at the very top)
              ========================================================================= */}
          <Link
            to="/"
            onClick={onClose}
            aria-current={isHomeActive ? 'page' : undefined}
            className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-150 ${
              isHomeActive
                ? 'bg-white/[0.1] border border-white/[0.22] font-semibold text-white shadow-xs'
                : 'border border-transparent text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white">
                {siteCopy.nav.home}
              </span>
              <span className="text-[11px] text-white/50">
                Overview &amp; void index
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-mono-tabular uppercase tracking-wider ${
                isHomeActive
                  ? 'bg-white/20 text-white border border-white/30 font-semibold'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
              }`}
            >
              Pinned
            </span>
          </Link>

          {/* Section Divider Hairline beneath Home */}
          <div className="my-1.5 h-[1px] w-full bg-white/[0.08]" />

          {/* =========================================================================
              2. PROFILE 1 (Red Verified Seal Badge + Counter 1)
              ========================================================================= */}
          <Link
            to="/log"
            onClick={onClose}
            aria-current={isProfile1Active ? 'page' : undefined}
            className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-150 ${
              isProfile1Active
                ? 'bg-white/[0.1] border border-white/[0.22] font-semibold text-white shadow-xs'
                : 'border border-transparent text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold tracking-tight text-white"
                  style={{textTransform: 'none'}}
                >
                  Profile 1
                </span>
                <span className="inline-flex min-w-[18px] items-center justify-center rounded-full border border-white/[0.14] bg-white/[0.08] px-1.5 py-0.5 text-[10px] font-mono-tabular font-medium leading-none text-white/80">
                  1
                </span>
                <VerifiedBadge
                  size={16}
                  variant="red"
                  label="Verified Profile 1"
                />
              </div>
              <span
                className="text-[11px] text-white/50"
                style={{textTransform: 'none'}}
              >
                {primaryProfile.displayName} · {primaryProfile.handle}
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-mono-tabular uppercase tracking-wider ${
                isProfile1Active
                  ? 'bg-white/20 text-white border border-white/30 font-semibold'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
              }`}
            >
              Primary
            </span>
          </Link>

          {/* Section Divider Hairline beneath Profile 1 */}
          <div className="my-1.5 h-[1px] w-full bg-white/[0.08]" />

          {/* =========================================================================
              3. PROFILE 2 (Blue Verified Seal Badge)
              ========================================================================= */}
          <Link
            to="/profile-2"
            onClick={onClose}
            aria-current={isProfile2Active ? 'page' : undefined}
            className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-150 ${
              isProfile2Active
                ? 'bg-white/[0.1] border border-white/[0.22] font-semibold text-white shadow-xs'
                : 'border border-transparent text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span
                  className="text-sm font-semibold tracking-tight text-white"
                  style={{textTransform: 'none'}}
                >
                  Profile 2
                </span>
                <VerifiedBadge
                  size={16}
                  variant="blue"
                  label="Verified Profile 2"
                />
              </div>
              <span
                className="text-[11px] text-white/50"
                style={{textTransform: 'none'}}
              >
                {secondaryProfile.displayName} · {secondaryProfile.handle}
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-mono-tabular uppercase tracking-wider ${
                isProfile2Active
                  ? 'bg-white/20 text-white border border-white/30 font-semibold'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
              }`}
            >
              Secondary
            </span>
          </Link>

          {/* Section Divider Hairline beneath Profile 2 */}
          <div className="my-1.5 h-[1px] w-full bg-white/[0.08]" />

          {/* =========================================================================
              4. DYNAMIC SECTION (qrb lab)
              ========================================================================= */}
          {dynamicSections.map((section) => {
            const isMatch =
              section.id === 'qrb-lab'
                ? activePathname === '/qrb-lab' ||
                  activePathname.startsWith('/qrb-lab/')
                : activePathname === section.to ||
                  activePathname.startsWith(`${section.to}/`);

            const caseClass = section.lowercaseStrict
              ? 'normal-case lowercase font-sans '
              : '';

            return (
              <Link
                key={section.id}
                to={section.to}
                onClick={onClose}
                aria-current={isMatch ? 'page' : undefined}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-150 ${
                  isMatch
                    ? 'bg-white/[0.1] border border-white/[0.22] font-semibold text-white shadow-xs'
                    : 'border border-transparent text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex flex-col">
                  <span
                    className={`${caseClass}text-sm font-semibold tracking-tight text-white`}
                    style={
                      section.lowercaseStrict
                        ? {textTransform: 'none'}
                        : undefined
                    }
                  >
                    {section.label}
                  </span>
                  <span className="text-[11px] text-white/50">
                    {section.description}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono-tabular tabular-nums tracking-wider ${
                      section.latestTimestamp !== null
                        ? 'bg-white/[0.08] text-white/80 border border-white/[0.12]'
                        : 'bg-white/[0.03] text-white/35 border border-white/[0.05]'
                    }`}
                  >
                    {section.badgeText}
                  </span>
                </div>
              </Link>
            );
          })}

          {/* Section Divider Hairline beneath dynamic section */}
          <div className="my-1.5 h-[1px] w-full bg-white/[0.08]" />

          {/* =========================================================================
              5. FIXED ABOUT SECTION
              ========================================================================= */}
          <Link
            to="/about"
            onClick={onClose}
            aria-current={isAboutActive ? 'page' : undefined}
            className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all duration-150 ${
              isAboutActive
                ? 'bg-white/[0.1] border border-white/[0.22] font-semibold text-white shadow-xs'
                : 'border border-transparent text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white">
                {siteCopy.nav.about}
              </span>
              <span className="text-[11px] text-white/50">
                Platform charter &amp; mission
              </span>
            </div>
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-mono-tabular uppercase tracking-wider ${
                isAboutActive
                  ? 'bg-white/20 text-white border border-white/30 font-semibold'
                  : 'bg-white/[0.03] text-white/35 border border-white/[0.05]'
              }`}
            >
              Info
            </span>
          </Link>
        </nav>

        {/* Section Divider Hairline beneath About */}
        <div className="my-1.5 h-[1px] w-full bg-white/[0.08]" />

        {/* =========================================================================
            6. DISCREET LOCAL DATA RESET FOOTER (Clean, quiet, zero clutter)
            ========================================================================= */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={handleClearLocalData}
            aria-label={siteCopy.settings.clearDataButton}
            className="flex min-h-[38px] w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5 shrink-0 text-white/40" />
              <span>Clear local ratings</span>
            </span>
            <span className="font-mono-tabular text-[9px] uppercase tracking-wider text-white/30">
              Reset
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
