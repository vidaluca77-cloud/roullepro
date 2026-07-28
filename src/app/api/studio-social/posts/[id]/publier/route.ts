/**
 * POST /api/studio-social/posts/[id]/publier — publication immédiate d'un post
 *   (brouillon ou planifié) sans attendre le prochain passage du cron horaire.
 *
 * Réutilise exactement la même logique de publication que le cron
 * (/api/cron/studio-social-publish) via publierPost() : mêmes garanties de
 * claim atomique, idempotence par cible, retry sûr et quota mensuel. Le pro
 * déclenche lui-même l'appel, donc pas de secret cron ici — l'auth se fait par
 * sa session Supabase, comme les autres routes /api/studio-social/posts/[id].
 *
 * Réservé aux abonnés Pro, sur un post qui leur appartient et qui n'est ni déjà
 * publié ni déjà en cours de publication.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import {
  getProStudioActif,
  moisParis,
  incrementerUsageMois,
  lireUsageMois,
  QUOTA_PUBLICATIONS_MOIS,
} from "@/lib/studio-social";
import { peutUtiliserStudioSocial } from "@/lib/sanitaire-plans";
import { tokenKeyConfigured } from "@/lib/studio-social-crypto";
import {
  selectionnerPostsAPublier,
  reclamerPost,
  chargerContexte,
  publierPost,
  type PostAPublier,
} from "@/lib/studio-social-publish";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://www.roullepro.com").replace(/\/$/, "");
const STUDIO_URL = `${APP_URL}/transport-medical/pro/studio-social`;

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = getAdminServiceClient();
  const pro = await getProStudioActif(admin, user.id);
  if (!pro) {
    return NextResponse.json(
      { error: "Le Studio réseaux sociaux est réservé aux abonnés Pro." },
      { status: 403 }
    );
  }
  if (!tokenKeyConfigured()) {
    return NextResponse.json(
      { error: "Publication indisponible pour le moment, réessayez plus tard." },
      { status: 500 }
    );
  }

  const { data: postData } = await admin
    .from("social_posts")
    .select("id, pro_id, contenu, hashtags, image_url, providers_cibles, scheduled_at, statut, resultats")
    .eq("id", params.id)
    .maybeSingle();
  if (!postData || postData.pro_id !== pro.id) {
    return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
  }
  if (postData.statut === "publie") {
    return NextResponse.json({ error: "Ce post est déjà publié." }, { status: 409 });
  }
  if (postData.statut === "publication_en_cours") {
    return NextResponse.json(
      { error: "Publication déjà en cours, réessayez dans quelques instants." },
      { status: 409 }
    );
  }
  if (!Array.isArray(postData.providers_cibles) || postData.providers_cibles.length === 0) {
    return NextResponse.json(
      { error: "Sélectionnez au moins une plateforme cible avant de publier." },
      { status: 400 }
    );
  }
  if (postData.providers_cibles.includes("instagram") && !postData.image_url) {
    return NextResponse.json(
      { error: "Instagram nécessite une image. Ajoutez une image ou retirez Instagram des cibles." },
      { status: 400 }
    );
  }

  const now = new Date();
  const mois = moisParis(now);
  const statutInitial = postData.statut as string;
  const post = postData as PostAPublier;

  const ctx = await chargerContexte(admin, pro.id, peutUtiliserStudioSocial, lireUsageMois, mois);
  if (!ctx) {
    return NextResponse.json(
      { error: "Le Studio réseaux sociaux est réservé aux abonnés Pro." },
      { status: 403 }
    );
  }
  if (ctx.quotaRestant <= 0) {
    return NextResponse.json(
      { error: "Quota de publications mensuel atteint. Réessayez le mois prochain." },
      { status: 429 }
    );
  }
  // Un post planifié pour plus tard reste publiable immédiatement à la demande
  // du pro : on ignore l'échéance ici, seul le quota est revalidé.
  if (selectionnerPostsAPublier([post], now, ctx.quotaRestant).length === 0 && statutInitial !== "brouillon") {
    return NextResponse.json({ error: "Ce post ne peut pas être publié maintenant." }, { status: 400 });
  }

  // reclamerPost() ne réclame que les posts au statut 'planifie' (garantie
  // d'idempotence partagée avec le cron). Un brouillon publié à la demande doit
  // donc d'abord transiter par 'planifie' avant le claim atomique.
  if (statutInitial === "brouillon") {
    const { data: planifie } = await admin
      .from("social_posts")
      .update({ statut: "planifie", scheduled_at: now.toISOString() })
      .eq("id", post.id)
      .eq("statut", "brouillon")
      .select("id");
    if (!planifie || planifie.length === 0) {
      return NextResponse.json(
        { error: "Publication déjà en cours, réessayez dans quelques instants." },
        { status: 409 }
      );
    }
  }

  // ── Claim atomique : identique au cron, protège contre un double-clic ou un
  //    passage simultané du cron horaire sur le même post ──
  if (!(await reclamerPost(admin, post.id))) {
    return NextResponse.json(
      { error: "Publication déjà en cours, réessayez dans quelques instants." },
      { status: 409 }
    );
  }

  const apres = await incrementerUsageMois(admin, pro.id, { publications: 1 }, mois);
  if (!apres || apres.publications > QUOTA_PUBLICATIONS_MOIS) {
    if (apres) await incrementerUsageMois(admin, pro.id, { publications: -1 }, mois);
    await admin.from("social_posts").update({ statut: "planifie" }).eq("id", post.id);
    return NextResponse.json(
      { error: "Quota de publications mensuel atteint. Réessayez le mois prochain." },
      { status: 429 }
    );
  }

  const stats = { cibles_ok: 0, cibles_ko: 0, connexions_en_erreur: 0, emails: 0 };
  try {
    const resultat = await publierPost(admin, ctx, post, new Set<string>(), stats, STUDIO_URL);
    if (!resultat.auMoinsUnePublication) {
      await incrementerUsageMois(admin, pro.id, { publications: -1 }, mois);
    }
    const { data: postMisAJour } = await admin
      .from("social_posts")
      .select(
        "id, sujet, contenu, hashtags, image_url, providers_cibles, statut, scheduled_at, published_at, resultats, genere_par_ia, created_at"
      )
      .eq("id", post.id)
      .single();
    return NextResponse.json({
      ok: resultat.statut === "publie",
      statut: resultat.statut,
      post: postMisAJour,
    });
  } catch (e) {
    await admin
      .from("social_posts")
      .update({ statut: "echec" })
      .eq("id", post.id)
      .eq("statut", "publication_en_cours");
    await incrementerUsageMois(admin, pro.id, { publications: -1 }, mois);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur inattendue lors de la publication." },
      { status: 500 }
    );
  }
}
