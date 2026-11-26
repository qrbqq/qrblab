import {marqueeItems, type MarqueeItem} from '../data/marqueeItems';

export function ArchitecturalMarquee() {
  // Repeat items 4 times to ensure seamless infinite looping across ultra-wide displays
  const repeatedItems = [
    ...marqueeItems,
    ...marqueeItems,
    ...marqueeItems,
    ...marqueeItems,
  ];

  const getItemClass = (variant: MarqueeItem['variant']) => {
    switch (variant) {
      case 'solid':
        return 'marquee-item-solid text-xl sm:text-2xl';
      case 'outline':
        return 'marquee-item-outline text-xl sm:text-2xl';
      case 'slanted':
        return 'marquee-item-slanted text-xl sm:text-2xl';
      case 'mono':
        return 'marquee-item-mono text-lg sm:text-xl';
      default:
        return 'marquee-item-solid text-xl sm:text-2xl';
    }
  };

  return (
    <div className="w-full border-t border-b border-white/[0.08] bg-[#050505] py-4 sm:py-5 architectural-marquee-container">
      <div className="architectural-marquee-track flex items-center gap-10 sm:gap-14">
        {repeatedItems.map((item, index) => {
          const isDuplicate = index >= marqueeItems.length;
          return (
            <div
              key={`${item.id}-${index}`}
              aria-hidden={isDuplicate ? 'true' : undefined}
              className="flex items-center gap-10 sm:gap-14 shrink-0 select-none"
            >
              <div className="flex items-center gap-3.5">
                <span className="font-mono-tabular text-xs font-semibold tracking-wider text-white/40">
                  {item.index}
                </span>
                <span className={getItemClass(item.variant)}>
                  {item.label}
                </span>
              </div>
              <span
                aria-hidden="true"
                className="font-mono-tabular text-xs text-white/25 select-none"
              >
                /
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
