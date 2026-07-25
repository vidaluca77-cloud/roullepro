/**
 * Scheduled function Netlify : publication automatique des posts planifiés du
 * Studio réseaux sociaux. Planification : toutes les heures (définie dans netlify.toml).
 *
 * Appelle l'endpoint interne /api/cron/studio-social-publish protégé par CRON_SECRET.
 * Publie sur Facebook / Instagram / Google Business Profile les posts 'planifie' échus,
 * dans la limite du quota mensuel, avec idempotence par cible.
 */
export default async () => {
  const baseUrl = process.env.URL || "https://roullepro.com";
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return new Response(JSON.stringify({ error: "CRON_SECRET not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(`${baseUrl}/api/cron/studio-social-publish`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const body = await res.json().catch(() => null);
    // Statut propagé : un 200 systématique masquerait les échecs dans les logs Netlify.
    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status, body }),
      {
        status: res.ok ? 200 : 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
