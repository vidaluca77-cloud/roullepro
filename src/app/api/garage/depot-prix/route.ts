import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { apiError } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });

  const sbService = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: garage } = await sbService
    .from('garages_partenaires')
    .select('id, statut')
    .eq('user_id', user.id)
    .single();

  if (!garage || garage.statut !== 'actif') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  let body: { depot_id?: string; prix_affiche?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const { depot_id, prix_affiche } = body;
  if (!depot_id || !prix_affiche || Number(prix_affiche) <= 0) {
    return NextResponse.json({ error: 'depot_id et prix_affiche valides requis' }, { status: 400 });
  }

  try {
    const { data: depot } = await sbService
      .from('depots')
      .select('id, prix_affiche, statut')
      .eq('id', depot_id)
      .eq('garage_id', garage.id)
      .single();

    if (!depot) return NextResponse.json({ error: 'Dépôt introuvable' }, { status: 404 });

    await sbService
      .from('depots')
      .update({ prix_affiche: Number(prix_affiche) })
      .eq('id', depot_id);

    await sbService.from('depot_events').insert({
      depot_id,
      type: 'prix_modifie',
      acteur_id: user.id,
      payload: { ancien_prix: depot.prix_affiche, nouveau_prix: Number(prix_affiche) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError('POST /api/garage/depot-prix', err);
  }
}
