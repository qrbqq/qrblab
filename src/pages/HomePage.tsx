import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight, ChevronDown, ChevronUp} from 'lucide-react';
import {ArchitectureTimelineStrip} from '../components/ArchitectureTimelineStrip';
import {LatestLabLogSection} from '../components/LatestLabLogSection';
import {LatestPublicationsSection} from '../components/LatestPublicationsSection';
import {useLanguage} from '../context/LanguageContext';
import {siteConfig} from '../data/siteConfig';
import {
  getLocalizedList,
  getLocalizedText,
  resolveAssetUrl,
} from '../utils/papers';

type HomeSectionId =
  | 'overview'
  | 'architecture'
  | 'lab-log'
  | 'publications';

const SECTION_ORDER: Array<{
  id: HomeSectionId;
  code: string;
  labelKey: keyof typeof SECTION_LABEL_KEYS;
}> = [
  {id: 'overview', code: '', labelKey: 'overview'},
  {id: 'architecture', code: '01', labelKey: 'architecture'},
  {id: 'lab-log', code: '02', labelKey: 'labLog'},
  {id: 'publications', code: '03', labelKey: 'publications'},
];

const SECTION_LABEL_KEYS = {
  overview: 'overview',
  architecture: 'architecture',
  labLog: 'labLog',
  publications: 'publications',
} as const;

