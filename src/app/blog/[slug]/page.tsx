/**
 * /blog/[slug] — Article individuel SEO (v2, refonte visuelle complète).
 */

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import {
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
  categoryLabelToSlug,
  getCategoryBySlug,
  getPostImage,
} from "@/lib/blog";
import {
  SITE_URL,
  getPostImageUrl,
  buildArticleJsonLd,
  extractFaq,
  buildFaqJsonLd,
  extractHowTo,
  buildHowToJsonLd,
  stripFaqSection,
} from "@/lib/blog-seo";
import { jsonLdHtml } from "@/lib/seo-schema";
import {
  MarkdownRenderer,
  extractHeadings,
} from "@/components/blog/MarkdownRenderer";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { NewsletterInline } from "@/components/blog/NewsletterInline";
import { BlogCTA } from "@/components/blog/BlogCTA";
import MaillageTransporteurs from "@/components/etablissements/MaillageTransporteurs";
import { FaqAccordion } from "@/components/blog/FaqAccordion";
import {
  ConfidenceBlock,
  DEFAULT_SOURCES_CPAM,
  SOURCES_AGREMENT,
  SOURCES_ALD_ONCO,
  type ConfidenceSource,
} from "@/components/blog/ConfidenceBlock";

// Articles recevant l'encart de maillage interne vers les fiches etablissement.
const MAILLAGE_SLUGS = new Set([
  "remboursement-transport-medical",
  "agrement-cpam-taxi-conventionne",
  "transport-chimiotherapie-dialyse-radiotherapie",
  "transport-medical-ald-droits",
  "ambulance-ne-repond-pas-que-faire",
  "transport-medical-partage-regles",
]);

// Articles strategiques SEO : reçoivent le bloc confiance (E-A-T) et la FAQ
// rendue en accordion stylise pour activer les rich snippets Google.
const SEO_BOOST_SLUGS = new Set([
  "agrement-cpam-taxi-conventionne",
  "remboursement-transport-medical",
  "transport-chimiotherapie-dialyse-radiotherapie",
]);

