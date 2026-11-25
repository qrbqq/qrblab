export interface LabLogEntry {
  id: string;
  timestamp: string; // ISO date string e.g. "2026-11-23T18:00:00Z"
  caption: {
    en: string;
    ar?: string;
    fr?: string;
    de?: string;
    es?: string;
  };
  image?: string; // Path relative to public/ e.g. "images/starship-schematic.png"
  sourceUrl?: string; // Optional external reference link
  tags?: string[];
}

/**
 * Lab Log Dispatch Template for qrblab:
 * 1. Optional: place visual assets inside `public/images/` (e.g. `public/images/motor-bench.png`).
 * 2. Copy the template object below into the `labLogs` array (`fr`, `de`, `es` are optional and fall back to `en`).
 * 3. Commit and push to `main` — GitHub Actions builds and deploys automatically.
 *
 * {
 *   id: "log-2026-11-23-01",
 *   timestamp: "2026-11-23T18:00:00Z",
 *   caption: {
 *     en: "Bench-testing a 40kHz current loop on the dual-inverter BLDC test rig. Phase jitter dropped below 1.2 microseconds after switching to DMA-triggered ADC sampling.",
 *     ar: "اختبار معمل لحلقة التيار بتردد 40 كيلوهرتز على منصة العاكس المزدوج لمحرك BLDC. انخفض تذبذب الطور إلى أقل من 1.2 ميكروثانية بعد تفعيل أخذ العينات عبر DMA.",
 *   },
 *   image: "images/motor-bench-schematic.png",
 *   sourceUrl: "https://github.com/qrblab",
 *   tags: ["BLDC", "FOC", "Firmware"],
 * }
 */
export const labLogs: LabLogEntry[] = [];
