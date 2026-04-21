import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { apiError } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

function estimerVehicule(
  annee: number,
  kilometrage: number,
  etat_general: string
): { estimation_min: number; estimation_max: number } {
  const currentYear = new Date().getFullYear();
  const age = currentYear - annee;
  let prix = 18000 - age * 1500 - kilometrage * 0.03;

  if (etat_general === 'bon') {
    prix = prix * 1.05;
  } else if (etat_general === 'a_revoir') {
    prix = prix * 0.85;
  }
  // 'moyen' => pas de modification

  // Borner entre 3000 et 50000
  prix = Math.max(3000, Math.min(50000, prix));

  const estimation_min = Math.round(prix * 0.92);
  const estimation_max = Math.round(prix * 1.08);

  return { estimation_min, estimation_max };
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { ok } = checkRateLimit(`estimer:${ip}`, 10, 60 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez dans une heure.' }, { status: 429 });
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
    return apiError('POST /api/depot-vente/estimer', 'Invalid JSON', 400, 'Corps de requête invalide');
  }

  const { immatriculation, kilometrage, annee, etat_general, marque, modele, email } = body;

  if (!annee || !kilometrage || !etat_general) {
    return NextResponse.json(
      { error: "Les champs annee, kilometrage et etat_general sont requis" },
      { status: 400 }
    );
  }

  const { estimation_min, estimation_max } = estimerVehicule(
    Number(annee),
    Number(kilometrage),
    etat_general
  );

  // Essayer de récupérer l'utilisateur auth
  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();

    if (user) {
      // Insérer un dépôt en statut estimation
      const sbService = createSbClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: depot } = await sbService
        .from('depots')
        .insert({
          vendeur_id: user.id,
          immatriculation: immatriculation ?? null,
          kilometrage: Number(kilometrage),
          annee: Number(annee),
          etat_general: etat_general,
          marque: marque ?? null,
          modele: modele ?? null,
          estimation_min,
          estimation_max,
          statut: 'estimation',
        })
        .select('id')
        .single();

      return NextResponse.json({
        estimation_min,
        estimation_max,
        depot_id: depot?.id ?? null,
      });
    }
  } catch {
    // Pas d'auth ou erreur — on retourne juste l'estimation
  }

  // Utilisateur non authentifié — retourner l'estimation sans insertion
  return NextResponse.json({ estimation_min, estimation_max, depot_id: null });
}
