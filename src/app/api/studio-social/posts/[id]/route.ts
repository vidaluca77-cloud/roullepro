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
  type SocialProvider,
} from "@/lib/studio-social";

const POST_COLS =
  "id, sujet, contenu, hashtags, image_url, providers_cibles, statut, scheduled_at, published_at, resultats, genere_par_ia, created_at";

/** Récupère le post s'il appartient à une fiche du pro connecté, sinon null. */
async function chargerPostPossede(
  admin: SupabaseClient,
  userId: string,
  postId: string
): Promise<{ id: string; statut: string; image_url: string | null } | null> {
  const { data } = await admin
    .from("social_posts")
    .select("id, statut, image_url, pro_id, pros_sanitaire!inner(claimed_by)")
    .eq("id", postId)
    .maybeSingle();
  if (!data) return null;
  const prorel = (data as { pros_sanitaire?: { claimed_by?: string } | { claimed_by?: string }[] })
    .pros_sanitaire;
  const claimedBy = Array.isArray(prorel) ? prorel[0]?.claimed_by : prorel?.claimed_by;
  if (claimedBy !== userId) return null;
  return { id: data.id as string, statut: data.statut as string, image_url: (data.image_url as string | null) ?? null };
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

  const post = await chargerPostPossede(admin, user.id, params.id);
  if (!post) return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
  if (post.statut === "publie") {
    return NextResponse.json({ error: "Un post publié n'est plus modifiable." }, { status: 409 });
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
    maj.image_url = body.image_url ? String(body.image_url).slice(0, 1000) : null;
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
    const ciblesFinales =
      providers ?? (undefined as SocialProvider[] | undefined);
    // On a besoin de connaître les providers cibles et l'image finale après maj.
    const ciblesEffectives =
      ciblesFinales ?? (await providersActuels(admin, params.id));
    if (ciblesEffectives.length === 0) {
      return NextResponse.json(
        { error: "Sélectionnez au moins une plateforme cible avant de planifier." },
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
  const post = await chargerPostPossede(admin, user.id, params.id);
  if (!post) return NextResponse.json({ error: "Post introuvable" }, { status: 404 });

  const { error } = await admin.from("social_posts").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
