import type {LocalizedList, LocalizedText} from './papers';

export interface SocialLinks {
  github: string;
  discord: string;
  instagram: string;
  x: string;
  website: string;
}

export interface ProjectStatement {
  title: LocalizedText;
  paragraphs: LocalizedList;
  purposeParagraphIndex: number;
}

export interface SiteConfig {
  brandName: string;
  tagline: LocalizedText;
  projectStatement: ProjectStatement;
  contactEmail: string;
  socialLinks: SocialLinks;
}

/**
 * Central configuration for qrblab.
 * Leave optional contact/social fields as "" when unconfigured; the UI
 * automatically omits unconfigured links.
 */
export const siteConfig: SiteConfig = {
  brandName: 'qrblab',
  tagline: {
    en: '',
  },
  projectStatement: {
    title: {
      en: 'Research Disclaimer & Project Statement',
    },
    purposeParagraphIndex: 5,
    paragraphs: {
      en: [
        'qrblab is an independent personal research project driven by a deep passion for technology and engineering, and a continuous desire to explore and understand the technologies shaping the future of these fields, particularly Artificial Intelligence, Mechatronics, Robotics, and Autonomous Vehicles.',
        'All materials and research published on this website are the result of individual effort in research, writing, analysis, and design. The content reflects an ongoing process of gathering information from available sources, studying it, and presenting it in a structured and accessible way, alongside personal analyses, interpretations, and perspectives.',
        'We strive to rely on credible sources, verify information, and provide accurate and meaningful educational content. However, these materials are primarily intended for learning, exploration, and knowledge sharing. They should not be considered definitive scientific references or substitutes for specialized academic research and original sources.',
        "Some publications also include personal analyses and opinions that reflect the project's author's individual perspective. These interpretations are open to discussion and disagreement and are not intended to impose any particular viewpoint on readers.",
        'We believe that technological knowledge is an open and constantly evolving field, and that exchanging and discussing ideas is an essential part of learning and progress.',
        'The purpose of qrblab is not to claim ownership of definitive answers, but to explore important questions, develop a deeper understanding of emerging technologies, and share knowledge and experiences with others who share the same passion.',
        'Thank you for being part of this journey of exploration and learning.',
      ],
    },
  },
  contactEmail: '',
  socialLinks: {
    github: '',
    discord: '',
    instagram: '',
    x: '',
    website: '',
  },
};
