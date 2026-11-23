# qrblab — Independent Engineering & Mechatronics Research Hub

A 100% static, zero-backend research archive and documentation platform for **qrblab**, designed with an Apple-inspired white and frosted-glass aesthetic, App-Store-style PDF preview galleries, interactive local star ratings, and full bilingual English (`LTR`) / Arabic (`RTL`) support for GitHub Pages.

## Overview

- **Bilingual Architecture**: English (`en`, `LTR`) default with instant Arabic (`ar`, `RTL`) switching, dynamic document direction/language attributes, and tailored typography (`Inter` and `IBM Plex Sans Arabic`).
- **App-Store-Style Paper Previews**: Research cards feature thumbnail slots, titles, short descriptions, and local rating summaries. Detail pages present an interactive `localStorage` star rating, deep explanation, horizontal scrollable PDF preview screenshots with a lightbox modal, and a direct `download PDF` action.
- **Zero-Backend & Empty-Ready**: All site configuration and publication metadata live in versioned TypeScript modules with no servers, databases, or authentication.

## Project Structure

```text
.
├── .github/workflows/deploy.yml   # Automated GitHub Pages build & deployment
├── public/
│   ├── images/                    # Paper thumbnails & PDF preview screenshots
│   └── papers/                    # Published PDF documents
├── src/
│   ├── components/                # Frosted-glass UI primitives, cards, lightbox, navbar
│   ├── context/                   # Bilingual EN/AR state & RTL direction management
│   ├── data/
│   │   ├── i18n.ts                # Complete English & Arabic UI strings
│   │   ├── papers.ts              # ResearchPaper schema & publications array
│   │   └── siteConfig.ts          # Brand name, disclaimer statement, & active channels
│   ├── pages/                     # Home, Research Archive, Paper Detail, About, 404
│   └── utils/                     # Pure filtering, citation, rating, & URL helpers
└── vite.config.ts                 # Configured with base: './' for GitHub Pages
```

## Publishing a New Research Paper

1. **Upload assets**: Place your PDF inside `public/papers/` (for example `public/papers/actuator-study.pdf`) and your thumbnail and preview screenshots inside `public/images/`.
2. **Register the paper**: Add a `ResearchPaper` entry to the `papers` array in `src/data/papers.ts` using the commented template at the top of that file (`title`, `shortDescription`, `explanation`, `thumbnail`, `previewImages`, `pdfPath`, `authors`, `publishedDate`, `version`, `category`, `tags`, `doi`).
3. **Commit to `main`**: Push your changes to the `main` branch. The GitHub Actions workflow builds `./dist` and deploys automatically to GitHub Pages.

## Local Development

```bash
npm install
npm run dev
```

To type-check and build the static production bundle:

```bash
npm run lint
npm run build
```
