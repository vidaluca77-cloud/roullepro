/**
 * Helper d'auto-inscription a la newsletter veille reglementaire.
 *
 * Appele depuis :
 *  - /api/sanitaire/inscription (creation de fiche)
 *  - /api/sanitaire/claim/verify (reclamation de fiche)
 *  - /api/stripe/webhook (activation plan payant)
 *
 * Comportement :
 *  - Si l'email n'est pas deja abonne : upsert + envoi email double opt-in via Resend.
 *  - Si deja confirme : merge des segments metiers (sans ecraser) + reg_newsletter_optin = true.
 *
 * Non bloquant : retourne le statut, ne throw pas en cas d'echec Resend.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  VEILLE_FROM_EMAIL,
  buildVeilleConfirmationHtml,
} from "@/lib/veille-email-templates";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";
const ALLOWED_METIERS = new Set(["ambulance", "vsl", "taxi_conventionne"]);

export type AutoSubscribeStatus =
  | "created"
  | "updated"
  | "already_confirmed"
  | "skipped";

export interface AutoSubscribeResult {
  status: AutoSubscribeStatus;
  sent_confirmation: boolean;
  reason?: string;
}

export async function autoSubscribePro(params: {
  email: string;
  categorie: string;
  supabase: SupabaseClient;
}): Promise<AutoSubscribeResult> {
  const email = (params.email || "").trim().toLowerCase();
  const categorie = (params.categorie || "").trim().toLowerCase();
  const supabase = params.supabase;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "skipped", sent_confirmation: false, reason: "invalid_email" };
  }
  if (!ALLOWED_METIERS.has(categorie)) {
    return {
      status: "skipped",
      sent_confirmation: false,
      reason: "invalid_categorie",
    };
  }

  // 1. Cherche l'eventuel subscriber existant.
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select(
      "id, email, metiers_segments, reg_newsletter_optin, confirmed_at, unsubscribed_at, unsubscribe_token"
    )
    .eq("email", email)
    .maybeSingle();

  // 2. Deja confirme : merge segments + s'assure que opt-in actif.
  if (existing && existing.confirmed_at && existing.reg_newsletter_optin) {
    const current = Array.isArray(existing.metiers_segments)
      ? (existing.metiers_segments as string[])
      : [];
    const merged = Array.from(new Set([...current, categorie]));
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({
        metiers_segments: merged,
        reg_newsletter_optin: true,
        unsubscribed_at: null,
      })
      .eq("id", (existing as { id: string }).id);
    if (error) {
      console.warn("[auto-subscribe] update existing error:", error.message);
      return {
        status: "skipped",
        sent_confirmation: false,
        reason: "update_failed",
      };
    }
    return { status: "already_confirmed", sent_confirmation: false };
  }

  // 3. Sinon : on (re)cree un cycle de double opt-in.
  const confirmationToken =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const previousSegments = existing && Array.isArray(existing.metiers_segments)
    ? (existing.metiers_segments as string[])
    : [];
  const mergedSegments = Array.from(new Set([...previousSegments, categorie]));

  const payload: Record<string, unknown> = {
    email,
    source: "pro_signup",
    metiers_segments: mergedSegments,
    confirmation_token: confirmationToken,
    confirmation_token_expires_at: expiresAt,
    reg_newsletter_optin: false,
    unsubscribed_at: null,
  };

  const { error: upsertError } = await supabase
    .from("newsletter_subscribers")
    .upsert(payload, { onConflict: "email" });

  if (upsertError) {
    console.warn("[auto-subscribe] upsert error:", upsertError.message);
    return {
      status: "skipped",
      sent_confirmation: false,
      reason: "upsert_failed",
    };
  }

  // 4. Envoi email confirmation (best-effort).
  const apiKey = process.env.RESEND_API_KEY;
  let sent = false;
  if (apiKey) {
    try {
      const resend = new Resend(apiKey);
      const confirmUrl = `${APP_URL}/api/veille/confirm?token=${confirmationToken}`;
      await resend.emails.send({
        from: VEILLE_FROM_EMAIL,
        to: email,
        subject: "Confirmez votre inscription à la veille RoullePro",
        html: buildVeilleConfirmationHtml({
          email,
          metiers: mergedSegments,
          confirmUrl,
        }),
      });
      sent = true;
    } catch (err) {
      console.warn(
        "[auto-subscribe] resend send failed:",
        err instanceof Error ? err.message : err
      );
    }
  } else {
    console.warn("[auto-subscribe] RESEND_API_KEY manquant, email non envoye");
  }

  return {
    status: existing ? "updated" : "created",
    sent_confirmation: sent,
  };
}
