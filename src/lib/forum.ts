import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import slugify from 'slugify';

export const FORUM_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';

export const POSTS_PER_PAGE = 20;
export const THREAD_TITLE_MAX = 200;
export const POST_CONTENT_MAX = 10000;
export const REPORT_REASON_MAX = 1000;

export interface ForumCategory {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  ordre: number;
}

export interface ForumThread {
  id: string;
  category_id: string;
  author_user_id: string | null;
  titre: string;
  slug: string;
  is_locked: boolean;
  is_pinned: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  author_user_id: string | null;
  contenu: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Client service-role pour les lectures SSR publiques (même convention que
 * les pages annuaire/annonces). Les pages forum sont lisibles sans login pour
 * le SEO ; les écritures passent par des route handlers authentifiés.
 */
export function getForumServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Nettoyage du contenu utilisateur : on stocke du texte brut (markdown léger),
 * jamais de HTML. On neutralise les balises et on normalise les espaces.
 */
export function sanitizeForumContent(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/<[^>]*>/g, '') // pas de HTML brut
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function forumSlugify(titre: string): string {
  const base = slugify(titre, { lower: true, strict: true, locale: 'fr' });
  return base.slice(0, 80) || 'sujet';
}

/**
 * Résout le nom d'affichage d'un auteur : raison sociale de sa fiche claimée
 * si disponible, sinon « Pro vérifié ».
 */
export async function resolveAuthorNames(
  supabase: SupabaseClient,
  userIds: (string | null)[]
): Promise<Record<string, string>> {
  const ids = Array.from(new Set(userIds.filter((v): v is string => !!v)));
  const map: Record<string, string> = {};
  if (ids.length === 0) return map;

  const { data } = await supabase
    .from('pros_sanitaire')
    .select('claimed_by, raison_sociale')
    .in('claimed_by', ids);

  for (const row of data || []) {
    if (row.claimed_by && row.raison_sociale && !map[row.claimed_by]) {
      map[row.claimed_by] = row.raison_sociale as string;
    }
  }
  return map;
}

export function authorDisplayName(
  userId: string | null,
  names: Record<string, string>
): string {
  if (userId && names[userId]) return names[userId];
  return 'Pro vérifié';
}

export async function getCategories(
  supabase: SupabaseClient
): Promise<ForumCategory[]> {
  const { data } = await supabase
    .from('forum_categories')
    .select('id, slug, nom, description, ordre')
    .order('ordre', { ascending: true });
  return (data as ForumCategory[]) || [];
}

export async function getCategoryBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<ForumCategory | null> {
  const { data } = await supabase
    .from('forum_categories')
    .select('id, slug, nom, description, ordre')
    .eq('slug', slug)
    .maybeSingle();
  return (data as ForumCategory) || null;
}

export interface ThreadWithMeta extends ForumThread {
  reply_count: number;
  author_name: string;
}

/**
 * Compte les réponses (posts non supprimés) par fil.
 */
async function countReplies(
  supabase: SupabaseClient,
  threadIds: string[]
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  if (threadIds.length === 0) return counts;
  const { data } = await supabase
    .from('forum_posts')
    .select('thread_id')
    .in('thread_id', threadIds)
    .eq('is_deleted', false);
  for (const row of data || []) {
    const tid = row.thread_id as string;
    counts[tid] = (counts[tid] || 0) + 1;
  }
  return counts;
}

async function decorateThreads(
  supabase: SupabaseClient,
  threads: ForumThread[]
): Promise<ThreadWithMeta[]> {
  const ids = threads.map((t) => t.id);
  const [counts, names] = await Promise.all([
    countReplies(supabase, ids),
    resolveAuthorNames(
      supabase,
      threads.map((t) => t.author_user_id)
    ),
  ]);
  return threads.map((t) => ({
    ...t,
    reply_count: Math.max(0, (counts[t.id] || 1) - 1),
    author_name: authorDisplayName(t.author_user_id, names),
  }));
}

export async function getLatestThreads(
  supabase: SupabaseClient,
  limit = 10
): Promise<ThreadWithMeta[]> {
  const { data } = await supabase
    .from('forum_threads')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);
  return decorateThreads(supabase, (data as ForumThread[]) || []);
}

export async function getThreadsByCategory(
  supabase: SupabaseClient,
  categoryId: string
): Promise<ThreadWithMeta[]> {
  const { data } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('category_id', categoryId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(100);
  return decorateThreads(supabase, (data as ForumThread[]) || []);
}

export async function getThreadBySlug(
  supabase: SupabaseClient,
  categoryId: string,
  slug: string
): Promise<ForumThread | null> {
  const { data } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('category_id', categoryId)
    .eq('slug', slug)
    .maybeSingle();
  return (data as ForumThread) || null;
}

export interface PostWithAuthor extends ForumPost {
  author_name: string;
}

export async function getPosts(
  supabase: SupabaseClient,
  threadId: string,
  page: number
): Promise<{ posts: PostWithAuthor[]; total: number }> {
  const from = (page - 1) * POSTS_PER_PAGE;
  const to = from + POSTS_PER_PAGE - 1;
  const { data, count } = await supabase
    .from('forum_posts')
    .select('*', { count: 'exact' })
    .eq('thread_id', threadId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })
    .range(from, to);

  const posts = (data as ForumPost[]) || [];
  const names = await resolveAuthorNames(
    supabase,
    posts.map((p) => p.author_user_id)
  );
  return {
    posts: posts.map((p) => ({
      ...p,
      author_name: authorDisplayName(p.author_user_id, names),
    })),
    total: count || 0,
  };
}
