import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Building2, MapPin } from "lucide-react";
import {
  TYPES_ETABLISSEMENT,
  countByCategorie,
  fetchTopEtablissements,
  nomEtablissement,
  type EtablissementPublic,
} from "@/lib/etablissements-data";
import { getDepartementByCode } from "@/lib/departements-fr";
import { buildBreadcrumbJsonLd, jsonLdHtml, BASE_URL } from "@/lib/seo-schema";
import { getEtablissementsCount } from "@/lib/stats";
import RechercheEtablissement from "@/components/RechercheEtablissement";
import { FinessFooter } from "./FinessFooter";
import ChantierETiles from "@/components/etablissements/ChantierETiles";

export const revalidate = 86400;

export const metadata: Metadata = {
  title:
    "Établissements de santé France — Annuaire transport médical CPAM | RoullePro",
  description:
    "Annuaire complet des hôpitaux, cliniques, EHPAD, centres de dialyse et maisons de santé en France. Trouvez un transporteur conventionné CPAM pour vous rendre dans chaque établissement.",
  alternates: { canonical: "/etablissements" },
};

// 13 regions metropolitaines. Le libelle doit correspondre EXACTEMENT a la valeur
// stockee dans DEPARTEMENTS_FR pour que le regroupement par departement fonctionne.
const REGIONS_METRO: { nom: string; slug: string }[] = [
  { nom: "Ile-de-France", slug: "ile-de-france" },
  { nom: "Auvergne-Rhone-Alpes", slug: "auvergne-rhone-alpes" },
  { nom: "Provence-Alpes-Cote d'Azur", slug: "provence-alpes-cote-d-azur" },
  { nom: "Occitanie", slug: "occitanie" },
  { nom: "Nouvelle-Aquitaine", slug: "nouvelle-aquitaine" },
  { nom: "Grand Est", slug: "grand-est" },
  { nom: "Hauts-de-France", slug: "hauts-de-france" },
  { nom: "Pays de la Loire", slug: "pays-de-la-loire" },
  { nom: "Bretagne", slug: "bretagne" },
  { nom: "Normandie", slug: "normandie" },
  { nom: "Bourgogne-Franche-Comte", slug: "bourgogne-franche-comte" },
  { nom: "Centre-Val de Loire", slug: "centre-val-de-loire" },
  { nom: "Corse", slug: "corse" },
];

