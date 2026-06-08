/**
 * Helpers SEO pour le blog : URLs absolues, image Open Graph, JSON-LD Article
 * et FAQPage. Centralise la logique pour les pages d'articles.
 */

import type { BlogPost } from "./blog";
import { getPostImage, categoryLabelToSlug } from "./blog";

/** URL de production du site (sans slash final). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://roullepro.com"
).replace(/\/$/, "");

/** Transforme un chemin relatif (/blog/x.jpg) en URL absolue de production. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** URL absolue de l'image principale d'un article (pour OG/JSON-LD). */
export function getPostImageUrl(post: BlogPost): string {
  return absoluteUrl(getPostImage(post).src);
}

/** JSON-LD Article complet, image en URL absolue. */
export function buildArticleJsonLd(post: BlogPost) {
  const categorySlug = categoryLabelToSlug(post.category);
  const wordCount = post.content.split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: [getPostImageUrl(post)],
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "fr-FR",
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
    author: {
      "@type": "Organization",
      name: "RoullePro",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "RoullePro",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/logo.png"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-excerpt", "article p:first-of-type"],
    },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    isAccessibleForFree: true,
    url: `${SITE_URL}/blog/${post.slug}/`.replace(/\/$/, ""),
    about: { "@type": "Thing", name: post.category },
    _categorySlug: categorySlug,
  };
}

/** Une question/réponse extraite d'une section FAQ. */
export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Extrait les questions/réponses d'une section « ## Questions fréquentes ».
 * Chaque question est un titre H3, la réponse correspond aux paragraphes qui
 * suivent jusqu'au prochain H3 ou H2. Retourne [] si aucune FAQ détectée.
 */
export function extractFaq(content: string): FaqItem[] {
  const lines = content.split("\n");
  const faq: FaqItem[] = [];
  let inFaq = false;
  let currentQuestion: string | null = null;
  let answerLines: string[] = [];

  const flush = () => {
    if (currentQuestion) {
      const answer = answerLines.join(" ").replace(/\s+/g, " ").trim();
      if (answer) faq.push({ question: currentQuestion, answer });
    }
    currentQuestion = null;
    answerLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      // Fin de section FAQ si on rencontre un nouveau H2 après être entré dedans.
      if (inFaq) {
        flush();
        inFaq = false;
      }
      const heading = trimmed
        .slice(3)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
      if (heading.includes("questions frequentes") || heading.includes("faq")) {
        inFaq = true;
      }
      continue;
    }
    if (!inFaq) continue;
    if (trimmed.startsWith("### ")) {
      flush();
      currentQuestion = trimmed.slice(4);
    } else if (trimmed && currentQuestion) {
      // On nettoie le markdown léger (gras, liens) pour le schema.
      const clean = trimmed
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      answerLines.push(clean);
    }
  }
  flush();
  return faq;
}

/** JSON-LD FAQPage à partir des items extraits (null si vide). */
export function buildFaqJsonLd(faq: FaqItem[]) {
  if (faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
