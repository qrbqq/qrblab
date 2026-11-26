import {memo, useEffect, useState} from 'react';
import {siteCopy} from '../data/siteConfig';

export type HomeSectionId =
  | 'overview'
  | 'statement'
  | 'lab-log'
  | 'publications'
  | 'methodology';

const SECTION_ORDER: Array<{
  id: HomeSectionId;
  code: string;
  labelKey: keyof typeof siteCopy.home.sections;
}> = [
  {id: 'overview', code: '', labelKey: 'overview'},
  {id: 'statement', code: '01', labelKey: 'statement'},
  {id: 'lab-log', code: '02', labelKey: 'labLog'},
  {id: 'publications', code: '03', labelKey: 'publications'},
  {id: 'methodology', code: '04', labelKey: 'methodology'},
];

export const HomeSectionTracker = memo(function HomeSectionTracker() {
  const [activeSection, setActiveSection] = useState<HomeSectionId>('overview');

  useEffect(() => {
    const updateActiveSection = () => {
      const scrollMarker = window.scrollY + window.innerHeight * 0.35;
      const docBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 40;

      if (docBottom) {
        setActiveSection('methodology');
        return;
      }

      let current: HomeSectionId = 'overview';
      for (const item of SECTION_ORDER) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollMarker >= top) {
            current = item.id;
          }
        }
      }
      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, {passive: true});
    return () => window.removeEventListener('scroll', updateActiveSection);
  }, []);

  const handleJumpToSection = (id: HomeSectionId) => {
    setActiveSection(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  const activeIndex = Math.max(
    0,
    SECTION_ORDER.findIndex((item) => item.id === activeSection),
  );
  const progressRatio =
    SECTION_ORDER.length > 1 ? activeIndex / (SECTION_ORDER.length - 1) : 0;

  return (
    <nav
      aria-label={siteCopy.home.sectionIndexLabel}
      className="fixed end-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center xl:flex"
    >
      <div className="relative flex flex-col items-center gap-2 py-1">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-4 bottom-4 left-1/2 w-px -translate-x-1/2 bg-[var(--border-strong)]/60"
        />
        <span
          aria-hidden="true"
          style={{transform: `scaleY(${progressRatio})`}}
          className="home-nav-pill pointer-events-none absolute top-4 bottom-4 left-1/2 w-px -translate-x-1/2 origin-top bg-[var(--text-primary)]/50"
        />

        {SECTION_ORDER.map((item) => {
          const isActive = activeSection === item.id;
          const label = siteCopy.home.sections[item.labelKey];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleJumpToSection(item.id)}
              aria-label={label}
              aria-current={isActive ? 'location' : undefined}
              className="group relative flex h-7 w-7 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute end-full me-2.5 inline-flex translate-x-1.5 items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface-glass)] px-3 py-1 text-[11px] font-medium text-[var(--text-primary)] opacity-0 shadow-xs backdrop-blur-md transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
              >
                {item.code ? (
                  <span className="font-mono-tabular text-[10px] text-[var(--text-secondary)]">
                    {item.code}
                  </span>
                ) : null}
                <span>{label}</span>
              </span>

              <span
                aria-hidden="true"
                className={`home-tracker-dot relative z-10 rounded-full ${
                  isActive
                    ? 'home-tracker-dot-active h-2.5 w-2.5 scale-110 bg-[var(--text-primary)] ring-2 ring-[var(--bg-canvas)]'
                    : 'h-1.5 w-1.5 bg-[var(--text-secondary)]/45 group-hover:scale-125 group-hover:bg-[var(--text-primary)]'
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
});
