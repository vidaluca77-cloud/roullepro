import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { apiError } from '@/lib/api-utils';
import { sendDepotDemandeAccuse, sendDepotDemandeGarage } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  let body: {
    depot_id?: string;
    garage_id?: string;
    date_depot_prevu?: string;
    recuperation_domicile?: boolean;
    adresse_recuperation?: string | null;
    code_postal_recuperation?: string | null;
    ville_recuperation?: string | null;
    frais_recuperation?: number | null;
    prix_propose_vendeur?: number | null;
    message_vendeur?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return apiError('POST /api/depot-vente/reserver', 'Invalid JSON', 400, "Corps de requête invalide");
  }

  const {
    depot_id,
    garage_id,
    date_depot_prevu,
    recuperation_domicile,
    adresse_recuperation,
    code_postal_recuperation,
    ville_recuperation,
    frais_recuperation,
    prix_propose_vendeur,
    message_vendeur,
  } = body;

  const recup = recuperation_domicile === true;
  if (recup) {
    if (!adresse_recuperation?.trim() || !code_postal_recuperation?.trim() || !ville_recuperation?.trim()) {
      return NextResponse.json(
        { error: "Adresse de récupération incomplète" },
        { status: 400 }
      );
    }
  }

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

    // Mettre à jour le dépôt — la demande part en attente de validation par le garage
    const { error: updateError } = await sbService
      .from('depots')
      .update({
        garage_id,
        date_depot_prevu: date_depot_prevu ?? null,
        statut: 'demande_en_attente',
        recuperation_domicile: recup,
        adresse_recuperation: recup ? adresse_recuperation : null,
        code_postal_recuperation: recup ? code_postal_recuperation : null,
        ville_recuperation: recup ? ville_recuperation : null,
        frais_recuperation: recup ? (frais_recuperation ?? 79) : 0,
        date_recuperation_prevue: recup && date_depot_prevu ? date_depot_prevu : null,
        prix_propose_vendeur: prix_propose_vendeur && Number(prix_propose_vendeur) > 0 ? Number(prix_propose_vendeur) : null,
        message_vendeur: message_vendeur?.trim() || null,
      })
      .eq('id', depot_id);

    if (updateError) {
      return apiError('POST /api/depot-vente/reserver', updateError, 500, "Erreur lors de la réservation");
    }

    // Créer l'événement — demande de dépôt-vente transmise au garage
    await sbService.from('depot_events').insert({
      depot_id,
      type: 'demande_envoyee',
      ancien_statut: depot.statut,
      nouveau_statut: 'demande_en_attente',
      acteur_id: user.id,
      payload: {
        garage_id,
        date_depot_prevu: date_depot_prevu ?? null,
        recuperation_domicile: recup,
        adresse_recuperation: recup ? adresse_recuperation : null,
        code_postal_recuperation: recup ? code_postal_recuperation : null,
        ville_recuperation: recup ? ville_recuperation : null,
        frais_recuperation: recup ? (frais_recuperation ?? 79) : 0,
        prix_propose_vendeur: prix_propose_vendeur ?? null,
        message_vendeur: message_vendeur ?? null,
      },
    });

    // Récupérer l'email vendeur
    const { data: profile } = await sbService
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const vendeurEmail = user.email ?? '';
    const vendeurName = (profile as { full_name?: string } | null)?.full_name ?? vendeurEmail;

    // Emails — accusé de réception au vendeur + notification au garage
    await Promise.allSettled([
      sendDepotDemandeAccuse(vendeurEmail, depot, garage),
      sendDepotDemandeGarage(
        garage.contact_email,
        depot,
        vendeurName,
        prix_propose_vendeur ?? null,
        message_vendeur ?? null
      ),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return apiError('POST /api/depot-vente/reserver', err);
  }
}
