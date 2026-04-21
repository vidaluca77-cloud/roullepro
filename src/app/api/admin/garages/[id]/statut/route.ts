import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { apiError } from '@/lib/api-utils';
import { sendGarageStatusUpdate } from '@/lib/email';

export const dynamic = 'force-dynamic';

const STATUTS_VALIDES = ['candidature', 'pre_valide', 'actif', 'suspendu', 'refuse'] as const;
type StatutGarage = typeof STATUTS_VALIDES[number];

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérification auth admin
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const sbService = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await sbService
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
  }

  let body: { statut?: string };
  try {
    body = await req.json();
  } catch {
    return apiError('POST /api/admin/garages/[id]/statut', 'Invalid JSON', 400, 'Corps invalide');
  }

  const { statut } = body;

  if (!statut || !STATUTS_VALIDES.includes(statut as StatutGarage)) {
    return NextResponse.json(
      { error: `Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    // Récupérer le garage
    const { data: garage, error: garageError } = await sbService
      .from('garages_partenaires')
      .select('id, statut, raison_sociale, contact_email, user_id')
      .eq('id', params.id)
      .single();

    if (garageError || !garage) {
      return NextResponse.json({ error: 'Garage introuvable' }, { status: 404 });
    }

    const ancienStatut = garage.statut;

    // Mettre à jour le statut
    const { error: updateError } = await sbService
      .from('garages_partenaires')
      .update({ statut, updated_at: new Date().toISOString() })
      .eq('id', params.id);

    if (updateError) {
      return apiError('POST /api/admin/garages/[id]/statut', updateError, 500, "Erreur lors de la mise à jour");
    }

    // Log d'événement dans depot_events n'est pas applicable ici, on peut logger en console
    console.log(
      `[Admin] Garage ${params.id} (${garage.raison_sociale}): ${ancienStatut} → ${statut} par ${user.id}`
    );

    // Si passage à actif, mettre le role='garage' sur le profil utilisateur associé
    if (statut === 'actif' && garage.user_id) {
      await sbService
        .from('profiles')
        .update({ role: 'garage' })
        .eq('id', garage.user_id);
    }

    // Email de notification au garage
    if (garage.contact_email) {
      await sendGarageStatusUpdate(
        garage.contact_email,
        garage.raison_sociale,
        statut
      ).catch(() => {});
    }

    return NextResponse.json({ ok: true, statut });
  } catch (err) {
    return apiError('POST /api/admin/garages/[id]/statut', err);
  }
}
