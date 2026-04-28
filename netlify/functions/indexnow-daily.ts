/**
 * Scheduled function Netlify : pousse 500 URLs/jour a IndexNow (Bing/Yandex)
 * pour notifier les pages a crawler en priorite.
 *
 * Couvre les 26 000+ fiches en ~50 jours en privilegiant les fiches
 * recemment mises a jour (claimed/verified d'abord par tri updated_at desc).
 *
 * Schedule defini dans netlify.toml : 02:00 UTC quotidien (avant refresh-sitemaps).
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
    const res = await fetch(`${baseUrl}/api/cron/indexnow?limit=500`, {
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
