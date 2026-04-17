export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: Récupérer les IDs des favoris de l'utilisateur
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Si non authentifié, retourner un tableau vide au lieu d'une erreur
      return NextResponse.json([]);
    }

    const { data: favoris, error } = await supabase
      .from('favoris')
      .select('*, annonces(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur récupération favoris:', error);
      return NextResponse.json([]);
    }

    return NextResponse.json(favoris || []);
  } catch (error) {
    console.error('Erreur GET /api/favoris:', error);
    return NextResponse.json([]);
  }
}

// POST: Ajouter aux favoris
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { annonce_id } = body;

    if (!annonce_id) {
      return NextResponse.json(
        { error: 'annonce_id est requis' },
        { status: 400 }
      );
    }

    // Vérifier si déjà en favoris
    const { data: existing } = await supabase
      .from('favoris')
      .select('id')
      .eq('user_id', user.id)
      .eq('annonce_id', annonce_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Déjà dans les favoris' },
        { status: 409 }
      );
    }

    // Ajouter aux favoris
    const { error: insertError } = await supabase
      .from('favoris')
      .insert({ user_id: user.id, annonce_id });

    if (insertError) {
      console.error('Erreur insertion favoris:', insertError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout aux favoris' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Ajouté aux favoris avec succès' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/favoris:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE: Retirer des favoris
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const annonce_id = searchParams.get('annonce_id');

    if (!annonce_id) {
      return NextResponse.json(
        { error: 'annonce_id est requis' },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('favoris')
      .delete()
      .eq('user_id', user.id)
      .eq('annonce_id', annonce_id);

    if (deleteError) {
      console.error('Erreur suppression favoris:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Retiré des favoris avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur DELETE /api/favoris:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
