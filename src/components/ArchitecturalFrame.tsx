import type {ReactNode} from 'react';

interface ArchitecturalFrameProps {
  id?: string;
  ariaLabel?: string;
  children: ReactNode;
  livingBorder?: boolean;
  className?: string;
}

export function ArchitecturalFrame({
  id,
  ariaLabel,
  children,
  livingBorder = false,
  className = '',
}: ArchitecturalFrameProps) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`glass-surface relative scroll-mt-24 overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10 ${className}`}
    >
      {livingBorder ? (
        <>
          <span
            aria-hidden="true"
            className="home-border-tick pointer-events-none absolute top-0 start-0 h-[1px] w-28"
          />
          <span
            aria-hidden="true"
            style={{'--tick-delay': '6s'} as React.CSSProperties}
            className="home-border-tick pointer-events-none absolute bottom-0 start-0 h-[1px] w-28"
          />
        </>
      ) : null}

      <span
        aria-hidden="true"
        className={`font-mono-tabular pointer-events-none absolute start-4 top-3 select-none text-xs leading-none text-[var(--crosshair-color)] ${
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
        className={`font-mono-tabular pointer-events-none absolute end-4 top-3 select-none text-xs leading-none text-[var(--crosshair-color)] ${
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
        className={`font-mono-tabular pointer-events-none absolute start-4 bottom-3 select-none text-xs leading-none text-[var(--crosshair-color)] ${
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
        className={`font-mono-tabular pointer-events-none absolute end-4 bottom-3 select-none text-xs leading-none text-[var(--crosshair-color)] ${
          livingBorder ? 'home-periphery-marker' : ''
        }`}
      >
        +
      </span>
      {children}
    </section>
  );
}
