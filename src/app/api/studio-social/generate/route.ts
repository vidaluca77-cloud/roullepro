/**
 * POST /api/studio-social/generate
 *
 * Génère des posts réseaux sociaux (Facebook / Instagram / Google Business) pour
 * le pro connecté via le LLM des experts IA (Mistral), puis les enregistre en
 * brouillons. Réservé aux abonnés Pro (essai inclus). Respecte le quota mensuel
 * de posts générés (8 / mois calendaire Europe/Paris).
 *
 * Sécurité : session pro obligatoire (createServerClient). Écritures en
 * service_role (bypass RLS) après vérification stricte de la propriété.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { mistralConfigured } from "@/lib/ia-assistant";
import {
  getProStudioActif,
  genererPosts,
  nombrePostsGenerables,
  bornesMoisParis,
  QUOTA_POSTS_MOIS,
} from "@/lib/studio-social";

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (!mistralConfigured()) {
    return NextResponse.json(
      { error: "La génération IA n'est pas configurée. Contactez le support RoullePro." },
      { status: 503 }
    );
  }

  const admin = getAdminServiceClient();
  const pro = await getProStudioActif(admin, user.id);
  if (!pro) {
    return NextResponse.json(
      { error: "Le Studio réseaux sociaux est réservé aux abonnés Pro." },
      { status: 403 }
    );
  }

  let body: { nombre?: number } = {};
  try {
    body = await req.json();
  } catch {
    /* corps optionnel */
  }
  const demande = body.nombre === 8 ? 8 : 4;

  // Quota mensuel : compter les posts générés par IA ce mois calendaire Paris.
  const { debut, fin } = bornesMoisParis();
  const { count } = await admin
    .from("social_posts")
    .select("id", { count: "exact", head: true })
    .eq("pro_id", pro.id)
    .eq("genere_par_ia", true)
    .gte("created_at", debut)
    .lt("created_at", fin);

  const dejaGeneres = count ?? 0;
  const aGenerer = nombrePostsGenerables(demande, dejaGeneres);
  if (aGenerer <= 0) {
    return NextResponse.json(
      {
        error: `Quota mensuel atteint (${QUOTA_POSTS_MOIS} posts générés / mois).`,
        quota_atteint: true,
      },
      { status: 429 }
    );
  }

  const posts = await genererPosts(pro, aGenerer);
  if (posts.length === 0) {
    return NextResponse.json(
      { error: "La génération n'a produit aucun post. Réessayez dans un instant." },
      { status: 502 }
    );
  }

  const lignes = posts.map((p) => ({
    pro_id: pro.id,
    sujet: p.sujet,
    contenu: p.contenu,
    hashtags: p.hashtags,
    providers_cibles: [] as string[],
    statut: "brouillon" as const,
    genere_par_ia: true,
  }));

  const { data: inseres, error } = await admin
    .from("social_posts")
    .insert(lignes)
    .select("id, sujet, contenu, hashtags, image_url, providers_cibles, statut, scheduled_at, published_at, created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, posts: inseres ?? [] });
}
