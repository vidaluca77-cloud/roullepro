import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { apiError } from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';
import { sendDepotOffreVendeur, sendDepotOffreAcheteur } from '@/lib/email';

export const dynamic = 'force-dynamic';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getClientIp(req);
  const { ok } = checkRateLimit(`offre:${ip}`, 5, 60 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 });
  }

  const depotId = params.id;

  let body: {
    montant?: number;
    message?: string;
    acheteur_email?: string;
    acheteur_telephone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return apiError('POST /api/depot-vente/[id]/offre', 'Invalid JSON', 400, 'Corps de requête invalide');
  }

  const { montant, message, acheteur_email, acheteur_telephone } = body;

  if (!montant || Number(montant) <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
  }

  if (!acheteur_email || !isValidEmail(acheteur_email)) {
    return NextResponse.json({ error: 'Email acheteur invalide' }, { status: 400 });
  }

  try {
    const sbService = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Vérifier que le dépôt est en_vente ou offre_en_cours
    const { data: depot, error: depotError } = await sbService
      .from('depots')
      .select('id, statut, vendeur_id, marque, modele, annee')
      .eq('id', depotId)
      .single();

    if (depotError || !depot) {
      return NextResponse.json({ error: 'Dépôt introuvable' }, { status: 404 });
    }

    if (!['en_vente', 'offre_en_cours'].includes(depot.statut)) {
      return NextResponse.json(
        { error: 'Ce véhicule ne peut pas recevoir d\'offres pour le moment' },
        { status: 400 }
      );
    }

    // Récupérer l'acheteur depuis l'auth (optionnel)
    let acheteur_id: string | null = null;
    try {
      const sb = await createClient();
      const { data: { user } } = await sb.auth.getUser();
      acheteur_id = user?.id ?? null;
    } catch {
      // Pas d'auth — offre anonyme
    }

    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + 48);

    const { data: offre, error: offreError } = await sbService
      .from('offres')
      .insert({
        depot_id: depotId,
        acheteur_id,
        acheteur_email: acheteur_email.toLowerCase().trim(),
        acheteur_telephone: acheteur_telephone ?? null,
        montant: Number(montant),
        message: message ?? null,
        statut: 'en_cours',
        expire_at: expireAt.toISOString(),
      })
      .select('id')
      .single();

    if (offreError) {
      return apiError('POST /api/depot-vente/[id]/offre', offreError, 500, "Erreur lors du dépôt de l'offre");
    }

    // Mettre à jour statut dépôt si nécessaire
    if (depot.statut === 'en_vente') {
      await sbService
        .from('depots')
        .update({ statut: 'offre_en_cours' })
        .eq('id', depotId);
    }

    // Récupérer email vendeur
    const { data: vendeurProfile } = await sbService
      .from('profiles')
      .select('email')
      .eq('id', depot.vendeur_id)
      .single();

    const vendeurEmail = (vendeurProfile as { email?: string } | null)?.email ?? '';

    const offreData = {
      id: offre.id,
      montant: Number(montant),
      message: message ?? null,
      expire_at: expireAt.toISOString(),
    };

    // Emails en parallèle
    await Promise.allSettled([
      vendeurEmail
        ? sendDepotOffreVendeur(vendeurEmail, depot, offreData)
        : Promise.resolve(),
      sendDepotOffreAcheteur(acheteur_email, depot, offreData),
    ]);

    return NextResponse.json({ ok: true, offre_id: offre.id });
  } catch (err) {
    return apiError('POST /api/depot-vente/[id]/offre', err);
  }
}
