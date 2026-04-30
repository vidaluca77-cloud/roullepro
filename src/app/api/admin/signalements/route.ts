export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const PROTECTED_FICHE_IDS = new Set<string>([
  // Taxi Etienne PETIT (Villaroger, 73) - NEVER TOUCH (consigne utilisateur)
  '4275105a-4d45-46fd-9012-6701f1c9ea81',
]);

async function requireAdmin() {
  const { createClient: createServerClient } = await import('@/lib/supabase/server');
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Non authentifié', status: 401 as const };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || profile.role !== 'admin') {
    return { error: 'Accès refusé', status: 403 as const };
  }
  return { user, status: 200 as const };
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET : liste les signalements (filtre par statut + target_type)
export async function GET(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(request.url);
  const statut = url.searchParams.get('statut') || 'en_attente';
  const targetType = url.searchParams.get('target_type'); // 'fiche_sanitaire' | 'annonce' | null

  const supa = adminClient();
  let q = supa
    .from('signalements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (statut !== 'tous') q = q.eq('statut', statut);
  if (targetType) q = q.eq('target_type', targetType);

  const { data: signalements, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Hydratation des fiches et annonces signalées
  const ficheIds = Array.from(new Set((signalements || []).filter(s => s.fiche_id).map(s => s.fiche_id as string)));
  const annonceIds = Array.from(new Set((signalements || []).filter(s => s.annonce_id).map(s => s.annonce_id as string)));
  const userIds = Array.from(new Set((signalements || []).filter(s => s.user_id).map(s => s.user_id as string)));

  const [fichesRes, annoncesRes, profilesRes] = await Promise.all([
    ficheIds.length
      ? supa.from('pros_sanitaire').select('id, nom_commercial, raison_sociale, ville, ville_slug, categorie, slug, telephone, email, claim_status, claimed_by').in('id', ficheIds)
      : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
    annonceIds.length
      ? supa.from('annonces').select('id, title, status').in('id', annonceIds)
      : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
    userIds.length
      ? supa.from('profiles').select('id, full_name, email').in('id', userIds)
      : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
  ]);

  const fichesMap = new Map((fichesRes.data || []).map((f: Record<string, unknown>) => [f.id as string, f]));
  const annoncesMap = new Map((annoncesRes.data || []).map((a: Record<string, unknown>) => [a.id as string, a]));
  const profilesMap = new Map((profilesRes.data || []).map((p: Record<string, unknown>) => [p.id as string, p]));

  const enriched = (signalements || []).map(s => ({
    ...s,
    fiche: s.fiche_id ? fichesMap.get(s.fiche_id) || null : null,
    annonce: s.annonce_id ? annoncesMap.get(s.annonce_id) || null : null,
    reporter: s.user_id ? profilesMap.get(s.user_id) || null : null,
  }));

  return NextResponse.json({ signalements: enriched });
}

// PATCH : traiter un signalement (action: 'supprimer' | 'rejeter' | 'modifier')
export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { signalement_id, action } = body as { signalement_id?: string; action?: string };

  if (!signalement_id || !action) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }
  if (!['supprimer', 'rejeter', 'modifier'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }

  const supa = adminClient();

  // Récupérer le signalement
  const { data: sig, error: sigErr } = await supa
    .from('signalements')
    .select('*')
    .eq('id', signalement_id)
    .single();
  if (sigErr || !sig) {
    return NextResponse.json({ error: 'Signalement introuvable' }, { status: 404 });
  }

  // Action : supprimer la fiche
  if (action === 'supprimer') {
    if (sig.target_type !== 'fiche_sanitaire' || !sig.fiche_id) {
      return NextResponse.json({ error: 'Cette action ne s\'applique qu\'aux fiches sanitaire' }, { status: 400 });
    }
    if (PROTECTED_FICHE_IDS.has(sig.fiche_id)) {
      return NextResponse.json({ error: 'Cette fiche est protégée et ne peut pas être supprimée' }, { status: 403 });
    }
    // Soft delete : marquer la fiche comme suspendue plutôt qu'une vraie suppression
    // pour préserver l'historique. On bascule claim_status à 'rejected' et on ajoute un flag.
    const { error: updErr } = await supa
      .from('pros_sanitaire')
      .update({
        suspendu: true,
        suspendu_le: new Date().toISOString(),
        suspendu_motif: `Signalement: ${sig.raison}`,
      })
      .eq('id', sig.fiche_id);
    if (updErr) {
      // Si les colonnes n'existent pas, on tombe sur un vrai delete
      const { error: delErr } = await supa
        .from('pros_sanitaire')
        .delete()
        .eq('id', sig.fiche_id);
      if (delErr) {
        return NextResponse.json({ error: `Suppression impossible: ${delErr.message}` }, { status: 500 });
      }
    }
  }

  // Marquer le signalement comme traité
  const newStatut =
    action === 'supprimer' ? 'traite_supprime' :
    action === 'rejeter' ? 'traite_rejete' :
    'traite_modifie';

  const { error: patchErr } = await supa
    .from('signalements')
    .update({
      statut: newStatut,
      traite_par: auth.user.id,
      traite_le: new Date().toISOString(),
    })
    .eq('id', signalement_id);

  if (patchErr) {
    return NextResponse.json({ error: patchErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, statut: newStatut });
}
