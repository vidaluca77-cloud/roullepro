/**
 * Carte d'article — utilisée sur index blog + pages catégories + articles similaires.
 */

import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { categoryLabelToSlug, getCategoryBySlug } from "@/lib/blog";

export function ArticleCard({
  post,
  variant = "default",
}: {
  post: BlogPost;
  variant?: "default" | "featured" | "compact";
}) {
  const cat = getCategoryBySlug(categoryLabelToSlug(post.category));
  const gradient = cat?.color || "from-blue-500 to-indigo-600";

  if (variant === "compact") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex gap-4 items-start p-4 rounded-xl hover:bg-gray-50 transition"
      >
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex-shrink-0 flex items-center justify-center text-white text-xs font-bold`}
        >
          {post.category.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wide">
            {post.category}
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 text-sm">
            {post.title}
          </h3>
          <div className="text-xs text-gray-400 mt-1">
            {post.readingTime} min
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 md:col-span-2"
      >
        <div className={`h-52 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="absolute bottom-5 left-6">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30">
              À la une · {post.category}
            </span>
          </div>
        </div>
        <div className="p-7">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition leading-tight">
            {post.title}
          </h2>
          <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
            {post.excerpt}
          </p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <time>
                {new Date(post.date).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {post.readingTime} min
              </span>
            </div>
            <span className="flex items-center gap-1 text-blue-600 font-semibold group-hover:gap-2 transition-all">
              Lire <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // default
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/30">
            {post.category}
          </span>
          <span className="text-white/80 text-[11px] font-medium flex items-center gap-1">
            <Clock size={11} />
            {post.readingTime} min
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
          {post.title}
        </h2>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="text-xs text-gray-400 flex items-center justify-between">
          <time>
            {new Date(post.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </time>
          <span className="text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
            Lire <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
