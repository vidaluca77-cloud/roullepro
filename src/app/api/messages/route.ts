import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Client admin avec service role (bypass RLS)
const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

/**
 * Envoie un email de notification au vendeur via Resend.
 * Silencieux si RESEND_API_KEY n'est pas configuré (ne bloque pas le message).
 */
async function sendVendeurNotification({
  vendeurEmail,
  vendeurName,
  senderName,
  senderEmail,
  annonceTitle,
  annonceId,
  messageContent,
}: {
  vendeurEmail: string;
  vendeurName: string;
  senderName: string;
  senderEmail: string;
  annonceTitle: string;
  annonceId: string;
  messageContent: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return; // Pas de clé = mode silencieux

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://roullepro.com';
  const dashboardUrl = `${appUrl}/dashboard`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background: #2563eb; padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">RoullePro</h1>
      </div>

      <div style="padding: 32px;">
        <h2 style="color: #1f2937; margin-top: 0;">Nouveau message reçu</h2>

        <p style="color: #6b7280; font-size: 15px;">
          Bonjour ${vendeurName || 'cher vendeur'},<br><br>
          Vous avez reçu un nouveau message concernant votre annonce
          <strong style="color: #1f2937;">${annonceTitle}</strong>.
        </p>

        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">
            De
          </p>
          <p style="margin: 0; font-weight: 600; color: #1f2937;">${senderName}</p>
          <a href="mailto:${senderEmail}" style="color: #2563eb; font-size: 14px;">${senderEmail}</a>

          <p style="margin: 16px 0 8px 0; font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">
            Message
          </p>
          <p style="margin: 0; color: #374151; white-space: pre-line; line-height: 1.6; font-size: 15px;">
            ${messageContent.replace(/\n/g, '<br>')}
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a
            href="${dashboardUrl}"
            style="background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;"
          >
            Répondre depuis mon espace
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          Vous pouvez répondre directement à cet email ou passer par votre
          <a href="${dashboardUrl}" style="color: #2563eb;">dashboard RoullePro</a>.
        </p>
      </div>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RoullePro <notifications@roullepro.fr>',
        to: vendeurEmail,
        reply_to: senderEmail,
        subject: `[RoullePro] Nouveau message pour "${annonceTitle}"`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      console.error('Resend error:', await res.text());
    }
  } catch (err) {
    // Ne jamais bloquer l'envoi du message si l'email échoue
    console.error('Erreur envoi email notification:', err);
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await request.json();
    const { annonce_id, sender_name, sender_email, content } = body;

    // Validation
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

    // Récupérer l'annonce + le profil vendeur en une seule requête
    const { data: annonce, error: annonceError } = await supabaseAdmin
      .from('annonces')
      .select('id, title, user_id, profiles(email, full_name)')
      .eq('id', annonce_id)
      .single();

    if (annonceError || !annonce) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    }

    // Vérifier que l'expéditeur connecté ne contacte pas sa propre annonce
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.id === annonce.user_id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas contacter votre propre annonce' },
        { status: 403 }
      );
    }

    // Insérer le message
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        annonce_id,
        sender_name: sender_name.trim(),
        sender_email: sender_email.trim(),
        content: content.trim(),
        seller_id: annonce.user_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur insertion message:', error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message", details: error.message },
        { status: 500 }
      );
    }

    // Envoyer l'email de notification au vendeur (asynchrone, non bloquant)
    const vendeur = annonce.profiles as any;
    if (vendeur?.email) {
      sendVendeurNotification({
        vendeurEmail: vendeur.email,
        vendeurName: vendeur.full_name || '',
        senderName: sender_name.trim(),
        senderEmail: sender_email.trim(),
        annonceTitle: annonce.title,
        annonceId: annonce.id,
        messageContent: content.trim(),
      });
    }

    return NextResponse.json({ message: 'Message envoyé avec succès', data }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabaseAdmin = getAdminClient();

    const { data: mesAnnonces } = await supabaseAdmin
      .from('annonces')
      .select('id, title')
      .eq('user_id', user.id);

    if (!mesAnnonces || mesAnnonces.length === 0) {
      return NextResponse.json([]);
    }

    const annonceIds = mesAnnonces.map((a: any) => a.id);

    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*, annonces(id, title)')
      .in('annonce_id', annonceIds)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Erreur de récupération des messages' }, { status: 500 });
    }

    return NextResponse.json(messages || []);
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}

// PATCH /api/messages — marquer un message comme lu
export async function PATCH(request: Request) {
  try {
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { message_id } = body;

    if (!message_id) {
      return NextResponse.json({ error: 'message_id requis' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    const { data: msg } = await supabaseAdmin
      .from('messages')
      .select('id, annonces(user_id)')
      .eq('id', message_id)
      .single();

    if (!msg || (msg.annonces as any)?.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('messages')
      .update({ is_read: true })
      .eq('id', message_id);

    if (error) {
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}
