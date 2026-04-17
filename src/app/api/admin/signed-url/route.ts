export const dynamic = 'force-dynamic';
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
 * GET /api/admin/signed-url?path=verification-docs/xxx.pdf
 * Génère une signed URL temporaire (60 min) pour un justificatif.
 * Accessible uniquement par les admins.
 */
export async function GET(request: Request) {
  try {
    const { createClient: createServerClient } = await import('@/lib/supabase/server');
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Récupérer le chemin du fichier depuis les query params
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'Paramètre path manquant' }, { status: 400 });
    }

    // Générer la signed URL (valide 1 heure)
    const adminClient = getAdminClient();
    const { data, error } = await adminClient.storage
      .from('verification-docs')
      .createSignedUrl(filePath, 3600); // 3600 secondes = 1 heure

    if (error || !data) {
      console.error('Erreur signed URL:', error);
      return NextResponse.json({ error: 'Impossible de générer le lien' }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (error: any) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
