/**
 * POST /api/annonces
 * Appelé après l'insert Supabase côté client dans deposer-annonce.
 * Déclenche la notification email admin pour modération.
 */
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendAdminNewAnnoncePending } from '@/lib/email';
import { createClient as createServerClient } from '@/lib/supabase/server';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function POST(request: Request) {
  try {
    // Vérifier que l'utilisateur est authentifié
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { annonce_id } = await request.json();
    if (!annonce_id) {
      return NextResponse.json({ error: 'annonce_id requis' }, { status: 400 });
    }

    // Récupérer l'annonce + les détails vendeur
    const admin = getAdminClient();
    const { data: annonce, error } = await admin
      .from('annonces')
      .select('id, title, price, city, user_id, categories(name), profiles(full_name, email)')
      .eq('id', annonce_id)
      .eq('user_id', user.id) // sécurité : l'auteur = l'utilisateur connecté
      .single();

    if (error || !annonce) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    }

    const vendeur = annonce.profiles as any;
    const cat = annonce.categories as any;

    // Email admin (asynchrone, non bloquant)
    sendAdminNewAnnoncePending({
      annonceId: annonce.id,
      annonceTitle: annonce.title,
      vendeurName: vendeur?.full_name || '',
      vendeurEmail: vendeur?.email || '',
      categorie: cat?.name,
      price: annonce.price,
      city: annonce.city,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[api/annonces] error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
