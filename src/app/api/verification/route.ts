import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/verification - Request verification
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { justificatif_url } = await request.json();

    if (!justificatif_url) {
      return NextResponse.json({ error: 'URL du justificatif requis' }, { status: 400 });
    }

    // Update profile with justificatif and set status to en_attente
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        justificatif_url,
        statut_verification: 'en_attente'
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Demande de vérification envoyée' });
  } catch (error) {
    console.error('Error in verification request:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
