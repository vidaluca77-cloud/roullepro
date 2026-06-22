import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Building2, MapPin } from "lucide-react";
import {
  TYPES_ETABLISSEMENT,
  countByCategorie,
  getSupabaseEtab,
  type EtablissementPublic,
} from "@/lib/etablissements-data";
import { buildBreadcrumbJsonLd } from "@/lib/seo-schema";
import { getEtablissementsCount } from "@/lib/stats";
import { FinessFooter } from "./FinessFooter";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Etablissements de sante en France : hopitaux, cliniques, EHPAD | RoullePro",
  description:
    "Annuaire des etablissements de sante francais (hopitaux, cliniques, EHPAD, centres de dialyse). Donnees officielles FINESS. Organisez votre transport medical conventionne.",
  alternates: { canonical: "/etablissements" },
};

// 12 grands etablissements connus mis en avant sur l'index national.
async function fetchGrandsEtablissements(): Promise<EtablissementPublic[]> {
  const supabase = getSupabaseEtab();
  const { data } = await supabase
    .from("etablissements_sante_public")
    .select(
      "id, raison_sociale, nom_court, slug, categorie_simple, ville, departement, capacite_lits"
    )
    .in("categorie_simple", ["hopital", "clinique"])
    .order("capacite_lits", { ascending: false, nullsFirst: false })
    .limit(12);
  return (data as EtablissementPublic[]) ?? [];
}

export default async function EtablissementsIndexPage() {
  const [counts, grands, totalEtablissements] = await Promise.all([
    countByCategorie(),
    fetchGrandsEtablissements(),
    getEtablissementsCount(),
  ]);

  const breadLd = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Etablissements de sante", href: "/etablissements" },
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }}
      />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Etablissements de sante en France
          </h1>
          <p className="text-blue-100 max-w-2xl">
            Hopitaux, cliniques, EHPAD, centres de dialyse et d&apos;oncologie. Trouvez un
            etablissement et organisez votre transport medical conventionne (ambulance, VSL,
            taxi conventionne CPAM).
          </p>
          {totalEtablissements > 0 && (
            <p className="text-sm text-blue-200 mt-4">
              {totalEtablissements.toLocaleString("fr-FR")} etablissements references (donnees FINESS).
            </p>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Par type d&apos;etablissement</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TYPES_ETABLISSEMENT.map((t) => {
            const count = counts[t.categorie] ?? 0;
            return (
              <Link
                key={t.slug}
                href={`/etablissements/${t.slug}`}
                className="block bg-white border border-gray-200 rounded-2xl p-5 transition hover:shadow-lg hover:border-blue-200"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#0066CC]" />
                  </div>
                  <div className="font-semibold text-gray-900">{t.labelPluriel}</div>
                </div>
                <p className="text-xs text-gray-500 mb-2">{t.description}</p>
                <span className="text-sm text-[#0066CC] font-medium">
                  {count > 0 ? `${count.toLocaleString("fr-FR")} etablissements` : "Bientot disponible"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {grands.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Grands etablissements</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {grands.map((e) => (
              <Link
                key={e.id}
                href={`/etablissements/${e.slug}`}
                className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 transition hover:border-blue-200"
              >
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {e.nom_court || e.raison_sociale}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {e.ville}
                    {e.departement ? ` (${e.departement})` : ""}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <FinessFooter />
    </main>
  );
}
