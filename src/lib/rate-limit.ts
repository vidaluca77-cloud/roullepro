/**
 * Rate limiting simple basé sur un Map en mémoire.
 *
 * Convient pour Netlify Edge/Serverless (chaque invocation partage la mémoire
 * tant que le container est chaud). Pour une protection plus robuste, remplacer
 * par Upstash Redis (@upstash/ratelimit) en ajoutant UPSTASH_REDIS_REST_URL
 * et UPSTASH_REDIS_REST_TOKEN dans les variables d'environnement Netlify.
 *
 * Usage :
 *   const { ok, remaining } = checkRateLimit(ip, 'messages', 5, 60_000);
 *   if (!ok) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * @param key     Identifiant unique (ex: `${ip}:${route}`)
 * @param limit   Nombre max de requêtes autorisées dans la fenêtre
 * @param windowMs Durée de la fenêtre en ms (ex: 60_000 = 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    // Nouvelle fenêtre
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  entry.count += 1;
  return { ok: true, remaining: limit - entry.count };
}

/**
 * Récupère l'IP réelle de la requête depuis les headers Netlify/Vercel.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers as Headers;
  return (
    headers.get('x-nf-client-connection-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}
