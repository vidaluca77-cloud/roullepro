/**
 * Bloc « articles liés » place sur les pages piliers et le hub transport
 * medical. Cree le maillage bidirectionnel pilier -> blog en poussant jusqu'a
 * 3 articles correspondant a la thematique de la page. Rien ne s'affiche si
 * aucun article ne correspond.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getPostsByKeywords } from "@/lib/blog";

export function ArticlesLiesPilier({
  needles,
  titre = "À lire sur le blog",
  limit = 3,
}: {
  needles: string[];
  titre?: string;
  limit?: number;
}) {
  const posts = getPostsByKeywords(needles, limit);
  if (posts.length === 0) return null;

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{titre}</h2>
      <ul className="grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-md transition"
            >
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                {post.category}
              </span>
              <span className="font-semibold text-gray-900 leading-snug group-hover:text-blue-700 transition">
                {post.title}
              </span>
              <span className="mt-2 text-sm text-gray-600 line-clamp-3">
                {post.excerpt}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                Lire l&apos;article
                <ArrowRight size={14} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
