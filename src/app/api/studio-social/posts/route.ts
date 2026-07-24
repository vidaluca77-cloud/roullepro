/**
 * GET  /api/studio-social/posts  — liste les posts du pro + état du quota mensuel.
 * POST /api/studio-social/posts  — crée un brouillon manuel (rédaction libre).
 *
 * Réservé aux abonnés Pro (essai inclus). Les tokens des connexions ne sont
 * jamais renvoyés ici.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import {
  getProStudioActif,
  bornesMoisParis,
  construireQuotaEtat,
  normaliserHashtags,
} from "@/lib/studio-social";

const POST_COLS =
  "id, sujet, contenu, hashtags, image_url, providers_cibles, statut, scheduled_at, published_at, resultats, genere_par_ia, created_at";

async function proActif(userId: string) {
  const admin = getAdminServiceClient();
  const pro = await getProStudioActif(admin, userId);
  return { admin, pro };
}

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { admin, pro } = await proActif(user.id);
  if (!pro) {
    return NextResponse.json(
      { error: "Le Studio réseaux sociaux est réservé aux abonnés Pro." },
      { status: 403 }
    );
  }

  const { debut, fin } = bornesMoisParis();

  const [postsRes, generesRes, publicationsRes] = await Promise.all([
    admin
      .from("social_posts")
      .select(POST_COLS)
      .eq("pro_id", pro.id)
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("social_posts")
      .select("id", { count: "exact", head: true })
      .eq("pro_id", pro.id)
      .eq("genere_par_ia", true)
      .gte("created_at", debut)
      .lt("created_at", fin),
    admin
      .from("social_posts")
      .select("id", { count: "exact", head: true })
      .eq("pro_id", pro.id)
      .eq("statut", "publie")
      .gte("published_at", debut)
      .lt("published_at", fin),
  ]);

  const quota = construireQuotaEtat(generesRes.count ?? 0, publicationsRes.count ?? 0);

  return NextResponse.json({
    ok: true,
    posts: postsRes.data ?? [],
    quota,
  });
}

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { admin, pro } = await proActif(user.id);
  if (!pro) {
    return NextResponse.json(
      { error: "Le Studio réseaux sociaux est réservé aux abonnés Pro." },
      { status: 403 }
    );
  }

  let body: { sujet?: string; contenu?: string; hashtags?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const contenu = (body.contenu || "").trim();
  if (contenu.length < 2) {
    return NextResponse.json({ error: "Contenu vide" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("social_posts")
    .insert({
      pro_id: pro.id,
      sujet: (body.sujet || "").trim().slice(0, 140) || null,
      contenu: contenu.slice(0, 2200),
      hashtags: normaliserHashtags(Array.isArray(body.hashtags) ? body.hashtags : []),
      providers_cibles: [],
      statut: "brouillon",
      genere_par_ia: false,
    })
    .select(POST_COLS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, post: data });
}
