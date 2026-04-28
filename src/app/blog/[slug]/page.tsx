/**
 * /blog/[slug] — Article individuel SEO (v2, refonte visuelle complète).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import {
  getAllSlugs,
  getPostBySlug,
  getRelatedPosts,
  categoryLabelToSlug,
  getCategoryBySlug,
} from "@/lib/blog";
import {
  MarkdownRenderer,
  extractHeadings,
} from "@/components/blog/MarkdownRenderer";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { NewsletterInline } from "@/components/blog/NewsletterInline";
import { BlogCTA } from "@/components/blog/BlogCTA";

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
  return {
    title: `${post.title} — RoullePro`,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      url: `https://roullepro.com/blog/${post.slug}`,
    },
    alternates: {
      canonical: `https://roullepro.com/blog/${post.slug}`,
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

  const wordCount = post.content.split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "fr-FR",
    wordCount,
    timeRequired: `PT${readingMinutes}M`,
    author: { "@type": "Organization", name: "RoullePro", url: "https://roullepro.com" },
    publisher: {
      "@type": "Organization",
      name: "RoullePro",
      url: "https://roullepro.com",
      logo: {
        "@type": "ImageObject",
        url: "https://roullepro.com/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://roullepro.com/blog/${post.slug}`,
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-excerpt", "article p:first-of-type"],
    },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    isAccessibleForFree: true,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: "https://roullepro.com/blog",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.category,
        item: `https://roullepro.com/blog/categorie/${categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
      },
    ],
  };

  // Séparation à ~45% pour insérer la newsletter au milieu
  const splitPoint = Math.floor(post.content.length * 0.45);
  const breakIndex = post.content.indexOf("\n## ", splitPoint);
  const firstHalf =
    breakIndex > 0 ? post.content.slice(0, breakIndex) : post.content;
  const secondHalf = breakIndex > 0 ? post.content.slice(breakIndex) : "";

  return (
    <article className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ─── HERO ─────────────────────────────── */}
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${gradient} text-white`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_100%,rgba(0,0,0,0.2),transparent_50%)]" />

        <div className="relative max-w-4xl mx-auto px-4 py-14 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-6">
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

          <h1 className="text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-5">
            {post.title}
          </h1>

          <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-6 max-w-3xl">
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <time>
                {new Date(post.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
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
