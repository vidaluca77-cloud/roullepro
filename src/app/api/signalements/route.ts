import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { annonce_id, raison } = body;

    // Validation
    if (!annonce_id || !raison) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Insérer le signalement
    const { data, error } = await supabase
      .from('signalements')
      .insert({
        annonce_id,
        user_id: user.id,
        raison,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du signalement:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création du signalement' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Signalement enregistré avec succès', data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
