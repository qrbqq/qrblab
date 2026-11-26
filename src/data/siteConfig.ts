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
  /**
   * Independent Founder Profile Photo URL or public-relative path (e.g. "images/profile.jpg")
   * rendered exclusively on `/log` Profile Header and Lab Log post cards.
   * Leave as "" to render the circular white-inverted `logo.png` fallback emblem.
   * Never alters the fixed top-left `logo.png` + `qrbqq` navigation lockup.
   */
  profileAvatar: string;
  tagline: LocalizedText;
  projectStatement: ProjectStatement;
  contactEmail: string;
  socialLinks: SocialLinks;
}

export interface SiteCopy {
  nav: {
    home: string;
    qrbLab: string;
    labLog: string;
    about: string;
    searchOpen: string;
    searchClose: string;
    menuOpen: string;
    menuClose: string;
  };
  liveSearch: {
    label: string;
    placeholder: string;
    noResults: string;
    clearLabel: string;
  };
  settings: {
    clearDataButton: string;
    clearDataSuccess: string;
  };
  home: {
    eyebrow: string;
    heroEyebrow: string;
    heroTitle: string;
    heroHeadline: string;
    readFullStatement: string;
    collapseStatement: string;
    exploreQrbLab: string;
    labLogEyebrow: string;
    labLogHeading: string;
    labLogEmptyStatus: string;
    labLogEmptyTitle: string;
    labLogEmptyDescription: string;
    viewAllLogs: string;
    latestEyebrow: string;
    latestHeading: string;
    latestSubheading: string;
    latestEmptyStatus: string;
    latestEmptyTitle: string;
    latestEmptyDescription: string;
    sectionIndexLabel: string;
    sections: {
      overview: string;
      statement: string;
      labLog: string;
      publications: string;
    };
  };
  labLog: {
    eyebrow: string;
    title: string;
    subtitle: string;
    countSingular: string;
    countPlural: string;
    emptyStatus: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyHint: string;
    sourceLink: string;
    zoomImage: string;
  };
  qrbLab: {
    eyebrow: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchLabel: string;
    clearSearch: string;
    allCollections: string;
    collectionFilterLabel: string;
    paperCountSingular: string;
    paperCountPlural: string;
    readPaper: string;
    ratingUnrated: string;
    ratingYourLabel: string;
    emptyStatus: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyHint: string;
    noMatchesStatus: string;
    noMatchesTitle: string;
    noMatchesDescription: string;
    resetFilters: string;
  };
  paperDetail: {
    backToArchive: string;
    authorsLabel: string;
    publishedLabel: string;
    versionLabel: string;
    categoryLabel: string;
    doiLabel: string;
    tagsLabel: string;
    rateHeading: string;
    rateSubheading: string;
    rateAriaLabel: string;
    clearRating: string;
    ratingSaved: string;
    ratingCleared: string;
    abstractHeading: string;
    explanationHeading: string;
    highlightsHeading: string;
    screenshotsHeading: string;
    screenshotsSubheading: string;
    screenshotsEmpty: string;
    openLightbox: string;
    closeLightbox: string;
    prevScreenshot: string;
    nextScreenshot: string;
    pdfPreviewHeading: string;
    downloadPdf: string;
    viewInsidePage: string;
    hideInsidePage: string;
    openInNewTab: string;
    openPdf: string;
    copyCitation: string;
    copyBibtex: string;
    copyLink: string;
    citationCopied: string;
    bibtexCopied: string;
    linkCopied: string;
    copyFailed: string;
    pdfFallbackText: string;
    notFoundStatus: string;
    notFoundTitle: string;
    notFoundDescription: string;
  };
  about: {
    eyebrow: string;
    title: string;
    subtitle: string;
    focusEyebrow: string;
    focusHeading: string;
    focusSubheading: string;
    focusAreas: Array<{
      code: string;
      id: string;
      title: string;
      description: string;
    }>;
    channelsHeading: string;
    channelsSubheading: string;
    emailLabel: string;
    socialLabels: {
      github: string;
      discord: string;
      instagram: string;
      x: string;
      website: string;
    };
  };
  notFound: {
    code: string;
    title: string;
    description: string;
    backHome: string;
  };
  footer: {
    tagline: string;
    copyright: string;
    navigationLabel: string;
  };
}

