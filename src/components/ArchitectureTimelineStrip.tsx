import {useState} from 'react';
import {useLanguage} from '../context/LanguageContext';

interface ArchitectureTimelineStripProps {
  id?: string;
}

export function ArchitectureTimelineStrip({
  id = 'architecture',
}: ArchitectureTimelineStripProps) {
  const {t} = useLanguage();
  const [principlesOpen, setPrinciplesOpen] = useState(false);

  return (
    <section
      id={id}
      aria-label={t.home.matrixEyebrow}
      className="mx-auto w-full max-w-5xl scroll-mt-24"
    >
      {/* Unified Ultra-Slim Iconless Architectural Timeline Bar */}
      <div className="glass-surface rounded-2xl px-5 py-3.5 sm:px-6 sm:py-4">
        <div className="grid grid-cols-1 divide-y divide-[var(--border-hairline)] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {t.home.timelineDomains.map((domain, index) => {
            const isSecondColumnOnTablet = index % 2 === 1;
            const isSecondRowOnTablet = index >= 2;

            return (
              <div
                key={domain.id}
                className={`py-2.5 first:pt-0 last:pb-0 ${
                  isSecondColumnOnTablet
                    ? 'sm:border-s sm:border-[var(--border-hairline)] sm:ps-5'
                    : 'sm:pe-5'
                } ${
                  isSecondRowOnTablet
                    ? 'sm:border-t sm:border-[var(--border-hairline)] sm:pt-3 sm:pb-0'
                    : 'sm:pt-0 sm:pb-3'
                } lg:border-t-0 lg:py-0 ${
                  index > 0
                    ? 'lg:border-s lg:border-[var(--border-hairline)] lg:ps-5'
                    : 'lg:ps-0'
                } ${index < 3 ? 'lg:pe-5' : 'lg:pe-0'}`}
              >
                {/* Telemetry Sequence Index + Connected Horizontal Rule */}
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-tabular shrink-0 text-[11px] font-medium tracking-wider text-[var(--text-secondary)] tabular-nums">
                    {domain.code}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-px flex-1 bg-[var(--border-strong)]/70"
                  />
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-px shrink-0 bg-[var(--border-strong)]"
                  />
                </div>

                {/* Bold Domain Title */}
                <h2 className="mt-1.5 text-[13px] font-semibold tracking-tight text-[var(--text-primary)]">
                  {domain.title}
                </h2>

                {/* Single Concise One-Line Scope Descriptor */}
                <p className="mt-0.5 truncate text-[11px] leading-snug text-[var(--text-secondary)]">
                  {domain.scope}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discreet Single-Line Principles Footnote & Inline Drawer Toggle */}
      <div className="mt-2.5 px-2">
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-[var(--text-secondary)]">
          <button
            type="button"
            onClick={() => setPrinciplesOpen((prev) => !prev)}
            aria-expanded={principlesOpen}
            aria-controls="home-principles-drawer"
            className="font-mono-tabular inline-flex items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)]/70 px-2.5 py-0.5 text-[10px] font-medium tracking-wider text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <span>{t.home.principlesToggleLabel}</span>
            <span aria-hidden="true">{principlesOpen ? '−' : '+'}</span>
          </button>

          {t.home.principles.map((principle, idx) => (
            <span
              key={principle.id}
              className="inline-flex items-center gap-2 whitespace-nowrap"
            >
              {idx > 0 ? (
                <span aria-hidden="true" className="text-[var(--border-strong)]">
                  ·
                </span>
              ) : null}
              <span className="font-mono-tabular text-[10px] text-[var(--text-secondary)]/80">
                {principle.code}
              </span>
              <span>{principle.title}</span>
            </span>
          ))}
        </div>

        <div
          id="home-principles-drawer"
          data-expanded={principlesOpen}
          aria-hidden={!principlesOpen}
          className="statement-collapse-grid"
        >
          <div className="statement-collapse-inner">
            <div className="mt-2.5 grid grid-cols-1 gap-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)]/60 px-5 py-3 sm:grid-cols-2 lg:grid-cols-4">
              {t.home.principles.map((principle) => (
                <div key={principle.id} className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-tight text-[var(--text-primary)]">
                    <span className="font-mono-tabular me-1.5 text-[10px] text-[var(--text-secondary)]">
                      {principle.code}
                    </span>
                    {principle.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
