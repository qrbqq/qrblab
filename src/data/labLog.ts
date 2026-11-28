export interface LabLogEntry {
  id: string;
  timestamp: string; // ISO date string e.g. "2026-11-23T18:00:00Z"
  caption: string | {
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
    id: 'log-20261128-094106',
    timestamp: '2026-11-28T07:41:06Z',
    caption: "From chatbots to agentic AI, and from the cloud to local AI—we are seeing the rise of open-weight models that run locally and can be customized through fine-tuning, alongside hybrid architectures and AI agents capable of executing real-world tasks. We may soon see smaller companies managed by lean teams, perhaps even operating entirely from home. I believe this is one of the defining features of the future of business.",
  },
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
