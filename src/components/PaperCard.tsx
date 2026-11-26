import {useState} from 'react';
import {Link} from 'react-router-dom';
import {ArrowRight} from 'lucide-react';
import type {ResearchPaper} from '../data/papers';
import {getLocalizedText, resolveAssetUrl} from '../utils/papers';
import {PosterPlaceholder} from './PosterPlaceholder';

interface PaperCardProps {
  paper: ResearchPaper;
  staticMode?: boolean;
}

export function PaperCard({paper, staticMode = false}: PaperCardProps) {
  const [imgError, setImgError] = useState(false);
  const title = getLocalizedText(paper.title);
  const category = getLocalizedText(paper.category);
  const thumbUrl = paper.thumbnail
    ? resolveAssetUrl(paper.thumbnail, import.meta.env.BASE_URL)
    : '';

  const hasValidThumb = Boolean(thumbUrl) && !imgError;

  return (
    <Link
      to={`/qrb-lab/${paper.slug}`}
      className="group block w-full text-start outline-none"
      aria-label={`${title} — Open PDF`}
    >
      {/* 1. Glass Poster Screen Frame (Aspect 3/4) */}
      <div
        className={`relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-white/[0.12] bg-[#0B0B0B] shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          staticMode
            ? 'active:scale-[0.985] group-hover:-translate-y-1 group-hover:border-white/[0.28] group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.8)]'
            : 'active:scale-[0.985] group-hover:-translate-y-1 group-hover:border-white/[0.28] group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.8)]'
        } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]`}
        style={{
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Full-Bleed Artwork or Scalable Monochrome Poster Fallback */}
        {hasValidThumb ? (
          <img
            src={thumbUrl}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <PosterPlaceholder
            title={title}
            category={category}
            version={paper.version}
          />
        )}

        {/* Top Minimal Specular & Technical Badges */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3 text-[10px] font-mono-tabular tracking-wider text-white/60">
          <span className="rounded bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/[0.08]">
            {paper.version}
          </span>
          <span className="rounded bg-black/60 px-2 py-0.5 backdrop-blur-md border border-white/[0.08]">
            {category}
          </span>
        </div>

        {/* Title Inside the Poster Over Smooth Dark Gradient Scrim (Part of the Poster) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 pt-20 sm:p-5"
          style={{
            background:
              'linear-gradient(to top, rgba(5,5,5,0.96) 0%, rgba(5,5,5,0.78) 45%, rgba(5,5,5,0.32) 78%, transparent 100%)',
          }}
        >
          <h3 className="font-display-card text-base font-bold leading-snug text-[#F5F5F5] transition-colors duration-200 group-hover:text-white line-clamp-3">
            {title}
          </h3>
        </div>
      </div>

      {/* 2. Single Minimal Action Line Beneath Each Poster (with whitespace-nowrap to prevent arrow wrap) */}
      <div className="mt-3 flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[var(--text-secondary)] transition-colors duration-200 group-hover:text-[var(--text-primary)]">
        <span>Open PDF</span>
        <ArrowRight
          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  );
}
