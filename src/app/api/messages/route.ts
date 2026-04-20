export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendVendeurNotification } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

/**
 * POST /api/messages — premier contact acheteur → vendeur
 */
export async function POST(request: Request) {
  try {
    // Rate limiting : max 5 messages par IP par minute
    const ip = getClientIp(request);
    const { ok } = checkRateLimit(`messages:${ip}`, 5, 60_000);
    if (!ok) {
      return NextResponse.json({ error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' }, { status: 429 });
    }

    const supabaseAdmin = getAdminClient();
    const body = await request.json();
    const { annonce_id, sender_name, sender_email, content } = body;

    if (!annonce_id || !sender_name?.trim() || !sender_email?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sender_email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }
    if (content.trim().length < 10) {
      return NextResponse.json({ error: 'Le message doit contenir au moins 10 caractères' }, { status: 400 });
    }

    const { data: annonce, error: annonceError } = await supabaseAdmin
      .from('annonces')
      .select('id, title, user_id, profiles(email, full_name)')
      .eq('id', annonce_id)
      .single();

    if (annonceError || !annonce) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    }

    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.id === annonce.user_id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas contacter votre propre annonce' }, { status: 403 });
    }

    const buyerId = (user && user.id !== annonce.user_id) ? user.id : null;

    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        annonce_id,
        sender_name: sender_name.trim(),
        sender_email: sender_email.trim(),
        content: content.trim(),
        seller_id: annonce.user_id,
        buyer_id: buyerId,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('[api/messages] insert error:', error.message);
      return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
    }

    const vendeur = annonce.profiles as any;
    if (vendeur?.email) {
      try {
        await sendVendeurNotification({
          vendeurEmail: vendeur.email,
          vendeurName: vendeur.full_name || '',
          senderName: sender_name.trim(),
          senderEmail: sender_email.trim(),
          annonceTitle: annonce.title,
          annonceId: annonce.id,
          messageContent: content.trim(),
        });
      } catch (emailErr) {
        // L'email est non-bloquant : on log mais on ne fait pas échouer la requête
        console.error('[api/messages] sendVendeurNotification failed:', emailErr);
      }
    }

    return NextResponse.json({ message: 'Message envoyé avec succès', data }, { status: 201 });
  } catch (err: unknown) {
    console.error('[api/messages] POST error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * GET /api/messages
 * Retourne une liste unifiée de conversations pour l'utilisateur connecté.
 * Chaque conversation = un root message enrichi de :
 *   - last_message_at   : date du dernier message du thread
 *   - last_message      : contenu du dernier message
 *   - has_unread        : booléen — est-ce qu'il y a des messages non lus pour moi ?
 *   - role              : 'seller' | 'buyer'
 */
export async function GET() {
  try {
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabaseAdmin = getAdminClient();

    // 1. Root messages où je suis vendeur
    const { data: mesAnnonces } = await supabaseAdmin
      .from('annonces')
      .select('id')
      .eq('user_id', user.id);

    const annonceIds = (mesAnnonces || []).map((a: any) => a.id);

    const [sellerRoots, buyerRoots] = await Promise.all([
      annonceIds.length > 0
        ? supabaseAdmin
            .from('messages')
            .select('*, annonces(id, title, profiles(full_name, company_name, email))')
            .in('annonce_id', annonceIds)
            .is('thread_id', null)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
      // Root messages où je suis acheteur
      supabaseAdmin
        .from('messages')
        .select('*, annonces(id, title, profiles(full_name, company_name, email))')
        .eq('buyer_id', user.id)
        .is('thread_id', null)
        .order('created_at', { ascending: false }),
    ]);

    const sellerList: any[] = (sellerRoots as any).data || [];
    const buyerList: any[]  = (buyerRoots as any).data  || [];

    // 2. Pour chaque thread, récupérer le dernier message + has_unread
    const allThreadIds = [
      ...sellerList.map((m: any) => m.id),
      ...buyerList.map((m: any) => m.id),
    ];

    if (allThreadIds.length === 0) {
      return NextResponse.json([]);
    }

    // Toutes les réponses de ces threads
    const { data: replies } = await supabaseAdmin
      .from('messages')
      .select('id, thread_id, content, created_at, is_read, is_seller_reply')
      .in('thread_id', allThreadIds)
      .order('created_at', { ascending: false });

    // Indexer par thread_id
    const replyMap: Record<string, any[]> = {};
    for (const r of replies || []) {
      if (!replyMap[r.thread_id]) replyMap[r.thread_id] = [];
      replyMap[r.thread_id].push(r);
    }

    // Enrichir chaque root
    const enrich = (msg: any, role: 'seller' | 'buyer') => {
      const threadReplies = replyMap[msg.id] || [];
      // Dernier message = la reply la plus récente, ou le root lui-même
      const lastReply = threadReplies[0]; // déjà trié desc
      const lastMsgContent = lastReply?.content ?? msg.content;
      const lastMsgAt = lastReply?.created_at ?? msg.created_at;

      // has_unread : messages non lus destinés à moi
      //   - vendeur → messages de l'acheteur non lus (is_seller_reply=false)
      //   - acheteur → réponses vendeur non lues (is_seller_reply=true)
      let hasUnread = false;
      if (role === 'seller') {
        hasUnread = !msg.is_read || threadReplies.some(
          (r: any) => !r.is_read && !r.is_seller_reply
        );
      } else {
        hasUnread = threadReplies.some((r: any) => !r.is_read && r.is_seller_reply);
      }

      return {
        ...msg,
        role,
        last_message: lastMsgContent,
        last_message_at: lastMsgAt,
        has_unread: hasUnread,
        reply_count: threadReplies.length,
      };
    };

    const enrichedSeller = sellerList.map((m: any) => enrich(m, 'seller'));
    const enrichedBuyer  = buyerList.map((m: any) => enrich(m, 'buyer'));

    // 3. Fusionner + dédupliquer (si même personne est vendeur ET acheteur sur même thread)
    //    Priorité vendeur pour les doublons
    const seen = new Set<string>();
    const merged: any[] = [];
    for (const m of [...enrichedSeller, ...enrichedBuyer]) {
      if (!seen.has(m.id)) {
        seen.add(m.id);
        merged.push(m);
      }
    }

    // Trier par dernière activité décroissante
    merged.sort((a, b) =>
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    );

    return NextResponse.json(merged);
  } catch (err: unknown) {
    console.error('[api/messages] GET error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/messages/:id géré dans /api/messages/[id]/route.ts