export function HomePage() {
  const {lang, t} = useLanguage();
  const [statementExpanded, setStatementExpanded] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [activeSection, setActiveSection] = useState<HomeSectionId>('overview');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const heroVideoUrl = resolveAssetUrl(
    'images/founder-hero.mp4',
    import.meta.env.BASE_URL,
  );
  const heroPosterUrl = resolveAssetUrl(
    'images/founder-portrait.png',
    import.meta.env.BASE_URL,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion || videoFailed) {
      return;
    }
    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});
  }, [prefersReducedMotion, videoFailed]);

  useEffect(() => {
    const updateActiveSection = () => {
      const scrollMarker = window.scrollY + window.innerHeight * 0.35;
      const docBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 40;

      if (docBottom) {
        setActiveSection('publications');
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

  const statement = siteConfig.projectStatement;
  const statementTitle = getLocalizedText(statement.title, lang);
  const allParagraphs = getLocalizedList(statement.paragraphs, lang);
  const openingParagraph = allParagraphs[0] ?? '';
  const purposeIndex = statement.purposeParagraphIndex;
  const middleParagraphs = allParagraphs.slice(1, purposeIndex);
  const purposeParagraph = allParagraphs[purposeIndex] ?? '';
  const closingParagraphs = allParagraphs.slice(purposeIndex + 1);

  return (
    <div className="relative w-full">
      {/* Desktop-Only Minimalist Sticky Right-Edge Progress Tracker */}
      <nav
        aria-label={t.home.sectionIndexLabel}
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
            const label = t.home.sections[item.labelKey];
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
                  className="pointer-events-none absolute end-full me-2.5 inline-flex translate-x-1.5 items-center gap-1.5 whitespace-nowrap rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface-glass)] px-3 py-1 text-[11px] font-medium text-[var(--text-primary)] opacity-0 shadow-xs backdrop-blur-md transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 rtl:-translate-x-1.5 rtl:group-hover:translate-x-0 rtl:group-focus-visible:translate-x-0"
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

      {/* Full-Bleed Top Ambient Visual Showcase (Sits Directly Behind Transparent Overlay Navbar) */}
      <section
        id="overview"
        aria-label={siteConfig.brandName}
        className="relative flex min-h-[78vh] w-full items-end overflow-hidden bg-[#0B0C0F]"
      >
        {/* Architectural Obsidian Monogram / Radial Backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,#1c1f28_0%,#0b0c0f_76%)]"
        />

        {/* Chromeless, Silent Looping Video or Reduced-Motion Static Poster */}
        {!prefersReducedMotion && !videoFailed ? (
          <video
            ref={videoRef}
            src={heroVideoUrl}
            poster={posterFailed ? undefined : heroPosterUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload noplaybackrate noremoteplayback"
            aria-hidden="true"
            tabIndex={-1}
            onEnded={() => {
              const video = videoRef.current;
              if (video) {
                video.currentTime = 0;
                video.play().catch(() => {});
              }
            }}
            onError={() => setVideoFailed(true)}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[center_12%]"
          />
        ) : !posterFailed ? (
          <img
            src={heroPosterUrl}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            onError={() => setPosterFailed(true)}
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[center_12%]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
          >
            <span className="font-mono-tabular text-7xl font-semibold tracking-tight text-white/10 sm:text-8xl">
              Q
            </span>
          </div>
        )}

        {/* Top & Bottom Contrast Scrims for Effortless Overlay Legibility */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(11,12,15,0.82)_0%,rgba(11,12,15,0.28)_34%,transparent_65%)]"
        />

        {/* Subtle Architectural Registration Marks */}
        <span
          aria-hidden="true"
          className="font-mono-tabular pointer-events-none absolute top-20 end-6 hidden select-none text-xs text-white/25 sm:block"
        >
          +
        </span>
        <span
          aria-hidden="true"
          className="font-mono-tabular pointer-events-none absolute bottom-6 end-6 hidden select-none text-xs text-white/25 sm:block"
        >
          +
        </span>

        {/* Uncluttered Lower-Start Editorial Overlay */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-3 pt-24 pb-8 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
          <div
            style={{'--stagger-delay': '0ms'} as CSSProperties}
            className="home-hero-stagger max-w-md lg:max-w-lg"
          >
            <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-white/75">
              {t.home.heroEyebrow}
            </p>

            <h1 className="mt-2 text-2xl font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.65rem] text-balance">
              {t.home.heroHeadline}
            </h1>

            <p className="font-mono-tabular mt-2.5 text-[11px] font-medium tracking-[0.08em] text-white/65">
              {t.home.eyebrow}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/research"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-[#0B0C0F] shadow-xs transition-all duration-200 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white whitespace-nowrap sm:text-sm"
              >
                <span>{t.home.exploreArchiveShort}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.85} />
              </Link>

              <Link
                to="/log"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/25 bg-white/12 px-5 py-2.5 text-xs font-medium text-white backdrop-blur-md transition-colors duration-200 hover:border-white/40 hover:bg-white/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white whitespace-nowrap sm:text-sm"
              >
                {t.nav.labLog}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content Directly Below the Visual Showcase */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* 1. Slim Iconless Timeline / Spec Strip */}
        <div className="scroll-mt-24">
          <ArchitectureTimelineStrip id="architecture" />
        </div>

        {/* 2. Research Disclaimer & Project Statement Card */}
        <section
          aria-labelledby="statement-heading"
          className="mx-auto mt-7 w-full max-w-5xl scroll-mt-24 sm:mt-8"
        >
          <div className="glass-surface relative overflow-hidden rounded-[2rem] p-6 text-start sm:p-8">
            <span
              aria-hidden="true"
              style={{'--tick-delay': '3s'} as CSSProperties}
              className="home-border-tick pointer-events-none absolute top-0 start-0 h-[1px] w-28"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2
                id="statement-heading"
                className="text-sm font-semibold tracking-tight text-[var(--text-primary)] sm:text-base"
              >
                {statementTitle}
              </h2>

              <button
                type="button"
                onClick={() => setStatementExpanded((prev) => !prev)}
                aria-expanded={statementExpanded}
                className="glass-surface-subtle inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1.5 self-start rounded-full px-4 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:self-auto whitespace-nowrap"
              >
                <span>
                  {statementExpanded
                    ? t.home.collapseStatement
                    : t.home.readFullStatement}
                </span>
                {statementExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                )}
              </button>
            </div>

            <div className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-[15px]">
              <p>{openingParagraph}</p>

              <div
                data-expanded={statementExpanded}
                aria-hidden={!statementExpanded}
                className="statement-collapse-grid"
              >
                <div className="statement-collapse-inner">
                  <div className="space-y-3.5 pt-3.5">
                    {middleParagraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-3.5 font-semibold text-[var(--text-primary)]">
                {purposeParagraph}
              </p>

              {closingParagraphs.length > 0 ? (
                <div
                  data-expanded={statementExpanded}
                  aria-hidden={!statementExpanded}
                  className="statement-collapse-grid"
                >
                  <div className="statement-collapse-inner">
                    <div className="space-y-3.5 pt-3.5">
                      {closingParagraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        {/* 3. Lab Log Preview */}
        <div className="mt-7 scroll-mt-24 sm:mt-8">
          <LatestLabLogSection id="lab-log" />
        </div>

        {/* 4. Latest Publications Showcase */}
        <div className="mt-7 scroll-mt-24 sm:mt-8">
          <LatestPublicationsSection id="publications" />
        </div>
      </div>
    </div>
  );
}
