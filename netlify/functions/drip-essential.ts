/**
 * Scheduled function Netlify : sequence drip de conversion Essential.
 * Planification : tous les jours a 09:00 UTC (definie dans netlify.toml).
 *
 * Appelle l'endpoint interne /api/cron/drip-essential protege par CRON_SECRET.
 * Sends:
 *   - J+3  apres octroi essai     -> rappel valeur + 3 actions
 *   - J+7  apres octroi essai     -> stats 7d + push conversion
 *   - J-13 a J-7 avant expiration -> urgence fin d'essai
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
    const res = await fetch(`${baseUrl}/api/cron/drip-essential`, {
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
