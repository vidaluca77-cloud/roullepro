/**
 * Bloc "Etablissements de sante a [Ville]" pose sur les pages
 * /transport-medical/[ville]. Boucle le maillage interne ville <-> etablissement
 * en remontant les 12 plus gros etablissements de la ville (par capacite_lits).
 *
 * Server component async — lecture en BDD au build/ISR.
 */

import Link from "next/link";
import { Building2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

type Etab = {
  id: string;
  slug: string;
  raison_sociale: string;
  nom_court: string | null;
  nom_affichage: string | null;
  categorie_simple: string | null;
  capacite_lits: number | null;
};

const TYPE_LABEL: Record<string, string> = {
  hopital: "Hopital",
  clinique: "Clinique",
  ehpad: "EHPAD",
  "centre-sante": "Centre de sante",
  "centre-dialyse": "Centre de dialyse",
  "centre-oncologie": "Centre d'oncologie",
  psychiatrie: "Etablissement psychiatrique",
  rehabilitation: "Centre de readaptation",
  "maison-sante": "Maison de sante",
  autre: "Etablissement",
};

// Mapping pour aligner les slugs villes SEO (saint-...) avec ceux du referentiel
// FINESS (st-...). Les 2 tables n'utilisent pas la meme convention.
const VILLE_SLUG_FINESS_ALIASES: Record<string, string> = {
  "saint-etienne": "st-etienne",
  "saint-denis": "st-denis",
};

async function fetchTopEtabsForVille(villeSlug: string, limit = 12): Promise<Etab[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const slugsToTry = [villeSlug];
  const alias = VILLE_SLUG_FINESS_ALIASES[villeSlug];
  if (alias) slugsToTry.push(alias);

  const { data, error } = await supabase
    .from("etablissements_sante_public")
    .select("id, slug, raison_sociale, nom_court, nom_affichage, categorie_simple, capacite_lits")
    .in("ville_slug", slugsToTry)
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .order("raison_sociale", { ascending: true })
    .limit(limit);
  if (error) return [];
  return (data || []) as Etab[];
}

function nom(e: Etab): string {
  return e.nom_affichage || e.nom_court || e.raison_sociale;
}

function typeLabel(categorie: string | null): string {
  if (!categorie) return "Etablissement";
  return TYPE_LABEL[categorie] ?? "Etablissement";
}

export default async function EtablissementsVille({
  villeSlug,
  nomVille,
}: {
  villeSlug: string;
  nomVille: string;
}) {
  const etabs = await fetchTopEtabsForVille(villeSlug, 12);
  if (etabs.length === 0) return null;

  return (
    <section className="bg-white py-10 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-6 w-6 text-blue-700" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900">
            Etablissements de santé à {nomVille}
          </h2>
        </div>
        <p className="text-slate-600 mb-6">
          Trouvez un transporteur conventionné CPAM pour vous rendre dans un établissement de
          santé à {nomVille}. Sélectionnez votre destination ci-dessous pour voir les taxis,
          VSL et ambulances qui assurent vos trajets en tiers payant.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {etabs.map((e) => (
            <Link
              key={e.id}
              href={`/etablissements/${e.slug}`}
              className="block rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-blue-300 transition"
            >
              <h3 className="font-semibold text-gray-900 leading-tight">{nom(e)}</h3>
              <p className="text-sm text-slate-600 mt-1">
                {typeLabel(e.categorie_simple)}
                {e.capacite_lits ? ` · ${e.capacite_lits} lits` : ""}
              </p>
              <span className="mt-3 inline-block text-sm text-blue-700">
                Transport conventionné →
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href="/etablissements"
            className="inline-block text-blue-700 font-medium hover:underline"
          >
            Voir tous les établissements de France →
          </Link>
        </div>
      </div>
    </section>
  );
}
