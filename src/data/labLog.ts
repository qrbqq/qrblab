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

export const labLogs: LabLogEntry[] = [
  {
    id: "log-20261126-120111",
    timestamp: "2026-11-26T12:01:11Z",
    caption: "البداية",
  }
];
