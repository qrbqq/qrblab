import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowRight, FileText, Folder, Search, X} from 'lucide-react';
import {siteCopy} from '../data/siteConfig';
import {papers} from '../data/papers';
import {formatPaperDate, resolveAssetUrl} from '../utils/papers';
import {recordQInteraction} from '../utils/qScore';
import {searchPapers} from '../utils/search';

interface LiveSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function LiveSearchOverlay({open, onClose}: LiveSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const navigate = useNavigate();

  const hasQuery = query.trim().length > 0;
  const results = useMemo(
    () => (hasQuery ? searchPapers(papers, query) : []),
    [query, hasQuery],
  );

  useEffect(() => {
    if (open) {
      setIsClosing(false);
      setActiveIndex(0);
      recordQInteraction('tool-trigger');
      const frame = window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleStartClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setQuery('');
      onClose();
    }, 240);
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleStartClose();
      }
    };

    const handlePointerDownOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }
      if (panelRef.current?.contains(target)) {
        return;
      }
      if (target.closest('[data-live-search-trigger="true"]')) {
        return;
      }
      handleStartClose();
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('mousedown', handlePointerDownOutside);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('mousedown', handlePointerDownOutside);
    };
  }, [open, isClosing]);

  useEffect(() => {
    const activeEl = itemRefs.current[activeIndex];
    if (activeEl) {
      activeEl.scrollIntoView({block: 'nearest'});
    }
  }, [activeIndex]);

  if (!open && !isClosing) {
    return null;
  }

  const handleOpenResult = (slug: string) => {
    recordQInteraction('search-query');
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setQuery('');
      onClose();
      navigate(`/qrb-lab/${slug}`);
    }, 180);
  };

  const handleInputKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleStartClose();
      return;
    }

    if (results.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = results[activeIndex] ?? results[0];
      if (target) {
        handleOpenResult(target.paper.slug);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={siteCopy.liveSearch.label}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/65 px-3 pt-20 backdrop-blur-sm sm:px-6 sm:pt-24"
    >
      <div
        ref={panelRef}
        className={`w-full max-w-xl transition-all duration-200 ${
          isClosing ? 'live-search-exit' : 'live-search-enter'
        }`}
      >
        {/* 1. Standalone Fixed-Height Input Capsule (Never clips, never stretches) */}
        <div
          className="flex h-13 w-full items-center gap-3 rounded-full bg-[#101010]/92 px-5 backdrop-blur-2xl border border-white/[0.16] shadow-2xl"
          style={{
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          }}
        >
          <Search
            className="h-4 w-4 shrink-0 text-[var(--text-secondary)]"
            strokeWidth={1.85}
            aria-hidden="true"
          />
          <label htmlFor="global-live-search-input" className="sr-only">
            {siteCopy.liveSearch.label}
          </label>
          <input
            ref={inputRef}
            id="global-live-search-input"
            type="search"
            dir="auto"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={siteCopy.liveSearch.placeholder}
            aria-autocomplete="list"
            aria-controls="live-search-results-list"
            aria-activedescendant={
              results.length > 0
                ? `live-search-option-${activeIndex}`
                : undefined
            }
            className="h-full w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none sm:text-[15px]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label={siteCopy.liveSearch.clearLabel}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/[0.08] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          ) : null}
        </div>

        {/* 2. Separated Stacked Glass Notification Cards (Outside the input capsule) */}
        {hasQuery ? (
          <div className="mt-3 space-y-2.5 max-h-[min(60vh,380px)] overflow-y-auto overflow-x-hidden">
            {results.length === 0 ? (
              <div
                className="search-result-enter flex items-center justify-between rounded-2xl bg-[#121212]/85 px-4 py-3.5 backdrop-blur-xl border-0 text-sm text-[var(--text-secondary)] shadow-xl"
                style={{boxShadow: '0 12px 30px rgba(0,0,0,0.6)'}}
              >
                <span>{siteCopy.liveSearch.noResults}</span>
              </div>
            ) : (
              <div
                id="live-search-results-list"
                role="listbox"
                aria-label={siteCopy.liveSearch.label}
                className="space-y-2.5"
              >
                {results.map((result, index) => {
                  const isSelected = index === activeIndex;
                  const thumbUrl = result.paper.thumbnail
                    ? resolveAssetUrl(result.paper.thumbnail, import.meta.env.BASE_URL)
                    : null;

                  return (
                    <button
                      key={result.paper.id}
                      ref={(el) => {
                        itemRefs.current[index] = el;
                      }}
                      id={`live-search-option-${index}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleOpenResult(result.paper.slug)}
                      className={`search-result-enter flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-start backdrop-blur-xl border-0 transition-all duration-150 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${
                        isSelected
                          ? 'bg-white/[0.12] text-[var(--text-primary)] shadow-2xl scale-[1.005]'
                          : 'bg-[#121212]/78 text-[var(--text-primary)] hover:bg-white/[0.08]'
                      }`}
                      style={{
                        '--stagger': `${Math.min(index * 40, 200)}ms`,
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                      } as React.CSSProperties}
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        {thumbUrl && !brokenThumbs[result.paper.id] ? (
                          <img
                            src={thumbUrl}
                            alt=""
                            onError={() =>
                              setBrokenThumbs((prev) => ({
                                ...prev,
                                [result.paper.id]: true,
                              }))
                            }
                            className="h-9 w-9 shrink-0 rounded-lg object-cover border border-white/[0.12]"
                          />
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] border border-white/[0.12] text-[var(--text-secondary)]">
                            <FileText className="h-4 w-4" strokeWidth={1.75} />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p
                            dir="auto"
                            className="truncate text-sm font-semibold text-[var(--text-primary)]"
                          >
                            {result.matchedTitle}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--text-secondary)]">
                            {result.folder ? (
                              <span className="inline-flex items-center gap-1 font-medium text-[var(--text-primary)]/80">
                                <Folder className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
                                <span>{result.folder}</span>
                              </span>
                            ) : null}
                            {result.filename ? (
                              <span className="font-mono-tabular truncate">
                                {result.filename}
                              </span>
                            ) : null}
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular tabular-nums">
                              {formatPaperDate(result.paper.publishedDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="inline-flex shrink-0 items-center text-[var(--text-secondary)]">
                        <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
