import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { apiError } from '@/lib/api-utils';
import { sendDepotRdvConfirmation, sendDepotRdvNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  let body: { depot_id?: string; garage_id?: string; date_depot_prevu?: string };
  try {
    body = await req.json();
  } catch {
    return apiError('POST /api/depot-vente/reserver', 'Invalid JSON', 400, 'Corps de requête invalide');
  }

  const { depot_id, garage_id, date_depot_prevu } = body;

  if (!depot_id || !garage_id) {
    return NextResponse.json({ error: 'depot_id et garage_id sont requis' }, { status: 400 });
  }

  try {
    const sbService = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Vérifier que le dépôt appartient au user
    const { data: depot, error: depotError } = await sbService
      .from('depots')
      .select('id, vendeur_id, statut, marque, modele, annee, kilometrage')
      .eq('id', depot_id)
      .single();

    if (depotError || !depot) {
      return NextResponse.json({ error: 'Dépôt introuvable' }, { status: 404 });
    }

    if (depot.vendeur_id !== user.id) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier que le garage est actif
    const { data: garage, error: garageError } = await sbService
      .from('garages_partenaires')
      .select('id, statut, raison_sociale, adresse, ville, contact_email, contact_telephone')
      .eq('id', garage_id)
      .single();

    if (garageError || !garage) {
      return NextResponse.json({ error: 'Garage introuvable' }, { status: 404 });
    }

    if (garage.statut !== 'actif') {
      return NextResponse.json({ error: 'Ce garage ne peut pas accepter de dépôts pour le moment' }, { status: 400 });
    }

    // Calculer date_limite = now + 90 jours
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() + 90);

    // Mettre à jour le dépôt
    const { error: updateError } = await sbService
      .from('depots')
      .update({
        garage_id,
        date_depot_prevu: date_depot_prevu ?? null,
        statut: 'rdv_pris',
        date_limite: dateLimit.toISOString(),
      })
      .eq('id', depot_id);

    if (updateError) {
      return apiError('POST /api/depot-vente/reserver', updateError, 500, "Erreur lors de la réservation");
    }

    // Créer l'événement
    await sbService.from('depot_events').insert({
      depot_id,
      type: 'rdv_pris',
      ancien_statut: depot.statut,
      nouveau_statut: 'rdv_pris',
      acteur_id: user.id,
      payload: { garage_id, date_depot_prevu: date_depot_prevu ?? null },
    });

    // Récupérer l'email vendeur
    const { data: profile } = await sbService
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const vendeurEmail = user.email ?? '';
    const vendeurName = (profile as { full_name?: string } | null)?.full_name ?? vendeurEmail;

    // Emails
    await Promise.allSettled([
      sendDepotRdvConfirmation(vendeurEmail, depot, garage),
      sendDepotRdvNotification(
        garage.contact_email,
        depot,
        vendeurName
      ),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError('POST /api/depot-vente/reserver', err);
  }
}
