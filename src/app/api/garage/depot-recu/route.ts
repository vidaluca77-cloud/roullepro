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

  let body: { depot_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps invalide' }, { status: 400 });
  }

  const { depot_id } = body;
  if (!depot_id) return NextResponse.json({ error: 'depot_id requis' }, { status: 400 });

  try {
    const { data: depot } = await sbService
      .from('depots')
      .select('id, statut')
      .eq('id', depot_id)
      .eq('garage_id', garage.id)
      .single();

    if (!depot) return NextResponse.json({ error: 'Dépôt introuvable' }, { status: 404 });

    await sbService
      .from('depots')
      .update({ statut: 'en_vente', date_depot_effectif: new Date().toISOString(), date_mise_en_ligne: new Date().toISOString() })
      .eq('id', depot_id);

    await sbService.from('depot_events').insert({
      depot_id,
      type: 'en_vente',
      ancien_statut: depot.statut,
      nouveau_statut: 'en_vente',
      acteur_id: user.id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError('POST /api/garage/depot-recu', err);
  }
}
