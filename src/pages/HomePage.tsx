import {useCallback, useState} from 'react';
import {Link} from 'react-router-dom';
import {
  HeroParticleIntro,
  type IntroVisualState,
} from '../components/HeroParticleIntro';
import {HeroVideoBackdrop} from '../components/HeroVideoBackdrop';
import {HomeSectionTracker} from '../components/HomeSectionTracker';
import {LatestLabLogSection} from '../components/LatestLabLogSection';
import {LatestPublicationsSection} from '../components/LatestPublicationsSection';
import {ArchitecturalMarquee} from '../components/ArchitecturalMarquee';
import {BillboardMarquee} from '../components/BillboardMarquee';
import {EditorialMethodologySection} from '../components/EditorialMethodologySection';
import {KineticHeadline} from '../components/KineticHeadline';
import {StatementCard} from '../components/StatementCard';
import {siteConfig, siteCopy} from '../data/siteConfig';
import {prefersReducedMotion} from '../hooks/useScrollReveal';
import {hasIntroPlayedInMemory} from '../utils/particleIntro';
import {getLocalizedList, getLocalizedText} from '../utils/papers';

function hasAutostartParam(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.search.includes('autostart=1') ||
    window.location.hash.includes('autostart=1')
  );
}

export function HomePage() {
  const [introState, setIntroState] = useState<IntroVisualState>(() => {
    const skipIntro =
      hasIntroPlayedInMemory() || prefersReducedMotion() || hasAutostartParam();
    return skipIntro
      ? {active: false, stage: 'complete', heroReveal: 1}
      : {active: true, stage: 'deep-space', heroReveal: 0};
  });

  const handleIntroStateChange = useCallback((next: IntroVisualState) => {
    setIntroState(next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('qrblab-intro-state', {detail: next}));
    }
  }, []);

  const statement = siteConfig.projectStatement;
  const statementTitle = getLocalizedText(statement.title);
  const allParagraphs = getLocalizedList(statement.paragraphs);
  const openingParagraph = allParagraphs[0] ?? '';
  const purposeIndex = statement.purposeParagraphIndex;
  const middleParagraphs = allParagraphs.slice(1, purposeIndex);
  const purposeParagraph = allParagraphs[purposeIndex] ?? '';
  const closingParagraphs = allParagraphs.slice(purposeIndex + 1);

  return (
    <div className="relative w-full overflow-x-clip">
      {/* Isolated Sticky Right-Edge Progress Tracker (Scroll updates stay isolated from hero video) */}
      {!introState.active ? <HomeSectionTracker /> : null}

      {/* Full-Bleed Top Ambient Visual Showcase + Pure GPU WebGL2 Particle Intro */}
      <section
        id="overview"
        aria-label={siteConfig.brandName}
        data-intro-active={String(introState.active)}
        data-intro-stage={introState.stage}
        className="relative flex min-h-[100svh] w-full items-end overflow-hidden bg-[var(--bg-canvas)]"
      >
        <HeroVideoBackdrop />

        <HeroParticleIntro
          active={introState.active}
          onStateChange={handleIntroStateChange}
        />

        {/* Subtle Architectural Registration Marks */}
        <span
          aria-hidden="true"
          style={{opacity: introState.heroReveal}}
          className="font-mono-tabular pointer-events-none absolute top-20 end-6 z-10 hidden select-none text-xs text-white/25 transition-opacity duration-300 sm:block"
        >
          +
        </span>
        <span
          aria-hidden="true"
          style={{opacity: introState.heroReveal}}
          className="font-mono-tabular pointer-events-none absolute bottom-6 end-6 z-10 hidden select-none text-xs text-white/25 transition-opacity duration-300 sm:block"
        >
          +
        </span>

        {/* Uncluttered Lower-Start Editorial Overlay */}
        <div
          style={{
            opacity: introState.heroReveal,
            transform: `translate3d(0, ${(1 - introState.heroReveal) * 14}px, 0)`,
          }}
          className={`relative z-10 mx-auto w-full max-w-7xl px-3 pt-24 pb-10 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] sm:px-6 sm:pb-14 lg:px-8 lg:pb-16 ${
            introState.heroReveal < 0.25 ? 'pointer-events-none' : ''
          }`}
        >
          <div className="max-w-lg lg:max-w-2xl">
            <p className="font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-white/75">
              {siteCopy.home.heroEyebrow}
            </p>

            <KineticHeadline
              as="h1"
              text={siteCopy.home.heroHeadline}
              triggerReady={!introState.active || introState.heroReveal >= 0.25}
              className="mt-2.5 text-4xl text-[#F5F5F5] sm:text-5xl lg:text-[3.75rem]"
            />

            <p className="font-mono-tabular mt-2.5 text-[11px] font-medium tracking-[0.08em] text-[#9BA1AE]">
              {siteCopy.home.eyebrow}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                to="/qrb-lab"
                className="normal-case inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full border border-[var(--border-strong)] bg-[var(--btn-secondary-bg)] px-5 py-2.5 text-xs font-medium text-[#F4F5F7] backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-[var(--btn-secondary-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:text-sm"
              >
                {siteCopy.home.exploreQrbLab}
              </Link>

              <Link
                to="/log"
                className="inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full border border-[var(--border-strong)] bg-[var(--btn-secondary-bg)] px-5 py-2.5 text-xs font-medium text-[#F4F5F7] backdrop-blur-sm transition-all duration-200 hover:border-white/30 hover:bg-[var(--btn-secondary-hover)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:text-sm"
              >
                {siteCopy.nav.labLog}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Discipline Marquee Strip */}
      <ArchitecturalMarquee />

      {/* Content Directly Below the Visual Showcase */}
      <div className="w-full">
        {/* 1. Research Disclaimer & Project Statement Section */}
        <StatementCard
          title={statementTitle}
          openingParagraph={openingParagraph}
          middleParagraphs={middleParagraphs}
          purposeParagraph={purposeParagraph}
          closingParagraphs={closingParagraphs}
          readFullLabel={siteCopy.home.readFullStatement}
          collapseLabel={siteCopy.home.collapseStatement}
        />

        {/* 2. Full-Bleed Continuous Billboard Marquee */}
        <BillboardMarquee />

        {/* 3. Unboxed Founder Dispatch Feed (Auto-synced with src/data/labLog.ts) */}
        <LatestLabLogSection id="lab-log" />

        {/* 4. Latest Publications Showcase */}
        <LatestPublicationsSection id="publications" />

        {/* 5. Comprehensive Editorial & Technical Methodology Block */}
        <EditorialMethodologySection id="methodology" />
      </div>
    </div>
  );
}
