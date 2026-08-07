/**
 * Authentification partagée pour les routes /api/voice/* appelées par l'agent
 * vocal IA (Retell AI via function calling).
 *
 * Même modèle que CRON_SECRET (cf. src/app/api/cron/relance-essai/route.ts) :
 * un secret partagé dans l'en-tête Authorization: Bearer <secret>, configuré
 * côté Retell dans les headers de chaque fonction et côté Netlify dans les
 * variables d'environnement.
 *
 * IMPORTANT : ces routes sont appelées automatiquement par une IA pendant un
 * appel téléphonique en cours — pas d'utilisateur authentifié Supabase derrière.
 * Le secret est donc la seule barrière ; ne jamais l'exposer côté client.
 */

export function verifierSecretAgentVocal(req: Request): boolean {
  const secret = process.env.VOICE_AGENT_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export function reponseNonAutorisee() {
  return new Response(JSON.stringify({ error: "Non autorisé" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}
