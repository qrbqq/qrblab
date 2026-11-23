import {useEffect, useRef, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Images,
  Link2,
  Maximize2,
  Quote,
} from 'lucide-react';
import {EmptyStateCard} from '../components/EmptyStateCard';
import {GlassIcon} from '../components/GlassIcon';
import {ScreenshotLightbox} from '../components/ScreenshotLightbox';
import {StarRating} from '../components/StarRating';
import {Toast, type ToastMessage} from '../components/Toast';
import {useLanguage} from '../context/LanguageContext';
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
  const {lang, t} = useLanguage();
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
      showToast(t.paperDetail.copyFailed, 'error');
    }
  };

  if (!paper) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyStateCard
          icon={FileText}
          title={t.paperDetail.notFoundTitle}
          description={t.paperDetail.notFoundDescription}
          actionLabel={t.paperDetail.backToArchive}
          actionTo="/research"
        />
      </div>
    );
  }

  const pdfUrl = resolveAssetUrl(paper.pdfPath, import.meta.env.BASE_URL);
  const formattedDate = formatPaperDate(paper.publishedDate, lang);
  const title = getLocalizedText(paper.title, lang);
  const category = getLocalizedText(paper.category, lang);
  const highlights = getLocalizedList(paper.highlights, lang);
  const summary = getPaperSummary(paper, lang);
  const deepExplanation = getLocalizedText(paper.explanation, lang).trim();
  const previewImages = (paper.previewImages ?? [])
    .map((img) => resolveAssetUrl(img, import.meta.env.BASE_URL))
    .filter(Boolean);

  const handleRate = (stars: number) => {
    const saved = savePaperRating(paper.slug, stars);
    if (saved) {
      setRating(saved.stars);
      showToast(t.paperDetail.ratingSaved, 'success');
    }
  };

  const handleClearRating = () => {
    clearPaperRating(paper.slug);
    setRating(null);
    showToast(t.paperDetail.ratingCleared, 'success');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        to="/research"
        className="mb-8 inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.75} />
        <span>{t.paperDetail.backToArchive}</span>
      </Link>

      <article className="glass-surface rounded-[2rem] p-6 sm:p-10 lg:p-12">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
          <span className="font-semibold text-[var(--text-primary)]">{category}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={paper.publishedDate} className="tabular-nums">
            {formattedDate}
          </time>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular">{paper.version}</span>
          {paper.doi ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">
                {t.paperDetail.doiLabel}: {paper.doi}
              </span>
            </>
          ) : null}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl text-balance">
          {title}
        </h1>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-y border-[var(--border-hairline)] py-5 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-[var(--text-secondary)]">
              {t.paperDetail.authorsLabel}
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--text-primary)]">
              {paper.authors.join(', ')}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[var(--text-secondary)]">
              {t.paperDetail.publishedLabel}
            </dt>
            <dd className="mt-1 text-sm font-medium text-[var(--text-primary)] tabular-nums">
              {formattedDate}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-[var(--text-secondary)]">
              {t.paperDetail.versionLabel}
            </dt>
            <dd className="mt-1 font-mono-tabular text-sm font-medium text-[var(--text-primary)]">
              {paper.version}
            </dd>
          </div>
        </dl>

        {/* 1. Interactive localStorage Star Rating */}
        <section className="mt-8 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface-elevated)] p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                {t.paperDetail.rateHeading}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {t.paperDetail.rateSubheading}
              </p>
            </div>

            <StarRating
              value={rating}
              onChange={handleRate}
              onClear={handleClearRating}
            />
          </div>
        </section>

        {/* 2. Deep Explanation & Summary */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {deepExplanation
              ? t.paperDetail.explanationHeading
              : t.paperDetail.abstractHeading}
          </h2>
          {summary && deepExplanation ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
              {summary}
            </p>
          ) : null}
          <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-relaxed text-[var(--text-primary)]/90">
            {deepExplanation || summary}
          </p>
        </section>

        {highlights.length > 0 ? (
          <section className="mt-8 border-t border-[var(--border-hairline)] pt-8">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
              {t.paperDetail.highlightsHeading}
            </h2>
            <ul className="mt-4 space-y-3">
              {highlights.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-primary)]/90"
                >
                  <GlassIcon icon={Check} size="sm" />
                  <span className="pt-2">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {paper.tags.length > 0 ? (
          <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--border-hairline)] pt-6 text-xs text-[var(--text-secondary)]">
            <span className="font-medium text-[var(--text-primary)]">
              {t.paperDetail.tagsLabel}:
            </span>
            <span>{paper.tags.join(' · ')}</span>
          </div>
        ) : null}

        {/* 3. Horizontal PDF Preview Screenshots + Lightbox */}
        <section className="mt-10 border-t border-[var(--border-hairline)] pt-8">
          <div className="mb-4 flex items-start gap-3">
            <GlassIcon icon={Images} size="sm" />
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                {t.paperDetail.screenshotsHeading}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {t.paperDetail.screenshotsSubheading}
              </p>
            </div>
          </div>

          {previewImages.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
              {previewImages.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`${t.paperDetail.openLightbox} (${index + 1})`}
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
              {t.paperDetail.screenshotsEmpty}
            </div>
          )}
        </section>

        {/* 4. Action Zone Directly Beneath Screenshots */}
        <section className="mt-8 border-t border-[var(--border-hairline)] pt-8">
          {/* Primary Prominent GREEN Download PDF Button */}
          <div>
            <a
              href={pdfUrl}
              download
              className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-[#16A34A] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#15803D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A] whitespace-nowrap"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              <span>{t.paperDetail.downloadPdf}</span>
            </a>
          </div>

          {/* Directly Under Green Button: Two BLUE File-Opening Choice Buttons */}
          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowInlinePdf((prev) => !prev)}
              aria-expanded={showInlinePdf}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#0062C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4" strokeWidth={1.85} />
              <span>
                {showInlinePdf
                  ? t.paperDetail.hideInsidePage
                  : t.paperDetail.viewInsidePage}
              </span>
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-[#0071E3] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#0062C4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] whitespace-nowrap"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={1.85} />
              <span>{t.paperDetail.openInNewTab}</span>
            </a>
          </div>

          {/* Utility Row Nearby */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  formatPlainCitation(paper, lang, siteConfig.brandName),
                  t.paperDetail.citationCopied,
                )
              }
              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-xs transition-colors hover:bg-[var(--bg-surface-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] whitespace-nowrap"
            >
              <Quote className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
              <span>{t.paperDetail.copyCitation}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                copyToClipboard(
                  formatBibtexCitation(paper, lang, siteConfig.brandName),
                  t.paperDetail.bibtexCopied,
                )
              }
              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-xs transition-colors hover:bg-[var(--bg-surface-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] whitespace-nowrap"
            >
              <Copy className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
              <span>{t.paperDetail.copyBibtex}</span>
            </button>

            <button
              type="button"
              onClick={() =>
                copyToClipboard(window.location.href, t.paperDetail.linkCopied)
              }
              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-xs transition-colors hover:bg-[var(--bg-surface-elevated)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] whitespace-nowrap"
            >
              <Link2 className="h-4 w-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
              <span>{t.paperDetail.copyLink}</span>
            </button>
          </div>
        </section>

        {/* Optional Embedded Inline PDF Reader */}
        {showInlinePdf ? (
          <section className="mt-8 border-t border-[var(--border-hairline)] pt-8">
            <div className="mb-4 flex items-center gap-3">
              <GlassIcon icon={FileText} size="sm" />
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
                {t.paperDetail.pdfPreviewHeading}
              </h2>
            </div>

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
                    {t.paperDetail.pdfFallbackText}
                  </p>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0071E3] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0062C4]"
                  >
                    <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                    <span>{t.paperDetail.openInNewTab}</span>
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
