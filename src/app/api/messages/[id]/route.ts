import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PATCH - Marquer un message comme lu
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifi\u00e9' }, { status: 401 });
    }

    const messageId = params.id;

    // V\u00e9rifier que l'utilisateur est le destinataire du message
    const { data: message } = await supabase
      .from('messages')
      .select('seller_id')
      .eq('id', messageId)
      .single();

    if (!message || message.seller_id !== user.id) {
      return NextResponse.json({ error: 'Message introuvable ou acc\u00e8s non autoris\u00e9' }, { status: 404 });
    }

    // Marquer comme lu
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Non authentifi\u00e9' }, { status: 401 });
    }

    const messageId = params.id;

    // V\u00e9rifier que l'utilisateur est le destinataire du message
    const { data: message } = await supabase
      .from('messages')
      .select('seller_id')
      .eq('id', messageId)
      .single();

    if (!message || message.seller_id !== user.id) {
      return NextResponse.json({ error: 'Message introuvable ou acc\u00e8s non autoris\u00e9' }, { status: 404 });
    }

    // Supprimer le message
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
