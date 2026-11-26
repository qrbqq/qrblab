import type {ReactNode} from 'react';

interface ArchitecturalFrameProps {
  id?: string;
  ariaLabel?: string;
  children: ReactNode;
  livingBorder?: boolean;
  compact?: boolean;
  spacing?: 'default' | 'compact' | 'preview' | 'editorial';
  className?: string;
}

const SPACING_CLASSES: Record<
  NonNullable<ArchitecturalFrameProps['spacing']>,
  string
> = {
  compact: 'py-14 sm:py-20',
  default: 'py-20 sm:py-28',
  preview: 'py-20 md:py-24',
  editorial: 'py-24 md:py-32',
};

export function ArchitecturalFrame({
  id,
  ariaLabel,
  children,
  livingBorder = false,
  compact = false,
  spacing,
  className = '',
}: ArchitecturalFrameProps) {
  const resolvedSpacing = spacing ?? (compact ? 'compact' : 'default');
  const paddingClass = SPACING_CLASSES[resolvedSpacing];
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative scroll-mt-24 border-t border-white/[0.08] bg-transparent ${paddingClass} ${className}`}
    >
      {livingBorder ? (
        <>
          <span
            aria-hidden="true"
            className="home-border-tick pointer-events-none absolute top-0 start-0 h-[1px] w-36"
          />
          <span
            aria-hidden="true"
            style={{'--tick-delay': '6s'} as React.CSSProperties}
            className="home-border-tick pointer-events-none absolute bottom-0 start-0 h-[1px] w-36"
          />
        </>
      ) : null}

      <span
        aria-hidden="true"
        className={`font-mono-tabular pointer-events-none absolute start-6 top-4 select-none text-xs leading-none text-[var(--crosshair-color)] ${
          livingBorder ? 'home-periphery-marker' : ''
        }`}
      >
        +
      </span>
      <span
        aria-hidden="true"
        style={
          livingBorder
            ? ({'--float-delay': '2.5s'} as React.CSSProperties)
            : undefined
        }
        className={`font-mono-tabular pointer-events-none absolute end-6 top-4 select-none text-xs leading-none text-[var(--crosshair-color)] ${
          livingBorder ? 'home-periphery-marker' : ''
        }`}
      >
        +
      </span>
      <span
        aria-hidden="true"
        style={
          livingBorder
            ? ({'--float-delay': '5s'} as React.CSSProperties)
            : undefined
        }
        className={`font-mono-tabular pointer-events-none absolute start-6 bottom-4 select-none text-xs leading-none text-[var(--crosshair-color)] ${
          livingBorder ? 'home-periphery-marker' : ''
        }`}
      >
        +
      </span>
      <span
        aria-hidden="true"
        style={
          livingBorder
            ? ({'--float-delay': '7.5s'} as React.CSSProperties)
            : undefined
        }
        className={`font-mono-tabular pointer-events-none absolute end-6 bottom-4 select-none text-xs leading-none text-[var(--crosshair-color)] ${
          livingBorder ? 'home-periphery-marker' : ''
        }`}
      >
        +
      </span>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}
