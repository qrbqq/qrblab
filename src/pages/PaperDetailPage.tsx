import {useEffect, useRef, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Copy,
  Download,
  ExternalLink,
  Link2,
  Maximize2,
  Quote,
} from 'lucide-react';
import {EmptyStateCard} from '../components/EmptyStateCard';
import {ScreenshotLightbox} from '../components/ScreenshotLightbox';
import {ScrollReveal} from '../components/ScrollReveal';
import {StarRating} from '../components/StarRating';
import {Toast, type ToastMessage} from '../components/Toast';
import {siteCopy} from '../data/i18n';
import {papers} from '../data/papers';
import {siteConfig} from '../data/siteConfig';
import {
  findPaperBySlug,
  formatBibtexCitation,
  formatPaperDate,
  formatPlainCitation,
  getLocalizedList,
  getLocalizedText,
  getPaperSummary,
  resolveAssetUrl,
} from '../utils/papers';
import {
  clearPaperRating,
  getPaperRating,
  savePaperRating,
} from '../utils/ratings';

export function PaperDetailPage() {
  const {slug} = useParams<{slug: string}>();
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showInlinePdf, setShowInlinePdf] = useState(false);
  const timerRef = useRef<number | null>(null);

  const paper = findPaperBySlug(papers, slug);

  useEffect(() => {
    setShowInlinePdf(false);
    if (!paper) {
      setRating(null);
      return;
    }
    const stored = getPaperRating(paper.slug);
    setRating(stored?.stars ?? null);
  }, [paper]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const showToast = (text: string, variant: ToastMessage['variant'] = 'success') => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    setToast({id: Date.now(), text, variant});
    timerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const copyToClipboard = async (value: string, successText: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(successText, 'success');
    } catch {
      showToast(siteCopy.paperDetail.copyFailed, 'error');
    }
  };

  if (!paper) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <ScrollReveal staggerIndex={0}>
          <EmptyStateCard
            eyebrow={siteCopy.paperDetail.notFoundStatus}
            title={siteCopy.paperDetail.notFoundTitle}
            description={siteCopy.paperDetail.notFoundDescription}
            actionLabel={siteCopy.paperDetail.backToArchive}
            actionTo="/qrb-lab"
          />
        </ScrollReveal>
      </div>
    );
  }

  const pdfUrl = resolveAssetUrl(paper.pdfPath, import.meta.env.BASE_URL);
  const formattedDate = formatPaperDate(paper.publishedDate);
  const title = getLocalizedText(paper.title);
  const category = getLocalizedText(paper.category);
  const highlights = getLocalizedList(paper.highlights);
  const summary = getPaperSummary(paper);
  const deepExplanation = getLocalizedText(paper.explanation).trim();
  const previewImages = (paper.previewImages ?? [])
    .map((img) => resolveAssetUrl(img, import.meta.env.BASE_URL))
    .filter(Boolean);

  const handleRate = (stars: number) => {
    const saved = savePaperRating(paper.slug, stars);
    if (saved) {
      setRating(saved.stars);
      showToast(siteCopy.paperDetail.ratingSaved, 'success');
    }
  };

  const handleClearRating = () => {
    clearPaperRating(paper.slug);
    setRating(null);
    showToast(siteCopy.paperDetail.ratingCleared, 'success');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <ScrollReveal staggerIndex={0} className="mb-8 inline-block">
        <Link
          to="/qrb-lab"
          className="normal-case inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          <span>{siteCopy.paperDetail.backToArchive}</span>
        </Link>
      </ScrollReveal>

      <article className="border-t border-white/[0.08] py-16 sm:py-20">
        <ScrollReveal staggerIndex={0}>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
            <span className="font-semibold text-[var(--text-primary)]">{category}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={paper.publishedDate} className="font-mono-tabular tabular-nums">
              {formattedDate}
            </time>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">{paper.version}</span>
            {paper.doi ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">
                  {siteCopy.paperDetail.doiLabel}: {paper.doi}
                </span>
              </>
            ) : null}
          </div>
        </ScrollReveal>

        <ScrollReveal staggerIndex={1}>
          <h1 className="font-display-hero mt-4 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            {title}
          </h1>
        </ScrollReveal>

        <ScrollReveal staggerIndex={2}>
          <dl className="mt-6 grid grid-cols-1 gap-4 border-y border-[var(--border-hairline)] py-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-[var(--text-secondary)]">
                {siteCopy.paperDetail.authorsLabel}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                {paper.authors.join(', ')}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--text-secondary)]">
                {siteCopy.paperDetail.publishedLabel}
              </dt>
              <dd className="font-mono-tabular mt-1 text-sm font-medium text-[var(--text-primary)] tabular-nums">
                {formattedDate}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--text-secondary)]">
                {siteCopy.paperDetail.versionLabel}
              </dt>
              <dd className="mt-1 font-mono-tabular text-sm font-medium text-[var(--text-primary)]">
                {paper.version}
              </dd>
            </div>
          </dl>
        </ScrollReveal>

        {/* 1. Interactive localStorage Star Rating */}
        <ScrollReveal
          as="section"
          staggerIndex={0}
          className="mt-8 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] p-5 sm:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display-card text-sm font-semibold text-[var(--text-primary)]">
                {siteCopy.paperDetail.rateHeading}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {siteCopy.paperDetail.rateSubheading}
              </p>
            </div>

            <StarRating
              value={rating}
              onChange={handleRate}
              onClear={handleClearRating}
            />
          </div>
        </ScrollReveal>

        {/* 2. Deep Explanation & Summary */}
        <section className="mt-10">
          <ScrollReveal staggerIndex={0}>
            <h2 className="font-display-heading text-lg font-semibold text-[var(--text-primary)]">
              {deepExplanation
                ? siteCopy.paperDetail.explanationHeading
                : siteCopy.paperDetail.abstractHeading}
            </h2>
          </ScrollReveal>
          {summary && deepExplanation ? (
            <ScrollReveal as="p" staggerIndex={1} className="font-body-prose mt-3 max-w-3xl text-sm text-[var(--text-secondary)]">
              {summary}
            </ScrollReveal>
          ) : null}
          <ScrollReveal
            as="p"
            staggerIndex={summary && deepExplanation ? 2 : 1}
            className="font-body-prose mt-4 max-w-3xl whitespace-pre-line text-base text-[var(--text-primary)]/90"
          >
            {deepExplanation || summary}
          </ScrollReveal>
        </section>

        {highlights.length > 0 ? (
          <section className="mt-8 border-t border-[var(--border-hairline)] pt-8">
            <ScrollReveal staggerIndex={0}>
              <h2 className="font-display-heading text-lg font-semibold text-[var(--text-primary)]">
                {siteCopy.paperDetail.highlightsHeading}
              </h2>
            </ScrollReveal>
            <ul className="mt-4 space-y-3">
              {highlights.map((item, idx) => (
                <ScrollReveal
                  key={idx}
                  as="li"
                  staggerIndex={idx % 5}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-primary)]/90"
                >
                  <span className="font-mono-tabular mt-0.5 shrink-0 text-xs font-medium tracking-wider text-[var(--text-eyebrow)]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="font-body-prose">{item}</span>
                </ScrollReveal>
              ))}
            </ul>
          </section>
        ) : null}

        {paper.tags.length > 0 ? (
          <ScrollReveal staggerIndex={0}>
            <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--border-hairline)] pt-6 text-xs text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">
                {siteCopy.paperDetail.tagsLabel}:
              </span>
              <span className="font-mono-tabular">{paper.tags.join(' · ')}</span>
            </div>
          </ScrollReveal>
        ) : null}

        {/* 3. Horizontal PDF Preview Screenshots + Lightbox */}
        <section className="mt-10 border-t border-[var(--border-hairline)] pt-8">
          <ScrollReveal staggerIndex={0} className="mb-4">
            <h2 className="font-display-heading text-lg font-semibold text-[var(--text-primary)]">
              {siteCopy.paperDetail.screenshotsHeading}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {siteCopy.paperDetail.screenshotsSubheading}
            </p>
          </ScrollReveal>

          {previewImages.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
              {previewImages.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`${siteCopy.paperDetail.openLightbox} (${index + 1})`}
                  className="group relative w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] text-start shadow-xs transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:w-80"
                >
                  <img
                    src={src}
                    alt={`${title} — ${index + 1}`}
                    referrerPolicy="no-referrer"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <span className="glass-surface absolute end-3 bottom-3 inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-primary)] opacity-90 transition-opacity group-hover:opacity-100">
                    <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] p-6 text-center text-xs text-[var(--text-secondary)]">
              {siteCopy.paperDetail.screenshotsEmpty}
            </div>
          )}
        </section>

        {/* 4. Action Zone Directly Beneath Screenshots */}
        <section className="mt-8 border-t border-[var(--border-hairline)] pt-8">
          {/* Primary Prominent GREEN Download PDF Button */}
          <ScrollReveal staggerIndex={0}>
            <a
              href={pdfUrl}
              download
              className="inline-flex min-h-[52px] items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl bg-[#16A34A] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#15803D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              <span>{siteCopy.paperDetail.downloadPdf}</span>
            </a>
          </ScrollReveal>

          {/* Directly Under Green Button: Two BLUE File-Opening Choice Buttons */}
          <ScrollReveal staggerIndex={1} className="mt-3.5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowInlinePdf((prev) => !prev)}
              aria-expanded={showInlinePdf}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#0062C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]"
            >
              <BookOpen className="h-4 w-4" strokeWidth={1.85} />
              <span>
                {showInlinePdf
                  ? siteCopy.paperDetail.hideInsidePage
                  : siteCopy.paperDetail.viewInsidePage}
              </span>
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#0062C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.85} />
              <span>{siteCopy.paperDetail.openInNewTab}</span>
            </a>
          </ScrollReveal>

          {/* Utility Row Nearby */}
          <ScrollReveal staggerIndex={2} className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  formatPlainCitation(paper, siteConfig.brandName),
                  siteCopy.paperDetail.citationCopied,
                )
              }
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-2xl border border-[var(--border-strong)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-xs transition-colors hover:bg-[var(--btn-secondary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <Quote className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
              <span>{siteCopy.paperDetail.copyCitation}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  formatBibtexCitation(paper, siteConfig.brandName),
                  siteCopy.paperDetail.bibtexCopied,
                )
              }
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-2xl border border-[var(--border-strong)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-xs transition-colors hover:bg-[var(--btn-secondary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <Copy className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
              <span>{siteCopy.paperDetail.copyBibtex}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                copyToClipboard(window.location.href, siteCopy.paperDetail.linkCopied)
              }
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-2xl border border-[var(--border-strong)] bg-[var(--btn-secondary-bg)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-xs transition-colors hover:bg-[var(--btn-secondary-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
            >
              <Link2 className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
              <span>{siteCopy.paperDetail.copyLink}</span>
            </button>
          </ScrollReveal>
        </section>

        {/* Optional Embedded Inline PDF Reader */}
        {showInlinePdf ? (
          <section className="mt-8 border-t border-[var(--border-hairline)] pt-8">
            <h2 className="font-display-heading mb-4 text-lg font-semibold text-[var(--text-primary)]">
              {siteCopy.paperDetail.pdfPreviewHeading}
            </h2>

            <div className="overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)]">
              <object
                data={pdfUrl}
                type="application/pdf"
                className="h-[640px] w-full"
                aria-label={title}
              >
                <iframe
                  src={pdfUrl}
                  title={title}
                  className="h-[640px] w-full border-0"
                />
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {siteCopy.paperDetail.pdfFallbackText}
                  </p>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0071E3] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0062C4]"
                  >
                    <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                    <span>{siteCopy.paperDetail.openInNewTab}</span>
                  </a>
                </div>
              </object>
            </div>
          </section>
        ) : null}
      </article>

      <ScreenshotLightbox
        images={previewImages}
        activeIndex={lightboxIndex}
        title={title}
        onClose={() => setLightboxIndex(null)}
        onSelectIndex={setLightboxIndex}
      />

      <Toast toast={toast} />
    </div>
  );
}
