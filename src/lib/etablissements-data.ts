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
  | "autre";

export type EtablissementPublic = {
  id: string;
  finess_geo: string;
  raison_sociale: string;
  nom_court: string | null;
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

// Les 8 types navigables (psychiatrie incluse meme si l'import ne la remplit pas
// encore : la page existe et restera vide tant que les codes psy ne sont pas mappes).
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
    description: "Etablissements de readaptation fonctionnelle et de soins de longue duree.",
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
  "id, finess_geo, raison_sociale, nom_court, slug, categorie_simple, categorie_finess_libelle, adresse, code_postal, ville, ville_slug, departement, region, latitude, longitude, telephone, site_web, capacite_lits, source_updated_at";

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

/** Compte les etablissements actifs par categorie_simple. */
export async function countByCategorie(): Promise<Record<string, number>> {
  const supabase = getSupabaseEtab();
  const counts: Record<string, number> = {};
  for (const t of TYPES_ETABLISSEMENT) {
    const { count } = await supabase
      .from("etablissements_sante_public")
      .select("id", { count: "estimated", head: true })
      .eq("categorie_simple", t.categorie);
    counts[t.categorie] = count ?? 0;
  }
  return counts;
}

/** Libelle FINESS humain pour le footer Licence Ouverte. */
export function formatSourceDate(date: string | null): string {
  if (!date) return "date inconnue";
  try {
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return date;
  }
}
