"use server";

import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { ensureAdmin, getServiceSupabase } from "./_helpers";

type ActionResult = { ok: boolean; error?: string };

function parseJsonArray(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr)
      ? (arr.filter((x) => typeof x === "string") as string[])
      : [];
  } catch {
    return [];
  }
}

function parseSourcesText(text: string): { label: string; url: string }[] {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const [label, url] = line.split("|").map((s) => s.trim());
      if (!url) return null;
      return { label: label || url, url };
    })
    .filter((x): x is { label: string; url: string } => x !== null);
}

function parseKeyNumbersText(text: string): { label: string; value: string }[] {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const [label, value] = line.split("|").map((s) => s.trim());
      if (!label || !value) return null;
      return { label, value };
    })
    .filter((x): x is { label: string; value: string } => x !== null);
}

function revalidateAll(slug?: string) {
  revalidatePath("/admin/veille/alertes");
  revalidatePath("/veille-reglementaire");
  if (slug) revalidatePath(`/veille-reglementaire/${slug}`);
}

/**
 * Wrappers form-action : Next.js exige `(formData) => void | Promise<void>`
 * pour les `<form action={...}>`. On expose donc des versions sans retour
 * pour ces usages. Les versions typees ActionResult restent dispo pour les
 * composants client qui ont besoin du retour.
 */
export async function publishAlertForm(formData: FormData): Promise<void> {
  await publishAlert(formData);
}
export async function unpublishAlertForm(formData: FormData): Promise<void> {
  await unpublishAlert(formData);
}
export async function archiveAlertForm(formData: FormData): Promise<void> {
  await archiveAlert(formData);
}

export async function publishAlert(formData: FormData): Promise<ActionResult> {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, error: "id manquant" };
  const sb = getServiceSupabase();

  const { data: current } = await sb
    .from("reg_alerts")
    .select("slug, published_at")
    .eq("id", id)
    .maybeSingle();

  const update: Record<string, unknown> = {
    status: "published",
    last_content_update: new Date().toISOString().slice(0, 10),
  };
  if (!current || !(current as { published_at?: string | null }).published_at) {
    update.published_at = new Date().toISOString();
  }

  const { error } = await sb.from("reg_alerts").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll((current as { slug?: string } | null)?.slug);
  return { ok: true };
}

export async function unpublishAlert(formData: FormData): Promise<ActionResult> {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, error: "id manquant" };
  const sb = getServiceSupabase();
  const { data: current } = await sb
    .from("reg_alerts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await sb
    .from("reg_alerts")
    .update({ status: "draft" })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll((current as { slug?: string } | null)?.slug);
  return { ok: true };
}

export async function archiveAlert(formData: FormData): Promise<ActionResult> {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, error: "id manquant" };
  const sb = getServiceSupabase();
  const { data: current } = await sb
    .from("reg_alerts")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await sb
    .from("reg_alerts")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) {
    // CHECK constraint peut refuser 'archived' selon la DB. Fallback : draft.
    const msg = error.message || "";
    if (/check constraint|invalid input value|violates check/i.test(msg)) {
      const { error: fallbackErr } = await sb
        .from("reg_alerts")
        .update({ status: "draft" })
        .eq("id", id);
      if (fallbackErr) return { ok: false, error: fallbackErr.message };
      revalidateAll((current as { slug?: string } | null)?.slug);
      return {
        ok: true,
        error:
          "Statut 'archived' non supporté par la contrainte DB — repassée en draft à la place.",
      };
    }
    return { ok: false, error: msg };
  }
  revalidateAll((current as { slug?: string } | null)?.slug);
  return { ok: true };
}

export async function deleteAlert(formData: FormData): Promise<ActionResult> {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, error: "id manquant" };
  const sb = getServiceSupabase();

  // Garde-fou : on n'autorise la suppression QUE pour les drafts.
  const { data: current } = await sb
    .from("reg_alerts")
    .select("id, slug, status")
    .eq("id", id)
    .maybeSingle();
  if (!current) return { ok: false, error: "Alerte introuvable" };
  if ((current as { status: string }).status !== "draft") {
    return {
      ok: false,
      error: "Suppression refusée : repassez d'abord l'alerte en draft.",
    };
  }

  // Nettoyer la reference depuis les candidats avant DELETE (FK).
  await sb
    .from("reg_alerts_candidates")
    .update({ promoted_alert_id: null })
    .eq("promoted_alert_id", id);

  const { error } = await sb.from("reg_alerts").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateAll((current as { slug?: string } | null)?.slug);
  return { ok: true };
}

export async function updateAlert(
  formData: FormData
): Promise<ActionResult & { slug?: string }> {
  await ensureAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, error: "id manquant" };

  const titleShort = String(formData.get("title_short") || "").trim();
  const titleLong =
    String(formData.get("title_long") || "").trim() || titleShort;
  const slugRaw = String(formData.get("slug") || "").trim();
  const summary = String(formData.get("summary_oneliner") || "").trim();
  const whatChanges = String(formData.get("what_changes") || "").trim();
  const whoConcerned = String(formData.get("who_is_concerned") || "").trim();
  const urgency = String(formData.get("urgency") || "medium");
  const metiers = parseJsonArray(formData.get("metiers"));
  const activites = parseJsonArray(formData.get("activites"));
  const regionsRaw = String(formData.get("regions") || "");
  const regions = regionsRaw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const applicableFrom = String(formData.get("applicable_from") || "") || null;
  const deadline = String(formData.get("deadline") || "") || null;
  const actionsText = String(formData.get("concrete_actions") || "");
  const concreteActions = actionsText
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const sources = parseSourcesText(String(formData.get("sources_text") || ""));
  const keyNumbers = parseKeyNumbersText(
    String(formData.get("key_numbers_text") || "")
  );
  const publishToo = formData.get("publish") === "1";

  if (!titleShort || !slugRaw) {
    return { ok: false, error: "Titre court et slug requis" };
  }
  const cleanSlug = slugify(slugRaw, { lower: true, strict: true });
  if (!cleanSlug) return { ok: false, error: "Slug invalide" };

  const sb = getServiceSupabase();

  const { data: existing } = await sb
    .from("reg_alerts")
    .select("slug, status, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Alerte introuvable" };

  const update: Record<string, unknown> = {
    slug: cleanSlug,
    title_short: titleShort.slice(0, 200),
    title_long: titleLong.slice(0, 500),
    summary_oneliner: summary.slice(0, 400),
    metiers,
    activites,
    regions,
    urgency,
    applicable_from: applicableFrom,
    deadline,
    what_changes: whatChanges,
    who_is_concerned: whoConcerned,
    concrete_actions: concreteActions,
    key_numbers: keyNumbers,
    sources,
    last_content_update: new Date().toISOString().slice(0, 10),
  };

  if (publishToo) {
    update.status = "published";
    if (!(existing as { published_at?: string | null }).published_at) {
      update.published_at = new Date().toISOString();
    }
  }

  const { error } = await sb.from("reg_alerts").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };

  // Revalidate ancien ET nouveau slug si change.
  const oldSlug = (existing as { slug?: string } | null)?.slug;
  if (oldSlug && oldSlug !== cleanSlug) revalidatePath(`/veille-reglementaire/${oldSlug}`);
  revalidateAll(cleanSlug);
  return { ok: true, slug: cleanSlug };
}
