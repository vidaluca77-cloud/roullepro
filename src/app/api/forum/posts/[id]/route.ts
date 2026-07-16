export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeForumContent, POST_CONTENT_MAX } from '@/lib/forum';

interface Ctx {
  params: { id: string };
}

export async function PATCH(request: Request, { params }: Ctx) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
  }

  let body: { contenu?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const contenu = sanitizeForumContent(body.contenu || '');
  if (contenu.length < 1 || contenu.length > POST_CONTENT_MAX) {
    return NextResponse.json({ error: 'Message invalide.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('forum_posts')
    .update({ contenu })
    .eq('id', params.id)
    .eq('author_user_id', user.id)
    .eq('is_deleted', false)
    .select('id');

  if (error) {
    return NextResponse.json({ error: 'Échec de la modification.' }, { status: 400 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Message introuvable ou non autorisé.' }, { status: 403 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
  }

  // Suppression douce : réservée à l'auteur (les admins purgent via service role).
  const { data, error } = await supabase
    .from('forum_posts')
    .update({ is_deleted: true })
    .eq('id', params.id)
    .eq('author_user_id', user.id)
    .select('id');

  if (error) {
    return NextResponse.json({ error: 'Échec de la suppression.' }, { status: 400 });
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Message introuvable ou non autorisé.' }, { status: 403 });
  }
  return NextResponse.json({ success: true });
}
