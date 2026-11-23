import type {CSSProperties} from 'react';
import {Bot, Brain, Car, Cog} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {
  handleSpotlightMouseMove,
  useScrollReveal,
} from '../hooks/useScrollReveal';
import {ArchitecturalFrame} from './ArchitecturalFrame';
import {GlassIcon} from './GlassIcon';

const MATRIX_ICONS = [Brain, Cog, Bot, Car];

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
  const {t} = useLanguage();
  const {ref, isVisible} = useScrollReveal<HTMLDivElement>({
    threshold: 0.12,
    disabled: !animated,
  });

  return (
    <ArchitecturalFrame
      id={id}
      ariaLabel={heading || eyebrow}
      livingBorder={animated}
    >
      <div ref={ref}>
        <div
          data-revealed={isVisible}
          className={`mb-6 flex flex-col gap-2 sm:mb-8 ${
            animated ? 'home-reveal-item' : ''
          }`}
        >
          <div className="inline-flex items-center gap-2 font-mono-tabular text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--text-primary)]"
              aria-hidden="true"
            />
            <span>{eyebrow}</span>
          </div>

          {heading ? (
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {heading}
            </h2>
          ) : null}

          {subheading ? (
            <p className="text-sm text-[var(--text-secondary)]">{subheading}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {t.about.focusAreas.map((area, index) => {
            const Icon = MATRIX_ICONS[index] ?? Cog;
            const staggerStyle = animated
              ? ({'--reveal-delay': `${index * 70}ms`} as CSSProperties)
              : undefined;

            return (
              <div
                key={area.id}
                data-revealed={isVisible}
                style={staggerStyle}
                onMouseMove={animated ? handleSpotlightMouseMove : undefined}
                className={`glass-card group flex flex-col justify-between rounded-3xl p-5 sm:p-6 ${
                  animated
                    ? 'home-reveal-item home-spotlight-card'
                    : 'glass-card-interactive'
                }`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-3">
                    <GlassIcon
                      icon={Icon}
                      size="md"
                      className={animated ? 'home-card-icon' : ''}
                    />
                    <span
                      className={`font-mono-tabular text-xs font-semibold tracking-wider text-[var(--text-secondary)] ${
                        animated ? 'home-card-code' : ''
                      }`}
                    >
                      {area.code}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-bold tracking-tight text-[var(--text-primary)]">
                    {area.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {area.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ArchitecturalFrame>
  );
}
