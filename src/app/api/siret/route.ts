export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Algorithme de Luhn adapté pour la validation SIRET
function isValidSiret(siret: string): boolean {
  const cleaned = siret.replace(/\s/g, '');
  if (!/^\d{14}$/.test(cleaned)) return false;

  // Luhn check
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let n = parseInt(cleaned[i], 10);
    if (i % 2 === 0) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

// GET /api/siret?numero=XXXXXXXXXXXXXX
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const numero = searchParams.get('numero')?.replace(/\s/g, '') || '';

  if (!numero) {
    return NextResponse.json({ error: 'Numéro SIRET requis' }, { status: 400 });
  }

  // Validation format
  if (!/^\d{14}$/.test(numero)) {
    return NextResponse.json(
      { valid: false, error: 'Le SIRET doit contenir exactement 14 chiffres' },
      { status: 200 }
    );
  }

  // Validation algorithme de Luhn
  if (!isValidSiret(numero)) {
    return NextResponse.json(
      { valid: false, error: 'Numéro SIRET invalide (vérification checksum échouée)' },
      { status: 200 }
    );
  }

  // Appel API Sirene (publique, pas de clé requise)
  try {
    const response = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siret/${numero}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.status === 404) {
      return NextResponse.json(
        { valid: false, error: 'SIRET introuvable dans le registre national' },
        { status: 200 }
      );
    }

    if (response.status === 200) {
      const data = await response.json();
      const etablissement = data.etablissement;
      const uniteLegale = etablissement?.uniteLegale;

      const nom =
        uniteLegale?.denominationUniteLegale ||
        [uniteLegale?.prenomUsuelUniteLegale, uniteLegale?.nomUniteLegale]
          .filter(Boolean)
          .join(' ') ||
        null;

      const adresse = [
        etablissement?.adresseEtablissement?.numeroVoieEtablissement,
        etablissement?.adresseEtablissement?.typeVoieEtablissement,
        etablissement?.adresseEtablissement?.libelleVoieEtablissement,
        etablissement?.adresseEtablissement?.codePostalEtablissement,
        etablissement?.adresseEtablissement?.libelleCommuneEtablissement,
      ]
        .filter(Boolean)
        .join(' ') || null;

      const etatAdmin =
        etablissement?.periodeEtablissement?.[0]?.etatAdministratifEtablissement;
      const isActive = etatAdmin === 'A';

      return NextResponse.json({
        valid: true,
        active: isActive,
        nom,
        adresse,
        siret: numero,
        siren: numero.slice(0, 9),
      });
    }

    // Fallback : INSEE indisponible → on accepte quand même (format valide)
    return NextResponse.json({ valid: true, active: null, nom: null, adresse: null, fallback: true });
  } catch {
    // Timeout ou erreur réseau → fallback silencieux (format valide suffisant)
    return NextResponse.json({ valid: true, active: null, nom: null, adresse: null, fallback: true });
  }
}
