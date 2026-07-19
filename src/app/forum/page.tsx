import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageSquare, Users } from 'lucide-react';
import {
  FORUM_BASE_URL,
  getForumServiceClient,
  getCategories,
  getLatestThreads,
} from '@/lib/forum';
import { formatForumDateShort } from '@/lib/forum-format';

export const revalidate = 120;

const PAGE_URL = `${FORUM_BASE_URL}/forum`;

export const metadata: Metadata = {
  title: 'Forum entre pros du transport sanitaire',
  description:
    'Échangez entre professionnels vérifiés du transport sanitaire : conventionnement CPAM, facturation, réglementation, matériel, emploi et entraide entre confrères.',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'Forum entre pros du transport sanitaire — RoullePro',
    description:
      'Échangez entre professionnels vérifiés du transport sanitaire : CPAM, facturation, réglementation, entraide entre confrères.',
    url: PAGE_URL,
    siteName: 'RoullePro',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default async function ForumIndexPage() {
  const supabase = getForumServiceClient();
  const [categories, latest] = await Promise.all([
    getCategories(supabase),
    getLatestThreads(supabase, 10),
  ]);

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: FORUM_BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Forum', item: PAGE_URL },
    ],
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Forum entre pros
        </h1>
        <p className="mt-2 text-gray-600 text-sm md:text-base">
          L&apos;espace d&apos;échange réservé aux professionnels vérifiés du transport
          sanitaire. Posez vos questions, partagez vos retours d&apos;expérience et
          entraidez-vous entre confrères.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/forum/${cat.slug}`}
            className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-400 hover:shadow-sm transition"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 text-blue-600">
                <MessageSquare size={20} />
              </span>
              <div>
                <h2 className="font-semibold text-gray-900">{cat.nom}</h2>
                {cat.description && (
                  <p className="mt-1 text-sm text-gray-500">{cat.description}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <Users size={18} className="text-blue-600" />
          Derniers sujets
        </h2>
        {latest.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucun sujet pour le moment. Soyez le premier à lancer une discussion.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {latest.map((t) => {
              const cat = catById[t.category_id];
              if (!cat) return null;
              return (
                <li key={t.id} className="p-4">
                  <Link
                    href={`/forum/${cat.slug}/${t.slug}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {t.titre}
                  </Link>
                  <div className="mt-1 text-xs text-gray-500">
                    {cat.nom} · {t.author_name} · {formatForumDateShort(t.updated_at)} ·{' '}
                    {t.reply_count} réponse{t.reply_count > 1 ? 's' : ''}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
