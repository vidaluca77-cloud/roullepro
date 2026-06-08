/**
 * /blog — Index du blog RoullePro (v2, refonte visuelle complète).
 */

import Link from "next/link";
import { Metadata } from "next";
import { BookOpen, ArrowRight } from "lucide-react";
import { getAllPosts, CATEGORIES, getPostsByCategorySlug } from "@/lib/blog";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { NewsletterInline } from "@/components/blog/NewsletterInline";

export const metadata: Metadata = {
  title: "Blog du transport sanitaire conventionné — Guides, réglementation et conseils | RoullePro",
  description:
    "Actualités, conseils et guides pour les pros du transport médical : ambulances, VSL et taxis conventionnés CPAM. Réglementation, conventionnement, fiscalité et financement.",
  openGraph: {
    title: "Blog du transport sanitaire conventionné — RoullePro",
    description:
      "Actualités, conseils et guides pour les professionnels du transport médical conventionné : ambulances, VSL et taxis CPAM.",
    type: "website",
    url: "https://roullepro.com/blog",
    images: [
      {
        url: "https://roullepro.com/blog/categories/default.svg",
        width: 1200,
        height: 675,
        alt: "Blog RoullePro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog du transport sanitaire conventionné — RoullePro",
    description:
      "Actualités, conseils et guides pour les pros du transport médical conventionné.",
    images: ["https://roullepro.com/blog/categories/default.svg"],
  },
  alternates: {
    canonical: "https://roullepro.com/blog",
  },
};

export default function BlogIndexPage() {
  const allPosts = getAllPosts();
  const [featured, ...rest] = allPosts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ─── HERO ───────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.2),transparent_50%)]" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <BookOpen size={15} className="text-blue-300" />
            <span className="text-sm font-medium tracking-wide">
              Transport médical conventionné
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-[1.05] tracking-tight">
            Le blog du transport
            <br />
            <span className="bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">
              sanitaire conventionné
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed">
            Actualités, conseils et guides pour les pros du transport médical :
            ambulances, VSL et taxis conventionnés CPAM. Réglementation,
            conventionnement, fiscalité et financement.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* ─── CATÉGORIES ─────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Parcourir par thème
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const count = getPostsByCategorySlug(cat.slug).length;
              if (count === 0) return null;
              return (
                <Link
                  key={cat.slug}
                  href={`/blog/categorie/${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={`relative h-24 bg-gradient-to-br ${cat.color} overflow-hidden`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition leading-tight">
                      {cat.label}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {count} {count > 1 ? "articles" : "article"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ─── À LA UNE + ARTICLES ─────────────────────── */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Tous les articles
            </h2>
            <span className="text-sm text-gray-400">
              {allPosts.length} publications
            </span>
          </div>

          {/* Article à la une, pleine largeur */}
          {featured && (
            <div className="mb-8">
              <ArticleCard post={featured} variant="featured" />
            </div>
          )}

          {/* Premiers articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.slice(0, 6).map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Newsletter au milieu */}
          {rest.length > 6 && (
            <div className="my-8">
              <NewsletterInline />
            </div>
          )}

          {/* Reste des articles */}
          {rest.length > 6 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.slice(6).map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* ─── CTA FINAL ───────────────────────────────── */}
        <section className="mt-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 md:p-12 text-white text-center">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Rejoignez la marketplace pro
              </h2>
              <p className="text-lg text-white/85 mb-6 max-w-2xl mx-auto">
                RoullePro connecte les professionnels du transport routier.
                Inscription gratuite, 1ère annonce offerte.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/deposer-annonce"
                  className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-gray-100 px-6 py-3 rounded-xl font-semibold transition"
                >
                  Déposer une annonce
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/annonces"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition"
                >
                  Parcourir les annonces
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
