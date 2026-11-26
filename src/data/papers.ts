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
  publishedDate: string;
  version: string;
  category: LocalizedText;
  tags: string[];
  pdfPath: string;
  thumbnail?: string;
  previewImages?: string[];
  doi?: string;
  highlights?: LocalizedList;
}

export const papers: ResearchPaper[] = [
  {
    id: "qrb-20261126-111721",
    slug: "attention-is-all-you-need",
    title: {
      en: "Attention Is All You Need",
      ar: "Attention Is All You Need",
    },
    shortDescription: {
      en: "The foundational paper introducing the Transformer architecture, a sequence transduction model built solely on self-attention mechanisms without recurrence or convolutions. It achieves higher parallelization, faster training, and state-of-the-art machine translation performance.",
      ar: "The foundational paper introducing the Transformer architecture, a sequence transduction model built solely on self-attention mechanisms without recurrence or convolutions. It achieves higher parallelization, faster training, and state-of-the-art machine translation performance.",
    },
    abstract: {
      en: "The foundational paper introducing the Transformer architecture, a sequence transduction model built solely on self-attention mechanisms without recurrence or convolutions. It achieves higher parallelization, faster training, and state-of-the-art machine translation performance.",
      ar: "The foundational paper introducing the Transformer architecture, a sequence transduction model built solely on self-attention mechanisms without recurrence or convolutions. It achieves higher parallelization, faster training, and state-of-the-art machine translation performance.",
    },
    explanation: {
      en: "This paper introduces the Transformer, an encoder-decoder neural architecture that completely replaces recurrent (RNN/LSTM) and convolutional layers with attention mechanisms to model global sequence dependencies directly in constant sequential operations.\n\nKey Architectural Components:\n1. Scaled Dot-Product & Multi-Head Attention: Queries, keys, and values are linearly projected into parallel attention heads (h = 8, d_k = d_v = 64 for d_model = 512), enabling the model to jointly attend to information across different representation subspaces and positions.\n2. Encoder & Decoder Stacks: Six identical encoder layers (multi-head self-attention + position-wise feed-forward network) paired with six decoder layers that add masked self-attention to preserve auto-regressive generation and cross-attention over encoder outputs. Residual connections and layer normalization wrap every sub-layer.\n3. Position-Wise Feed-Forward Networks & Positional Encoding: Each layer applies two linear transformations with ReLU activation (d_ff = 2048), while sinusoidal positional encodings inject sequence order without recurrence.\n\nEmpirical Results (WMT 2014 & Generalization):\n- Achieved 28.4 BLEU on WMT 2014 English-to-German and 41.8 BLEU on English-to-French (single model trained in 3.5 days on 8 P100 GPUs), outperforming prior recurrent and convolutional ensembles at a fraction of the training cost.\n- Generalized effectively beyond translation to English constituency parsing (91.3 F1 WSJ-only, 92.7 F1 semi-supervised).",
      ar: "This paper introduces the Transformer, an encoder-decoder neural architecture that completely replaces recurrent (RNN/LSTM) and convolutional layers with attention mechanisms to model global sequence dependencies directly in constant sequential operations.\n\nKey Architectural Components:\n1. Scaled Dot-Product & Multi-Head Attention: Queries, keys, and values are linearly projected into parallel attention heads (h = 8, d_k = d_v = 64 for d_model = 512), enabling the model to jointly attend to information across different representation subspaces and positions.\n2. Encoder & Decoder Stacks: Six identical encoder layers (multi-head self-attention + position-wise feed-forward network) paired with six decoder layers that add masked self-attention to preserve auto-regressive generation and cross-attention over encoder outputs. Residual connections and layer normalization wrap every sub-layer.\n3. Position-Wise Feed-Forward Networks & Positional Encoding: Each layer applies two linear transformations with ReLU activation (d_ff = 2048), while sinusoidal positional encodings inject sequence order without recurrence.\n\nEmpirical Results (WMT 2014 & Generalization):\n- Achieved 28.4 BLEU on WMT 2014 English-to-German and 41.8 BLEU on English-to-French (single model trained in 3.5 days on 8 P100 GPUs), outperforming prior recurrent and convolutional ensembles at a fraction of the training cost.\n- Generalized effectively beyond translation to English constituency parsing (91.3 F1 WSJ-only, 92.7 F1 semi-supervised).",
    },
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Łukasz Kaiser", "Illia Polosukhin"],
    publishedDate: "2017-06-12",
    version: "v1.0",
    category: {
      en: "Artificial Intelligence",
      ar: "Artificial Intelligence",
    },
    tags: ["Transformer", "Self-Attention", "Multi-Head Attention", "Deep Learning", "NLP"],
    pdfPath: "papers/attention-is-all-you-need.pdf",
    thumbnail: "images/attention-is-all-you-need-poster.jpg",
    previewImages: ["images/attention-is-all-you-need-p1.png", "images/attention-is-all-you-need-p2.png", "images/attention-is-all-you-need-p3.png"],
    doi: "10.48550/arXiv.1706.03762",
  }
];