/**
 * GET /api/studio-social/connect/google/callback
 *
 * Callback OAuth Google : échange le code contre un access_token + refresh_token,
 * résout le/les établissement(s) Google Business Profile disponibles pour ce compte
 * Google puis stocke les tokens CHIFFRÉS côté serveur (jamais exposés au client).
 *
 * Un compte Google peut gérer PLUSIEURS comptes/établissements GBP (ex. un pro qui
 * gère aussi la fiche d'un confrère). L'API `accounts.list` ne garantit aucun ordre
 * stable : prendre systématiquement le premier résultat connecterait silencieusement
 * le mauvais établissement. On liste donc TOUS les comptes et TOUTES leurs locations :
 *   - un seul établissement trouvé au total → connexion directe (pas de friction inutile)
 *   - plusieurs établissements → statut 'en_attente_choix', liste stockée dans
 *     `comptes_disponibles` (jamais de token dedans), l'utilisateur choisit ensuite
 *     via l'écran de sélection du Studio Social.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAdminServiceClient } from "@/lib/admin-guard";
import { getProStudioActif } from "@/lib/studio-social";
import { chiffrerToken, tokenKeyConfigured } from "@/lib/studio-social-crypto";
import {
  providerActive,
  googleRedirectUri,
  GOOGLE_SCOPES,
  expiresAtDepuisExpiresIn,
  appUrl,
} from "@/lib/studio-social-oauth";

const STUDIO_URL = "/transport-medical/pro/studio-social";

type Location = { name?: string; title?: string };
type Compte = { name?: string; accountName?: string };
/** Établissement candidat, tous comptes confondus : `name` = `accounts/{id}/locations/{id}`. */
export type EtablissementCandidat = { name: string; title: string | null; compte: string };

function retour(statut: "connecte" | "choix" | "erreur", detail?: string) {
  const q =
    statut === "connecte"
      ? "connecte=google"
      : statut === "choix"
        ? "choix=google"
        : `erreur=${detail || "google"}`;
  return NextResponse.redirect(`${appUrl()}${STUDIO_URL}?${q}`);
}

/** Établissements du compte GBP. `name` est relatif : `locations/{id}`. */
async function listerLocations(compte: string, accessToken: string): Promise<Location[]> {
  const url =
    `https://mybusinessbusinessinformation.googleapis.com/v1/${compte}/locations` +
    `?readMask=name,title&pageSize=100`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return (data?.locations as Location[] | undefined) || [];
}

/** Liste tous les établissements de tous les comptes GBP accessibles à ce token. */
async function listerTousLesEtablissements(
  comptes: Compte[],
  accessToken: string
): Promise<EtablissementCandidat[]> {
  const resultats: EtablissementCandidat[] = [];
  for (const c of comptes) {
    if (!c.name) continue;
    const locations = await listerLocations(c.name, accessToken);
    for (const l of locations) {
      if (!l.name) continue;
      resultats.push({
        name: `${c.name}/${l.name}`,
        title: l.title || c.accountName || null,
        compte: c.name,
      });
    }
  }
  return resultats;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const refus = url.searchParams.get("error");

  const cookieStore = await cookies();
  const attendu = cookieStore.get("ss_oauth_google")?.value;
  cookieStore.delete("ss_oauth_google");

  // L'utilisateur a refusé/annulé côté Google : pas une erreur technique.
  if (refus) return retour("erreur", "annule");
  if (!code || !state || !attendu || state !== attendu) {
    return retour("erreur", "state");
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return retour("erreur", "auth");

  const admin = getAdminServiceClient();
  const pro = await getProStudioActif(admin, user.id);
  const proIdState = state.split(".")[1];
  if (!pro || pro.id !== proIdState) return retour("erreur", "plan");
  if (!providerActive("google_business")) return retour("erreur", "indisponible");
  if (!tokenKeyConfigured()) return retour("erreur", "chiffrement");

  try {
    const body = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    });
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!tokenRes.ok) return retour("erreur", "token");
    const tokenData = await tokenRes.json();
    const accessToken: string | undefined = tokenData?.access_token;
    const refreshToken: string | null = tokenData?.refresh_token ?? null;
    if (!accessToken) return retour("erreur", "token");
    const expiresAt = expiresAtDepuisExpiresIn(tokenData?.expires_in);

    // 1. Tous les comptes GBP accessibles à ce token (peut en gérer plusieurs).
    const accRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!accRes.ok) return retour("erreur", "no_account");
    const accData = await accRes.json().catch(() => ({}));
    const comptes: Compte[] = (accData?.accounts as Compte[] | undefined) || [];
    if (comptes.length === 0) return retour("erreur", "no_account");

    // 2. Tous les établissements publiables, tous comptes confondus :
    // `accounts/{id}/locations/{id}`. Jamais de sélection automatique dès qu'il y
    // a ambiguïté — voir le commentaire d'en-tête du fichier.
    const etablissements = await listerTousLesEtablissements(comptes, accessToken);
    if (etablissements.length === 0) return retour("erreur", "no_location");

    const baseMaj: Record<string, unknown> = {
      pro_id: pro.id,
      provider: "google_business",
      access_token_chiffre: chiffrerToken(accessToken),
      token_expires_at: expiresAt,
      scopes: GOOGLE_SCOPES.join(" "),
      updated_at: new Date().toISOString(),
    };
    // Google ne renvoie le refresh_token qu'au premier consentement : ne jamais
    // écraser celui déjà stocké par un null, sinon plus aucun rafraîchissement.
    if (refreshToken) baseMaj.refresh_token_chiffre = chiffrerToken(refreshToken);

    if (etablissements.length === 1) {
      // Cas non-ambigu : un seul établissement possible, connexion directe.
      const seul = etablissements[0];
      await admin.from("social_connections").upsert(
        {
          ...baseMaj,
          account_id: seul.name,
          account_name: seul.title,
          account_metadata: { compte: seul.compte, locations: [seul] },
          comptes_disponibles: [],
          statut: "active",
        },
        { onConflict: "pro_id,provider" }
      );
      return retour("connecte");
    }

    // Cas ambigu : plusieurs établissements trouvés, on ne choisit rien à la
    // place de l'utilisateur. Le token est déjà stocké (chiffré) pour permettre
    // la validation finale sans nouvelle autorisation Google.
    await admin.from("social_connections").upsert(
      {
        ...baseMaj,
        account_id: null,
        account_name: null,
        account_metadata: {},
        comptes_disponibles: etablissements.slice(0, 50),
        statut: "en_attente_choix",
      },
      { onConflict: "pro_id,provider" }
    );
    return retour("choix");
  } catch {
    return retour("erreur", "exception");
  }
}
