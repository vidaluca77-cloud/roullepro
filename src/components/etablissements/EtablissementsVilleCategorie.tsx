/**
 * Bloc "Etablissements de sante desservis a [ville] et alentours" pose sur les
 * pages /transport-medical/[ville]/[categorie]. Remonte jusqu'a 6 etablissements
 * de la ville (ou du departement si la ville en compte moins de 3) pour boucler
 * le maillage interne vers /etablissements/[slug].
 *
 * Server component async — lecture BDD au build/ISR. Deux requetes au plus :
 * la ville, puis un repli departement uniquement si necessaire.
 */

import Link from "next/link";
import { Building2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import {
  selectEtablissementsAffichage,
  type EtabRow,
} from "@/lib/sanitaire-ville-categorie";

const SELECT_COLS = "id, slug, raison_sociale, nom_court, nom_affichage, categorie_simple";

const TYPE_LABEL: Record<string, string> = {
  hopital: "Hôpital",
  clinique: "Clinique",
  ehpad: "EHPAD",
  "centre-sante": "Centre de santé",
  "centre-dialyse": "Centre de dialyse",
  "centre-oncologie": "Centre d'oncologie",
  psychiatrie: "Établissement psychiatrique",
  rehabilitation: "Centre de réadaptation",
  "maison-sante": "Maison de santé",
  autre: "Établissement",
};

// Les slugs villes SEO (saint-...) different du referentiel FINESS (st-...).
const VILLE_SLUG_FINESS_ALIASES: Record<string, string> = {
  "saint-etienne": "st-etienne",
  "saint-denis": "st-denis",
};

async function fetchEtabs(villeSlug: string, departement: string): Promise<{
  scope: "ville" | "departement";
  rows: EtabRow[];
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const slugsToTry = [villeSlug];
  const alias = VILLE_SLUG_FINESS_ALIASES[villeSlug];
  if (alias) slugsToTry.push(alias);

  const { data: villeData } = await supabase
    .from("etablissements_sante_public")
    .select(SELECT_COLS)
    .in("ville_slug", slugsToTry)
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .order("raison_sociale", { ascending: true })
    .limit(6);
  const villeRows = (villeData || []) as EtabRow[];

  // Repli departement uniquement si la ville compte moins de 3 etablissements.
  let deptRows: EtabRow[] = [];
  if (villeRows.length < 3 && departement) {
    const { data: deptData } = await supabase
      .from("etablissements_sante_public")
      .select(SELECT_COLS)
      .eq("departement", departement)
      .order("capacite_lits", { ascending: false, nullsFirst: false })
      .order("raison_sociale", { ascending: true })
      .limit(6);
    deptRows = (deptData || []) as EtabRow[];
  }

  return selectEtablissementsAffichage(villeRows, deptRows, 6);
}

function nom(e: EtabRow): string {
  return e.nom_affichage || e.nom_court || e.raison_sociale;
}

function typeLabel(categorie: string | null): string {
  if (!categorie) return "Établissement";
  return TYPE_LABEL[categorie] ?? "Établissement";
}

export default async function EtablissementsVilleCategorie({
  villeSlug,
  nomVille,
  departement,
}: {
  villeSlug: string;
  nomVille: string;
  departement: string;
}) {
  const { scope, rows } = await fetchEtabs(villeSlug, departement);
  if (rows.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="h-5 w-5 text-blue-700" aria-hidden="true" />
        <h2 className="text-xl font-bold text-gray-900">
          Établissements de santé desservis à {nomVille} et alentours
        </h2>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        {scope === "ville"
          ? `Trouvez un transport conventionné pour vous rendre dans ces établissements de santé à ${nomVille}.`
          : `Peu d'établissements sont référencés à ${nomVille} : voici ceux desservis dans le même département.`}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((e) => (
          <Link
            key={e.id}
            href={`/etablissements/${e.slug}`}
            className="block rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition"
          >
            <h3 className="font-semibold text-gray-900 leading-tight">{nom(e)}</h3>
            <p className="text-sm text-slate-600 mt-1">{typeLabel(e.categorie_simple)}</p>
            <span className="mt-3 inline-block text-sm text-blue-700">Transport conventionné →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
