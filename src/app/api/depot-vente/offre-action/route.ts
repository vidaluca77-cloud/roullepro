import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { apiError } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });

  let body: { offre_id?: string; depot_id?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const { offre_id, depot_id, action } = body;
  if (!offre_id || !depot_id || !action) {
    return NextResponse.json({ error: 'offre_id, depot_id et action requis' }, { status: 400 });
  }
  if (!['accepter', 'refuser'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }

  try {
    const sbService = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Vérifier que le dépôt appartient au user
    const { data: depot } = await sbService
      .from('depots')
      .select('id, statut')
      .eq('id', depot_id)
      .eq('vendeur_id', user.id)
      .single();

    if (!depot) return NextResponse.json({ error: 'Dépôt introuvable ou accès refusé' }, { status: 404 });

    const nouveauStatutOffre = action === 'accepter' ? 'acceptee' : 'refusee';

    await sbService
      .from('offres')
      .update({ statut: nouveauStatutOffre })
      .eq('id', offre_id)
      .eq('depot_id', depot_id);

    if (action === 'accepter') {
      await sbService
        .from('depots')
        .update({ statut: 'vendu' })
        .eq('id', depot_id);

      await sbService.from('depot_events').insert({
        depot_id,
        type: 'offre_acceptee',
        ancien_statut: depot.statut,
        nouveau_statut: 'vendu',
        acteur_id: user.id,
        payload: { offre_id },
      });
    } else {
      // Si refus : repasser en en_vente si plus d'offres actives
      const { data: autresOffres } = await sbService
        .from('offres')
        .select('id')
        .eq('depot_id', depot_id)
        .eq('statut', 'en_cours');

      if (!autresOffres || autresOffres.length === 0) {
        await sbService
          .from('depots')
          .update({ statut: 'en_vente' })
          .eq('id', depot_id);
      }

      await sbService.from('depot_events').insert({
        depot_id,
        type: 'offre_refusee',
        acteur_id: user.id,
        payload: { offre_id },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError('POST /api/depot-vente/offre-action', err);
  }
}
