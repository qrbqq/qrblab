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
import {KineticHeadline} from '../components/KineticHeadline';
import {PosterPlaceholder} from '../components/PosterPlaceholder';
import {ScreenshotLightbox} from '../components/ScreenshotLightbox';
import {ScrollReveal} from '../components/ScrollReveal';
import {StarRating} from '../components/StarRating';
import {Toast, type ToastMessage} from '../components/Toast';
import {papers} from '../data/papers';
import {siteConfig, siteCopy} from '../data/siteConfig';
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
  const [imgError, setImgError] = useState(false);
  const timerRef = useRef<number | null>(null);

  const paper = findPaperBySlug(papers, slug);

  useEffect(() => {
    setShowInlinePdf(false);
    setImgError(false);
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
  const thumbUrl = paper.thumbnail
    ? resolveAssetUrl(paper.thumbnail, import.meta.env.BASE_URL)
    : '';
  const hasValidThumb = Boolean(thumbUrl) && !imgError;

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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Prelude Stage 0: Back Button */}
      <div className="paper-stage-0 mb-6 inline-block">
        <Link
          to="/qrb-lab"
          className="normal-case inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          <span>{siteCopy.paperDetail.backToArchive}</span>
        </Link>
      </div>

      <div className="hairline-draw-accent h-[1px] w-full bg-white/[0.08]" />

      <article className="py-10 sm:py-14">
        {/* =========================================================================
            1. TOP HERO SECTION (2-Column Editorial Split on Desktop, Clean Stack on Mobile)
            ========================================================================= */}
        <section className="grid grid-cols-1 items-start gap-8 md:grid-cols-12 lg:gap-12">
          {/* Left Side: Identical Glass Poster (3:4 Portrait Aspect Ratio, Glass Frame) */}
          <div className="paper-stage-1 w-full max-w-xs mx-auto md:max-w-none md:col-span-5 lg:col-span-4">
            <div
              className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/[0.12] bg-[#0B0B0B] shadow-2xl"
              style={{
                boxShadow: '0 16px 36px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
              }}
            >
              {hasValidThumb ? (
                <img
                  src={thumbUrl}
                  alt={title}
                  loading="eager"
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <PosterPlaceholder
                  title={title}
                  category={category}
                  version={paper.version}
                />
              )}

              {/* Minimal Top Specularity & Technical Badges */}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3 text-[10px] font-mono-tabular tracking-wider text-white/60">
                <span className="rounded bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/[0.08]">
                  {paper.version}
                </span>
                <span className="rounded bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/[0.08]">
                  {category}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side: Metadata Eyebrow, Title, Description, Tactile Monochrome Download Button, Secondary Controls */}
          <div className="paper-stage-2 flex flex-col justify-start md:col-span-7 lg:col-span-8">
            {/* Subtle Inline Metadata Eyebrow */}
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

            {/* Bebas Neue Kinetic Display Title */}
            <KineticHeadline
              as="h1"
              text={title}
              className="mt-3 text-3xl text-[#F5F5F5] sm:text-4xl lg:text-5xl"
            />

            {/* Authors Byline */}
            <div className="mt-3 text-xs font-medium text-[var(--text-secondary)]">
              <span className="text-[var(--text-eyebrow)]">{siteCopy.paperDetail.authorsLabel}:</span>{' '}
              <span className="text-[var(--text-primary)]/90">{paper.authors.join(', ')}</span>
            </div>

            {/* Short Description directly beneath title */}
            {summary ? (
              <p className="font-body-prose mt-4 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                {summary}
              </p>
            ) : null}

            {/* Action Zone: Prominent Tactile Monochrome Download Button & Secondary Controls (Zero Blue/Green!) */}
            <div className="mt-6 flex flex-col gap-4 border-t border-white/[0.08] pt-6">
              {pdfUrl ? (
                <div className="flex flex-wrap items-center gap-3">
                  {/* Prominent High-Contrast Monochrome Download PDF Button (Crisp #F5F5F5, dark #050505 text, NO GREEN!) */}
                  <a
                    href={pdfUrl}
                    download
                    className="inline-flex min-h-[46px] items-center justify-center gap-2.5 rounded-xl bg-[#F5F5F5] px-6 py-2.5 text-sm font-semibold text-[#050505] shadow-sm transition-all duration-200 hover:bg-white active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Download className="h-4 w-4" strokeWidth={2} />
                    <span>{siteCopy.paperDetail.downloadPdf}</span>
                  </a>

                  {/* View Inside Page (Neutral Frosted Glass, NO BLUE!) */}
                  <button
                    type="button"
                    onClick={() => setShowInlinePdf((prev) => !prev)}
                    aria-expanded={showInlinePdf}
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-white/[0.16] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-[#F5F5F5] backdrop-blur-sm shadow-xs transition-all duration-200 hover:bg-white/[0.12] hover:border-white/[0.28] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <BookOpen className="h-4 w-4 text-white/80" strokeWidth={1.75} />
                    <span>
                      {showInlinePdf
                        ? siteCopy.paperDetail.hideInsidePage
                        : siteCopy.paperDetail.viewInsidePage}
                    </span>
                  </button>

                  {/* Open In New Tab (Neutral Frosted Glass, NO BLUE!) */}
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-white/[0.16] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-[#F5F5F5] backdrop-blur-sm shadow-xs transition-all duration-200 hover:bg-white/[0.12] hover:border-white/[0.28] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <ExternalLink className="h-4 w-4 text-white/80" strokeWidth={1.75} />
                    <span>{siteCopy.paperDetail.openInNewTab}</span>
                  </a>
                </div>
              ) : null}

              {/* Utility Citation Controls & Compact Reader Rating */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        formatPlainCitation(paper, siteConfig.brandName),
                        siteCopy.paperDetail.citationCopied,
                      )
                    }
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-xs transition-all duration-150 hover:bg-white/[0.08] hover:border-white/[0.2] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    <Quote className="h-3.5 w-3.5 text-[var(--text-secondary)]" strokeWidth={1.75} />
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
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-xs transition-all duration-150 hover:bg-white/[0.08] hover:border-white/[0.2] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    <Copy className="h-3.5 w-3.5 text-[var(--text-secondary)]" strokeWidth={1.75} />
                    <span>{siteCopy.paperDetail.copyBibtex}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(window.location.href, siteCopy.paperDetail.linkCopied)
                    }
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-xs transition-all duration-150 hover:bg-white/[0.08] hover:border-white/[0.2] active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  >
                    <Link2 className="h-3.5 w-3.5 text-[var(--text-secondary)]" strokeWidth={1.75} />
                    <span>{siteCopy.paperDetail.copyLink}</span>
                  </button>
                </div>

                {/* Compact Reader Rating Stars (No bloated boxes) */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    {siteCopy.paperDetail.rateHeading}:
                  </span>
                  <StarRating
                    value={rating}
                    onChange={handleRate}
                    onClear={handleClearRating}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Collapsible Embedded Inline PDF Reader */}
        {showInlinePdf && pdfUrl ? (
          <section className="mt-8 overflow-hidden rounded-xl border border-white/[0.12] bg-[#0E0E0E] p-4 sm:p-6">
            <h2 className="font-display-heading mb-4 text-base font-semibold text-[var(--text-primary)]">
              {siteCopy.paperDetail.pdfPreviewHeading}
            </h2>

            <div className="overflow-hidden rounded-lg border border-white/[0.08] bg-black">
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
                    className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-white/[0.1] px-5 py-2.5 text-sm font-medium text-white hover:bg-white/[0.16]"
                  >
                    <ExternalLink className="h-4 w-4" strokeWidth={1.75} />
                    <span>{siteCopy.paperDetail.openInNewTab}</span>
                  </a>
                </div>
              </object>
            </div>
          </section>
        ) : null}

        {/* =========================================================================
            2. MIDDLE SECTION — PDF Screenshots / Page Previews
            ========================================================================= */}
        <section className="paper-stage-3 mt-12 border-t border-[var(--border-hairline)] pt-10">
          <div className="mb-5">
            <h2 className="font-display-heading text-lg font-semibold text-[var(--text-primary)]">
              {siteCopy.paperDetail.screenshotsHeading}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {siteCopy.paperDetail.screenshotsSubheading}
            </p>
          </div>

          {previewImages.length > 0 ? (
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible">
              {previewImages.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`${siteCopy.paperDetail.openLightbox} (${index + 1})`}
                  className="group relative w-64 shrink-0 snap-start overflow-hidden rounded-xl border border-white/[0.12] bg-[#0E0E0E] text-start shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-white/[0.24] hover:shadow-lg active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] sm:w-auto"
                >
                  <img
                    src={src}
                    alt={`${title} — ${index + 1}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <span className="glass-surface absolute end-2.5 bottom-2.5 inline-flex h-8 w-8 items-center justify-center rounded-lg text-white opacity-80 backdrop-blur-md transition-opacity group-hover:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="font-body-prose pt-1 text-xs text-[var(--text-secondary)]">
              {siteCopy.paperDetail.screenshotsEmpty}
            </p>
          )}
        </section>

        {/* =========================================================================
            3. LOWER SECTION — Detailed Technical Explanation
            ========================================================================= */}
        <section className="paper-stage-4 mt-12 border-t border-[var(--border-hairline)] pt-10">
          <div>
            <h2 className="font-display-heading text-lg font-semibold text-[var(--text-primary)]">
              {deepExplanation
                ? siteCopy.paperDetail.explanationHeading
                : siteCopy.paperDetail.abstractHeading}
            </h2>

            <p className="font-body-prose mt-4 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-[var(--text-primary)]/90 sm:text-base">
              {deepExplanation || summary}
            </p>
          </div>

          {highlights.length > 0 ? (
            <div className="mt-8 border-t border-[var(--border-hairline)] pt-8">
              <h3 className="font-display-heading text-base font-semibold text-[var(--text-primary)]">
                {siteCopy.paperDetail.highlightsHeading}
              </h3>
              <ul className="mt-4 space-y-3">
                {highlights.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-sm leading-relaxed text-[var(--text-primary)]/90"
                  >
                    <span className="font-mono-tabular mt-0.5 shrink-0 text-xs font-medium tracking-wider text-[var(--text-eyebrow)]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-body-prose">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {paper.tags.length > 0 ? (
            <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-[var(--border-hairline)] pt-6 text-xs text-[var(--text-secondary)]">
              <span className="font-medium text-[var(--text-primary)]">
                {siteCopy.paperDetail.tagsLabel}:
              </span>
              <span className="font-mono-tabular">{paper.tags.join(' · ')}</span>
            </div>
          ) : null}
        </section>
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
