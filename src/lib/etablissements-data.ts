/**
 * Helpers partages pour les pages /etablissements/* (referentiel FINESS).
 *
 * categorie_simple est la valeur stockee en BDD (voir CATEGORIE_FINESS_MAP dans
 * finess-import.ts). Les routes utilisent un slug de type au pluriel (ex
 * "hopitaux") qui se mappe vers categorie_simple ("hopital").
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type CategorieSimple =
  | "hopital"
  | "clinique"
  | "ehpad"
  | "centre-sante"
  | "centre-dialyse"
  | "centre-oncologie"
  | "psychiatrie"
  | "rehabilitation"
  | "maison-sante"
  | "autre";

export type EtablissementPublic = {
  id: string;
  finess_geo: string;
  raison_sociale: string;
  nom_court: string | null;
  nom_affichage: string | null;
  search_aliases: string | null;
  slug: string;
  categorie_simple: CategorieSimple;
  categorie_finess_libelle: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  ville_slug: string | null;
  departement: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  telephone: string | null;
  site_web: string | null;
  capacite_lits: number | null;
  source_updated_at: string | null;
};

export type TypeEtablissement = {
  slug: string; // segment d'URL (pluriel)
  categorie: CategorieSimple;
  label: string; // singulier
  labelPluriel: string;
  description: string;
};

// Types navigables. psychiatrie et centre-oncologie restent presents pour leurs
// pages dediees meme si la whitelist FINESS stricte ne les alimente pas (codes psy
// ranges sous "hopital", oncologie non mappee) : les pages existent et peuvent etre vides.
export const TYPES_ETABLISSEMENT: TypeEtablissement[] = [
  {
    slug: "hopitaux",
    categorie: "hopital",
    label: "Hopital",
    labelPluriel: "Hopitaux",
    description: "Centres hospitaliers (CH) et universitaires (CHU).",
  },
  {
    slug: "cliniques",
    categorie: "clinique",
    label: "Clinique",
    labelPluriel: "Cliniques",
    description: "Cliniques et etablissements de soins pluridisciplinaires.",
  },
  {
    slug: "ehpad",
    categorie: "ehpad",
    label: "EHPAD",
    labelPluriel: "EHPAD",
    description: "Maisons de retraite medicalisees, logements-foyers et maisons de repos.",
  },
  {
    slug: "centres-sante",
    categorie: "centre-sante",
    label: "Centre de sante",
    labelPluriel: "Centres de sante",
    description: "Centres medico-psychologiques et centres de sante.",
  },
  {
    slug: "centres-dialyse",
    categorie: "centre-dialyse",
    label: "Centre de dialyse",
    labelPluriel: "Centres de dialyse",
    description: "Centres de dialyse et d'autodialyse.",
  },
  {
    slug: "centres-oncologie",
    categorie: "centre-oncologie",
    label: "Centre d'oncologie",
    labelPluriel: "Centres d'oncologie",
    description: "Etablissements de lutte contre le cancer.",
  },
  {
    slug: "psychiatrie",
    categorie: "psychiatrie",
    label: "Etablissement psychiatrique",
    labelPluriel: "Etablissements psychiatriques",
    description: "Etablissements de soins psychiatriques.",
  },
  {
    slug: "rehabilitation",
    categorie: "rehabilitation",
    label: "Centre de readaptation",
    labelPluriel: "Centres de readaptation",
    description: "Etablissements de soins de suite et de readaptation (SSR).",
  },
  {
    slug: "maisons-sante",
    categorie: "maison-sante",
    label: "Maison de sante",
    labelPluriel: "Maisons de sante",
    description: "Maisons de sante pluriprofessionnelles (L.6223-3).",
  },
];

const BY_SLUG = new Map(TYPES_ETABLISSEMENT.map((t) => [t.slug, t]));
const BY_CATEGORIE = new Map(TYPES_ETABLISSEMENT.map((t) => [t.categorie, t]));

export function getTypeBySlug(slug: string): TypeEtablissement | undefined {
  return BY_SLUG.get(slug);
}

export function getTypeByCategorie(categorie: string): TypeEtablissement | undefined {
  return BY_CATEGORIE.get(categorie as CategorieSimple);
}

export function getSupabaseEtab(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const ETAB_SELECT =
  "id, finess_geo, raison_sociale, nom_court, nom_affichage, slug, categorie_simple, categorie_finess_libelle, adresse, code_postal, ville, ville_slug, departement, region, latitude, longitude, telephone, site_web, capacite_lits, source_updated_at";

/** Recupere une fiche etablissement par slug (ou null si absente). */
export async function getEtablissementBySlug(
  slug: string
): Promise<EtablissementPublic | null> {
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select(ETAB_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  return (data as EtablissementPublic | null) ?? null;
}

// Champs minimaux pour les cartes/listes de maillage (hub + encarts blog).
const ETAB_CARD_SELECT =
  "id, raison_sociale, nom_court, nom_affichage, slug, categorie_simple, ville, ville_slug, departement, capacite_lits";

/**
 * Recupere les plus gros etablissements (par capacite de lits) pour une ou
 * plusieurs categories. Sert au hub /etablissements et aux encarts de maillage
 * interne : les slugs proviennent toujours de la BDD, jamais codes en dur.
 */
export async function fetchTopEtablissements(
  categories: CategorieSimple[],
  limit: number
): Promise<EtablissementPublic[]> {
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select(ETAB_CARD_SELECT)
    .in("categorie_simple", categories)
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .order("ville", { ascending: true })
    .limit(limit);
  return (data as EtablissementPublic[]) ?? [];
}

/** Nom d'affichage prioritaire d'une fiche (affichage > court > raison sociale). */
export function nomEtablissement(e: EtablissementPublic): string {
  return e.nom_affichage || e.nom_court || e.raison_sociale;
}

/** Compte les etablissements actifs par categorie_simple. */
export async function countByCategorie(): Promise<Record<string, number>> {
  const supabase = getSupabaseEtab();
  const results = await Promise.all(
    TYPES_ETABLISSEMENT.map(async (t) => {
      const { count } = await supabase
        .from("etablissements_sante_public")
        .select("id", { count: "estimated", head: true })
        .eq("categorie_simple", t.categorie);
      return [t.categorie, count ?? 0] as const;
    })
  );
  return Object.fromEntries(results);
}

/** Libelle FINESS humain pour le footer Licence Ouverte. */
export function formatSourceDate(date: string | null): string {
  if (!date) return "date inconnue";
  try {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Europe/Paris",
    });
  } catch {
    return date;
  }
}
