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
    ar: '',
  },
  projectStatement: {
    title: {
      en: 'Research Disclaimer & Project Statement',
      ar: 'إخلاء المسؤولية البحثية وبيان المشروع',
      fr: 'Avertissement de recherche et déclaration du projet',
      de: 'Forschungshinweis und Projekterklärung',
      es: 'Aviso de investigación y declaración del proyecto',
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
      ar: [
        'qrblab هو مشروع بحثي شخصي مستقل ينبع من شغف عميق بالتكنولوجيا والهندسة، ورغبة متواصلة في استكشاف وفهم التقنيات التي ترسم مستقبل هذه المجالات، ولا سيما الذكاء الاصطناعي، والميكاترونيكس، والروبوتات، والمركبات ذاتية القيادة.',
        'جميع المواد والأبحاث المنشورة في هذا الموقع هي ثمرة جهد فردي في البحث والكتابة والتحليل والتصميم. ويعكس المحتوى مساراً مستمراً لجمع المعلومات من المصادر المتاحة ودراستها وتقديمها بصورة منظمة وميسّرة، إلى جانب التحليلات والتفسيرات ووجهات النظر الشخصية.',
        'نحرص على الاعتماد على مصادر موثوقة، والتحقق من المعلومات، وتقديم محتوى تعليمي دقيق وهادف. ومع ذلك، فإن هذه المواد مخصصة بالأساس للتعلّم والاستكشاف وتبادل المعرفة، ولا ينبغي اعتبارها مراجع علمية قطعية أو بديلاً عن الأبحاث الأكاديمية المتخصصة والمصادر الأصلية.',
        'كما تتضمن بعض المنشورات تحليلات وآراء شخصية تعبّر عن المنظور الفردي لمؤلف المشروع. وتبقى هذه التفسيرات مفتوحة للنقاش والاختلاف ولا تهدف إلى فرض أي وجهة نظر بعينها على القرّاء.',
        'نؤمن بأن المعرفة التكنولوجية مجال مفتوح ومتطور باستمرار، وأن تبادل الأفكار ومناقشتها جزء جوهري من عملية التعلّم والتقدم.',
        'إن الهدف من qrblab ليس ادّعاء امتلاك الإجابات النهائية، بل استكشاف الأسئلة الجوهرية، وبناء فهم أعمق للتقنيات الناشئة، ومشاركة المعرفة والتجارب مع كل من يشاركنا الشغف ذاته.',
        'شكراً لكم على كونكم جزءاً من هذه الرحلة في الاستكشاف والتعلّم.',
      ],
      fr: [
        "qrblab est un projet de recherche personnel et indépendant, animé par une profonde passion pour la technologie et l'ingénierie, ainsi que par un désir constant d'explorer et de comprendre les technologies qui façonnent l'avenir de ces domaines, en particulier l'Intelligence Artificielle, la Mécatronique, la Robotique et les Véhicules Autonomes.",
        "Tous les contenus et recherches publiés sur ce site sont le fruit d'un travail individuel de recherche, de rédaction, d'analyse et de conception. Ils reflètent un processus continu de collecte d'informations à partir des sources disponibles, d'étude approfondie et de présentation structurée et accessible, enrichie d'analyses, d'interprétations et de perspectives personnelles.",
        "Nous nous efforçons de nous appuyer sur des sources crédibles, de vérifier les informations et de fournir un contenu pédagogique précis et pertinent. Toutefois, ces ressources sont avant tout destinées à l'apprentissage, à l'exploration et au partage des connaissances. Elles ne doivent pas être considérées comme des références scientifiques définitives ni remplacer la recherche académique spécialisée et les sources originales.",
        "Certaines publications incluent également des analyses et des opinions personnelles qui reflètent le point de vue individuel de l'auteur du projet. Ces interprétations restent ouvertes à la discussion et au désaccord et n'ont pas vocation à imposer une opinion particulière aux lecteurs.",
        "Nous pensons que le savoir technologique est un domaine ouvert et en perpétuelle évolution, et que l'échange et le débat d'idées constituent une dimension essentielle de l'apprentissage et du progrès.",
        "L'objectif de qrblab n'est pas de revendiquer la détention de réponses définitives, mais d'explorer des questions essentielles, de développer une compréhension plus approfondie des technologies émergentes et de partager savoirs et expériences avec tous ceux qui partagent la même passion.",
        "Merci de prendre part à ce voyage d'exploration et d'apprentissage.",
      ],
      de: [
        'qrblab ist ein unabhängiges persönliches Forschungsprojekt, getragen von tiefer Leidenschaft für Technologie und Ingenieurwesen sowie dem beständigen Wunsch, jene Technologien zu erforschen und zu verstehen, die die Zukunft dieser Bereiche prägen — insbesondere Künstliche Intelligenz, Mechatronik, Robotik und Autonome Fahrzeuge.',
        'Alle auf dieser Website veröffentlichten Materialien und Studien sind das Ergebnis individueller Arbeit in Recherche, Dokumentation, Analyse und Gestaltung. Die Inhalte spiegeln einen fortlaufenden Prozess wider, Informationen aus verfügbaren Quellen zu sammeln, auszuwerten und strukturiert sowie verständlich aufzubereiten — ergänzt durch persönliche Analysen, Einordnungen und Perspektiven.',
        'Wir sind bestrebt, uns auf verlässliche Quellen zu stützen, Informationen zu prüfen und präzise sowie gehaltvolle Lerninhalte bereitzustellen. Dennoch dienen diese Materialien in erster Linie dem Lernen, Entdecken und Wissensaustausch. Sie stellen keine endgültigen wissenschaftlichen Referenzen dar und ersetzen keine spezialisierte akademische Forschung oder Originalquellen.',
        'Einige Veröffentlichungen enthalten zudem persönliche Analysen und Einschätzungen, die die individuelle Sichtweise des Autors widerspiegeln. Diese Interpretationen stehen offen für Diskussion und Widerspruch und sollen den Lesenden keine bestimmte Sichtweise vorschreiben.',
        'Wir sind überzeugt, dass technologisches Wissen ein offenes, sich stetig weiterentwickelndes Feld ist und der Austausch sowie die Diskussion von Ideen ein wesentlicher Teil von Lernen und Fortschritt sind.',
        'Das Ziel von qrblab besteht nicht darin, endgültige Antworten zu beanspruchen, sondern wichtige Fragen zu erforschen, ein tieferes Verständnis entstehender Technologien zu entwickeln und Wissen sowie Erfahrungen mit Gleichgesinnten zu teilen.',
        'Vielen Dank, dass Sie Teil dieser Reise des Entdeckens und Lernens sind.',
      ],
      es: [
        'qrblab es un proyecto de investigación personal e independiente impulsado por una profunda pasión por la tecnología y la ingeniería, y por el deseo continuo de explorar y comprender las tecnologías que configuran el futuro de estos campos, en particular la Inteligencia Artificial, la Mecatrónica, la Robótica y los Vehículos Autónomos.',
        'Todos los materiales e investigaciones publicados en este sitio web son resultado del esfuerzo individual en investigación, redacción, análisis y diseño. El contenido refleja un proceso continuo de recopilación de información de fuentes disponibles, estudio y presentación estructurada y accesible, junto con análisis, interpretaciones y perspectivas personales.',
        'Nos esforzamos por apoyarnos en fuentes fiables, verificar la información y ofrecer contenido educativo preciso y significativo. Sin embargo, estos materiales están pensados principalmente para el aprendizaje, la exploración y el intercambio de conocimientos. No deben considerarse referencias científicas definitivas ni sustitutos de la investigación académica especializada y las fuentes originales.',
        'Algunas publicaciones también incluyen análisis y opiniones personales que reflejan la perspectiva individual del autor del proyecto. Estas interpretaciones están abiertas al debate y al desacuerdo, y no pretenden imponer ningún punto de vista concreto a los lectores.',
        'Creemos que el conocimiento tecnológico es un ámbito abierto y en constante evolución, y que intercambiar y debatir ideas es una parte esencial del aprendizaje y del progreso.',
        'El propósito de qrblab no es atribuirse respuestas definitivas, sino explorar preguntas relevantes, desarrollar una comprensión más profunda de las tecnologías emergentes y compartir conocimientos y experiencias con quienes comparten esta misma pasión.',
        'Gracias por formar parte de este camino de exploración y aprendizaje.',
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
