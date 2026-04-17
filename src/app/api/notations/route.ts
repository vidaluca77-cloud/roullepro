export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/notations?vendeur_id=XXX
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vendeur_id = searchParams.get('vendeur_id');
  if (!vendeur_id) return NextResponse.json({ error: 'vendeur_id requis' }, { status: 400 });

  const supabase = await createClient();

  const { data: notations } = await supabase
    .from('notations')
    .select('id, note, commentaire, created_at, acheteur_id, profiles!notations_acheteur_id_fkey(full_name, company_name)')
    .eq('vendeur_id', vendeur_id)
    .order('created_at', { ascending: false });

  const { data: stats } = await supabase
    .from('vendeur_stats')
    .select('nb_notations, note_moyenne, nb_5_etoiles, nb_4_etoiles, nb_3_etoiles, nb_2_etoiles, nb_1_etoile')
    .eq('vendeur_id', vendeur_id)
    .single();

  // Notation de l'utilisateur connecté (si connecté)
  const { data: { user } } = await supabase.auth.getUser();
  let maNotation = null;
  if (user) {
    const { data } = await supabase
      .from('notations')
      .select('id, note, commentaire')
      .eq('vendeur_id', vendeur_id)
      .eq('acheteur_id', user.id)
      .single();
    maNotation = data;
  }

  return NextResponse.json({
    notations: notations || [],
    stats: stats || null,
    maNotation,
    isOwn: user?.id === vendeur_id,
  });
}

// POST /api/notations — créer/modifier une notation
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { vendeur_id, note, commentaire, annonce_id } = await request.json();

  if (!vendeur_id || !note || note < 1 || note > 5) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }
  if (vendeur_id === user.id) {
    return NextResponse.json({ error: 'Impossible de se noter soi-même' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('notations')
    .upsert({
      vendeur_id,
      acheteur_id: user.id,
      annonce_id: annonce_id || null,
      note,
      commentaire: commentaire?.trim() || null,
    }, { onConflict: 'vendeur_id,acheteur_id' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, notation: data });
}

// DELETE /api/notations?vendeur_id=XXX — supprimer sa notation
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const vendeur_id = searchParams.get('vendeur_id');
  if (!vendeur_id) return NextResponse.json({ error: 'vendeur_id requis' }, { status: 400 });

  const { error } = await supabase
    .from('notations')
    .delete()
    .eq('vendeur_id', vendeur_id)
    .eq('acheteur_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
