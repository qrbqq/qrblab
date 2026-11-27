interface VerifiedBadgeProps {
  size?: number;
  className?: string;
  label?: string;
}

/**
 * Official Verified Checkmark Seal SVG (12-point scalloped seal).
 * Strictly reserved Deep Crimson Red (#C81E1E) with pure #FFFFFF checkmark,
 * sharp micro-contrast border, and zero outer drop-shadow, blur, or halo glow.
 */
export function VerifiedBadge({
  size = 20,
  className = '',
  label = 'Verified founder',
}: VerifiedBadgeProps) {
  const sealColor = '#C81E1E';

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center align-middle select-none ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        shapeRendering="geometricPrecision"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* 12-point scalloped official verification seal with razor-sharp micro-contrast border */}
        <path
          d="M12 1.25L14.34 3.07L17.28 2.66L18.58 5.34L21.34 6.64L20.93 9.58L22.75 11.92L20.93 14.26L21.34 17.2L18.58 18.5L17.28 21.18L14.34 20.77L12 22.59L9.66 20.77L6.72 21.18L5.42 18.5L2.66 17.2L3.07 14.26L1.25 11.92L3.07 9.58L2.66 6.64L5.42 5.34L6.72 2.66L9.66 3.07L12 1.25Z"
          fill={sealColor}
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* Bold sharp pure white checkmark */}
        <path
          d="M8.1 12.15L10.75 14.8L16.1 9.25"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
