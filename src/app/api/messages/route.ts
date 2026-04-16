import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Client admin avec service role (bypass RLS)
const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getAdminClient();
    const body = await request.json();
      // Colonnes réelles: sender_name, sender_email, content, seller_id (définies dans
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

    // Vérifier que l'annonce existe
    const { data: annonce, error: annonceError } = await supabaseAdmin
      .from('annonces')
      .select('id, user_id')
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

    // Insérer le message avec les vrais noms de colonnes
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        annonce_id,
        sender_name: sender_name.trim(),
        sender_email: sender_email.trim(),
        content: content.trim(),
          seller_id: annonce.user_id,      })
      .select()
      .single();

    if (error) {
      console.error('Erreur insertion message:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi du message', details: error.message }, { status: 500 });
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

    // Récupérer les annonces de l'utilisateur
    const { data: mesAnnonces } = await supabaseAdmin
      .from('annonces')
      .select('id, title')
      .eq('user_id', user.id);

    if (!mesAnnonces || mesAnnonces.length === 0) {
      return NextResponse.json([]);
    }

    const annonceIds = mesAnnonces.map((a: any) => a.id);

    // Récupérer les messages avec le title de l'annonce
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .in('annonce_id', annonceIds)
      .order('created_at', { ascending: false })

      .select('*, annonces(id, title), is_read');
  
    if (error) {
      return NextResponse.json({ error: 'Erreur de récupération des messages' }, { status: 500 });

    return NextResponse.json(messages || []);
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}

// PATCH pour marquer un message comme lu
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

    // Vérifier que le message appartient à une annonce de l'utilisateur
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
      .update({ lu: true })
      .eq('id', message_id);

    if (error) {
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur serveur', details: error.message }, { status: 500 });
  }
}
