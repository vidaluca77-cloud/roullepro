/**
 * Scheduled function Netlify : relances automatiques de fin d'essai / d'offre gratuite.
 * Planification : tous les jours à 07:30 UTC (définie dans netlify.toml).
 *
 * Appelle l'endpoint interne /api/cron/relance-essai protégé par CRON_SECRET.
 * Relance les pros « claimed » dont la fin d'offre (COALESCE(free_trial_ends_at,
 * plan_active_until)) tombe à J-7, J-3 ou J-1 (date calendaire Europe/Paris).
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
    const res = await fetch(`${baseUrl}/api/cron/relance-essai`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const body = await res.json();
    return new Response(
      JSON.stringify({ ok: res.ok, status: res.status, body }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
