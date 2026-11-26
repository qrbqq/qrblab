import {useState} from 'react';
import {resolveAssetUrl} from '../utils/papers';

interface FounderAvatarProps {
  sizeClass?: string;
  paddingClass?: string;
  className?: string;
  alt?: string;
}

/**
 * Circular Brand Emblem Avatar rendering the pure white inverted `Q` mark (`logo.png`)
 * centered inside a deep `#0A0A0A` obsidian circle with screen blending.
 */
export function FounderAvatar({
  sizeClass = 'h-9 w-9',
  paddingClass = 'p-1.5',
  className = '',
  alt = 'qrbqq brand emblem',
}: FounderAvatarProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  const logoSrc = resolveAssetUrl('images/logo.png', import.meta.env.BASE_URL);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] ${sizeClass} ${paddingClass} ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(75% 75% at 50% 25%, rgba(255, 255, 255, 0.045) 0%, transparent 75%)',
      }}
    >
      {!logoFailed ? (
        <img
          src={logoSrc}
          alt={alt}
          onError={() => setLogoFailed(true)}
          className="brand-logo-img h-full w-full object-contain mix-blend-screen select-none"
        />
      ) : (
        <span className="font-display-heading text-xs font-bold text-[#F5F5F5]">
          Q
        </span>
      )}
    </span>
  );
}
