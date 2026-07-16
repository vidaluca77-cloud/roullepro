/**
 * Scheduled function Netlify : sequence drip de conversion Essential.
 * Planification : tous les jours a 09:00 UTC (definie dans netlify.toml).
 *
 * Appelle l'endpoint interne /api/cron/drip-essential protege par CRON_SECRET.
 * Sends (essai 7 jours) :
 *   - J+2 apres octroi essai -> bien demarrer (fiche + experts IA + forum)
 *   - J+5 apres octroi essai -> essai se termine bientot + push conversion
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
