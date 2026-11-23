export type SupportedLanguage = 'en' | 'ar' | 'fr' | 'de' | 'es';

export interface LocalizedText {
  en: string;
  ar: string;
  fr?: string;
  de?: string;
  es?: string;
}

export interface LocalizedList {
  en: string[];
  ar: string[];
  fr?: string[];
  de?: string[];
  es?: string[];
}

export type BilingualText = LocalizedText;
export type BilingualList = LocalizedList;

export interface ResearchPaper {
  id: string;
  slug: string;
  title: LocalizedText;
  shortDescription: LocalizedText;
  explanation: LocalizedText;
  abstract?: LocalizedText;
  authors: string[];
  publishedDate: string; // ISO date string: YYYY-MM-DD
  version: string;
  category: LocalizedText;
  tags: string[];
  pdfPath: string; // Relative to public/, e.g. "papers/my-paper.pdf"
  thumbnail?: string; // Relative to public/, e.g. "images/my-paper-thumb.png"
  previewImages?: string[]; // Relative to public/, e.g. ["images/page-1.png", "images/page-2.png"]
  doi?: string;
  highlights?: LocalizedList;
}

/**
 * Publishing Template for qrblab (takes under 2 minutes on GitHub):
 * 1. Upload your PDF to `public/papers/` and images to `public/images/`.
 * 2. Copy the template object below into the `papers` array (`fr`, `de`, `es` are optional and fall back cleanly to `en`).
 * 3. Commit and push to `main` — GitHub Actions builds and deploys automatically.
 *
 * {
 *   id: "qrblab-2026-001",
 *   slug: "field-oriented-control-bldc-actuator",
 *   title: {
 *     en: "High-Bandwidth Field-Oriented Control for Compact BLDC Actuators",
 *     ar: "التحكم الموجه بالمجال عالي النطاق الترددي لمشغلات المحركات عديمة الفرش المدمجة",
 *   },
 *   shortDescription: {
 *     en: "Concise 1-2 sentence overview displayed on research cards and search results.",
 *     ar: "ملخص موجز من جملة إلى جملتين يظهر على بطاقات الأبحاث ونتائج البحث.",
 *   },
 *   explanation: {
 *     en: "Deep technical explanation covering methodology, math, testbench architecture, and empirical observations.",
 *     ar: "شرح تقني معمق يغطي المنهجية والمعادلات وبنية منصة الاختبار والملاحظات التجريبية.",
 *   },
 *   thumbnail: "images/field-oriented-control-thumb.png",
 *   previewImages: [
 *     "images/field-oriented-control-p1.png",
 *     "images/field-oriented-control-p2.png",
 *   ],
 *   pdfPath: "papers/field-oriented-control-bldc-actuator.pdf",
 *   authors: ["Author Name"],
 *   publishedDate: "2026-05-14",
 *   version: "v1.0",
 *   category: {
 *     en: "Mechatronics",
 *     ar: "الميكاترونيكس",
 *   },
 *   tags: ["BLDC", "FOC", "Robotics"],
 *   doi: "10.0000/qrblab.2026.001",
 *   highlights: {
 *     en: [
 *       "Key engineering contribution or experimental result.",
 *       "Second verifiable technical takeaway.",
 *     ],
 *     ar: [
 *       "المساهمة الهندسية الرئيسية أو النتيجة التجريبية.",
 *       "الاستنتاج التقني الثاني القابل للتحقق.",
 *     ],
 *   },
 * }
 */
export const papers: ResearchPaper[] = [];
