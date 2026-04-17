export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

/**
 * GET /api/messages/thread?thread_id=<uuid>
 * Retourne tous les messages d'un thread (root + réponses), triés par date.
 * Seul le vendeur propriétaire de l'annonce peut y accéder.
 */
export async function GET(request: Request) {
  try {
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const thread_id = searchParams.get('thread_id');

    if (!thread_id) {
      return NextResponse.json({ error: 'thread_id requis' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Vérifier que le root message appartient bien à une annonce du vendeur connecté
    const { data: rootMsg } = await supabaseAdmin
      .from('messages')
      .select('id, annonces(user_id)')
      .eq('id', thread_id)
      .single();

    if (!rootMsg || (rootMsg.annonces as any)?.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer tous les messages du thread (root + réponses)
    const { data: allMessages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .or(`id.eq.${thread_id},thread_id.eq.${thread_id}`)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Erreur de récupération' }, { status: 500 });
    }

    // Marquer tous les messages non lus du buyer comme lus
    const unreadIds = (allMessages || [])
      .filter(m => !m.is_read && !m.is_seller_reply)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await supabaseAdmin
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadIds);
    }

    return NextResponse.json(allMessages || []);
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}