/** Mapping slug -> sources officielles personnalisees pour le bloc confiance. */
function getConfidenceSources(slug: string): ConfidenceSource[] {
  switch (slug) {
    case "agrement-cpam-taxi-conventionne":
      return SOURCES_AGREMENT;
    case "transport-chimiotherapie-dialyse-radiotherapie":
      return SOURCES_ALD_ONCO;
    default:
      return DEFAULT_SOURCES_CPAM;
  }
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Article introuvable" };
  const imageUrl = getPostImageUrl(post);
  const { alt } = getPostImage(post);
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      url: `${SITE_URL}/blog/${post.slug}`,
      images: [{ url: imageUrl, width: 1200, height: 630, alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const categorySlug = categoryLabelToSlug(post.category);
  const cat = getCategoryBySlug(categorySlug);
  const gradient = cat?.color || "from-blue-500 to-indigo-600";
  const headings = extractHeadings(post.content);
  const related = getRelatedPosts(post, 3);
  const heroImage = getPostImage(post);

  const wordCount = post.content.split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  const faqItems = extractFaq(post.content);
  const jsonLd = buildArticleJsonLd(post);
  const faqLd = buildFaqJsonLd(faqItems);
  const howToLd = buildHowToJsonLd(extractHowTo(post.content));

  // Des qu'un article contient une FAQ, on la rend en accordion stylise (h3 +
  // details/summary) et on retire la section markdown plate pour eviter le doublon.
  // Generalise a TOUS les articles (et plus seulement SEO_BOOST_SLUGS) : chaque
  // FAQ devient citable par les AI Overviews via le JSON-LD FAQPage + le rendu h3.
  const isSeoBoosted = SEO_BOOST_SLUGS.has(post.slug);
  const hasFaq = faqItems.length > 0;
  const renderedContent = hasFaq ? stripFaqSection(post.content) : post.content;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.category,
        item: `${SITE_URL}/blog/categorie/${categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
      },
    ],
  };

  // Séparation à ~45% pour insérer la newsletter au milieu
  const splitPoint = Math.floor(renderedContent.length * 0.45);
  const breakIndex = renderedContent.indexOf("\n## ", splitPoint);
  const firstHalf =
    breakIndex > 0 ? renderedContent.slice(0, breakIndex) : renderedContent;
  const secondHalf = breakIndex > 0 ? renderedContent.slice(breakIndex) : "";

  return (
    <article className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd) }}
        />
      )}
      {howToLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdHtml(howToLd) }}
        />
      )}

      {/* ─── IMAGE HERO ─────────────────────────── */}
      <div className="relative w-full bg-gray-900">
        <div className="relative w-full aspect-[21/9] max-h-[480px]">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
        </div>
      </div>

      {/* ─── HERO ─────────────────────────────── */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${gradient} text-white`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_100%,rgba(0,0,0,0.2),transparent_50%)]" />
        {/* Voile sombre : garantit le contraste même si le dégradé de
            catégorie venait à manquer ou si le fond est trop clair. */}
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative max-w-4xl mx-auto px-4 py-14 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/80 mb-6 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            <Link
              href="/blog"
              className="hover:text-white transition inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Blog
            </Link>
            <span>/</span>
            <Link
              href={`/blog/categorie/${categorySlug}`}
              className="hover:text-white transition"
            >
              {post.category}
            </Link>
          </nav>

          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5 mb-5">
            <Tag size={13} />
            <span className="text-xs font-semibold tracking-wide uppercase">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
            {post.h1 || post.title}
          </h1>

          <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-6 max-w-3xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85 drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <time>
                {new Date(post.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "Europe/Paris",
                })}
              </time>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{post.readingTime} min de lecture</span>
            </div>
            <div className="text-white/50">·</div>
            <div>Par l&apos;équipe RoullePro</div>
          </div>
        </div>
      </div>

      {/* ─── CORPS ─────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_240px] gap-10">
          {/* Contenu principal */}
          <div className="min-w-0">
            {/* Bloc confiance E-A-T : auteur, sources officielles, mise a jour */}
            {isSeoBoosted && (
              <ConfidenceBlock
                updatedAt={post.date}
                readingMinutes={readingMinutes}
                sources={getConfidenceSources(post.slug)}
              />
            )}

            <MarkdownRenderer content={firstHalf} />

            {secondHalf && (
              <>
                <NewsletterInline />
                <MarkdownRenderer content={secondHalf} />
              </>
            )}

            {/* Mots-clés */}
            {post.keywords.length > 0 && (
              <div className="mt-10 pt-8 border-t border-gray-100">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Mots-clés
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.keywords.map((k) => (
                    <span
                      key={k}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full"
                    >
                      #{k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ accordion stylisee (rich snippets + citabilite AI Overviews)
                sur tous les articles disposant d'une section FAQ. */}
            {hasFaq && <FaqAccordion items={faqItems} />}

            {/* Maillage interne : encart transporteurs conventionnes */}
            {MAILLAGE_SLUGS.has(post.slug) && (
              <MaillageTransporteurs
                variant={
                  post.slug === "transport-chimiotherapie-dialyse-radiotherapie"
                    ? "dialyse"
                    : "default"
                }
              />
            )}

            {/* CTA contextuel */}
            <BlogCTA category={post.category} />
          </div>

          {/* Sommaire latéral (desktop) */}
          {headings.length > 2 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Sommaire
                </div>
                <nav className="space-y-2 text-sm border-l border-gray-200 pl-4">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className="block text-gray-600 hover:text-blue-600 hover:border-blue-600 -ml-[17px] pl-4 border-l-2 border-transparent py-1 transition leading-snug"
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>

                <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    À propos
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Article de {readingMinutes} min rédigé
                    par l&apos;équipe RoullePro, marketplace B2B du
                    transport routier.
                  </p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* ─── ARTICLES SIMILAIRES ─────────────────── */}
      {related.length > 0 && (
        <div className="bg-gray-50 border-t border-gray-100 py-14 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
                  À lire aussi
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Dans la même catégorie
                </h2>
              </div>
              <Link
                href={`/blog/categorie/${categorySlug}`}
                className="text-sm font-semibold text-blue-600 hover:underline hidden md:inline-flex items-center gap-1"
              >
                Voir tous les articles {post.category}
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <ArticleCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
