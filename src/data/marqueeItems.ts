export interface MarqueeItem {
  id: string;
  index: string; // e.g. "01", "02", "03", "04"
  label: string;
  variant: 'solid' | 'outline' | 'slanted' | 'mono';
  tag?: string;    // Optional future badge (e.g. "PARTNER" / "SPONSOR")
  href?: string;   // Optional target link
  active?: boolean; // Optional active state flag
}

/**
 * Static configuration file for the architectural discipline marquee strip on Home.
 * Easily extensible: add new disciplines, announcements, or monochrome partner/sponsor slots here.
 */
export const marqueeItems: MarqueeItem[] = [
  {
    id: 'disc-ai',
    index: '01',
    label: 'Artificial Intelligence',
    variant: 'solid',
  },
  {
    id: 'disc-mechatronics',
    index: '02',
    label: 'Mechatronics',
    variant: 'outline',
  },
  {
    id: 'disc-robotics',
    index: '03',
    label: 'Robotics',
    variant: 'slanted',
  },
  {
    id: 'disc-autonomous',
    index: '04',
    label: 'Autonomous Vehicles',
    variant: 'mono',
  },
];
