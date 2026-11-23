import {useEffect, useMemo, useRef, useState} from 'react';
import {FileSearch, Search, X} from 'lucide-react';
import {EmptyStateCard} from '../components/EmptyStateCard';
import {GlassIcon} from '../components/GlassIcon';
import {PaperCard} from '../components/PaperCard';
import {useLanguage} from '../context/LanguageContext';
import {papers} from '../data/papers';
import {extractCategories, filterPapers} from '../utils/papers';

export function ResearchPage() {
  const {lang, t} = useLanguage();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const categories = useMemo(
    () => extractCategories(papers, lang),
    [lang],
  );

  const activeCategory =
    selectedCategory && categories.includes(selectedCategory)
      ? selectedCategory
      : null;

  const filteredPapers = useMemo(
    () =>
      filterPapers(papers, {
        query,
        category: activeCategory,
        lang,
      }),
    [query, activeCategory, lang],
  );

  const hasPapers = papers.length > 0;
  const countLabel =
    filteredPapers.length === 1
      ? t.research.paperCountSingular
      : t.research.paperCountPlural;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-8 flex flex-col gap-6 border-b border-[var(--border-hairline)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <GlassIcon icon={FileSearch} size="lg" staticMode />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl text-balance">
              {t.research.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
              {t.research.subtitle}
            </p>
          </div>
        </div>

        {hasPapers ? (
          <p className="shrink-0 text-sm font-medium text-[var(--text-secondary)] tabular-nums">
            {filteredPapers.length} {countLabel}
          </p>
        ) : null}
      </header>

      <div className="static-card mb-8 flex flex-col gap-4 rounded-3xl p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div
          className={`relative flex w-full items-center ${
            hasPapers && categories.length > 0 ? 'lg:max-w-xl' : ''
          }`}
        >
          <label htmlFor="research-search" className="sr-only">
            {t.research.searchLabel}
          </label>
          <Search
            className="pointer-events-none absolute start-4 h-4 w-4 text-[var(--text-secondary)]"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            id="research-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.research.searchPlaceholder}
            className="min-h-[46px] w-full rounded-full border border-[var(--border-strong)] bg-[var(--bg-surface)] ps-11 pe-20 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-none focus:border-[var(--focus-ring)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-soft)]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                searchInputRef.current?.focus();
              }}
              aria-label={t.research.clearSearch}
              className="absolute end-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-none hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => searchInputRef.current?.focus()}
              aria-label="⌘K"
              className="font-mono-tabular absolute end-2 hidden items-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-none hover:text-[var(--text-primary)] sm:inline-flex"
            >
              ⌘K
            </button>
          )}
        </div>

        {hasPapers && categories.length > 0 ? (
          <div
            role="group"
            aria-label={t.research.categoryFilterLabel}
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              aria-pressed={activeCategory === null}
              className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                activeCategory === null
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                  : 'border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t.research.allCategories}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={activeCategory === category}
                className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                  activeCategory === category
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                    : 'border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {!hasPapers ? (
        <EmptyStateCard
          icon={FileSearch}
          title={t.research.emptyTitle}
          description={t.research.emptyDescription}
          actionLabel={t.research.emptyHint}
          actionTo="/about"
          staticMode
        />
      ) : filteredPapers.length === 0 ? (
        <EmptyStateCard
          icon={Search}
          title={t.research.noMatchesTitle}
          description={t.research.noMatchesDescription}
          actionLabel={t.research.resetFilters}
          onActionClick={() => {
            setQuery('');
            setSelectedCategory(null);
          }}
          staticMode
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} staticMode />
          ))}
        </div>
      )}
    </div>
  );
}
