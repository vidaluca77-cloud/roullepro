import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Pin, Lock } from 'lucide-react';
import {
  FORUM_BASE_URL,
  getForumServiceClient,
  getCategoryBySlug,
  getThreadsByCategory,
} from '@/lib/forum';
import { formatForumDateShort } from '@/lib/forum-format';
import NewThreadCta from '../_components/NewThreadCta';

export const revalidate = 120;

interface PageProps {
  params: { categorie: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = getForumServiceClient();
  const cat = await getCategoryBySlug(supabase, params.categorie);
  if (!cat) {
    return { title: 'Catégorie introuvable — Forum RoullePro', robots: { index: false, follow: false } };
  }
  const url = `${FORUM_BASE_URL}/forum/${cat.slug}`;
  const description =
    cat.description ||
    `Discussions ${cat.nom.toLowerCase()} entre professionnels vérifiés du transport sanitaire.`;
  return {
    title: `${cat.nom} — Forum entre pros`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${cat.nom} — Forum entre pros — RoullePro`,
      description,
      url,
      siteName: 'RoullePro',
      locale: 'fr_FR',
      type: 'website',
    },
  };
}

export default async function ForumCategoryPage({ params }: PageProps) {
  const supabase = getForumServiceClient();
  const cat = await getCategoryBySlug(supabase, params.categorie);
  if (!cat) notFound();

  const threads = await getThreadsByCategory(supabase, cat.id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: FORUM_BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Forum', item: `${FORUM_BASE_URL}/forum` },
      { '@type': 'ListItem', position: 3, name: cat.nom, item: `${FORUM_BASE_URL}/forum/${cat.slug}` },
    ],
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/forum"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
      >
        <ChevronLeft size={16} /> Forum
      </Link>

      <header className="mt-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{cat.nom}</h1>
        {cat.description && <p className="mt-2 text-gray-600 text-sm">{cat.description}</p>}
      </header>

      <NewThreadCta categorieSlug={cat.slug} />

      <section className="mt-6">
        {threads.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun sujet dans cette catégorie pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {threads.map((t) => (
              <li key={t.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/forum/${cat.slug}/${t.slug}`}
                      className="font-medium text-gray-900 hover:text-blue-600 break-words"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {t.is_pinned && <Pin size={14} className="text-amber-500 shrink-0" />}
                        {t.is_locked && <Lock size={14} className="text-gray-400 shrink-0" />}
                        {t.titre}
                      </span>
                    </Link>
                    <div className="mt-1 text-xs text-gray-500">
                      {t.author_name} · {formatForumDateShort(t.updated_at)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-xs text-gray-500">
                    {t.reply_count} réponse{t.reply_count > 1 ? 's' : ''}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
