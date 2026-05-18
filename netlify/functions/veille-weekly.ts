/**
 * Scheduled function Netlify : envoi hebdomadaire de la newsletter veille reglementaire.
 * Planification : mardi 06:00 UTC (definie dans netlify.toml).
 *
 * Appelle l'endpoint interne /api/cron/veille-weekly protege par CRON_SECRET.
 */
export default async () => {
  const baseUrl = process.env.URL || "https://roullepro.com";
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return new Response(
      JSON.stringify({ error: "CRON_SECRET not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const res = await fetch(`${baseUrl}/api/cron/veille-weekly`, {
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
