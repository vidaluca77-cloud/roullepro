export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { REPORT_REASON_MAX } from '@/lib/forum';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 });
  }

  let body: { postId?: string; raison?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const postId = (body.postId || '').trim();
  const raison = (body.raison || '').trim();
  if (!postId) {
    return NextResponse.json({ error: 'Message manquant.' }, { status: 400 });
  }
  if (raison.length < 3 || raison.length > REPORT_REASON_MAX) {
    return NextResponse.json({ error: 'Motif invalide (3 à 1000 caractères).' }, { status: 400 });
  }

  const { error } = await supabase.from('forum_reports').insert({
    post_id: postId,
    reporter_user_id: user.id,
    raison,
  });

  if (error) {
    const msg = error.message || '';
    if (/row-level security|policy/i.test(msg)) {
      return NextResponse.json(
        { error: 'Seuls les professionnels vérifiés peuvent signaler.' },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: 'Échec du signalement.' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
