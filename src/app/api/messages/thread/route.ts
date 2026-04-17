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
 * Accessible par le vendeur OU par l'acheteur (buyer_id = user.id).
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

    // Récupérer le root message
    const { data: rootMsg } = await supabaseAdmin
      .from('messages')
      .select('id, buyer_id, annonces(user_id)')
      .eq('id', thread_id)
      .single();

    if (!rootMsg) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
    }

    const isVendeur = (rootMsg.annonces as any)?.user_id === user.id;
    const isAcheteur = rootMsg.buyer_id === user.id;

    if (!isVendeur && !isAcheteur) {
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

    // Marquer les messages non lus comme lus selon le rôle
    const unreadIds = (allMessages || [])
      .filter(m => {
        if (!m.is_read) {
          // Le vendeur lit les messages de l'acheteur (is_seller_reply = false)
          if (isVendeur && !m.is_seller_reply) return true;
          // L'acheteur lit les réponses du vendeur (is_seller_reply = true)
          if (isAcheteur && m.is_seller_reply) return true;
        }
        return false;
      })
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
