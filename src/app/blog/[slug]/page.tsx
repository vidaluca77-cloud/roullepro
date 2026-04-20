/**
 * /blog/[slug] — Article individuel SEO.
 * Rendu statique avec generateStaticParams + generateMetadata.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
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
    },
    alternates: {
      canonical: `https://roullepro.com/blog/${post.slug}`,
    },
  };
}

/** Mini-rendu Markdown sans dépendance : titres, paragraphes, listes, gras. */
function renderMarkdown(raw: string) {
  const lines = raw.split("\n");
  const blocks: any[] = [];
  let currentList: string[] | null = null;

  const pushList = () => {
    if (currentList) {
      blocks.push({ type: "ul", items: currentList });
      currentList = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      pushList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      pushList();
      blocks.push({ type: "h3", text: trimmed.slice(4) });
    } else if (trimmed.startsWith("## ")) {
      pushList();
      blocks.push({ type: "h2", text: trimmed.slice(3) });
    } else if (trimmed.startsWith("- ")) {
      if (!currentList) currentList = [];
      currentList.push(trimmed.slice(2));
    } else {
      pushList();
      blocks.push({ type: "p", text: trimmed });
    }
  }
  pushList();

  const inline = (s: string) => {
    const parts = s.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return blocks.map((b, i) => {
    if (b.type === "h2")
      return (
        <h2 key={i} className="text-2xl font-bold text-gray-900 mt-8 mb-3">
          {b.text}
        </h2>
      );
    if (b.type === "h3")
      return (
        <h3 key={i} className="text-xl font-semibold text-gray-900 mt-6 mb-2">
          {b.text}
        </h3>
      );
    if (b.type === "ul")
      return (
        <ul key={i} className="list-disc pl-6 space-y-1 text-gray-700 mb-4">
          {b.items.map((it: string, j: number) => (
            <li key={j}>{inline(it)}</li>
          ))}
        </ul>
      );
    return (
      <p key={i} className="text-gray-700 leading-relaxed mb-4">
        {inline(b.text)}
      </p>
    );
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: "RoullePro" },
    publisher: {
      "@type": "Organization",
      name: "RoullePro",
      url: "https://roullepro.com",
    },
    mainEntityOfPage: `https://roullepro.com/blog/${post.slug}`,
  };

  return (
    <article className="min-h-screen bg-white py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline mb-6"
        >
          <ArrowLeft size={14} /> Retour au blog
        </Link>

        <header className="mb-8">
          <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-2">
            {post.category}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {post.title}
          </h1>
          <p className="text-lg text-gray-600 mb-3">{post.excerpt}</p>
          <div className="text-sm text-gray-400">
            {new Date(post.date).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" · "}
            {post.readingTime} min de lecture
          </div>
        </header>

        <div className="prose prose-blue max-w-none">
          {renderMarkdown(post.content)}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-900 mb-2">
            Vendez plus vite avec RoullePro
          </h3>
          <p className="text-sm text-gray-700 mb-4">
            Déposez votre annonce en 3 minutes, atteignez des milliers de
            professionnels qualifiés.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Link
              href="/deposer-annonce"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
            >
              Déposer une annonce
            </Link>
            <Link
              href="/pricing"
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2 rounded-lg text-sm font-semibold transition"
            >
              Voir les abonnements
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
