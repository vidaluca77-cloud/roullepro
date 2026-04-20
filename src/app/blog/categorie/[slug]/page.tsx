import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  CATEGORIES,
  getCategoryBySlug,
  getPostsByCategorySlug,
  getLatestPosts,
} from "@/lib/blog";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { NewsletterInline } from "@/components/blog/NewsletterInline";

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) return { title: "Catégorie introuvable — RoullePro" };

  const url = `https://roullepro.com/blog/categorie/${cat.slug}`;
  return {
    title: `${cat.label} — Blog RoullePro`,
    description: cat.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${cat.label} — Blog RoullePro`,
      description: cat.description,
      url,
      type: "website",
    },
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const cat = getCategoryBySlug(params.slug);
  if (!cat) notFound();

  const posts = getPostsByCategorySlug(params.slug);
  const otherCategories = CATEGORIES.filter((c) => c.slug !== params.slug);
  const latestOther = getLatestPosts(6).filter(
    (p) => !posts.some((x) => x.slug === p.slug)
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero catégorie */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${cat.color} py-20 md:py-28`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_40%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.15),transparent_50%)]" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/85 hover:text-white text-sm font-medium mb-6 transition"
          >
            <ArrowLeft size={16} /> Retour au blog
          </Link>
          <div className="inline-block bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/25 uppercase tracking-wider mb-5">
            Catégorie
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5">
            {cat.label}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl leading-relaxed">
            {cat.description}
          </p>
          <div className="mt-6 text-white/80 text-sm">
            {posts.length} article{posts.length > 1 ? "s" : ""} dans cette
            catégorie
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-600 text-lg">
              Aucun article publié dans cette catégorie pour le moment.
            </p>
            <Link
              href="/blog"
              className="inline-block mt-5 px-6 py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition"
            >
              Voir tous les articles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {/* Newsletter */}
        <NewsletterInline />

        {/* Autres catégories */}
        <div className="mt-14">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Explorer d&apos;autres thèmes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {otherCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/blog/categorie/${c.slug}`}
                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md hover:-translate-y-0.5 transition"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${c.color}`}
                />
                <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition">
                  {c.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Derniers articles d'autres catégories */}
        {latestOther.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Également à lire
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestOther.slice(0, 3).map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
