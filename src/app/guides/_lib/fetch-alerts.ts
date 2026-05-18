import { createClient } from "@supabase/supabase-js";
import type { AlertLinkData } from "../_components/AlertCardLink";
import type { RegUrgency } from "@/lib/reg-alerts";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function getAlertsBySlug(slugs: string[]): Promise<AlertLinkData[]> {
  const supabase = getSupabase();
  if (!supabase || slugs.length === 0) return [];
  const { data } = await supabase
    .from("reg_alerts")
    .select("slug, title_short, summary_oneliner, urgency, applicable_from")
    .eq("status", "published")
    .in("slug", slugs);
  if (!data) return [];
  const bySlug = new Map<string, AlertLinkData>();
  for (const row of data as Array<{
    slug: string;
    title_short: string;
    summary_oneliner: string;
    urgency: string;
    applicable_from: string | null;
  }>) {
    bySlug.set(row.slug, {
      slug: row.slug,
      title_short: row.title_short,
      summary_oneliner: row.summary_oneliner,
      urgency: (row.urgency as RegUrgency) || "info",
      applicable_from: row.applicable_from,
    });
  }
  // Preserve order requested.
  return slugs.map((s) => bySlug.get(s)).filter((x): x is AlertLinkData => !!x);
}
