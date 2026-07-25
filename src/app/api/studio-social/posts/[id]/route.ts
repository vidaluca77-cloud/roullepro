/**
 * PATCH  /api/studio-social/posts/[id] — édite un post (contenu, hashtags, image,
 *   providers cibles) ou le (dé)planifie.
 * DELETE /api/studio-social/posts/[id] — supprime un brouillon / annule un post.
 *
 * Réservé aux abonnés Pro. Vérifie que le post appartient à une fiche du pro
 * connecté (claimed_by). Instagram exige une image à la planification.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getProStudioActif,
  estProviderValide,
  normaliserHashtags,
  PROVIDER_LABEL,
  type SocialProvider,
} from "@/lib/studio-social";

const POST_COLS =
  "id, sujet, contenu, hashtags, image_url, providers_cibles, statut, scheduled_at, published_at, resultats, genere_par_ia, created_at";

/**
 * Récupère le post s'il appartient à la fiche éligible du pro connecté, sinon null.
 * On compare directement pro_id à la fiche retenue par getProStudioActif : un post
 * rattaché à une autre fiche (même possédée, mais sans plan actif) est refusé.
 */
async function chargerPostPossede(
  admin: SupabaseClient,
  proId: string,
  postId: string
): Promise<{ id: string; statut: string; image_url: string | null } | null> {
  const { data } = await admin
    .from("social_posts")
    .select("id, statut, image_url, pro_id")
    .eq("id", postId)
    .maybeSingle();
  if (!data || data.pro_id !== proId) return null;
  return {
    id: data.id as string,
    statut: data.statut as string,
    image_url: (data.image_url as string | null) ?? null,
  };
}

/** Une URL d'image doit être absolue en https (utilisée telle quelle par Meta/Google). */
function imageUrlValide(v: string): boolean {
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
}

/** Providers effectivement connectés (connexion active) pour ce pro. */
async function providersConnectes(
  admin: SupabaseClient,
  proId: string
): Promise<Set<string>> {
  const { data } = await admin
    .from("social_connections")
    .select("provider, statut")
    .eq("pro_id", proId)
    .eq("statut", "active");
  return new Set(((data as Array<{ provider: string }> | null) || []).map((c) => c.provider));
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

  const post = await chargerPostPossede(admin, pro.id, params.id);
  if (!post) return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
  if (post.statut === "publie") {
    return NextResponse.json({ error: "Un post publié n'est plus modifiable." }, { status: 409 });
  }
  if (post.statut === "publication_en_cours") {
    return NextResponse.json(
      { error: "Publication en cours, réessayez dans quelques minutes." },
      { status: 409 }
    );
  }

  let body: {
    sujet?: string;
    contenu?: string;
    hashtags?: string[];
    image_url?: string | null;
    providers_cibles?: string[];
    action?: "planifier" | "deplanifier";
    scheduled_at?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }

  const maj: Record<string, unknown> = {};

  if (typeof body.sujet === "string") maj.sujet = body.sujet.trim().slice(0, 140) || null;
  if (typeof body.contenu === "string") {
    const c = body.contenu.trim();
    if (c.length < 2) return NextResponse.json({ error: "Contenu vide" }, { status: 400 });
    maj.contenu = c.slice(0, 2200);
  }
  if (Array.isArray(body.hashtags)) maj.hashtags = normaliserHashtags(body.hashtags);
  if (body.image_url === null || typeof body.image_url === "string") {
    const brut = body.image_url ? String(body.image_url).trim().slice(0, 1000) : "";
    if (brut && !imageUrlValide(brut)) {
      return NextResponse.json(
        { error: "L'URL de l'image doit être une adresse https accessible publiquement." },
        { status: 400 }
      );
    }
    maj.image_url = brut || null;
  }

  let providers: SocialProvider[] | undefined;
  if (Array.isArray(body.providers_cibles)) {
    providers = Array.from(
      new Set(body.providers_cibles.filter((p): p is SocialProvider => estProviderValide(p)))
    );
    maj.providers_cibles = providers;
  }

  // (Dé)planification
  if (body.action === "deplanifier") {
    maj.statut = "brouillon";
    maj.scheduled_at = null;
  } else if (body.action === "planifier") {
    const quand = body.scheduled_at ? new Date(body.scheduled_at) : null;
    if (!quand || Number.isNaN(quand.getTime())) {
      return NextResponse.json({ error: "Date de planification invalide." }, { status: 400 });
    }
    if (quand.getTime() <= Date.now()) {
      return NextResponse.json({ error: "La date de planification doit être future." }, { status: 400 });
    }
    // On a besoin de connaître les providers cibles et l'image finale après maj.
    const ciblesEffectives = providers ?? (await providersActuels(admin, params.id));
    if (ciblesEffectives.length === 0) {
      return NextResponse.json(
        { error: "Sélectionnez au moins une plateforme cible avant de planifier." },
        { status: 400 }
      );
    }
    // Toute cible doit être connectée : sinon la publication échouerait sur cette
    // cible tout en consommant une publication réelle sur les autres.
    const connectes = await providersConnectes(admin, pro.id);
    const manquants = ciblesEffectives.filter((p) => !connectes.has(p));
    if (manquants.length > 0) {
      return NextResponse.json(
        {
          error:
            "Connectez d'abord ces plateformes dans l'onglet Connexions : " +
            manquants.map((p) => PROVIDER_LABEL[p]).join(", ") + ".",
        },
        { status: 400 }
      );
    }
    const imageEffective =
      "image_url" in maj ? (maj.image_url as string | null) : post.image_url;
    if (ciblesEffectives.includes("instagram") && !imageEffective) {
      return NextResponse.json(
        { error: "Instagram nécessite une image. Ajoutez une image ou retirez Instagram des cibles." },
        { status: 400 }
      );
    }
    maj.statut = "planifie";
    maj.scheduled_at = quand.toISOString();
  }

  const { data, error } = await admin
    .from("social_posts")
    .update(maj)
    .eq("id", params.id)
    .select(POST_COLS)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, post: data });
}

async function providersActuels(admin: SupabaseClient, postId: string): Promise<SocialProvider[]> {
  const { data } = await admin
    .from("social_posts")
    .select("providers_cibles")
    .eq("id", postId)
    .maybeSingle();
  const raw = (data?.providers_cibles as string[] | null) ?? [];
  return raw.filter((p): p is SocialProvider => estProviderValide(p));
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
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

  const post = await chargerPostPossede(admin, pro.id, params.id);
  if (!post) return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
  // Un post publié est un historique de publication réelle : il reste en base
  // (le quota est de toute façon compté sur des compteurs monotones).
  if (post.statut === "publie") {
    return NextResponse.json(
      { error: "Un post publié ne peut pas être supprimé de l'historique." },
      { status: 409 }
    );
  }
  if (post.statut === "publication_en_cours") {
    return NextResponse.json(
      { error: "Publication en cours, réessayez dans quelques minutes." },
      { status: 409 }
    );
  }

  const { error } = await admin.from("social_posts").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
