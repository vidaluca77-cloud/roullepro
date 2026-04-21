import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { apiError } from '@/lib/api-utils';
import { estimerVehicule, type EtatGeneral } from '@/lib/estimation-vehicule';

export const dynamic = 'force-dynamic';

const ETATS_VALIDES: EtatGeneral[] = ['bon', 'moyen', 'a_revoir'];

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { ok } = checkRateLimit(`estimer:${ip}`, 10, 60 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: 'Trop de requetes. Reessayez dans une heure.' }, { status: 429 });
  }

  let body: {
    immatriculation?: string;
    kilometrage?: number;
    annee?: number;
    etat_general?: string;
    marque?: string;
    modele?: string;
    email?: string;
  };

  try {
    body = await req.json();
  } catch {
    return apiError('POST /api/depot-vente/estimer', 'Invalid JSON', 400, 'Corps de requete invalide');
  }

  const { immatriculation, kilometrage, annee, etat_general, marque, modele } = body;

  if (!annee || !kilometrage || !etat_general) {
    return NextResponse.json(
      { error: "Les champs annee, kilometrage et etat_general sont requis" },
      { status: 400 }
    );
  }

  if (!ETATS_VALIDES.includes(etat_general as EtatGeneral)) {
    return NextResponse.json(
      { error: "etat_general invalide (valeurs acceptees : bon, moyen, a_revoir)" },
      { status: 400 }
    );
  }

  const currentYear = new Date().getFullYear();
  const anneeNum = Number(annee);
  const kmNum = Number(kilometrage);

  if (anneeNum < 1990 || anneeNum > currentYear) {
    return NextResponse.json({ error: "Annee invalide" }, { status: 400 });
  }
  if (kmNum < 0 || kmNum > 2_000_000) {
    return NextResponse.json({ error: "Kilometrage invalide" }, { status: 400 });
  }

  const estimation = estimerVehicule({
    annee: anneeNum,
    kilometrage: kmNum,
    etat_general: etat_general as EtatGeneral,
    marque: marque ?? null,
    modele: modele ?? null,
  });

  // Essayer de recuperer l'utilisateur auth
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();

    if (user) {
      const sbService = createSbClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: depot } = await sbService
        .from('depots')
        .insert({
          vendeur_id: user.id,
          immatriculation: immatriculation ?? null,
          kilometrage: kmNum,
          annee: anneeNum,
          etat_general,
          marque: marque ?? null,
          modele: modele ?? null,
          estimation_min: estimation.estimation_min,
          estimation_max: estimation.estimation_max,
          statut: 'estimation',
        })
        .select('id')
        .single();

      return NextResponse.json({
        estimation_min: estimation.estimation_min,
        estimation_max: estimation.estimation_max,
        estimation_centrale: estimation.estimation_centrale,
        categorie: estimation.categorie,
        confiance: estimation.confiance,
        depot_id: depot?.id ?? null,
      });
    }
  } catch {
    // Pas d'auth ou erreur -- on retourne juste l'estimation
  }

  return NextResponse.json({
    estimation_min: estimation.estimation_min,
    estimation_max: estimation.estimation_max,
    estimation_centrale: estimation.estimation_centrale,
    categorie: estimation.categorie,
    confiance: estimation.confiance,
    depot_id: null,
  });
}
