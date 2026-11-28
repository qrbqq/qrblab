import type {ResearchPaper} from '../data/papers';
import {getLatestPapers, getLocalizedText} from './papers';

export type BillboardEmblemKind = 'brand-logo' | 'research' | 'verified-badge';

export type BillboardItem =
  | {
      id: string;
      kind: 'label';
      label: string;
      isSkills?: boolean;
    }
  | {
      id: string;
      kind: 'emblem';
      emblem: BillboardEmblemKind;
      label: string;
    }
  | {
      id: string;
      kind: 'paper';
      paper: ResearchPaper;
      title: string;
      category: string;
    };

export interface BillboardSequenceResult {
  /** Single logical cycle containing all disciplines, emblems, and every paper once */
  cycleItems: BillboardItem[];
  /** Repeated half-track items so a single -50% loop spans ultrawide viewports cleanly */
  halfTrackItems: BillboardItem[];
  /** Proportional animation duration in seconds for steady billboard velocity */
  durationSeconds: number;
}

const CORE_ANCHORS: BillboardItem[] = [
  {id: 'disc-ai', kind: 'label', label: 'Artificial Intelligence'},
  {id: 'emblem-logo', kind: 'emblem', emblem: 'brand-logo', label: '0101 brand mark'},
  {id: 'disc-mechatronics', kind: 'label', label: 'Mechatronics'},
  {
    id: 'emblem-verified',
    kind: 'emblem',
    emblem: 'verified-badge',
    label: 'Official crimson verified seal',
  },
  {id: 'disc-robotics', kind: 'label', label: 'Robotics'},
  {id: 'disc-skills', kind: 'label', label: 'Skills', isSkills: true},
  {
    id: 'emblem-research',
    kind: 'emblem',
    emblem: 'research',
    label: 'Research monograph emblem',
  },
  {id: 'disc-autonomous', kind: 'label', label: 'Autonomous Vehicles'},
];

function createPaperBillboardItem(paper: ResearchPaper): BillboardItem {
  return {
    id: `paper-${paper.id || paper.slug}`,
    kind: 'paper',
    paper,
    title: getLocalizedText(paper.title),
    category: getLocalizedText(paper.category),
  };
}

/**
 * Dynamically builds a shuffled, interleaved sequence for the full-bleed Billboard Marquee.
 * Combines platform disciplines + "Skills", official vector emblems & crimson verified seal,
 * and every published paper in `src/data/papers.ts` (zero empty slots, zero broken placeholders).
 */
export function buildBillboardSequence(
  sourcePapers: ResearchPaper[],
): BillboardSequenceResult {
  const orderedPapers = getLatestPapers(sourcePapers, sourcePapers.length);
  const paperNodes = orderedPapers.map(createPaperBillboardItem);

  let cycleItems: BillboardItem[];

  if (paperNodes.length === 0) {
    cycleItems = [...CORE_ANCHORS];
  } else if (paperNodes.length <= CORE_ANCHORS.length) {
    // Spread papers evenly across the varied anchor sequence (Discipline -> Paper -> Emblem...)
    cycleItems = [];
    const totalAnchors = CORE_ANCHORS.length;
    const totalPapers = paperNodes.length;
    // Insertion indices chosen to distribute papers smoothly without clustering
    const step = totalAnchors / totalPapers;
    const insertAfterAnchor = new Map<number, BillboardItem[]>();

    for (let p = 0; p < totalPapers; p++) {
      const slot = Math.min(totalAnchors - 1, Math.floor(p * step));
      const existing = insertAfterAnchor.get(slot) ?? [];
      existing.push(paperNodes[p]!);
      insertAfterAnchor.set(slot, existing);
    }

    for (let a = 0; a < totalAnchors; a++) {
      cycleItems.push(CORE_ANCHORS[a]!);
      const inserted = insertAfterAnchor.get(a);
      if (inserted) {
        cycleItems.push(...inserted);
      }
    }
  } else {
    // Large catalog (9..100+ papers): emit every paper interleaved rhythmically with anchors
    cycleItems = [];
    const papersPerAnchor = paperNodes.length > 24 ? 2 : 1;
    let anchorCursor = 0;

    for (let i = 0; i < paperNodes.length; i++) {
      if (i % papersPerAnchor === 0) {
        cycleItems.push(CORE_ANCHORS[anchorCursor % CORE_ANCHORS.length]!);
        anchorCursor++;
      }
      cycleItems.push(paperNodes[i]!);
    }

    // Ensure all core disciplines & emblems still appear at least once even if paper count was small multiple
    while (anchorCursor < CORE_ANCHORS.length) {
      cycleItems.push(CORE_ANCHORS[anchorCursor]!);
      anchorCursor++;
    }
  }

  // Ensure each half-track has enough visual width to seamlessly cover 4K ultrawide displays
  const minItemsPerHalfTrack = 16;
  const repeatCount = Math.max(1, Math.ceil(minItemsPerHalfTrack / cycleItems.length));
  const halfTrackItems: BillboardItem[] = [];
  for (let r = 0; r < repeatCount; r++) {
    halfTrackItems.push(...cycleItems);
  }

  // Steady billboard cruise speed proportional to item count (~3.2s per item slot)
  const durationSeconds = Math.max(36, Math.round(halfTrackItems.length * 3.2));

  return {
    cycleItems,
    halfTrackItems,
    durationSeconds,
  };
}
