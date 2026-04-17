export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Créer un client Supabase avec le service role key pour bypass RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Créer un client normal pour vérifier l'authentification
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();

    // Vérifier l'authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour signaler une annonce' },
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

    // Insérer le signalement avec le client admin (bypass RLS)
    const { data, error } = await supabaseAdmin
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
        { error: 'Erreur lors de la création du signalement', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Signalement enregistré avec succès', data },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  }
}
