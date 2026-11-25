import {memo, useEffect, useRef, useState} from 'react';
import {resolveAssetUrl} from '../utils/papers';

let cachedVideoEl: HTMLVideoElement | null = null;
let cachedVideoUrl = '';

function getPersistentHeroVideo(videoUrl: string): HTMLVideoElement {
  if (cachedVideoEl && cachedVideoUrl === videoUrl) {
    return cachedVideoEl;
  }

  const video = document.createElement('video');
  video.src = videoUrl;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  video.preload = 'auto';
  video.disablePictureInPicture = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.setAttribute('controlsList', 'nodownload noplaybackrate noremoteplayback');
  video.setAttribute('aria-hidden', 'true');
  video.tabIndex = -1;
  video.className =
    'hero-video-surface pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[center_12%]';

  cachedVideoEl = video;
  cachedVideoUrl = videoUrl;
  return video;
}

export const HeroVideoBackdrop = memo(function HeroVideoBackdrop() {
  const heroVideoUrl = resolveAssetUrl(
    'images/founder-hero.mp4',
    import.meta.env.BASE_URL,
  );
  const heroPosterUrl = resolveAssetUrl(
    'images/founder-portrait.png',
    import.meta.env.BASE_URL,
  );

  const slotRef = useRef<HTMLDivElement | null>(null);
  const [posterFailed, setPosterFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoReady, setVideoReady] = useState<boolean>(() => {
    return Boolean(
      cachedVideoEl &&
        cachedVideoUrl === heroVideoUrl &&
        cachedVideoEl.readyState >= 2,
    );
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot || prefersReducedMotion || videoFailed) {
      if (cachedVideoEl && !cachedVideoEl.paused) {
        cachedVideoEl.pause();
      }
      return;
    }

    const video = getPersistentHeroVideo(heroVideoUrl);

    if (video.parentNode !== slot) {
      slot.appendChild(video);
    }

    const syncReady = () => {
      if (video.readyState >= 2) {
        setVideoReady(true);
      }
    };

    const handlePlaying = () => {
      setVideoReady(true);
    };

    const handleError = () => {
      setVideoFailed(true);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && video.paused && !prefersReducedMotion) {
        video.play().catch(() => {});
      }
    };

    syncReady();

    video.addEventListener('loadeddata', syncReady);
    video.addEventListener('canplay', syncReady);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => {});

    return () => {
      video.removeEventListener('loadeddata', syncReady);
      video.removeEventListener('canplay', syncReady);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      video.pause();
      if (video.parentNode === slot) {
        slot.removeChild(video);
      }
    };
  }, [heroVideoUrl, prefersReducedMotion, videoFailed]);

  return (
    <>
      {/* Obsidian Radial Fallback Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,#181c26_0%,#07080a_78%)]"
      />

      {/* Instant Portrait Backdrop Layer until First Decoded Video Frame or Under Reduced Motion */}
      {!posterFailed ? (
        <img
          src={heroPosterUrl}
          alt=""
          aria-hidden="true"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setPosterFailed(true)}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-[center_12%]"
        />
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        >
          <span className="font-mono-tabular text-7xl font-semibold tracking-tight text-white/10 sm:text-8xl">
            Q
          </span>
        </div>
      )}

      {/* Persistent, GPU-Composited Video Slot */}
      {!prefersReducedMotion && !videoFailed ? (
        <div
          ref={slotRef}
          aria-hidden="true"
          style={{opacity: videoReady ? 1 : 0}}
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      ) : null}

      {/* Consolidated Contrast Scrim Blending Seamlessly Into Void Canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,8,10,0.58)_0%,rgba(7,8,10,0.08)_36%,rgba(7,8,10,0.48)_70%,#07080a_100%)]"
      />
    </>
  );
});
