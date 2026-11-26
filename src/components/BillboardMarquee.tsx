import {useMemo, useState, type CSSProperties} from 'react';
import {Link} from 'react-router-dom';
import {papers, type ResearchPaper} from '../data/papers';
import {resolveAssetUrl} from '../utils/papers';
import {
  buildBillboardSequence,
  type BillboardEmblemKind,
  type BillboardItem,
} from '../utils/billboardMarquee';
import {PosterPlaceholder} from './PosterPlaceholder';
import {VerifiedBadge} from './VerifiedBadge';

function BillboardPosterCard({
  paper,
  title,
  category,
  inDuplicate = false,
}: {
  paper: ResearchPaper;
  title: string;
  category: string;
  inDuplicate?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const thumbUrl = paper.thumbnail
    ? resolveAssetUrl(paper.thumbnail, import.meta.env.BASE_URL)
    : '';
  const hasValidThumb = Boolean(thumbUrl) && !imgError;

  return (
    <Link
      to={`/qrb-lab/${paper.slug}`}
      tabIndex={inDuplicate ? -1 : undefined}
      aria-label={inDuplicate ? undefined : title}
      className="group relative block h-28 sm:h-36 aspect-[3/4] shrink-0 overflow-hidden rounded-xl border border-white/[0.14] bg-[#0B0B0B] transition-[border-color,transform] duration-200 hover:border-white/[0.32] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      style={{
        boxShadow:
          '0 10px 28px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {hasValidThumb ? (
        <img
          src={thumbUrl}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <PosterPlaceholder
          title={title}
          category={category}
          version={paper.version}
        />
      )}

      {/* Subtle Bottom Dark Scrim + Paper Title Only */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-2.5 pt-10"
        style={{
          background:
            'linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.72) 55%, transparent 100%)',
        }}
      >
        <span className="font-display-card line-clamp-2 text-[11px] font-semibold leading-tight text-[#F5F5F5] sm:text-xs">
          {title}
        </span>
      </div>
    </Link>
  );
}

function ResearchMonographIcon({label}: {label: string}) {
  return (
    <span
      role="img"
      aria-label={label}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-[#F5F5F5]/85 sm:h-12 sm:w-12"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7 sm:h-8 sm:w-8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M6.25 3.75H14.25L18.5 8V20.25H6.25V3.75Z"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinejoin="round"
        />
        <path
          d="M14 3.75V8.25H18.5"
          stroke="currentColor"
          strokeWidth="1.45"
          strokeLinejoin="round"
        />
        <path
          d="M9 12H15.5M9 15.5H13.5"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function BillboardEmblem({
  emblem,
  label,
}: {
  emblem: BillboardEmblemKind;
  label: string;
}) {
  const [logoError, setLogoError] = useState(false);
  const logoSrc = resolveAssetUrl('images/logo.png', import.meta.env.BASE_URL);

  switch (emblem) {
    case 'brand-logo':
      return (
        <span className="inline-flex shrink-0 items-center justify-center select-none">
          {!logoError ? (
            <img
              src={logoSrc}
              alt={label}
              draggable={false}
              onError={() => setLogoError(true)}
              className="brand-logo-img h-10 w-auto object-contain sm:h-12 md:h-14"
            />
          ) : (
            <span className="font-billboard text-3xl text-[#F5F5F5] sm:text-4xl">
              Q
            </span>
          )}
        </span>
      );

    case 'research':
      return <ResearchMonographIcon label={label} />;

    case 'verified-badge':
      return <VerifiedBadge size={34} label={label} />;
  }
}

function renderBillboardNode(item: BillboardItem, inDuplicate = false) {
  if (item.kind === 'paper') {
    return (
      <BillboardPosterCard
        paper={item.paper}
        title={item.title}
        category={item.category}
        inDuplicate={inDuplicate}
      />
    );
  }

  if (item.kind === 'emblem') {
    return <BillboardEmblem emblem={item.emblem} label={item.label} />;
  }

  return (
    <span className="font-billboard whitespace-nowrap select-none text-2xl text-[#F5F5F5] sm:text-3xl md:text-4xl lg:text-[2.65rem]">
      {item.label}
    </span>
  );
}

export function BillboardMarquee() {
  const {halfTrackItems, durationSeconds} = useMemo(
    () => buildBillboardSequence(papers),
    [],
  );

  return (
    <section
      aria-label="Continuous platform showcase marquee"
      className="billboard-marquee-shell py-8 sm:py-12 bg-[#050505]"
    >
      <div
        className="billboard-marquee-track flex items-center gap-12 sm:gap-16 lg:gap-20"
        style={
          {
            '--billboard-duration': `${durationSeconds}s`,
            animationPlayState: 'running',
          } as CSSProperties
        }
      >
        {/* Primary Continuous Half-Track */}
        {halfTrackItems.map((item, idx) => (
          <div
            key={`primary-${item.id}-${idx}`}
            className="flex shrink-0 items-center gap-12 sm:gap-16 lg:gap-20"
          >
            {renderBillboardNode(item, false)}
            <span
              aria-hidden="true"
              className="h-5 w-px shrink-0 bg-white/[0.14] select-none"
            />
          </div>
        ))}

        {/* Duplicate Half-Track for Zero-Seam Infinite -50% Loop */}
        {halfTrackItems.map((item, idx) => (
          <div
            key={`dup-${item.id}-${idx}`}
            aria-hidden="true"
            className="flex shrink-0 items-center gap-12 sm:gap-16 lg:gap-20"
          >
            {renderBillboardNode(item, true)}
            <span
              aria-hidden="true"
              className="h-5 w-px shrink-0 bg-white/[0.14] select-none"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
