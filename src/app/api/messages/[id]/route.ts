export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Client admin avec service role (bypass RLS)
const getAdminClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

// PATCH - Marquer un message comme lu
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const messageId = params.id;

    // Vérifier que l'utilisateur est le destinataire du message
    const { data: message } = await supabase
      .from('messages')
      .select('seller_id')
      .eq('id', messageId)
      .single();

    if (!message || message.seller_id !== user.id) {
      return NextResponse.json({ error: 'Message introuvable ou accès non autorisé' }, { status: 404 });
    }

    // Marquer comme lu
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) {
      console.error('[api/messages/[id]] update error:', error.message);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[api/messages/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const messageId = params.id;

    // Vérifier que l'utilisateur est le destinataire du message
    const supabaseAdmin = getAdminClient();
    const { data: message } = await supabaseAdmin
      .from('messages')
      .select('seller_id')
      .eq('id', messageId)
      .single();

    if (!message || message.seller_id !== user.id) {
      return NextResponse.json({ error: 'Message introuvable ou accès non autorisé' }, { status: 404 });
    }

    // Supprimer le message avec le client admin (bypass RLS)
    const { error } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('[api/messages/[id]] delete error:', error.message);
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[api/messages/[id]] DELETE error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
