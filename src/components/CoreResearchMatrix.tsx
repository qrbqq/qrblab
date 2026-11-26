import {siteCopy} from '../data/siteConfig';
import {ArchitecturalFrame} from './ArchitecturalFrame';
import {KineticHeadline} from './KineticHeadline';
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
        <div className="mb-8 flex flex-col gap-2 sm:mb-10">
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
            <KineticHeadline
              as="h2"
              text={heading}
              className="text-3xl text-[var(--text-primary)] sm:text-4xl"
            />
          ) : null}

          {subheading ? (
            <ScrollReveal staggerIndex={2}>
              <p className="font-body-prose text-sm text-[var(--text-secondary)]">
                {subheading}
              </p>
            </ScrollReveal>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {siteCopy.about.focusAreas.map((area, index) => (
            <ScrollReveal
              key={area.id}
              staggerIndex={index % 4}
              className="h-full"
            >
              <div className="group flex h-full flex-col justify-between border-t border-white/[0.08] pt-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono-tabular text-xs font-semibold tracking-wider text-[var(--text-eyebrow)] transition-colors group-hover:text-[var(--text-primary)]">
                      {area.code}
                    </span>
                  </div>

                  <h3 className="font-display-card mt-3 text-base font-bold text-[var(--text-primary)]">
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
