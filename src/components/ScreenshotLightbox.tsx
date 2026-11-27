import {useEffect} from 'react';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import {siteCopy} from '../data/siteConfig';

interface ScreenshotLightboxProps {
  images: string[];
  activeIndex: number | null;
  title: string;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export function ScreenshotLightbox({
  images,
  activeIndex,
  title,
  onClose,
  onSelectIndex,
}: ScreenshotLightboxProps) {
  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowRight' && images.length > 1) {
        onSelectIndex((activeIndex + 1) % images.length);
      } else if (event.key === 'ArrowLeft' && images.length > 1) {
        onSelectIndex((activeIndex - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, images.length, onClose, onSelectIndex]);

  if (activeIndex === null || !images[activeIndex]) {
    return null;
  }

  const handlePrev = () => {
    onSelectIndex((activeIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    onSelectIndex((activeIndex + 1) % images.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — ${activeIndex + 1} / ${images.length}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-surface relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="font-mono-tabular text-xs font-medium text-[var(--text-secondary)]">
            {activeIndex + 1} / {images.length}
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label={siteCopy.paperDetail.closeLightbox}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-2)] text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)]">
          <img
            src={images[activeIndex]}
            alt={`${title} — ${activeIndex + 1}`}
            referrerPolicy="no-referrer"
            className="max-h-[70vh] w-auto object-contain"
            style={{
              imageRendering: '-webkit-optimize-contrast',
              backfaceVisibility: 'hidden',
              transform: 'translateZ(0)',
            }}
          />
        </div>

        {images.length > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label={siteCopy.paperDetail.prevScreenshot}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-2)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              <span>{siteCopy.paperDetail.prevScreenshot}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label={siteCopy.paperDetail.nextScreenshot}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-2)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-hover)]"
            >
              <span>{siteCopy.paperDetail.nextScreenshot}</span>
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
