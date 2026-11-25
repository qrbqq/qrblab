import {siteCopy} from '../data/i18n';
import {handleSpotlightMouseMove} from '../hooks/useScrollReveal';
import {ArchitecturalFrame} from './ArchitecturalFrame';
import {ScrollReveal} from './ScrollReveal';

interface CoreResearchMatrixProps {
  id?: string;
  eyebrow: string;
  heading?: string;
  subheading?: string;
  animated?: boolean;
}

export function CoreResearchMatrix({
  id,
  eyebrow,
  heading,
  subheading,
  animated = false,
}: CoreResearchMatrixProps) {
  return (
    <ArchitecturalFrame
      id={id}
      ariaLabel={heading || eyebrow}
      livingBorder={animated}
    >
      <div>
        <div className="mb-6 flex flex-col gap-2 sm:mb-8">
          <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
            <p className="font-mono-tabular shrink-0 text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
              {eyebrow}
            </p>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-[var(--border-hairline)]"
            />
          </ScrollReveal>

          {heading ? (
            <ScrollReveal staggerIndex={1}>
              <h2 className="font-display-heading text-2xl font-semibold text-[var(--text-primary)]">
                {heading}
              </h2>
            </ScrollReveal>
          ) : null}

          {subheading ? (
            <ScrollReveal staggerIndex={2}>
              <p className="font-body-prose text-sm text-[var(--text-secondary)]">
                {subheading}
              </p>
            </ScrollReveal>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {siteCopy.about.focusAreas.map((area, index) => (
            <ScrollReveal
              key={area.id}
              staggerIndex={index % 4}
              className="h-full"
            >
              <div
                onMouseMove={animated ? handleSpotlightMouseMove : undefined}
                className={`rounded-sm border border-white/[0.08] bg-[var(--bg-surface)] group flex h-full flex-col justify-between p-5 sm:p-6 ${
                  animated ? 'home-spotlight-card' : 'glass-card-interactive'
                }`}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`font-mono-tabular text-xs font-semibold tracking-wider text-[var(--text-secondary)] ${
                        animated ? 'home-card-code' : ''
                      }`}
                    >
                      {area.code}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-[var(--border-hairline)]"
                    />
                  </div>

                  <h3 className="font-display-card mt-4 text-base font-bold text-[var(--text-primary)]">
                    {area.title}
                  </h3>

                  <p className="font-body-prose mt-2 text-sm text-[var(--text-secondary)]">
                    {area.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </ArchitecturalFrame>
  );
}
