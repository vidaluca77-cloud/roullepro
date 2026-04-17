export const dynamic = 'force-dynamic';
/**
 * PATCH /api/admin/moderation
 * Approuve ou refuse une annonce pending.
 * Déclenche l'email de notification vendeur.
 * Réservé aux admins (role='admin').
 */
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { sendVendeurAnnonceApprouvee, sendVendeurAnnonceRefusee } from '@/lib/email';

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

export async function PATCH(request: Request) {
  try {
    // Auth + vérification admin
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { annonce_id, action } = await request.json();
    if (!annonce_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Paramètres invalides (annonce_id + action: approve|reject)' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'active' : 'rejected';

    // Récupérer l'annonce + vendeur avant la mise à jour
    const { data: annonce, error: fetchErr } = await admin
      .from('annonces')
      .select('id, title, user_id, profiles(full_name, email)')
      .eq('id', annonce_id)
      .single();

    if (fetchErr || !annonce) {
      return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
    }

    // Mettre à jour le statut
    const { error: updateErr } = await admin
      .from('annonces')
      .update({ status: newStatus })
      .eq('id', annonce_id);

    if (updateErr) {
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
    }

    // Email notification vendeur (asynchrone, non bloquant)
    const vendeur = annonce.profiles as any;
    if (vendeur?.email) {
      if (action === 'approve') {
        sendVendeurAnnonceApprouvee({
          vendeurEmail: vendeur.email,
          vendeurName: vendeur.full_name || '',
          annonceTitle: annonce.title,
          annonceId: annonce.id,
        });
      } else {
        sendVendeurAnnonceRefusee({
          vendeurEmail: vendeur.email,
          vendeurName: vendeur.full_name || '',
          annonceTitle: annonce.title,
        });
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err: any) {
    console.error('[api/admin/moderation] error:', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
