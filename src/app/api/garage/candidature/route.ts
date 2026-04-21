import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSbClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { apiError } from '@/lib/api-utils';
import {
  sendGarageCandidatureConfirmation,
  sendGarageCandidatureAdminNotification,
} from '@/lib/email';

export const dynamic = 'force-dynamic';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidSiret(siret: string): boolean {
  return /^\d{14}$/.test(siret.replace(/\s/g, ''));
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { ok } = checkRateLimit(`garage-candidature:${ip}`, 3, 60 * 60 * 1000);
  if (!ok) {
    return NextResponse.json({ error: 'Trop de requêtes. Réessayez plus tard.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return apiError('POST /api/garage/candidature', 'Invalid JSON', 400, 'Corps de requête invalide');
  }

  const {
    raison_sociale,
    siret,
    contact_nom,
    contact_email,
    contact_telephone,
    adresse,
    code_postal,
    ville,
    site_web,
    nb_places_parking,
    specialites,
    message_candidature,
  } = body as Record<string, string | number | string[] | undefined>;

  // Validation
  if (!raison_sociale || typeof raison_sociale !== 'string' || raison_sociale.trim().length < 2) {
    return NextResponse.json({ error: 'Raison sociale invalide' }, { status: 400 });
  }
  if (!siret || typeof siret !== 'string' || !isValidSiret(siret)) {
    return NextResponse.json({ error: 'Numéro SIRET invalide (14 chiffres requis)' }, { status: 400 });
  }
  if (!contact_email || typeof contact_email !== 'string' || !isValidEmail(contact_email)) {
    return NextResponse.json({ error: 'Email de contact invalide' }, { status: 400 });
  }

  try {
    const sbService = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await sbService
      .from('garages_partenaires')
      .insert({
        raison_sociale: String(raison_sociale).trim(),
        siret: String(siret).replace(/\s/g, ''),
        contact_nom: contact_nom ? String(contact_nom).trim() : null,
        contact_email: String(contact_email).toLowerCase().trim(),
        contact_telephone: contact_telephone ? String(contact_telephone) : null,
        adresse: adresse ? String(adresse) : null,
        code_postal: code_postal ? String(code_postal) : null,
        ville: ville ? String(ville) : null,
        site_web: site_web ? String(site_web) : null,
        nb_places_parking: nb_places_parking ? Number(nb_places_parking) : null,
        specialites: Array.isArray(specialites) ? specialites : [],
        message_candidature: message_candidature ? String(message_candidature) : null,
        statut: 'candidature',
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: "Un dossier avec ce SIRET existe déjà." },
          { status: 409 }
        );
      }
      return apiError('POST /api/garage/candidature', error, 500, "Erreur lors de l'enregistrement");
    }

    // Emails en parallèle (sans bloquer en cas d'erreur email)
    await Promise.allSettled([
      sendGarageCandidatureConfirmation(
        String(contact_email),
        String(raison_sociale)
      ),
      sendGarageCandidatureAdminNotification(
        data.id,
        String(raison_sociale)
      ),
    ]);

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    return apiError('POST /api/garage/candidature', err);
  }
}
