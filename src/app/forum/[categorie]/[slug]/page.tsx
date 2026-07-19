import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, Lock } from 'lucide-react';
import {
  FORUM_BASE_URL,
  POSTS_PER_PAGE,
  getForumServiceClient,
  getCategoryBySlug,
  getThreadBySlug,
  getPosts,
} from '@/lib/forum';
import { formatForumDate } from '@/lib/forum-format';
import PostActions from '../../_components/PostActions';
import ReplyForm from '../../_components/ReplyForm';
import ViewCounter from '../../_components/ViewCounter';

export const revalidate = 60;

interface PageProps {
  params: { categorie: string; slug: string };
  searchParams: { page?: string };
}

async function loadThread(categorie: string, slug: string) {
  const supabase = getForumServiceClient();
  const cat = await getCategoryBySlug(supabase, categorie);
  if (!cat) return null;
  const thread = await getThreadBySlug(supabase, cat.id, slug);
  if (!thread) return null;
  return { supabase, cat, thread };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const ctx = await loadThread(params.categorie, params.slug);
  if (!ctx) {
    return { title: 'Sujet introuvable — Forum RoullePro', robots: { index: false, follow: false } };
  }
  const url = `${FORUM_BASE_URL}/forum/${ctx.cat.slug}/${ctx.thread.slug}`;
  const description = `${ctx.thread.titre} — discussion entre professionnels vérifiés du transport sanitaire (${ctx.cat.nom}).`;
  return {
    title: `${ctx.thread.titre} — Forum entre pros`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${ctx.thread.titre} — Forum entre pros — RoullePro`,
      description,
      url,
      siteName: 'RoullePro',
      locale: 'fr_FR',
      type: 'article',
    },
  };
}

export default async function ForumThreadPage({ params, searchParams }: PageProps) {
  const ctx = await loadThread(params.categorie, params.slug);
  if (!ctx) notFound();
  const { supabase, cat, thread } = ctx;

  const page = Math.max(1, parseInt(searchParams.page || '1', 10) || 1);
  const { posts, total } = await getPosts(supabase, thread.id, page);
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const url = `${FORUM_BASE_URL}/forum/${cat.slug}/${thread.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: thread.titre,
    url,
    datePublished: thread.created_at,
    dateModified: thread.updated_at,
    author: {
      '@type': 'Person',
      name: posts[0]?.author_name || 'Pro vérifié',
    },
    interactionStatistic: {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/CommentAction',
      userInteractionCount: Math.max(0, total - 1),
    },
    articleBody: posts[0]?.contenu || '',
    comment: posts.slice(1).map((p) => ({
      '@type': 'Comment',
      text: p.contenu,
      datePublished: p.created_at,
      author: { '@type': 'Person', name: p.author_name },
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: FORUM_BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Forum', item: `${FORUM_BASE_URL}/forum` },
      { '@type': 'ListItem', position: 3, name: cat.nom, item: `${FORUM_BASE_URL}/forum/${cat.slug}` },
      { '@type': 'ListItem', position: 4, name: thread.titre, item: url },
    ],
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ViewCounter threadId={thread.id} />

      <Link
        href={`/forum/${cat.slug}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
      >
        <ChevronLeft size={16} /> {cat.nom}
      </Link>

      <header className="mt-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 break-words">
          {thread.is_locked && (
            <span className="inline-flex items-center gap-1 text-sm font-normal text-gray-400 mr-2 align-middle">
              <Lock size={14} /> verrouillé
            </span>
          )}
          {thread.titre}
        </h1>
      </header>

      <ol className="space-y-4">
        {posts.map((p, i) => (
          <li
            key={p.id}
            id={`post-${p.id}`}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
              <span className="font-medium text-gray-700">
                {p.author_name}
                {page === 1 && i === 0 && (
                  <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">
                    Auteur du sujet
                  </span>
                )}
              </span>
              <span>{formatForumDate(p.created_at)}</span>
            </div>
            <div className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-800">
              {p.contenu}
            </div>
            <PostActions
              postId={p.id}
              authorUserId={p.author_user_id}
              initialContent={p.contenu}
            />
          </li>
        ))}
      </ol>

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <Link
              href={`/forum/${cat.slug}/${thread.slug}?page=${page - 1}`}
              className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50"
            >
              Précédent
            </Link>
          )}
          <span className="text-gray-500">
            Page {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/forum/${cat.slug}/${thread.slug}?page=${page + 1}`}
              className="rounded border border-gray-300 px-3 py-1 hover:bg-gray-50"
            >
              Suivant
            </Link>
          )}
        </nav>
      )}

      <div className="mt-8">
        <ReplyForm threadId={thread.id} isLocked={thread.is_locked} />
      </div>
    </main>
  );
}
