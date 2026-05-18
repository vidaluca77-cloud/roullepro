/**
 * Scheduled function Netlify : ingestion automatique de la veille reglementaire.
 * Planification : jeudi 07:00 UTC = 9h Paris ete (definie dans netlify.toml).
 *
 * Appelle l'endpoint interne /api/cron/veille-ingest protege par CRON_SECRET.
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
    const res = await fetch(`${baseUrl}/api/cron/veille-ingest`, {
      method: "POST",
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
