/**
 * Scheduled function Netlify : rafraichit le referentiel FINESS une fois par mois.
 * Planification : le 1er du mois a 04:00 UTC (definie dans netlify.toml).
 *
 * Appelle l'endpoint interne /api/cron/etab-refresh-finess protege par CRON_SECRET.
 *
 * Note : la planification est definie dans netlify.toml pour ne pas dependre du package
 * @netlify/functions (non installe dans ce projet).
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
    const res = await fetch(`${baseUrl}/api/cron/etab-refresh-finess`, {
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
