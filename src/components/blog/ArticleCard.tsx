/**
 * Carte d'article — utilisée sur index blog + pages catégories + articles similaires.
 * Trois variants : default (16:9), featured (21:9), compact (vignette latérale).
 */

import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import type { BlogPost } from "@/lib/blog";
import { categoryLabelToSlug, getCategoryBySlug, getPostImage } from "@/lib/blog";

export function ArticleCard({
  post,
  variant = "default",
}: {
  post: BlogPost;
  variant?: "default" | "featured" | "compact";
}) {
  const cat = getCategoryBySlug(categoryLabelToSlug(post.category));
  const gradient = cat?.color || "from-blue-500 to-indigo-600";
  const { src, alt } = getPostImage(post);

  // ─── COMPACT ─── (sidebars « articles similaires », style conservé) ───
  if (variant === "compact") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex gap-4 items-start p-4 rounded-xl hover:bg-gray-50 transition"
      >
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="64px"
            className="object-cover"
          />
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

  // ─── FEATURED ─── (image 21:9 + overlay sombre, cliquable en entier) ───
  if (variant === "featured") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-3"
      >
        <div className="relative aspect-[21/9] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
            <div className="mb-3 flex items-center gap-3">
              <span
                className={`inline-block bg-gradient-to-r ${gradient} text-white text-xs font-semibold px-3 py-1.5 rounded-full`}
              >
                À la une · {post.category}
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight tracking-tight mb-3 max-w-3xl">
              {post.title}
            </h2>
            <p className="text-white/85 line-clamp-2 mb-4 max-w-2xl leading-relaxed text-sm md:text-base">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 text-sm text-white/75">
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
          </div>
        </div>
      </Link>
    );
  }

  // ─── DEFAULT ─── (image 16:9 + corps blanc, badge catégorie en overlay) ───
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className={`absolute top-3 left-3 inline-block bg-gradient-to-r ${gradient} text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm`}
        >
          {post.category}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
          {post.title}
        </h2>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="text-xs text-gray-400 flex items-center justify-between">
          <span className="flex items-center gap-3">
            <time>
              {new Date(post.date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {post.readingTime} min
            </span>
          </span>
          <span className="text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
            Lire <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
