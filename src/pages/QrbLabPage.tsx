import {useEffect, useMemo, useState} from 'react';
import {Folder} from 'lucide-react';
import {EmptyStateCard} from '../components/EmptyStateCard';
import {KineticHeadline} from '../components/KineticHeadline';
import {PaperCard} from '../components/PaperCard';
import {ScrollReveal} from '../components/ScrollReveal';
import {siteCopy} from '../data/siteConfig';
import {papers} from '../data/papers';
import {extractFolders, filterPapers} from '../utils/papers';
import {recordQInteraction} from '../utils/qScore';

export function QrbLabPage() {
  const [query, setQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const searchTrigger = document.querySelector('[data-live-search-trigger="true"]') as HTMLButtonElement | null;
        searchTrigger?.click();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const folders = useMemo(() => extractFolders(papers), []);

  const activeFolder =
    selectedFolder && folders.includes(selectedFolder)
      ? selectedFolder
      : null;

  const filteredPapers = useMemo(
    () =>
      filterPapers(papers, {
        query,
        category: activeFolder,
      }),
    [query, activeFolder],
  );

  const hasPapers = papers.length > 0;
  const countLabel =
    filteredPapers.length === 1
      ? siteCopy.qrbLab.paperCountSingular
      : siteCopy.qrbLab.paperCountPlural;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <header className="mb-8 flex flex-col gap-6 border-b border-[var(--border-hairline)] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <ScrollReveal staggerIndex={0} className="flex items-center gap-3">
            <p className="font-mono-tabular shrink-0 text-[11px] font-medium tracking-[0.12em] text-[var(--text-eyebrow)]">
              {siteCopy.qrbLab.eyebrow}
            </p>
            <span
              aria-hidden="true"
              className="h-px flex-1 bg-[var(--border-hairline)]"
            />
          </ScrollReveal>
          <KineticHeadline
            as="h1"
            text={siteCopy.qrbLab.title}
            className="mt-2.5 text-4xl text-[var(--text-primary)] sm:text-5xl"
          />
          <ScrollReveal staggerIndex={2}>
            <p className="font-body-prose normal-case mt-2 max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">
              {siteCopy.qrbLab.subtitle}
            </p>
          </ScrollReveal>
        </div>

        {hasPapers ? (
          <ScrollReveal staggerIndex={1} className="shrink-0">
            <p className="font-mono-tabular text-sm font-medium text-[var(--text-secondary)] tabular-nums">
              {filteredPapers.length} {countLabel}
            </p>
          </ScrollReveal>
        ) : null}
      </header>

      {hasPapers && folders.length > 0 ? (
        <ScrollReveal staggerIndex={2} className="mb-8">
          <div
            role="group"
            aria-label={siteCopy.qrbLab.collectionFilterLabel}
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              onClick={() => setSelectedFolder(null)}
              aria-pressed={activeFolder === null}
              className={`min-h-[40px] shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                activeFolder === null
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                  : 'border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {siteCopy.qrbLab.allCollections}
            </button>
            {folders.map((folder) => (
              <button
                key={folder}
                type="button"
                onClick={() => {
                  if (activeFolder !== folder) {
                    recordQInteraction('tool-trigger');
                  }
                  setSelectedFolder(folder);
                }}
                aria-pressed={activeFolder === folder}
                className={`inline-flex min-h-[40px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${
                  activeFolder === folder
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                    : 'border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Folder className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
                <span>{folder}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>
      ) : null}

      {!hasPapers ? (
        <ScrollReveal staggerIndex={3}>
          <EmptyStateCard
            eyebrow={siteCopy.qrbLab.emptyStatus}
            title={siteCopy.qrbLab.emptyTitle}
            description={siteCopy.qrbLab.emptyDescription}
            actionLabel={siteCopy.qrbLab.emptyHint}
            actionTo="/about"
            staticMode
          />
        </ScrollReveal>
      ) : filteredPapers.length === 0 ? (
        <ScrollReveal staggerIndex={0}>
          <EmptyStateCard
            eyebrow={siteCopy.qrbLab.noMatchesStatus}
            title={siteCopy.qrbLab.noMatchesTitle}
            description={siteCopy.qrbLab.noMatchesDescription}
            actionLabel={siteCopy.qrbLab.resetFilters}
            onActionClick={() => {
              setQuery('');
              setSelectedFolder(null);
            }}
            staticMode
          />
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPapers.map((paper, index) => (
            <ScrollReveal
              key={paper.id}
              staggerIndex={index % 3}
              className="h-full"
            >
              <PaperCard paper={paper} staticMode />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
