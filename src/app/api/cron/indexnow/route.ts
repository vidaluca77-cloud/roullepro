/**
 * IndexNow API — notifie Bing/Yandex/etc. des URLs nouvelles ou mises a jour
 * pour accelerer drastiquement l'indexation par rapport au crawl naturel.
 *
 * Usage : GET /api/cron/indexnow?limit=100  (Bearer CRON_SECRET)
 * Selectionne les fiches pros recemment modifiees + pages cles et les soumet.
 *
 * Doc : https://www.indexnow.org/documentation
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
const HOST = "roullepro.com";
const KEY = "9569b8627b1543759478b373636ff7b8";
const KEY_LOCATION = `${BASE_URL}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) return unauthorized();

  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = Math.min(Math.max(parseInt(limitParam || "100", 10) || 100, 1), 10000);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Selectionne les fiches recemment mises a jour (claimed/verified prioritaires)
  const { data: pros } = await supabase
    .from("pros_sanitaire_public")
    .select("slug, ville_slug, categorie, updated_at")
    .eq("actif", true)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  const urls: string[] = [BASE_URL + "/", `${BASE_URL}/transport-medical`];

  if (pros) {
    for (const p of pros as Array<{ slug: string; ville_slug: string; categorie: string }>) {
      if (!p.slug || !p.ville_slug || !p.categorie) continue;
      const cat = p.categorie === "taxi_conventionne" ? "taxi-conventionne" : p.categorie;
      urls.push(`${BASE_URL}/transport-medical/${p.ville_slug}/${cat}/${p.slug}`);
    }
  }

  // IndexNow accepte max 10000 URLs par requete
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls.slice(0, 10000),
  };

  let indexNowStatus = 0;
  let indexNowBody = "";
  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    indexNowStatus = res.status;
    indexNowBody = await res.text().catch(() => "");
  } catch (e) {
    indexNowStatus = 0;
    indexNowBody = e instanceof Error ? e.message : "fetch failed";
  }

  return NextResponse.json({
    ok: indexNowStatus >= 200 && indexNowStatus < 300,
    submitted: urls.length,
    indexNowStatus,
    indexNowBody: indexNowBody.slice(0, 500),
  });
}
