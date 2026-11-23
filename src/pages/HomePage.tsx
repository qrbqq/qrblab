import {useEffect, useState, type CSSProperties} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight, ChevronDown, ChevronUp} from 'lucide-react';
import {CoreResearchMatrix} from '../components/CoreResearchMatrix';
import {LatestPublicationsSection} from '../components/LatestPublicationsSection';
import {PrinciplesSection} from '../components/PrinciplesSection';
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
  | 'principles'
  | 'publications';

const SECTION_ORDER: Array<{id: HomeSectionId; code: string}> = [
  {id: 'overview', code: ''},
  {id: 'architecture', code: '01'},
  {id: 'principles', code: '02'},
  {id: 'publications', code: '03'},
];

const HERO_PERIPHERY_MARKERS: Array<{
  className: string;
  duration: string;
  delay: string;
  symbol: string;
}> = [
  {
    className: 'start-2 top-6 sm:start-6 sm:top-8',
    duration: '9s',
    delay: '0s',
    symbol: '+',
  },
  {
    className: 'end-2 top-10 sm:end-6 sm:top-12',
    duration: '11s',
    delay: '1.8s',
    symbol: '+',
  },
  {
    className: 'start-4 bottom-24 hidden sm:block lg:start-8',
    duration: '10.5s',
    delay: '3.2s',
    symbol: '+',
  },
  {
    className: 'end-4 bottom-20 hidden sm:block lg:end-8',
    duration: '8.5s',
    delay: '4.5s',
    symbol: '+',
  },
];

export function HomePage() {
  const {lang, t} = useLanguage();
  const [statementExpanded, setStatementExpanded] = useState(false);
  const [heroLogoError, setHeroLogoError] = useState(false);
  const [activeSection, setActiveSection] = useState<HomeSectionId>('overview');
  const logoSrc = resolveAssetUrl('images/logo.png', import.meta.env.BASE_URL);

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

  const statement = siteConfig.projectStatement;
  const statementTitle = getLocalizedText(statement.title, lang);
  const allParagraphs = getLocalizedList(statement.paragraphs, lang);
  const openingParagraph = allParagraphs[0] ?? '';
  const purposeIndex = statement.purposeParagraphIndex;
  const middleParagraphs = allParagraphs.slice(1, purposeIndex);
  const purposeParagraph = allParagraphs[purposeIndex] ?? '';
  const closingParagraphs = allParagraphs.slice(purposeIndex + 1);

  return (
    <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 xl:pe-44 min-[1420px]:pe-8">
      {/* Desktop-Only Animated Sticky Right-Edge Section Navigator */}
      <nav
        aria-label={t.home.sectionIndexLabel}
        className="glass-surface fixed end-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col rounded-2xl p-1.5 xl:flex"
      >
        <div className="relative flex flex-col gap-1">
          <span
            aria-hidden="true"
            style={{transform: `translate3d(0, ${activeIndex * 38}px, 0)`}}
            className="home-nav-pill pointer-events-none absolute inset-x-0 top-0 h-[34px] rounded-xl bg-[var(--btn-primary-bg)] shadow-xs"
          />

          {SECTION_ORDER.map((item) => {
            const isActive = activeSection === item.id;
            const label = t.home.sections[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleJumpToSection(item.id)}
                aria-current={isActive ? 'location' : undefined}
                className={`relative z-10 flex h-[34px] items-center gap-2 rounded-xl px-2.5 text-start text-[11px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                  isActive
                    ? 'font-semibold text-[var(--btn-primary-text)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.code ? (
                  <span className="font-mono-tabular text-[10px] tracking-wider">
                    {item.code}
                  </span>
                ) : null}
                <span className="whitespace-nowrap">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Overview & Statement Showcase with Staggered Mount Choreography */}
      <section
        id="overview"
        className="relative mx-auto max-w-4xl scroll-mt-24 text-center"
      >
        {/* Living Architectural Blueprint Periphery (Outer Hero Margins) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-6 -inset-y-4 overflow-hidden sm:-inset-x-10"
        >
          {HERO_PERIPHERY_MARKERS.map((marker, idx) => (
            <span
              key={idx}
              style={
                {
                  '--float-duration': marker.duration,
                  '--float-delay': marker.delay,
                } as CSSProperties
              }
              className={`home-periphery-marker font-mono-tabular absolute select-none text-xs leading-none ${marker.className}`}
            >
              {marker.symbol}
            </span>
          ))}
          <span
            style={{'--tick-delay': '1.5s'} as CSSProperties}
            className="home-border-tick absolute top-0 start-0 hidden h-[1px] w-24 sm:block"
          />
        </div>

        {/* Step 1 (0ms): Eyebrow tag & centered Q logo */}
        <div
          style={{'--stagger-delay': '0ms'} as CSSProperties}
          className="home-hero-stagger relative z-10"
        >
          <div className="glass-surface-subtle inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono-tabular text-[11px] font-medium tracking-[0.08em] text-[var(--text-eyebrow)]">
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-primary)]"
              aria-hidden="true"
            />
            <span>{t.home.eyebrow}</span>
          </div>

          <h1 className="sr-only">{siteConfig.brandName}</h1>
          {!heroLogoError ? (
            <img
              src={logoSrc}
              alt={siteConfig.brandName}
              onError={() => setHeroLogoError(true)}
              className="brand-logo-img mx-auto mt-6 h-16 w-auto object-contain sm:h-20"
            />
          ) : (
            <p className="mt-6 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              {siteConfig.brandName}
            </p>
          )}
        </div>

        {/* Step 2 (90ms): Centered Research Disclaimer & Project Statement card */}
        <div
          style={{'--stagger-delay': '90ms'} as CSSProperties}
          className="home-hero-stagger glass-surface relative z-10 mx-auto mt-7 overflow-hidden rounded-[2rem] p-6 text-start sm:p-8"
        >
          <span
            aria-hidden="true"
            style={{'--tick-delay': '3s'} as CSSProperties}
            className="home-border-tick pointer-events-none absolute top-0 start-0 h-[1px] w-28"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] sm:text-base">
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

        {/* Step 3 (180ms): Primary CTA button */}
        <div
          style={{'--stagger-delay': '180ms'} as CSSProperties}
          className="home-hero-stagger relative z-10 mt-7 flex justify-center"
        >
          <Link
            to="/research"
            className="inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-full bg-[var(--btn-primary-bg)] px-7 py-3 text-sm font-medium text-[var(--btn-primary-text)] shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--btn-primary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] whitespace-nowrap"
          >
            <span>{t.home.exploreResearch}</span>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.85} />
          </Link>
        </div>
      </section>

      {/* Section 01: Core Architecture Framed Matrix */}
      <div className="mt-16 scroll-mt-24 sm:mt-20">
        <CoreResearchMatrix
          id="architecture"
          eyebrow={t.home.matrixEyebrow}
          animated
        />
      </div>

      {/* Section 02: Principles Framed Matrix */}
      <div className="mt-14 scroll-mt-24 sm:mt-16">
        <PrinciplesSection id="principles" animated />
      </div>

      {/* Section 03: Latest Publications Showcase */}
      <div className="mt-14 scroll-mt-24 sm:mt-16">
        <LatestPublicationsSection id="publications" />
      </div>
    </div>
  );
}
