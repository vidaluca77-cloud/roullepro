/**
 * /blog — Index du blog RoullePro.
 * Articles statiques optimisés SEO pour ranker sur les requêtes
 * "vendre utilitaire pro", "acheter camion occasion", etc.
 */

import Link from "next/link";
import { Metadata } from "next";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog RoullePro — Conseils véhicules utilitaires et professionnels",
  description:
    "Guides, actualités et conseils pour acheter ou vendre un véhicule utilitaire, un taxi, un VTC ou une ambulance entre professionnels.",
  openGraph: {
    title: "Blog RoullePro",
    description:
      "Guides pour acheter ou vendre un véhicule professionnel entre pros.",
    type: "website",
  },
  alternates: {
    canonical: "https://roullepro.com/blog",
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Blog RoullePro</h1>
          <p className="text-lg text-gray-600">
            Guides, fiscalité et bonnes pratiques pour les professionnels du
            véhicule utilitaire.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition group"
            >
              <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-2">
                {post.category}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                {post.title}
              </h2>
              <p className="text-sm text-gray-600 line-clamp-3">
                {post.excerpt}
              </p>
              <div className="mt-4 text-xs text-gray-400">
                {new Date(post.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" · "}
                {post.readingTime} min de lecture
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
