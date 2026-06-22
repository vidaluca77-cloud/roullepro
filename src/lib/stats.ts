import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

// Source unique de verite pour les comptages de pros affiches sur le site.
// Filtre canonique de visibilite : actif IS NOT FALSE AND suspendu IS NOT TRUE AND masquage_raison IS NULL.
// Les pages home, /pro et /transport-medical consomment ce helper pour rester coherentes.
//
// Perf : on utilise count "estimated" plutot que "exact". Sur une table de 26 000+
// fiches, "exact" force un scan complet a chaque revalidation du cache (cause
// majeure du p95 homepage). "estimated" s'appuie sur les statistiques Postgres et
// est ~100x plus rapide. Les comptages sont purement indicatifs ("26 000+ pros"),
// une approximation est donc acceptable.

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
    .select("*", { count: "estimated", head: true })
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

// Nombre d'etablissements de sante actifs (referentiel FINESS). Comptage estime
// (cf. note perf ci-dessus) et cache 1 h : la donnee ne bouge qu'au refresh mensuel.
async function computeEtablissementsCount(): Promise<number> {
  const supabase = supabaseClient();
  const { count } = await supabase
    .from("etablissements_sante_public")
    .select("id", { count: "estimated", head: true });
  return count ?? 0;
}

export const getEtablissementsCount = unstable_cache(
  computeEtablissementsCount,
  ["etablissements-count"],
  { revalidate: 3600, tags: ["etablissements-count"] }
);
