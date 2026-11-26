import {useState} from 'react';
import {siteConfig} from '../data/siteConfig';
import {resolveAssetUrl} from '../utils/papers';

interface FounderAvatarProps {
  sizeClass?: string;
  paddingClass?: string;
  className?: string;
  alt?: string;
  avatarSrc?: string;
}

/**
 * Circular Founder Avatar used exclusively on `/log` and Lab Log post cards.
 * - When `siteConfig.profileAvatar` (or `avatarSrc`) is configured, renders that photo
 *   naturally (`object-cover object-top`, zero `invert(1)` filter, zero padding).
 * - When empty or unavailable, falls back cleanly to the padded white-inverted `Q` mark (`logo.png`)
 *   centered inside a `#0A0A0A` circle.
 */
export function FounderAvatar({
  sizeClass = 'h-9 w-9',
  paddingClass = 'p-1.5',
  className = '',
  alt = 'qrbqq profile avatar',
  avatarSrc,
}: FounderAvatarProps) {
  const [customFailed, setCustomFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const configuredAvatar = (avatarSrc ?? siteConfig.profileAvatar).trim();
  const customAvatarUrl = configuredAvatar
    ? resolveAssetUrl(configuredAvatar, import.meta.env.BASE_URL)
    : '';
  const showCustomAvatar = Boolean(customAvatarUrl) && !customFailed;
  const logoSrc = resolveAssetUrl('images/logo.png', import.meta.env.BASE_URL);

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A] ${sizeClass} ${
        showCustomAvatar ? '' : paddingClass
      } ${className}`}
      style={
        showCustomAvatar
          ? undefined
          : {
              backgroundImage:
                'radial-gradient(75% 75% at 50% 25%, rgba(255, 255, 255, 0.045) 0%, transparent 75%)',
            }
      }
    >
      {showCustomAvatar ? (
        <img
          src={customAvatarUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setCustomFailed(true)}
          className="h-full w-full object-cover object-top select-none"
        />
      ) : !logoFailed ? (
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
