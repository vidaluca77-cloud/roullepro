/**
 * Helper : octroi automatique d'un essai Pro gratuit a chaque nouvelle fiche
 * (inscription ou claim valide). Duree = SANITAIRE_TRIAL_DAYS (7 jours par defaut,
 * surchargeable via STRIPE_TRIAL_JOURS). Best-effort, non bloquant pour la reponse.
 *
 * Garde-fou : ne grant pas si le pro a deja recu une offre (plan_offer_source
 * non null).
 */

import { createClient } from "@supabase/supabase-js";
import { SANITAIRE_TRIAL_DAYS } from "@/lib/sanitaire-trial";

export type GrantResult =
  | { granted: true; expires_at: string }
  | { skipped: true; reason: "already_granted" | "not_found" | "config" | "error"; error?: string };

export async function grantAutoTrial(proId: string): Promise<GrantResult> {
  if (!proId) return { skipped: true, reason: "not_found" };

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return { skipped: true, reason: "config" };
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing, error: selErr } = await supabase
    .from("pros_sanitaire")
    .select("id, plan, plan_offer_source")
    .eq("id", proId)
    .maybeSingle();

  if (selErr) {
    return { skipped: true, reason: "error", error: selErr.message };
  }
  if (!existing) {
    return { skipped: true, reason: "not_found" };
  }
  if ((existing as { plan_offer_source?: string | null }).plan_offer_source) {
    return { skipped: true, reason: "already_granted" };
  }

  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + SANITAIRE_TRIAL_DAYS);

  const { error: updErr } = await supabase
    .from("pros_sanitaire")
    .update({
      plan: "essential",
      plan_expires_at: expiresAt.toISOString(),
      plan_offer_source: "auto_trial_2months",
      plan_offer_granted_at: now.toISOString(),
    })
    .eq("id", proId);

  if (updErr) {
    return { skipped: true, reason: "error", error: updErr.message };
  }

  // Audit, best-effort (la table peut etre verrouillee par une RLS distincte).
  const { error: auditErr } = await supabase
    .from("plan_offer_grants")
    .insert({
      pro_id: proId,
      offer_source: "auto_trial_2months",
      plan_granted: "essential",
      expires_at: expiresAt.toISOString(),
    });
  if (auditErr) {
    console.warn("[auto-trial] audit insert error:", auditErr.message);
  }

  return { granted: true, expires_at: expiresAt.toISOString() };
}
