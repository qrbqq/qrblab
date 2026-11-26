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
    id: "log-20261126-160350",
    timestamp: "2026-11-26T16:03:50Z",
    caption: "النقلة الحقيقية ليست في عدد المعاملات، بل في test-time compute: نماذج مدرَّبة بالتعلم المعزز تولّد chain-of-thought، وتراجع مساراتها بـverifier، وتصحح أخطاءها قبل الجواب. الآلية ما زالت next-token prediction، لكن الاستدلال نفسه صار قابلاً للتوسع بالحوسبة.",
    image: "images/log-20261126-160350.jpg",
  },
{
    id: "log-20261126-155756",
    timestamp: "2026-11-26T15:57:56Z",
    caption: "0101",
  }
];
