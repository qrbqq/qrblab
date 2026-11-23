import type {SupportedLanguage} from './papers';

export const LANGUAGE_ENDONYMS: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
};

export interface TranslationDictionary {
  nav: {
    home: string;
    research: string;
    about: string;
    archiveCta: string;
    subLabel: string;
    menuOpen: string;
    menuClose: string;
  };
  settings: {
    openLabel: string;
    title: string;
    closeLabel: string;
    themeLabel: string;
    themeOptions: {
      light: string;
      dark: string;
      system: string;
    };
    languageLabel: string;
    dataLabel: string;
    clearDataButton: string;
    clearDataHint: string;
    clearDataSuccess: string;
  };
  home: {
    eyebrow: string;
    heroTitle: string;
    readFullStatement: string;
    collapseStatement: string;
    exploreResearch: string;
    matrixEyebrow: string;
    principlesEyebrow: string;
    principlesHeading: string;
    principlesSubheading: string;
    principles: Array<{
      code: string;
      id: string;
      title: string;
      description: string;
    }>;
    latestEyebrow: string;
    latestHeading: string;
    latestSubheading: string;
    latestEmptyTitle: string;
    latestEmptyDescription: string;
    sectionIndexLabel: string;
    sections: {
      overview: string;
      architecture: string;
      principles: string;
      publications: string;
    };
  };
  research: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchLabel: string;
    clearSearch: string;
    allCategories: string;
    categoryFilterLabel: string;
    paperCountSingular: string;
    paperCountPlural: string;
    readPaper: string;
    ratingUnrated: string;
    ratingYourLabel: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyHint: string;
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
    notFoundTitle: string;
    notFoundDescription: string;
  };
  about: {
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

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    nav: {
      home: 'Home',
      research: 'Research',
      about: 'About',
      archiveCta: 'Archive',
      subLabel: 'LAB · MECHATRONICS & AI',
      menuOpen: 'Open navigation menu',
      menuClose: 'Close navigation menu',
    },
    settings: {
      openLabel: 'Open settings',
      title: 'Settings',
      closeLabel: 'Close settings',
      themeLabel: 'Theme',
      themeOptions: {
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      },
      languageLabel: 'Language',
      dataLabel: 'Local Data',
      clearDataButton: 'Clear local data & reset',
      clearDataHint: 'Clears locally saved paper ratings and resets theme and language defaults.',
      clearDataSuccess: 'Local ratings cleared and defaults restored',
    },
    home: {
      eyebrow: 'AI · MECHATRONICS · ROBOTICS · AUTONOMOUS VEHICLES',
      heroTitle: 'qrblab',
      readFullStatement: 'Read full statement',
      collapseStatement: 'Show less',
      exploreResearch: 'Explore Research Archive',
      matrixEyebrow: '01 / CORE ARCHITECTURE',
      principlesEyebrow: '02 / PRINCIPLES',
      principlesHeading: 'Research Principles',
      principlesSubheading: 'Foundational commitments guiding every note and technical study.',
      principles: [
        {
          code: '01',
          id: 'inquiry',
          title: 'Independent Inquiry',
          description:
            'Every note originates from first-hand study, engineering synthesis, and structured questioning.',
        },
        {
          code: '02',
          id: 'verification',
          title: 'Source Verification',
          description:
            'Grounded in credible technical references while openly distinguishing personal analysis from established theory.',
        },
        {
          code: '03',
          id: 'exploration',
          title: 'Open Exploration',
          description:
            'Interpretations remain open to discussion, scrutiny, and continuous refinement as technologies evolve.',
        },
        {
          code: '04',
          id: 'access',
          title: 'Zero-Friction Access',
          description:
            'Static, account-free publishing with direct PDF downloads, preview galleries, and transparent local storage.',
        },
      ],
      latestEyebrow: '03 / LATEST PUBLICATIONS',
      latestHeading: 'Latest Publications',
      latestSubheading: 'Recent technical monographs, notes, and systems analyses.',
      latestEmptyTitle: 'No publications yet',
      latestEmptyDescription:
        'Independent studies and engineering papers will appear here as soon as they are published.',
      sectionIndexLabel: 'Page sections',
      sections: {
        overview: 'Overview',
        architecture: 'Architecture',
        principles: 'Principles',
        publications: 'Publications',
      },
    },
    research: {
      title: 'Research Archive',
      subtitle: 'Search and browse published engineering, AI, robotics, and mechatronics studies.',
      searchPlaceholder: 'Search papers by title, description, explanation, or tag...',
      searchLabel: 'Search research publications',
      clearSearch: 'Clear search',
      allCategories: 'All',
      categoryFilterLabel: 'Filter publications by category',
      paperCountSingular: 'publication',
      paperCountPlural: 'publications',
      readPaper: 'Read paper',
      ratingUnrated: 'Not rated yet',
      ratingYourLabel: 'Your rating',
      emptyTitle: 'The research archive is currently empty',
      emptyDescription:
        'No technical papers or monographs have been published yet. New entries will appear here once added.',
      emptyHint: 'About qrblab',
      noMatchesTitle: 'No matching publications',
      noMatchesDescription:
        'Try adjusting your search query or selecting a different category filter.',
      resetFilters: 'Reset filters',
    },
    paperDetail: {
      backToArchive: 'Back to Research Archive',
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
      notFoundTitle: 'Publication not found',
      notFoundDescription:
        'The requested document could not be located in the archive.',
    },
    about: {
      title: 'About qrblab',
      subtitle:
        'Independent personal research exploring Artificial Intelligence, Mechatronics, Robotics, and Autonomous Vehicles.',
      focusEyebrow: '01 / CORE ARCHITECTURE',
      focusHeading: 'Research Focus Areas',
      focusSubheading: 'Core domains explored through independent study, analysis, and technical design.',
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
  },
  ar: {
    nav: {
      home: 'الرئيسية',
      research: 'الأبحاث',
      about: 'حول',
      archiveCta: 'الأرشيف',
      subLabel: 'مختبر · الميكاترونيكس والذكاء الاصطناعي',
      menuOpen: 'فتح قائمة التنقل',
      menuClose: 'إغلاق قائمة التنقل',
    },
    settings: {
      openLabel: 'فتح الإعدادات',
      title: 'الإعدادات',
      closeLabel: 'إغلاق الإعدادات',
      themeLabel: 'المظهر',
      themeOptions: {
        light: 'فاتح',
        dark: 'داكن',
        system: 'النظام',
      },
      languageLabel: 'اللغة',
      dataLabel: 'البيانات المحلية',
      clearDataButton: 'مسح البيانات المحلية وإعادة الضبط',
      clearDataHint: 'يمسح تقييمات الأبحاث المحفوظة محلياً ويعيد المظهر واللغة إلى الوضع الافتراضي.',
      clearDataSuccess: 'تم مسح التقييمات المحلية واستعادة الإعدادات الافتراضية',
    },
    home: {
      eyebrow: 'الذكاء الاصطناعي · الميكاترونيكس · الروبوتات · المركبات ذاتية القيادة',
      heroTitle: 'qrblab',
      readFullStatement: 'قراءة البيان كاملاً',
      collapseStatement: 'عرض أقل',
      exploreResearch: 'استكشاف أرشيف الأبحاث',
      matrixEyebrow: '01 / البنية الأساسية',
      principlesEyebrow: '02 / المبادئ',
      principlesHeading: 'مبادئ البحث',
      principlesSubheading: 'التزامات أساسية توجه كل ورقة تقنية ودراسة منشورة.',
      principles: [
        {
          code: '01',
          id: 'inquiry',
          title: 'استقصاء مستقل',
          description:
            'تنبع كل دراسة من البحث الفردي والتحليل الهندسي وصياغة الأسئلة الجوهرية بوضوح.',
        },
        {
          code: '02',
          id: 'verification',
          title: 'التحقق من المصادر',
          description:
            'الاعتماد على المراجع التقنية الموثوقة مع الفصل الواضح بين التحليل الشخصي والنظرية المثبتة.',
        },
        {
          code: '03',
          id: 'exploration',
          title: 'استكشاف منفتح',
          description:
            'تبقى التفسيرات والأفكار مفتوحة للنقاش والمراجعة والتطوير المستمر مع تطور التقنيات.',
        },
        {
          code: '04',
          id: 'access',
          title: 'وصول مباشر بلا قيود',
          description:
            'نشر ساكن دون حسابات مع تنزيل فوري لملفات PDF ومعاينة واضحة وتخزين محلي شفاف.',
        },
      ],
      latestEyebrow: '03 / أحدث المنشورات',
      latestHeading: 'أحدث المنشورات',
      latestSubheading: 'أحدث الأوراق التقنية والدراسات التحليلية المنشورة.',
      latestEmptyTitle: 'لا توجد منشورات بعد',
      latestEmptyDescription:
        'ستظهر الدراسات المستقلة والأوراق الهندسية هنا فور نشرها.',
      sectionIndexLabel: 'أقسام الصفحة',
      sections: {
        overview: 'نظرة عامة',
        architecture: 'البنية',
        principles: 'المبادئ',
        publications: 'المنشورات',
      },
    },
    research: {
      title: 'أرشيف الأبحاث',
      subtitle: 'تصفح وابحث في دراسات الهندسة والذكاء الاصطناعي والروبوتات والميكاترونيكس.',
      searchPlaceholder: 'ابحث بالعنوان أو الوصف أو الشرح أو الكلمات المفتاحية...',
      searchLabel: 'البحث في المنشورات البحثية',
      clearSearch: 'مسح البحث',
      allCategories: 'الكل',
      categoryFilterLabel: 'تصفية المنشورات حسب التصنيف',
      paperCountSingular: 'منشور',
      paperCountPlural: 'منشورات',
      readPaper: 'قراءة البحث',
      ratingUnrated: 'لا يوجد تقييم بعد',
      ratingYourLabel: 'تقييمك',
      emptyTitle: 'أرشيف الأبحاث فارغ حالياً',
      emptyDescription:
        'لم يتم نشر أي أوراق تقنية أو دراسات حتى الآن. ستظهر الإدخالات الجديدة هنا فور إضافتها.',
      emptyHint: 'عن qrblab',
      noMatchesTitle: 'لا توجد نتائج مطابقة',
      noMatchesDescription:
        'جرّب تعديل عبارة البحث أو اختيار تصنيف مختلف.',
      resetFilters: 'إعادة ضبط التصفية',
    },
    paperDetail: {
      backToArchive: 'العودة إلى أرشيف الأبحاث',
      authorsLabel: 'المؤلفون',
      publishedLabel: 'تاريخ النشر',
      versionLabel: 'الإصدار',
      categoryLabel: 'التصنيف',
      doiLabel: 'المعرّف الرقمي (DOI)',
      tagsLabel: 'الكلمات المفتاحية',
      rateHeading: 'تقييم القارئ',
      rateSubheading: 'يُحفظ محلياً في متصفحك',
      rateAriaLabel: 'تقييم {n} من 5 نجوم',
      clearRating: 'مسح',
      ratingSaved: 'تم حفظ التقييم محلياً',
      ratingCleared: 'تم مسح التقييم',
      abstractHeading: 'الملخص',
      explanationHeading: 'الشرح التفصيلي',
      highlightsHeading: 'أبرز النتائج',
      screenshotsHeading: 'لقطات معاينة PDF',
      screenshotsSubheading: 'اختر أي لقطة لمعاينتها بدقة كاملة.',
      screenshotsEmpty: 'لم يتم إرفاق لقطات معاينة لهذا المنشور.',
      openLightbox: 'معاينة اللقطة بالحجم الكامل',
      closeLightbox: 'إغلاق المعاينة',
      prevScreenshot: 'اللقطة السابقة',
      nextScreenshot: 'اللقطة التالية',
      pdfPreviewHeading: 'المستند المدمج',
      downloadPdf: 'تنزيل PDF',
      viewInsidePage: 'العرض داخل الصفحة',
      hideInsidePage: 'إخفاء القارئ المدمج',
      openInNewTab: 'فتح في تبويب جديد',
      openPdf: 'فتح PDF',
      copyCitation: 'نسخ الاستشهاد',
      copyBibtex: 'نسخ BibTeX',
      copyLink: 'نسخ الرابط',
      citationCopied: 'تم نسخ الاستشهاد إلى الحافظة',
      bibtexCopied: 'تم نسخ صيغة BibTeX إلى الحافظة',
      linkCopied: 'تم نسخ رابط المنشور إلى الحافظة',
      copyFailed: 'تعذّر النسخ إلى الحافظة',
      pdfFallbackText: 'معاينة ملف PDF المدمجة غير مدعومة في هذا المتصفح.',
      notFoundTitle: 'المنشور غير موجود',
      notFoundDescription: 'تعذّر العثور على الوثيقة المطلوبة في الأرشيف.',
    },
    about: {
      title: 'عن qrblab',
      subtitle:
        'مشروع بحثي شخصي مستقل يستكشف الذكاء الاصطناعي والميكاترونيكس والروبوتات والمركبات ذاتية القيادة.',
      focusEyebrow: '01 / البنية الأساسية',
      focusHeading: 'مجالات التركيز البحثي',
      focusSubheading: 'المجالات الأساسية التي يتناولها المشروع عبر الدراسة والتحليل والتصميم التقني.',
      focusAreas: [
        {
          code: '01',
          id: 'ai',
          title: 'الذكاء الاصطناعي',
          description:
            'معماريات الذكاء الآلي ونماذج الإدراك وأنظمة اتخاذ القرار التحليلية.',
        },
        {
          code: '02',
          id: 'mechatronics',
          title: 'الميكاترونيكس',
          description:
            'تصميم منظومات الحركة الكهروميكانيكية والمشغلات والتكامل بين العتاد والبرمجيات.',
        },
        {
          code: '03',
          id: 'robotics',
          title: 'الروبوتات',
          description:
            'الكينماتيكا وحلقات التحكم المدمجة وتقدير الحالة وتنسيق الأنظمة الفيزيائية.',
        },
        {
          code: '04',
          id: 'autonomous',
          title: 'المركبات ذاتية القيادة',
          description:
            'دمج الحساسات وتخطيط المسار ومعمارية الملاحة والحركة في الزمن الحقيقي.',
        },
      ],
      channelsHeading: 'التواصل والقنوات',
      channelsSubheading: 'قنوات التواصل والمستودعات المعتمدة لمشروع qrblab.',
      emailLabel: 'البريد الإلكتروني',
      socialLabels: {
        github: 'GitHub',
        discord: 'Discord',
        instagram: 'إنستجرام',
        x: 'X',
        website: 'الموقع الإلكتروني',
      },
    },
    notFound: {
      code: '404',
      title: 'الصفحة غير موجودة',
      description: 'الصفحة التي طلبتها غير متوفرة أو تم نقلها.',
      backHome: 'العودة إلى الرئيسية',
    },
    footer: {
      tagline: 'أبحاث مستقلة في الهندسة والتكنولوجيا',
      copyright: 'qrblab',
      navigationLabel: 'روابط التذييل',
    },
  },
  fr: {
    nav: {
      home: 'Accueil',
      research: 'Recherches',
      about: 'À propos',
      archiveCta: 'Archives',
      subLabel: 'LABO · MÉCATRONIQUE & IA',
      menuOpen: 'Ouvrir le menu de navigation',
      menuClose: 'Fermer le menu de navigation',
    },
    settings: {
      openLabel: 'Ouvrir les paramètres',
      title: 'Paramètres',
      closeLabel: 'Fermer les paramètres',
      themeLabel: 'Thème',
      themeOptions: {
        light: 'Clair',
        dark: 'Sombre',
        system: 'Système',
      },
      languageLabel: 'Langue',
      dataLabel: 'Données locales',
      clearDataButton: 'Effacer les données locales et réinitialiser',
      clearDataHint: 'Supprime les évaluations enregistrées localement et rétablit le thème et la langue par défaut.',
      clearDataSuccess: 'Données locales effacées et paramètres réinitialisés',
    },
    home: {
      eyebrow: 'IA · MÉCATRONIQUE · ROBOTIQUE · VÉHICULES AUTONOMES',
      heroTitle: 'qrblab',
      readFullStatement: 'Lire la déclaration complète',
      collapseStatement: 'Réduire',
      exploreResearch: 'Explorer les archives',
      matrixEyebrow: '01 / ARCHITECTURE CENTRALE',
      principlesEyebrow: '02 / PRINCIPES',
      principlesHeading: 'Principes de recherche',
      principlesSubheading: 'Engagements fondamentaux qui guident chaque note et étude technique.',
      principles: [
        {
          code: '01',
          id: 'inquiry',
          title: 'Investigation indépendante',
          description:
            "Chaque note résulte d'une étude personnelle, d'une synthèse technique et d'un questionnement structuré.",
        },
        {
          code: '02',
          id: 'verification',
          title: 'Vérification des sources',
          description:
            'Appuyé sur des références fiables tout en distinguant clairement analyse personnelle et théorie établie.',
        },
        {
          code: '03',
          id: 'exploration',
          title: 'Exploration ouverte',
          description:
            'Les interprétations restent ouvertes à la discussion, à la critique et aux évolutions technologiques.',
        },
        {
          code: '04',
          id: 'access',
          title: 'Accès sans friction',
          description:
            'Publication statique sans compte, téléchargement direct en PDF, aperçus et stockage local transparent.',
        },
      ],
      latestEyebrow: '03 / DERNIÈRES PUBLICATIONS',
      latestHeading: 'Dernières publications',
      latestSubheading: 'Monographies techniques, notes et analyses de systèmes récentes.',
      latestEmptyTitle: 'Aucune publication pour le moment',
      latestEmptyDescription:
        'Les études indépendantes et articles techniques apparaîtront ici dès leur publication.',
      sectionIndexLabel: 'Sections de la page',
      sections: {
        overview: 'Aperçu',
        architecture: 'Architecture',
        principles: 'Principes',
        publications: 'Publications',
      },
    },
    research: {
      title: 'Archives de recherche',
      subtitle: 'Recherchez et consultez les études publiées en ingénierie, IA, robotique et mécatronique.',
      searchPlaceholder: 'Rechercher par titre, description, explication ou mot-clé...',
      searchLabel: 'Rechercher dans les publications',
      clearSearch: 'Effacer la recherche',
      allCategories: 'Toutes',
      categoryFilterLabel: 'Filtrer les publications par catégorie',
      paperCountSingular: 'publication',
      paperCountPlural: 'publications',
      readPaper: 'Lire le document',
      ratingUnrated: 'Pas encore noté',
      ratingYourLabel: 'Votre note',
      emptyTitle: 'Les archives de recherche sont actuellement vides',
      emptyDescription:
        "Aucun document technique n'a encore été publié. Les nouvelles études apparaîtront ici dès leur ajout.",
      emptyHint: 'À propos de qrblab',
      noMatchesTitle: 'Aucune publication correspondante',
      noMatchesDescription:
        'Essayez de modifier votre requête ou de sélectionner une autre catégorie.',
      resetFilters: 'Réinitialiser les filtres',
    },
    paperDetail: {
      backToArchive: 'Retour aux archives',
      authorsLabel: 'Auteurs',
      publishedLabel: 'Publié le',
      versionLabel: 'Version',
      categoryLabel: 'Catégorie',
      doiLabel: 'DOI',
      tagsLabel: 'Mots-clés',
      rateHeading: 'Évaluation du lecteur',
      rateSubheading: 'Enregistrée localement dans votre navigateur',
      rateAriaLabel: 'Noter {n} sur 5 étoiles',
      clearRating: 'Effacer',
      ratingSaved: 'Note enregistrée localement',
      ratingCleared: 'Note supprimée',
      abstractHeading: 'Résumé',
      explanationHeading: 'Explication détaillée',
      highlightsHeading: 'Points clés',
      screenshotsHeading: 'Aperçus du PDF',
      screenshotsSubheading: 'Sélectionnez une capture pour inspecter en pleine résolution.',
      screenshotsEmpty: "Aucun aperçu d'image joint à cette publication.",
      openLightbox: "Agrandir l'aperçu",
      closeLightbox: "Fermer l'aperçu",
      prevScreenshot: 'Aperçu précédent',
      nextScreenshot: 'Aperçu suivant',
      pdfPreviewHeading: 'Document intégré',
      downloadPdf: 'download PDF',
      viewInsidePage: 'Afficher dans la page',
      hideInsidePage: 'Masquer le lecteur',
      openInNewTab: 'Ouvrir dans un nouvel onglet',
      openPdf: 'Ouvrir le PDF',
      copyCitation: 'Copier la citation',
      copyBibtex: 'Copier BibTeX',
      copyLink: 'Copier le lien',
      citationCopied: 'Citation copiée dans le presse-papiers',
      bibtexCopied: 'Entrée BibTeX copiée dans le presse-papiers',
      linkCopied: 'Lien de publication copié dans le presse-papiers',
      copyFailed: 'Impossible de copier dans le presse-papiers',
      pdfFallbackText: "La prévisualisation PDF intégrée n'est pas disponible dans ce navigateur.",
      notFoundTitle: 'Publication introuvable',
      notFoundDescription: "Le document demandé n'a pas été trouvé dans les archives.",
    },
    about: {
      title: 'À propos de qrblab',
      subtitle:
        "Recherche personnelle et indépendante explorant l'Intelligence Artificielle, la Mécatronique, la Robotique et les Véhicules Autonomes.",
      focusEyebrow: '01 / ARCHITECTURE CENTRALE',
      focusHeading: 'Domaines de recherche',
      focusSubheading: "Principaux axes explorés par l'étude indépendante, l'analyse et la conception technique.",
      focusAreas: [
        {
          code: '01',
          id: 'ai',
          title: 'Intelligence Artificielle',
          description:
            "Architectures d'intelligence artificielle, modèles de perception et systèmes de décision analytiques.",
        },
        {
          code: '02',
          id: 'mechatronics',
          title: 'Mécatronique',
          description:
            'Conception de transmissions électromécaniques, actionnement et intégration matérielle.',
        },
        {
          code: '03',
          id: 'robotics',
          title: 'Robotique',
          description:
            "Cinématique, boucles d'asservissement embarquées, estimation d'état et coordination physique.",
        },
        {
          code: '04',
          id: 'autonomous',
          title: 'Véhicules Autonomes',
          description:
            'Fusion de capteurs, planification de trajectoire, navigation et mobilité temps réel.',
        },
      ],
      channelsHeading: 'Contact & Canaux',
      channelsSubheading: 'Liens de communication et dépôts vérifiés pour qrblab.',
      emailLabel: 'E-mail',
      socialLabels: {
        github: 'GitHub',
        discord: 'Discord',
        instagram: 'Instagram',
        x: 'X',
        website: 'Site web',
      },
    },
    notFound: {
      code: '404',
      title: 'Page introuvable',
      description: "La page demandée n'existe pas ou a été déplacée.",
      backHome: "Retour à l'accueil",
    },
    footer: {
      tagline: 'Recherche indépendante en ingénierie et technologie',
      copyright: 'qrblab',
      navigationLabel: 'Navigation du pied de page',
    },
  },
  de: {
    nav: {
      home: 'Start',
      research: 'Forschung',
      about: 'Über',
      archiveCta: 'Archiv',
      subLabel: 'LABOR · MECHATRONIK & KI',
      menuOpen: 'Navigationsmenü öffnen',
      menuClose: 'Navigationsmenü schließen',
    },
    settings: {
      openLabel: 'Einstellungen öffnen',
      title: 'Einstellungen',
      closeLabel: 'Einstellungen schließen',
      themeLabel: 'Design',
      themeOptions: {
        light: 'Hell',
        dark: 'Dunkel',
        system: 'System',
      },
      languageLabel: 'Sprache',
      dataLabel: 'Lokale Daten',
      clearDataButton: 'Lokale Daten löschen & zurücksetzen',
      clearDataHint: 'Löscht lokal gespeicherte Bewertungen und setzt Design sowie Sprache auf Standardwerte zurück.',
      clearDataSuccess: 'Lokale Daten gelöscht und Standardwerte wiederhergestellt',
    },
    home: {
      eyebrow: 'KI · MECHATRONIK · ROBOTIK · AUTONOME FAHRZEUGE',
      heroTitle: 'qrblab',
      readFullStatement: 'Vollständige Erklärung lesen',
      collapseStatement: 'Weniger anzeigen',
      exploreResearch: 'Forschungsarchiv öffnen',
      matrixEyebrow: '01 / KERNARCHITEKTUR',
      principlesEyebrow: '02 / PRINZIPIEN',
      principlesHeading: 'Forschungsprinzipien',
      principlesSubheading: 'Grundsätze, die jede technische Notiz und Analyse leiten.',
      principles: [
        {
          code: '01',
          id: 'inquiry',
          title: 'Unabhängige Untersuchung',
          description:
            'Jeder Beitrag entsteht aus eigenständiger Recherche, technischer Synthese und klaren Fragestellungen.',
        },
        {
          code: '02',
          id: 'verification',
          title: 'Quellenprüfung',
          description:
            'Auf verlässliche Fachquellen gestützt und klar zwischen eigener Analyse und gesichertem Wissen trennend.',
        },
        {
          code: '03',
          id: 'exploration',
          title: 'Offene Erkundung',
          description:
            'Deutungen bleiben offen für Diskussion, Kritik und fortlaufende Überarbeitung im technologischen Wandel.',
        },
        {
          code: '04',
          id: 'access',
          title: 'Reibungsfreier Zugang',
          description:
            'Statische Veröffentlichung ohne Konto mit direktem PDF-Download, Vorschauen und transparentem Lokal-Speicher.',
        },
      ],
      latestEyebrow: '03 / NEUESTE PUBLIKATIONEN',
      latestHeading: 'Neueste Publikationen',
      latestSubheading: 'Aktuelle technische Berichte, Notizen und Systemanalysen.',
      latestEmptyTitle: 'Noch keine Publikationen',
      latestEmptyDescription:
        'Unabhängige Studien und Fachberichte erscheinen hier, sobald sie veröffentlicht sind.',
      sectionIndexLabel: 'Seitenabschnitte',
      sections: {
        overview: 'Überblick',
        architecture: 'Architektur',
        principles: 'Prinzipien',
        publications: 'Publikationen',
      },
    },
    research: {
      title: 'Forschungsarchiv',
      subtitle: 'Durchsuchen und lesen Sie Studien zu Ingenieurwesen, KI, Robotik und Mechatronik.',
      searchPlaceholder: 'Nach Titel, Beschreibung, Erklärung oder Schlagwort suchen...',
      searchLabel: 'Forschungspublikationen durchsuchen',
      clearSearch: 'Suche löschen',
      allCategories: 'Alle',
      categoryFilterLabel: 'Publikationen nach Kategorie filtern',
      paperCountSingular: 'Publikation',
      paperCountPlural: 'Publikationen',
      readPaper: 'Dokument lesen',
      ratingUnrated: 'Noch nicht bewertet',
      ratingYourLabel: 'Ihre Bewertung',
      emptyTitle: 'Das Forschungsarchiv ist derzeit leer',
      emptyDescription:
        'Es wurden noch keine technischen Berichte veröffentlicht. Neue Beiträge erscheinen hier nach dem Hinzufügen.',
      emptyHint: 'Über qrblab',
      noMatchesTitle: 'Keine passenden Publikationen',
      noMatchesDescription:
        'Passen Sie Ihren Suchbegriff an oder wählen Sie einen anderen Kategoriefilter.',
      resetFilters: 'Filter zurücksetzen',
    },
    paperDetail: {
      backToArchive: 'Zurück zum Forschungsarchiv',
      authorsLabel: 'Autoren',
      publishedLabel: 'Veröffentlicht',
      versionLabel: 'Version',
      categoryLabel: 'Kategorie',
      doiLabel: 'DOI',
      tagsLabel: 'Schlagwörter',
      rateHeading: 'Leserbewertung',
      rateSubheading: 'Lokal in Ihrem Browser gespeichert',
      rateAriaLabel: '{n} von 5 Sternen bewerten',
      clearRating: 'Zurücksetzen',
      ratingSaved: 'Bewertung lokal gespeichert',
      ratingCleared: 'Bewertung entfernt',
      abstractHeading: 'Zusammenfassung',
      explanationHeading: 'Detaillierte Erklärung',
      highlightsHeading: 'Kernaussagen',
      screenshotsHeading: 'Vorschaubilder',
      screenshotsSubheading: 'Wählen Sie ein Vorschaubild für die Vollansicht aus.',
      screenshotsEmpty: 'Keine Vorschaubilder für diese Publikation hinterlegt.',
      openLightbox: 'Vorschaubild vergrößern',
      closeLightbox: 'Vorschau schließen',
      prevScreenshot: 'Vorheriges Bild',
      nextScreenshot: 'Nächstes Bild',
      pdfPreviewHeading: 'Eingebettetes Dokument',
      downloadPdf: 'download PDF',
      viewInsidePage: 'Auf der Seite ansehen',
      hideInsidePage: 'Inline-Ansicht schließen',
      openInNewTab: 'In neuem Tab öffnen',
      openPdf: 'PDF öffnen',
      copyCitation: 'Zitat kopieren',
      copyBibtex: 'BibTeX kopieren',
      copyLink: 'Link kopieren',
      citationCopied: 'Zitat in die Zwischenablage kopiert',
      bibtexCopied: 'BibTeX-Eintrag in die Zwischenablage kopiert',
      linkCopied: 'Publikationslink in die Zwischenablage kopiert',
      copyFailed: 'Kopieren in die Zwischenablage fehlgeschlagen',
      pdfFallbackText: 'Die eingebettete PDF-Vorschau ist in diesem Browser nicht verfügbar.',
      notFoundTitle: 'Publikation nicht gefunden',
      notFoundDescription: 'Das angeforderte Dokument konnte im Archiv nicht gefunden werden.',
    },
    about: {
      title: 'Über qrblab',
      subtitle:
        'Unabhängige persönliche Forschung zu Künstlicher Intelligenz, Mechatronik, Robotik und Autonomen Fahrzeugen.',
      focusEyebrow: '01 / KERNARCHITEKTUR',
      focusHeading: 'Forschungsschwerpunkte',
      focusSubheading: 'Kernbereiche unabhängiger Studien, Analysen und technischer Systementwicklung.',
      focusAreas: [
        {
          code: '01',
          id: 'ai',
          title: 'Künstliche Intelligenz',
          description:
            'Maschinelle Intelligenzarchitekturen, Wahrnehmungsmodelle und analytische Entscheidungssysteme.',
        },
        {
          code: '02',
          id: 'mechatronics',
          title: 'Mechatronik',
          description:
            'Elektromechanische Antriebsauslegung, Aktorik und integrierte Hardware-Entwicklung.',
        },
        {
          code: '03',
          id: 'robotics',
          title: 'Robotik',
          description:
            'Kinematik, eingebettete Regelkreise, Zustandsschätzung und physische Systemkoordination.',
        },
        {
          code: '04',
          id: 'autonomous',
          title: 'Autonome Fahrzeuge',
          description:
            'Sensordatenfusion, Pfadplanung, Navigationspipelines und Echtzeit-Mobilitätsarchitekturen.',
        },
      ],
      channelsHeading: 'Kontakt & Kanäle',
      channelsSubheading: 'Verifizierte Kontakt- und Repository-Links für qrblab.',
      emailLabel: 'E-Mail',
      socialLabels: {
        github: 'GitHub',
        discord: 'Discord',
        instagram: 'Instagram',
        x: 'X',
        website: 'Webseite',
      },
    },
    notFound: {
      code: '404',
      title: 'Seite nicht gefunden',
      description: 'Die angeforderte Seite existiert nicht oder wurde verschoben.',
      backHome: 'Zur Startseite',
    },
    footer: {
      tagline: 'Unabhängige Ingenieur- & Technologieforschung',
      copyright: 'qrblab',
      navigationLabel: 'Fußzeilennavigation',
    },
  },
  es: {
    nav: {
      home: 'Inicio',
      research: 'Investigación',
      about: 'Acerca de',
      archiveCta: 'Archivo',
      subLabel: 'LAB · MECATRÓNICA E IA',
      menuOpen: 'Abrir menú de navegación',
      menuClose: 'Cerrar menú de navegación',
    },
    settings: {
      openLabel: 'Abrir configuración',
      title: 'Configuración',
      closeLabel: 'Cerrar configuración',
      themeLabel: 'Tema',
      themeOptions: {
        light: 'Claro',
        dark: 'Oscuro',
        system: 'Sistema',
      },
      languageLabel: 'Idioma',
      dataLabel: 'Datos locales',
      clearDataButton: 'Borrar datos locales y restablecer',
      clearDataHint: 'Elimina las valoraciones guardadas localmente y restablece el tema e idioma predeterminados.',
      clearDataSuccess: 'Datos locales borrados y valores predeterminados restaurados',
    },
    home: {
      eyebrow: 'IA · MECATRÓNICA · ROBÓTICA · VEHÍCULOS AUTÓNOMOS',
      heroTitle: 'qrblab',
      readFullStatement: 'Leer declaración completa',
      collapseStatement: 'Mostrar menos',
      exploreResearch: 'Explorar archivo de investigación',
      matrixEyebrow: '01 / ARQUITECTURA CENTRAL',
      principlesEyebrow: '02 / PRINCIPIOS',
      principlesHeading: 'Principios de investigación',
      principlesSubheading: 'Compromisos esenciales que guían cada nota técnica y estudio.',
      principles: [
        {
          code: '01',
          id: 'inquiry',
          title: 'Indagación independiente',
          description:
            'Cada documento parte del estudio directo, la síntesis de ingeniería y preguntas técnicas estructuradas.',
        },
        {
          code: '02',
          id: 'verification',
          title: 'Verificación de fuentes',
          description:
            'Basado en referencias fiables, distinguiendo con claridad el análisis personal de la teoría establecida.',
        },
        {
          code: '03',
          id: 'exploration',
          title: 'Exploración abierta',
          description:
            'Las interpretaciones permanecen abiertas al debate, la revisión crítica y la mejora continua.',
        },
        {
          code: '04',
          id: 'access',
          title: 'Acceso sin fricción',
          description:
            'Publicación estática sin cuentas, descarga directa en PDF, vistas previas y almacenamiento local transparente.',
        },
      ],
      latestEyebrow: '03 / ÚLTIMAS PUBLICACIONES',
      latestHeading: 'Últimas publicaciones',
      latestSubheading: 'Monografías técnicas, notas y análisis de sistemas recientes.',
      latestEmptyTitle: 'Aún no hay publicaciones',
      latestEmptyDescription:
        'Los estudios independientes y artículos técnicos aparecerán aquí en cuanto se publiquen.',
      sectionIndexLabel: 'Secciones de la página',
      sections: {
        overview: 'Resumen',
        architecture: 'Arquitectura',
        principles: 'Principios',
        publications: 'Publicaciones',
      },
    },
    research: {
      title: 'Archivo de investigación',
      subtitle: 'Busca y explora estudios publicados sobre ingeniería, IA, robótica y mecatrónica.',
      searchPlaceholder: 'Buscar por título, descripción, explicación o etiqueta...',
      searchLabel: 'Buscar publicaciones de investigación',
      clearSearch: 'Borrar búsqueda',
      allCategories: 'Todas',
      categoryFilterLabel: 'Filtrar publicaciones por categoría',
      paperCountSingular: 'publicación',
      paperCountPlural: 'publicaciones',
      readPaper: 'Leer documento',
      ratingUnrated: 'Sin valorar aún',
      ratingYourLabel: 'Tu valoración',
      emptyTitle: 'El archivo de investigación está vacío',
      emptyDescription:
        'Todavía no se han publicado artículos ni notas técnicas. Aparecerán aquí en cuanto se añadan.',
      emptyHint: 'Acerca de qrblab',
      noMatchesTitle: 'No hay publicaciones coincidentes',
      noMatchesDescription:
        'Prueba ajustando los términos de búsqueda o seleccionando otra categoría.',
      resetFilters: 'Restablecer filtros',
    },
    paperDetail: {
      backToArchive: 'Volver al archivo de investigación',
      authorsLabel: 'Autores',
      publishedLabel: 'Publicado',
      versionLabel: 'Versión',
      categoryLabel: 'Categoría',
      doiLabel: 'DOI',
      tagsLabel: 'Palabras clave',
      rateHeading: 'Valoración del lector',
      rateSubheading: 'Guardada localmente en tu navegador',
      rateAriaLabel: 'Valorar con {n} de 5 estrellas',
      clearRating: 'Borrar',
      ratingSaved: 'Valoración guardada localmente',
      ratingCleared: 'Valoración eliminada',
      abstractHeading: 'Resumen',
      explanationHeading: 'Explicación detallada',
      highlightsHeading: 'Hallazgos clave',
      screenshotsHeading: 'Capturas de vista previa',
      screenshotsSubheading: 'Selecciona cualquier captura para inspeccionarla a resolución completa.',
      screenshotsEmpty: 'No hay capturas de vista previa adjuntas para esta publicación.',
      openLightbox: 'Ampliar captura',
      closeLightbox: 'Cerrar vista previa',
      prevScreenshot: 'Captura anterior',
      nextScreenshot: 'Siguiente captura',
      pdfPreviewHeading: 'Documento integrado',
      downloadPdf: 'download PDF',
      viewInsidePage: 'Ver dentro de la página',
      hideInsidePage: 'Ocultar lector integrado',
      openInNewTab: 'Abrir en nueva pestaña',
      openPdf: 'Abrir PDF',
      copyCitation: 'Copiar cita',
      copyBibtex: 'Copiar BibTeX',
      copyLink: 'Copiar enlace',
      citationCopied: 'Cita copiada al portapapeles',
      bibtexCopied: 'Entrada BibTeX copiada al portapapeles',
      linkCopied: 'Enlace copiado al portapapeles',
      copyFailed: 'No se pudo copiar al portapapeles',
      pdfFallbackText: 'La vista previa integrada de PDF no está disponible en este navegador.',
      notFoundTitle: 'Publicación no encontrada',
      notFoundDescription: 'No se pudo localizar el documento solicitado en el archivo.',
    },
    about: {
      title: 'Acerca de qrblab',
      subtitle:
        'Investigación personal independiente que explora la Inteligencia Artificial, la Mecatrónica, la Robótica y los Vehículos Autónomos.',
      focusEyebrow: '01 / ARQUITECTURA CENTRAL',
      focusHeading: 'Áreas de enfoque',
      focusSubheading: 'Dominios principales explorados mediante estudio independiente, análisis y diseño técnico.',
      focusAreas: [
        {
          code: '01',
          id: 'ai',
          title: 'Inteligencia Artificial',
          description:
            'Arquitecturas de inteligencia artificial, modelos de percepción y sistemas analíticos de decisión.',
        },
        {
          code: '02',
          id: 'mechatronics',
          title: 'Mecatrónica',
          description:
            'Diseño electromecánico de transmisión, actuación e ingeniería integrada de hardware.',
        },
        {
          code: '03',
          id: 'robotics',
          title: 'Robótica',
          description:
            'Cinemática, lazos de control embebidos, estimación de estado y coordinación física.',
        },
        {
          code: '04',
          id: 'autonomous',
          title: 'Vehículos Autónomos',
          description:
            'Fusión sensorial, planificación de trayectorias, navegación y movilidad en tiempo real.',
        },
      ],
      channelsHeading: 'Contacto y Canales',
      channelsSubheading: 'Canales de comunicación y repositorios verificados de qrblab.',
      emailLabel: 'Correo electrónico',
      socialLabels: {
        github: 'GitHub',
        discord: 'Discord',
        instagram: 'Instagram',
        x: 'X',
        website: 'Sitio web',
      },
    },
    notFound: {
      code: '404',
      title: 'Página no encontrada',
      description: 'La página solicitada no existe o ha sido movida.',
      backHome: 'Volver al inicio',
    },
    footer: {
      tagline: 'Investigación independiente en ingeniería y tecnología',
      copyright: 'qrblab',
      navigationLabel: 'Navegación del pie de página',
    },
  },
};
