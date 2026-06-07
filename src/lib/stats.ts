import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

// Source unique de verite pour les comptages de pros affiches sur le site.
// Filtre canonique de visibilite : actif IS NOT FALSE AND suspendu IS NOT TRUE AND masquage_raison IS NULL.
// Les pages home, /pro et /transport-medical consomment ce helper pour rester coherentes.

export type ProStats = {
  total: number;
  byCategory: {
    ambulance: number;
    vsl: number;
    taxi_conventionne: number;
  };
};

type CategorieKey = keyof ProStats["byCategory"];

function supabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Filtre canonique de visibilite + comptage exact, optionnellement par categorie.
async function countVisible(categorie?: CategorieKey): Promise<number> {
  const supabase = supabaseClient();
  let query = supabase
    .from("pros_sanitaire")
    .select("*", { count: "exact", head: true })
    .not("actif", "is", false)
    .not("suspendu", "is", true)
    .is("masquage_raison", null);
  if (categorie) query = query.eq("categorie", categorie);
  const { count } = await query;
  return count ?? 0;
}

async function computeProStats(): Promise<ProStats> {
  const [total, ambulance, vsl, taxi_conventionne] = await Promise.all([
    countVisible(),
    countVisible("ambulance"),
    countVisible("vsl"),
    countVisible("taxi_conventionne"),
  ]);
  return { total, byCategory: { ambulance, vsl, taxi_conventionne } };
}

// Cache 15 min, invalidable via le tag "pro-stats".
export const getProStats = unstable_cache(computeProStats, ["pro-stats"], {
  revalidate: 900,
  tags: ["pro-stats"],
});
