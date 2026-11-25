import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {useNavigate} from 'react-router-dom';
import {ArrowRight, FileText, Folder, Search, X} from 'lucide-react';
import {siteCopy} from '../data/i18n';
import {papers} from '../data/papers';
import {formatPaperDate} from '../utils/papers';
import {searchPapers} from '../utils/search';

interface LiveSearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function LiveSearchOverlay({open, onClose}: LiveSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
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
    setQuery('');
    setIsClosing(false);
    onClose();
    navigate(`/qrb-lab/${slug}`);
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
        className={`w-full max-w-xl rounded-full bg-[#0e0e0e]/92 backdrop-blur-2xl border border-white/[0.16] shadow-2xl overflow-hidden transition-all duration-200 ${
          isClosing ? 'live-search-exit' : 'live-search-enter'
        }`}
        style={{
          boxShadow: '0 32px 75px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center gap-3 px-5 py-3">
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
            className="min-h-[36px] w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none sm:text-[15px]"
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

        {hasQuery ? (
          <div className="border-t border-white/[0.08] max-h-[min(60vh,380px)] overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-5 py-7 text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {siteCopy.liveSearch.noResults}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {siteCopy.liveSearch.noResultsHint}
                </p>
              </div>
            ) : (
              <div
                id="live-search-results-list"
                role="listbox"
                aria-label={siteCopy.liveSearch.label}
                className="divide-y divide-white/[0.06] p-2"
              >
                {results.map((result, index) => {
                  const isSelected = index === activeIndex;
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
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-start transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] ${
                        isSelected
                          ? 'bg-white/[0.08] text-[var(--text-primary)]'
                          : 'bg-transparent text-[var(--text-primary)] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <FileText
                          className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <p
                            dir="auto"
                            className="truncate text-sm font-semibold text-[var(--text-primary)]"
                          >
                            {result.matchedTitle}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[var(--text-secondary)]">
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

                      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--text-secondary)]">
                        <span className="hidden sm:inline">
                          {siteCopy.liveSearch.openItemLabel}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
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
