import type {LucideIcon} from 'lucide-react';

interface GlassIconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'neutral' | 'accent';
  staticMode?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<GlassIconProps['size']>, {box: string; icon: string}> = {
  sm: {box: 'h-10 w-10 rounded-xl', icon: 'h-4 w-4'},
  md: {box: 'h-12 w-12 rounded-2xl', icon: 'h-5 w-5'},
  lg: {box: 'h-14 w-14 rounded-2xl', icon: 'h-6 w-6'},
};

export function GlassIcon({
  icon: Icon,
  size = 'md',
  tone = 'neutral',
  staticMode = false,
  className = '',
}: GlassIconProps) {
  const sizing = SIZE_CLASSES[size];
  const colorClass = tone === 'accent' ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]';
  const surfaceClass = staticMode ? 'static-icon' : 'glass-icon';

  return (
    <div
      className={`${surfaceClass} inline-flex shrink-0 items-center justify-center ${sizing.box} ${colorClass} ${className}`}
      aria-hidden="true"
    >
      <Icon className={sizing.icon} strokeWidth={1.5} />
    </div>
  );
}
