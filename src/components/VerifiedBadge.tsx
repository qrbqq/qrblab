import {useId} from 'react';

interface VerifiedBadgeProps {
  size?: number;
  className?: string;
  label?: string;
}

/**
 * Official Deep Crimson Verified Checkmark Seal SVG (12-point scalloped seal).
 * Color calibration:
 * - Rich deep-to-vivid crimson gradient (#B91C1C -> #DC2626)
 * - Crisp subtle specular edge (rgba(255, 130, 130, 0.35))
 * - Ambient crimson glow (drop-shadow 0 0 10px rgba(220, 38, 38, 0.45))
 * - Bold, razor-sharp pure #FFFFFF inner checkmark
 */
export function VerifiedBadge({
  size = 23,
  className = '',
  label = 'Verified founder',
}: VerifiedBadgeProps) {
  const uid = useId().replace(/:/g, '');
  const gradientId = `qrbqq-crimson-seal-${uid}`;

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center align-middle select-none ${className}`}
      style={{
        width: size,
        height: size,
        filter: 'drop-shadow(0 0 10px rgba(220, 38, 38, 0.45))',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#B91C1C" />
          </linearGradient>
        </defs>

        {/* 12-point scalloped official verification seal */}
        <path
          d="M12 1.25L14.34 3.07L17.28 2.66L18.58 5.34L21.34 6.64L20.93 9.58L22.75 11.92L20.93 14.26L21.34 17.2L18.58 18.5L17.28 21.18L14.34 20.77L12 22.59L9.66 20.77L6.72 21.18L5.42 18.5L2.66 17.2L3.07 14.26L1.25 11.92L3.07 9.58L2.66 6.64L5.42 5.34L6.72 2.66L9.66 3.07L12 1.25Z"
          fill={`url(#${gradientId})`}
          stroke="rgba(255, 130, 130, 0.35)"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Bold sharp pure white checkmark */}
        <path
          d="M8.1 12.15L10.75 14.8L16.1 9.25"
          stroke="#FFFFFF"
          strokeWidth="2.45"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
