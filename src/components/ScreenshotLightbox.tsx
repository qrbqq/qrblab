import {useEffect} from 'react';
import {ChevronLeft, ChevronRight, X} from 'lucide-react';
import {useLanguage} from '../context/LanguageContext';

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
  const {t} = useLanguage();

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md"
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
            aria-label={t.paperDetail.closeLightbox}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)]">
          <img
            src={images[activeIndex]}
            alt={`${title} — ${activeIndex + 1}`}
            referrerPolicy="no-referrer"
            className="max-h-[70vh] w-auto object-contain"
          />
        </div>

        {images.length > 1 ? (
          <div className="mt-4 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrev}
              aria-label={t.paperDetail.prevScreenshot}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-elevated)]"
            >
              <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
              <span>{t.paperDetail.prevScreenshot}</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label={t.paperDetail.nextScreenshot}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-surface-elevated)]"
            >
              <span>{t.paperDetail.nextScreenshot}</span>
              <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