/**
 * Central static configuration for qrblab.
 * Optional contact, social, and profileAvatar fields should remain "" when unconfigured;
 * the UI omits unconfigured channels and falls back cleanly when profileAvatar is empty.
 */
export const siteConfig: SiteConfig = {
  brandName: 'qrblab',
  profileAvatar: '',
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

export const siteCopy: SiteCopy = {
  nav: {
    home: 'Home',
    qrbLab: 'qrb lab',
    labLog: 'Lab Log',
    about: 'About',
    searchOpen: 'Open live search',
    searchClose: 'Close live search',
    menuOpen: 'Open navigation menu',
    menuClose: 'Close navigation menu',
  },
  liveSearch: {
    label: 'Search qrb lab documents and PDFs',
    placeholder: 'Search PDFs, studies, or topics...',
    noResults: 'No results found',
    clearLabel: 'Clear search query',
  },
  settings: {
    clearDataButton: 'Clear local data & reset',
    clearDataSuccess: 'Local ratings cleared',
  },
  home: {
    eyebrow: 'AI · MECHATRONICS · ROBOTICS · AUTONOMOUS VEHICLES',
    heroEyebrow: '00 / INDEPENDENT RESEARCH LAB',
    heroTitle: 'qrblab',
    heroHeadline: 'Intelligence, Mechatronics & Autonomous Systems',
    readFullStatement: 'Read full statement',
    collapseStatement: 'Show less',
    exploreQrbLab: 'Explore qrb lab',
    labLogEyebrow: '02 / LAB LOG',
    labLogHeading: 'Latest from Lab Log',
    labLogEmptyStatus: '00 / LOG STATUS',
    labLogEmptyTitle: 'No dispatches logged yet',
    labLogEmptyDescription:
      'Field notes, schematics, and rapid technical observations will appear here once logged.',
    viewAllLogs: 'View all logs',
    latestEyebrow: '03 / LATEST PUBLICATIONS',
    latestHeading: 'Latest Publications',
    latestSubheading: 'Recent technical monographs, notes, and systems analyses.',
    latestEmptyStatus: '00 / qrb lab STATUS',
    latestEmptyTitle: 'No publications yet',
    latestEmptyDescription:
      'Independent studies and PDFs registered in qrb lab will appear here as soon as they are published.',
    sectionIndexLabel: 'Page sections',
    sections: {
      overview: 'Overview',
      statement: 'Statement',
      labLog: 'Lab Log',
      publications: 'Publications',
    },
  },
  labLog: {
    eyebrow: 'DISPATCH STREAM',
    title: 'Lab Log',
    subtitle:
      'Chronological stream of field notes, bench schematics, and rapid technical observations.',
    countSingular: 'dispatch',
    countPlural: 'dispatches',
    emptyStatus: '00 / LOG STATUS',
    emptyTitle: 'No dispatches logged yet',
    emptyDescription:
      'Chronological field notes, bench schematics, and technical observations will appear here once added.',
    emptyHint: 'Explore qrb lab',
    sourceLink: 'Reference',
    zoomImage: 'Inspect dispatch visual',
  },
  qrbLab: {
    eyebrow: 'STATIC DOCUMENT INDEX',
    title: 'qrb lab',
    subtitle:
      'Browse registered PDFs, technical studies, and collections in qrb lab.',
    searchPlaceholder:
      'Filter qrb lab documents, folders, or tags...',
    searchLabel: 'Filter qrb lab index',
    clearSearch: 'Clear filter',
    allCollections: 'All',
    collectionFilterLabel: 'Filter qrb lab by folder or collection',
    paperCountSingular: 'document',
    paperCountPlural: 'documents',
    readPaper: 'Open PDF',
    ratingUnrated: 'Not rated yet',
    ratingYourLabel: 'Your rating',
    emptyStatus: '00 / qrb lab INDEX',
    emptyTitle: 'No documents in qrb lab yet',
    emptyDescription:
      'Registered PDFs and studies added to the static index will appear here automatically.',
    emptyHint: 'About qrblab',
    noMatchesStatus: '00 / QUERY RESULT',
    noMatchesTitle: 'No results found',
    noMatchesDescription:
      'Try adjusting your filter query or selecting a different folder.',
    resetFilters: 'Reset filters',
  },
  paperDetail: {
    backToArchive: 'Back to qrb lab',
    authorsLabel: 'Authors',
    publishedLabel: 'Published',
    versionLabel: 'Version',
    categoryLabel: 'Category',
    doiLabel: 'DOI',
    tagsLabel: 'Keywords',
    rateHeading: 'Reader Rating',
    rateSubheading: 'Saved locally in your browser',
    rateAriaLabel: 'Rate {n} out of 5 stars',
    clearRating: 'Clear',
    ratingSaved: 'Rating saved locally',
    ratingCleared: 'Rating cleared',
    abstractHeading: 'Summary',
    explanationHeading: 'Deep Explanation',
    highlightsHeading: 'Key Findings',
    screenshotsHeading: 'Preview Screenshots',
    screenshotsSubheading: 'Select any page preview to inspect at full resolution.',
    screenshotsEmpty: 'No preview screenshots attached for this publication.',
    openLightbox: 'Inspect preview screenshot',
    closeLightbox: 'Close preview modal',
    prevScreenshot: 'Previous screenshot',
    nextScreenshot: 'Next screenshot',
    pdfPreviewHeading: 'Embedded Document',
    downloadPdf: 'download PDF',
    viewInsidePage: 'View Inside Page',
    hideInsidePage: 'Hide Inline Reader',
    openInNewTab: 'Open in New Tab',
    openPdf: 'Open PDF',
    copyCitation: 'Copy Citation',
    copyBibtex: 'Copy BibTeX',
    copyLink: 'Copy Link',
    citationCopied: 'Citation copied to clipboard',
    bibtexCopied: 'BibTeX entry copied to clipboard',
    linkCopied: 'Publication link copied to clipboard',
    copyFailed: 'Unable to copy to clipboard',
    pdfFallbackText: 'Inline PDF preview is unavailable in this browser.',
    notFoundStatus: '404 / DOCUMENT',
    notFoundTitle: 'Document not found',
    notFoundDescription:
      'The requested PDF or study could not be located in qrb lab.',
  },
  about: {
    eyebrow: 'INSTITUTIONAL NOTE',
    title: 'About qrblab',
    subtitle:
      'Independent personal research exploring Artificial Intelligence, Mechatronics, Robotics, and Autonomous Vehicles.',
    focusEyebrow: '01 / CORE ARCHITECTURE',
    focusHeading: 'Research Focus Areas',
    focusSubheading:
      'Core domains explored through independent study, analysis, and technical design.',
    focusAreas: [
      {
        code: '01',
        id: 'ai',
        title: 'Artificial Intelligence',
        description:
          'Machine intelligence architectures, perception models, and analytical decision systems.',
      },
      {
        code: '02',
        id: 'mechatronics',
        title: 'Mechatronics',
        description:
          'Electro-mechanical drivetrain design, actuation, and integrated hardware engineering.',
      },
      {
        code: '03',
        id: 'robotics',
        title: 'Robotics',
        description:
          'Kinematics, embedded control loops, state estimation, and physical system coordination.',
      },
      {
        code: '04',
        id: 'autonomous',
        title: 'Autonomous Vehicles',
        description:
          'Sensor fusion, path planning, navigation pipelines, and real-time mobility architectures.',
      },
    ],
    channelsHeading: 'Contact & Channels',
    channelsSubheading: 'Verified communication and repository links for qrblab.',
    emailLabel: 'Email',
    socialLabels: {
      github: 'GitHub',
      discord: 'Discord',
      instagram: 'Instagram',
      x: 'X',
      website: 'Website',
    },
  },
  notFound: {
    code: '404',
    title: 'Page not found',
    description: 'The page you requested does not exist or has been moved.',
    backHome: 'Back to Home',
  },
  footer: {
    tagline: 'Independent engineering & technology research',
    copyright: 'qrblab',
    navigationLabel: 'Footer navigation',
  },
};
