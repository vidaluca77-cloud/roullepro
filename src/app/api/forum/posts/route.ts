export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeForumContent, POST_CONTENT_MAX } from '@/lib/forum';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
  }

  let body: { threadId?: string; contenu?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const threadId = (body.threadId || '').trim();
  const contenu = sanitizeForumContent(body.contenu || '');

  if (!threadId) {
    return NextResponse.json({ error: 'Sujet manquant.' }, { status: 400 });
  }
  if (contenu.length < 1 || contenu.length > POST_CONTENT_MAX) {
    return NextResponse.json({ error: 'Message invalide.' }, { status: 400 });
  }

  const { error } = await supabase.from('forum_posts').insert({
    thread_id: threadId,
    author_user_id: user.id,
    contenu,
  });

  if (error) {
    const msg = error.message || '';
    if (/row-level security|policy/i.test(msg)) {
      return NextResponse.json(
        { error: 'Publication impossible (sujet verrouillé ou compte non vérifié).' },
        { status: 403 }
      );
    }
    if (/patienter|rate|check_violation/i.test(msg)) {
      return NextResponse.json({ error: msg }, { status: 429 });
    }
    return NextResponse.json({ error: 'Échec de la publication.' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
