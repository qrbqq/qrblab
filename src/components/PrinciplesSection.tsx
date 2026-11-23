import type {CSSProperties} from 'react';
import {BookOpenCheck, Compass, FileCheck2, Unlock} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';
import {
  handleSpotlightMouseMove,
  useScrollReveal,
} from '../hooks/useScrollReveal';
import {ArchitecturalFrame} from './ArchitecturalFrame';
import {GlassIcon} from './GlassIcon';

const PRINCIPLE_ICONS = [Compass, BookOpenCheck, Unlock, FileCheck2];

interface PrinciplesSectionProps {
  id?: string;
  animated?: boolean;
}

export function PrinciplesSection({
  id,
  animated = false,
}: PrinciplesSectionProps) {
  const {t} = useLanguage();
  const {ref, isVisible} = useScrollReveal<HTMLDivElement>({
    threshold: 0.12,
    disabled: !animated,
  });

  return (
    <ArchitecturalFrame
      id={id}
      ariaLabel={t.home.principlesHeading}
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
            <span>{t.home.principlesEyebrow}</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t.home.principlesHeading}
          </h2>

          <p className="text-sm text-[var(--text-secondary)]">
            {t.home.principlesSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {t.home.principles.map((item, index) => {
            const Icon = PRINCIPLE_ICONS[index] ?? Compass;
            const staggerStyle = animated
              ? ({'--reveal-delay': `${index * 70}ms`} as CSSProperties)
              : undefined;

            return (
              <div
                key={item.id}
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
                      {item.code}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-bold tracking-tight text-[var(--text-primary)]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.description}
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
