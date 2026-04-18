/**
 * Utilitaires pour les routes API — sécurité et réponses standardisées.
 */

import { NextResponse } from 'next/server';

/**
 * Renvoie une réponse d'erreur sans exposer les détails techniques au client.
 * Les détails sont loggés côté serveur uniquement.
 */
export function apiError(
  context: string,
  err: unknown,
  status = 500,
  publicMessage = 'Une erreur est survenue'
): NextResponse {
  if (err instanceof Error) {
    console.error(`[${context}]`, err.message);
  } else {
    console.error(`[${context}]`, err);
  }
  return NextResponse.json({ error: publicMessage }, { status });
}

/**
 * Récupère l'adresse IP de la requête (pour le rate limiting).
 */
export function getClientIp(request: Request): string {
  const forwarded = (request.headers as Headers).get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}
