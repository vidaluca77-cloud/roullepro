export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendReplyNotification, sendVendeurNotification } from '@/lib/email';
import { notifyUser } from '@/lib/notify';

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
 * Utilisable par :
 *   - Le VENDEUR (is_seller_reply = true) → notifie l'acheteur par email
 *   - L'ACHETEUR (is_seller_reply = false) → notifie le vendeur par email
 */
export async function POST(request: Request) {
  try {
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

    // Récupérer le root message + annonce + profils
    const { data: rootMsg, error: rootErr } = await supabaseAdmin
      .from('messages')
      .select(`
        id, annonce_id, seller_id, buyer_id,
        sender_name, sender_email,
        annonces(id, title, user_id, profiles(full_name, company_name, email))
      `)
      .eq('id', thread_id)
      .is('thread_id', null)
      .single();

    if (rootErr || !rootMsg) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
    }

    const annonce = rootMsg.annonces as any;
    const isVendeur = annonce.user_id === user.id;
    const isAcheteur = rootMsg.buyer_id === user.id;

    if (!isVendeur && !isAcheteur) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Récupérer le profil de l'expéditeur
    const { data: senderProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, company_name, email')
      .eq('id', user.id)
      .single();

    const senderName = senderProfile?.company_name || senderProfile?.full_name || (isVendeur ? 'Le vendeur' : 'L\'acheteur');
    const senderEmail = senderProfile?.email || '';

    // Insérer la réponse
    const { data: reply, error: insertErr } = await supabaseAdmin
      .from('messages')
      .insert({
        annonce_id: rootMsg.annonce_id,
        seller_id: rootMsg.seller_id,
        buyer_id: rootMsg.buyer_id,          // maintenu pour chainage
        thread_id: thread_id,
        is_seller_reply: isVendeur,
        seller_id_reply: isVendeur ? user.id : null,
        sender_name: senderName,
        sender_email: senderEmail,
        content: content.trim(),
        is_read: false,                       // le destinataire n'a pas encore lu
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[api/messages/reply] insert error:', insertErr.message);
      return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
    }

    // ── Notifications email (non bloquantes) ──

    if (isVendeur) {
      // Vendeur répond → notifier l'acheteur
      const vendeurName = annonce.profiles?.company_name || annonce.profiles?.full_name || 'Le vendeur';
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
    } else {
      // Acheteur répond → notifier le vendeur
      const vendeurProfile = annonce.profiles as any;
      if (vendeurProfile?.email) {
        sendVendeurNotification({
          vendeurEmail: vendeurProfile.email,
          vendeurName: vendeurProfile.full_name || '',
          senderName,
          senderEmail,
          annonceTitle: annonce.title,
          annonceId: annonce.id,
          messageContent: content.trim(),
        });
      }
    }

    // Push (non bloquant)
    const pushTarget = isVendeur ? rootMsg.buyer_id : rootMsg.seller_id;
    if (pushTarget) {
      notifyUser(pushTarget, {
        title: isVendeur ? 'Réponse du vendeur' : 'Nouveau message',
        body: content.trim().slice(0, 120),
        url: '/dashboard/messages',
        tag: `msg-${rootMsg.annonce_id}`,
      }).catch((e) => console.error('[api/messages/reply] push error:', e?.message));
    }

    return NextResponse.json({ success: true, data: reply }, { status: 201 });
  } catch (err: unknown) {
    console.error('[api/messages/reply] unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