export default async function EtablissementsHubPage() {
  const types = TYPES_ETABLISSEMENT;

  const [counts, total, perCategory, majeurs] = await Promise.all([
    countByCategorie(),
    getEtablissementsCount(),
    Promise.all(types.map((t) => fetchTopEtablissements([t.categorie], 20))),
    fetchTopEtablissements(["hopital", "clinique"], 50),
  ]);

  // Pool dedoublonne pour le regroupement par region (categories + majeurs).
  const pool = new Map<string, EtablissementPublic>();
  for (const list of perCategory) for (const e of list) pool.set(e.id, e);
  for (const e of majeurs) pool.set(e.id, e);

  const byRegion = new Map<string, EtablissementPublic[]>();
  for (const e of Array.from(pool.values())) {
    const info = e.departement ? getDepartementByCode(e.departement) : null;
    if (!info) continue;
    const arr = byRegion.get(info.region) ?? [];
    arr.push(e);
    byRegion.set(info.region, arr);
  }
  const regionsAvecEtabs = REGIONS_METRO.map((r) => ({
    ...r,
    etabs: (byRegion.get(r.nom) ?? [])
      .sort((a, b) => (b.capacite_lits ?? 0) - (a.capacite_lits ?? 0))
      .slice(0, 8),
  })).filter((r) => r.etabs.length > 0);

  const breadLd = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Annuaire des établissements", href: "/etablissements" },
  ]);

  // CollectionPage avec hasPart : declare les sous-collections par categorie.
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Annuaire des établissements de santé en France",
    description:
      "Annuaire des hôpitaux, cliniques, EHPAD, centres de dialyse et maisons de santé en France, avec accès au transport médical conventionné CPAM.",
    url: `${BASE_URL}/etablissements`,
    hasPart: types.map((t) => ({
      "@type": "CollectionPage",
      name: t.labelPluriel,
      url: `${BASE_URL}/etablissements/${t.slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(collectionLd) }}
      />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">
              Accueil
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Annuaire des établissements</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 max-w-4xl">
            Annuaire des établissements de santé en France — Transport médical
            conventionné CPAM
          </h1>
          <p className="text-blue-100 max-w-3xl">
            Hôpitaux, cliniques, EHPAD, centres de dialyse, maisons de santé et
            centres de réadaptation : retrouvez chaque établissement et organisez
            votre transport médical conventionné (ambulance, VSL, taxi
            conventionné CPAM).
          </p>
          {total > 0 && (
            <p className="text-sm text-blue-200 mt-4">
              {total.toLocaleString("fr-FR")} établissements référencés (données
              officielles FINESS).
            </p>
          )}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pt-8">
        <RechercheEtablissement placeholder="Rechercher un établissement par nom ou par ville..." />
      </section>

      {/* Intro mission (~100 mots) */}
      <section className="max-w-3xl mx-auto px-4 pt-10">
        <p className="text-gray-700 leading-relaxed">
          RoullePro aide chaque patient à trouver un transporteur sanitaire
          conventionné pour se rendre dans son établissement de soins. Que vous
          deviez vous rendre à une consultation hospitalière, à une séance de
          dialyse ou de chimiothérapie, dans une clinique, un EHPAD ou un centre
          de réadaptation, notre annuaire référence les établissements de santé
          de toute la France à partir des données officielles FINESS. Pour
          chaque établissement, vous accédez à une page dédiée qui vous met en
          relation avec les ambulances, VSL et taxis conventionnés CPAM de votre
          secteur. Le service est gratuit pour les patients, sans inscription ni
          avance de frais avec les professionnels conventionnés.
        </p>
      </section>

      {/* Statistiques par categorie */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Les établissements de santé en chiffres
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {types.map((t) => {
            const count = counts[t.categorie] ?? 0;
            return (
              <a
                key={t.slug}
                href={`#categorie-${t.slug}`}
                className="block bg-white border border-gray-200 rounded-xl p-4 transition hover:border-blue-200"
              >
                <div className="text-2xl font-bold text-[#0066CC]">
                  {count.toLocaleString("fr-FR")}
                </div>
                <div className="text-sm text-gray-600">{t.labelPluriel}</div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Par categorie : cartes + listes inline (top 20 par categorie) */}
      <section className="max-w-6xl mx-auto px-4 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Par catégorie</h2>
        <p className="text-gray-600 mb-6 max-w-3xl">
          Parcourez les principaux établissements de chaque catégorie ou ouvrez
          l&apos;annuaire complet de la catégorie.
        </p>
        <div className="space-y-10">
          {types.map((t, i) => {
            const liste = perCategory[i];
            const count = counts[t.categorie] ?? 0;
            if (liste.length === 0) return null;
            return (
              <div key={t.slug} id={`categorie-${t.slug}`} className="scroll-mt-24">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#0066CC]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {t.labelPluriel}
                      </h3>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </div>
                  </div>
                  <Link
                    href={`/etablissements/${t.slug}`}
                    className="text-sm text-[#0066CC] font-medium hover:underline whitespace-nowrap"
                  >
                    {count > 0
                      ? `Voir les ${count.toLocaleString("fr-FR")} →`
                      : "Voir tout →"}
                  </Link>
                </div>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {liste.map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/etablissements/${e.slug}`}
                        className="block text-sm text-gray-700 hover:text-[#0066CC] hover:underline truncate"
                      >
                        {nomEtablissement(e)}
                        {e.ville ? ` — ${e.ville}` : ""}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Par region : listes inline des plus gros etablissements */}
      {regionsAvecEtabs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Par région</h2>
          <p className="text-gray-600 mb-6 max-w-3xl">
            Les principaux établissements de chaque région française.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regionsAvecEtabs.map((r) => (
              <div
                key={r.slug}
                id={`region-${r.slug}`}
                className="scroll-mt-24 bg-white border border-gray-200 rounded-2xl p-5"
              >
                <h3 className="flex items-center gap-2 font-bold text-gray-900 mb-3">
                  <MapPin className="w-4 h-4 text-[#0066CC]" />
                  {r.nom}
                </h3>
                <ul className="space-y-1.5">
                  {r.etabs.map((e) => (
                    <li key={e.id}>
                      <Link
                        href={`/etablissements/${e.slug}`}
                        className="block text-sm text-gray-700 hover:text-[#0066CC] hover:underline truncate"
                      >
                        {nomEtablissement(e)}
                        {e.ville ? ` — ${e.ville}` : ""}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Etablissements majeurs : liens directs vers les fiches */}
      {majeurs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Établissements majeurs
          </h2>
          <p className="text-gray-600 mb-6 max-w-3xl">
            Les plus grands centres hospitaliers et cliniques de France (CHU,
            AP-HP, APHM, HCL…), classés par capacité d&apos;accueil.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {majeurs.map((e) => (
              <Link
                key={e.id}
                href={`/etablissements/${e.slug}`}
                className="flex items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 transition hover:border-blue-200"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Building2 className="w-4 h-4 text-[#0066CC] mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {nomEtablissement(e)}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {e.ville}
                      {e.departement ? ` (${e.departement})` : ""}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#0066CC] flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Pages thematiques par type x ville - Chantier E */}
      <ChantierETiles />

      {/* CTA etablissements */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <div className="bg-gradient-to-br from-[#0066CC] to-[#0f1d3a] text-white rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-xl bg-white/10 items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">
                Vous êtes un établissement de santé ?
              </h2>
              <p className="text-blue-100 max-w-2xl mb-4">
                Médecins, hôpitaux, cliniques et EHPAD : orientez vos patients
                vers des transporteurs conventionnés et fiabilisez vos sorties.
                Découvrez l&apos;espace prescripteurs ou signalez une correction
                sur une fiche établissement.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/prescripteurs"
                  className="inline-flex items-center gap-2 bg-white text-[#0066CC] font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                  Espace prescripteurs
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/signaler"
                  className="inline-flex items-center gap-2 bg-white/10 text-white font-medium px-4 py-2 rounded-lg hover:bg-white/20 transition"
                >
                  Signaler une fiche
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinessFooter />
    </main>
  );
}
