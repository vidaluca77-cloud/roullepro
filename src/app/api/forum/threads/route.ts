export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import {
  sanitizeForumContent,
  forumSlugify,
  THREAD_TITLE_MAX,
  POST_CONTENT_MAX,
} from '@/lib/forum';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
  }

  let body: { categorieSlug?: string; titre?: string; contenu?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const titre = (body.titre || '').trim();
  const contenu = sanitizeForumContent(body.contenu || '');
  const categorieSlug = (body.categorieSlug || '').trim();

  if (titre.length < 3 || titre.length > THREAD_TITLE_MAX) {
    return NextResponse.json({ error: 'Titre invalide (3 à 200 caractères).' }, { status: 400 });
  }
  if (contenu.length < 1 || contenu.length > POST_CONTENT_MAX) {
    return NextResponse.json({ error: 'Message invalide.' }, { status: 400 });
  }

  const { data: category } = await supabase
    .from('forum_categories')
    .select('id, slug')
    .eq('slug', categorieSlug)
    .maybeSingle();
  if (!category) {
    return NextResponse.json({ error: 'Catégorie introuvable.' }, { status: 404 });
  }

  const slug = `${forumSlugify(titre)}-${randomBytes(3).toString('hex')}`;

  const { data: thread, error: threadErr } = await supabase
    .from('forum_threads')
    .insert({
      category_id: category.id,
      author_user_id: user.id,
      titre,
      slug,
    })
    .select('id, slug')
    .single();

  if (threadErr || !thread) {
    const msg = threadErr?.message || '';
    if (/row-level security|policy/i.test(msg)) {
      return NextResponse.json(
        { error: 'Vous devez être un professionnel vérifié pour publier.' },
        { status: 403 }
      );
    }
    if (/patienter|rate|check_violation/i.test(msg)) {
      return NextResponse.json({ error: msg }, { status: 429 });
    }
    return NextResponse.json({ error: 'Échec de la création du sujet.' }, { status: 400 });
  }

  const { error: postErr } = await supabase.from('forum_posts').insert({
    thread_id: thread.id,
    author_user_id: user.id,
    contenu,
  });

  if (postErr) {
    await supabase.from('forum_threads').delete().eq('id', thread.id);
    return NextResponse.json({ error: 'Échec de la publication du message.' }, { status: 400 });
  }

  return NextResponse.json({ id: thread.id, slug: thread.slug });
}
