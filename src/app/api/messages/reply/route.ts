export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendReplyNotification } from '@/lib/email';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

/**
 * POST /api/messages/reply
 * Body: { thread_id: string, content: string }
 *
 * Permet au vendeur de répondre dans un thread de conversation.
 * thread_id = id du message initial (root message).
 */
export async function POST(request: Request) {
  try {
    // Auth : seul un utilisateur connecté peut répondre
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { thread_id, content } = body;

    if (!thread_id || !content?.trim()) {
      return NextResponse.json({ error: 'thread_id et content requis' }, { status: 400 });
    }

    if (content.trim().length < 2) {
      return NextResponse.json({ error: 'Message trop court' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // Récupérer le message root + l'annonce + le profil vendeur
    const { data: rootMsg, error: rootErr } = await supabaseAdmin
      .from('messages')
      .select('id, annonce_id, seller_id, sender_name, sender_email, annonces(id, title, user_id)')
      .eq('id', thread_id)
      .is('thread_id', null) // s'assurer que c'est bien le root
      .single();

    if (rootErr || !rootMsg) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
    }

    const annonce = rootMsg.annonces as any;

    // Vérifier que l'utilisateur connecté est bien le vendeur de l'annonce
    if (annonce.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé — vous n\'êtes pas le vendeur' }, { status: 403 });
    }

    // Récupérer le profil du vendeur pour avoir son nom
    const { data: vendeurProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, company_name, email')
      .eq('id', user.id)
      .single();

    const vendeurName = vendeurProfile?.company_name || vendeurProfile?.full_name || 'Le vendeur';
    const vendeurEmail = vendeurProfile?.email || '';

    // Insérer la réponse du vendeur dans le thread
    const { data: reply, error: insertErr } = await supabaseAdmin
      .from('messages')
      .insert({
        annonce_id: rootMsg.annonce_id,
        seller_id: rootMsg.seller_id,
        thread_id: thread_id,            // rattaché au root
        is_seller_reply: true,
        seller_id_reply: user.id,
        sender_name: vendeurName,
        sender_email: vendeurEmail,
        content: content.trim(),
        is_read: true,                   // le vendeur a déjà lu sa propre réponse
      })
      .select()
      .single();

    if (insertErr) {
      console.error('Erreur insertion réponse:', insertErr);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi', details: insertErr.message }, { status: 500 });
    }

    // Notifier l'acheteur par email (non bloquant)
    if (rootMsg.sender_email) {
      sendReplyNotification({
        buyerEmail: rootMsg.sender_email,
        buyerName: rootMsg.sender_name,
        vendeurName,
        annonceTitle: annonce.title,
        annonceId: annonce.id,
        replyContent: content.trim(),
      });
    }

    return NextResponse.json({ success: true, data: reply }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur serveur reply:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}
