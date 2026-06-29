/**
 * Hub regional SEO : /transport-medical/region/[slug]
 * 18 regions (13 metropole + 5 DOM) generees statiquement.
 *
 * Cible les requetes generiques regionales :
 *  - "ambulance bretagne" / "vsl normandie" / "taxi conventionne ile-de-france"
 *  - Concentre le jus SEO des departements et villes de la region.
 *
 * Strategie : aggregation par departement, top villes, FAQ regionale, schema.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  ChevronRight,
  MapPin,
  Cross,
  Car,
  Users,
  BadgeCheck,
} from "lucide-react";
import {
  CATEGORIES_SANITAIRE,
  REGIONS_FR_SEO,
  getRegionBySlug,
} from "@/lib/sanitaire-data";
import { getDepartementByCode } from "@/lib/departements-fr";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/sanitaire-seo";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

type DepStat = {
  code: string;
  nom: string;
  prefecture: string;
  nb: number;
  ambulance: number;
  vsl: number;
  taxi: number;
};

type VilleStat = {
  ville: string;
  ville_slug: string;
  departement: string;
  nb: number;
};

async function fetchRegionData(regionSlug: string): Promise<{
  departements: DepStat[];
  topVilles: VilleStat[];
  totals: { total: number; ambulance: number; vsl: number; taxi: number };
} | null> {
  const region = getRegionBySlug(regionSlug);
  if (!region) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: pros, error } = await supabase
    .from("pros_sanitaire_public")
    .select("ville, ville_slug, categorie, departement")
    .eq("actif", true)
    .eq("suspendu", false)
    .in("departement", region.departements)
    .limit(10000);

  if (error || !pros) return null;

  const depMap = new Map<string, DepStat>();
  const villeMap = new Map<string, VilleStat>();
  const totals = { total: 0, ambulance: 0, vsl: 0, taxi: 0 };

  // Pre-init departements pour afficher meme ceux sans fiche
  for (const dep of region.departements) {
    const d = getDepartementByCode(dep);
    if (d) {
      depMap.set(dep, {
        code: dep,
        nom: d.nom,
        prefecture: d.prefecture,
        nb: 0,
        ambulance: 0,
        vsl: 0,
        taxi: 0,
      });
    }
  }

  for (const p of pros as Array<{
    ville: string;
    ville_slug: string;
    categorie: string;
    departement: string;
  }>) {
    if (!p.ville_slug) continue;
    const d = depMap.get(p.departement);
    if (d) {
      d.nb += 1;
      if (p.categorie === "ambulance") d.ambulance += 1;
      else if (p.categorie === "vsl") d.vsl += 1;
      else if (p.categorie === "taxi_conventionne") d.taxi += 1;
    }
    totals.total += 1;
    if (p.categorie === "ambulance") totals.ambulance += 1;
    else if (p.categorie === "vsl") totals.vsl += 1;
    else if (p.categorie === "taxi_conventionne") totals.taxi += 1;

    const cur = villeMap.get(p.ville_slug);
    if (cur) cur.nb += 1;
    else
      villeMap.set(p.ville_slug, {
        ville: p.ville,
        ville_slug: p.ville_slug,
        departement: p.departement,
        nb: 1,
      });
  }

  const departements = Array.from(depMap.values()).sort((a, b) =>
    a.code.localeCompare(b.code),
  );
  const topVilles = Array.from(villeMap.values())
    .sort((a, b) => b.nb - a.nb)
    .slice(0, 40);

  return { departements, topVilles, totals };
}

export async function generateStaticParams() {
  return REGIONS_FR_SEO.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) return { title: "Region introuvable" };

  const data = await fetchRegionData(slug);
  const total = data?.totals.total || 0;

  const title = `Transport sanitaire ${region.nom} — Ambulances, VSL et taxis conventionnes`;
  const description = `${total > 0 ? total + " professionnels du transport sanitaire" : "Annuaire complet des ambulances, VSL et taxis conventionnes"} en region ${region.nom} : agrees ARS, conventionnes CPAM, telephone direct. Annuaire RoullePro.`;

  return {
    title,
    description,
    alternates: { canonical: `/transport-medical/region/${region.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      url: `${BASE_URL}/transport-medical/region/${region.slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params;
  const region = getRegionBySlug(slug);
  if (!region) notFound();

  const data = await fetchRegionData(slug);
  const departements = data?.departements || [];
  const topVilles = data?.topVilles || [];
  const totals = data?.totals || { total: 0, ambulance: 0, vsl: 0, taxi: 0 };

  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport medical", url: "/transport-medical" },
    { name: region.nom, url: `/transport-medical/region/${region.slug}` },
  ]);

  const faqs = [
    {
      question: `Combien y a-t-il de societes de transport sanitaire en ${region.nom} ?`,
      answer: `${totals.total} professionnels du transport sanitaire sont referenced en region ${region.nom} sur RoullePro : ${totals.ambulance} societes d'ambulances, ${totals.vsl} VSL et ${totals.taxi} taxis conventionnes CPAM, repartis sur ${region.departements.length} departements.`,
    },
    {
      question: `Comment trouver une ambulance ou un VSL en ${region.nom} ?`,
      answer: `Selectionnez votre departement ou directement votre ville dans la liste ci-dessous. Chaque fiche affiche le telephone direct, l'adresse et le statut de conventionnement CPAM. Pour une urgence vitale, composez le 15 (SAMU).`,
    },
    {
      question: `Quels sont les departements couverts par la region ${region.nom} ?`,
      answer: `La region ${region.nom} regroupe ${region.departements.length} departement${region.departements.length > 1 ? "s" : ""} : ${region.departements
        .map((c) => {
          const d = getDepartementByCode(c);
          return d ? `${d.nom} (${c})` : c;
        })
        .join(", ")}.`,
    },
    {
      question: `Le transport sanitaire est-il rembourse en ${region.nom} ?`,
      answer: `Oui, dans toute la France. Sur prescription medicale, le transport en ambulance, VSL ou taxi conventionne est rembourse par la Securite sociale a 55 % du tarif conventionne, ou 100 % en cas d'ALD, hospitalisation, maternite ou accident du travail. Le tiers payant est applique par les transporteurs conventionnes.`,
    },
    {
      question: `Comment savoir si un transporteur est agree ARS en ${region.nom} ?`,
      answer: `Toutes les ambulances et VSL de RoullePro sont verifiees agreees par l'Agence Regionale de Sante ${region.nom}. Les taxis conventionnes sont verifies aupres de la CPAM departementale. Le badge "Pro verifie" en bleu indique une fiche dont les justificatifs ont ete controles par notre equipe.`,
    },
  ];
  const faqLd = buildFaqJsonLd(faqs);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Departements de ${region.nom} avec transport sanitaire`,
    itemListElement: departements.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${d.nom} (${d.code})`,
      url: `${BASE_URL}/transport-medical/departement/${d.code}`,
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {departements.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
            <Link href="/transport-medical" className="hover:text-white">
              Annuaire
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{region.nom}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Transport sanitaire en {region.nom}
          </h1>
          <p className="text-blue-100 max-w-3xl">
            Annuaire des ambulances, VSL et taxis conventionnes CPAM de la
            region {region.nom}. {region.departements.length} departement
            {region.departements.length > 1 ? "s" : ""} couvert
            {region.departements.length > 1 ? "s" : ""}.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <Cross className="w-4 h-4" /> {totals.ambulance} ambulances
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <Car className="w-4 h-4" /> {totals.vsl} VSL
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <Users className="w-4 h-4" /> {totals.taxi} taxis conventionnes
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <BadgeCheck className="w-4 h-4" /> Agrees ARS {region.nom}
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Transport sanitaire en {region.nom} — Vue d&apos;ensemble
          </h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              La region {region.nom} regroupe {region.departements.length}{" "}
              departement{region.departements.length > 1 ? "s" : ""} et
              compte {totals.total} professionnels du transport sanitaire
              referenced sur RoullePro. L&apos;Agence Regionale de Sante
              (ARS) {region.nom} delivre les agrements aux societes
              d&apos;ambulances et VSL, tandis que les CPAM departementales
              gerent les conventions avec les taxis et VSL.
            </p>
            <p>
              Le transport sanitaire prescrit par un medecin est pris en
              charge par l&apos;Assurance maladie : 55 % en regime general,
              100 % pour les patients en ALD (Affection Longue Duree),
              maternite, hospitalisation ou accident du travail. Le tiers
              payant est applique : aucun frais a avancer. Une franchise
              forfaitaire de 4 euros par trajet (plafonnee 8 euros/jour, 50
              euros/an) reste a la charge du patient (sauf exemptions).
            </p>
            <p>
              <strong>Ambulance</strong> : transport medicalise allonge,
              equipage DEA + auxiliaire, materiel de reanimation a bord.
              <strong> VSL</strong> : transport assis pour patients stables,
              jusqu&apos;a 3 par vehicule.
              <strong> Taxi conventionne CPAM</strong> : transport assis sur
              prescription, tiers payant CPAM.
            </p>
          </div>
        </article>

        {departements.length > 0 && (
          <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Departements de {region.nom}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cliquez sur un departement pour acceder a son annuaire complet
              (ambulances, VSL, taxis conventionnes).
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {departements.map((d) => (
                <Link
                  key={d.code}
                  href={`/transport-medical/departement/${d.code}`}
                  className="block bg-gray-50 hover:bg-blue-50 hover:border-[#0066CC] text-gray-800 px-4 py-3 rounded-lg transition border border-gray-100"
                >
                  <div className="font-semibold text-gray-900 mb-0.5">
                    {d.nom} ({d.code})
                  </div>
                  <div className="text-xs text-gray-500 mb-1">
                    Prefecture : {d.prefecture}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span>{d.ambulance} ambulances</span>
                    <span>·</span>
                    <span>{d.vsl} VSL</span>
                    <span>·</span>
                    <span>{d.taxi} taxis</span>
                  </div>
                </Link>
              ))}
            </div>
          </article>
        )}

        {topVilles.length > 0 && (
          <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Top villes de {region.nom}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {topVilles.length} principales villes referenced de la region.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {topVilles.map((v) => (
                <Link
                  key={v.ville_slug}
                  href={`/transport-medical/${v.ville_slug}`}
                  className="flex items-center justify-between gap-2 bg-gray-50 hover:bg-blue-50 hover:text-[#0066CC] text-gray-800 text-sm px-4 py-2.5 rounded-lg transition border border-gray-100"
                >
                  <span className="flex items-center gap-2 min-w-0 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{v.ville}</span>
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {v.nb}
                  </span>
                </Link>
              ))}
            </div>
          </article>
        )}

        <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Categories de transport sanitaire
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {CATEGORIES_SANITAIRE.map((c) => (
              <Link
                key={c.slug}
                href={`/transport-medical/categorie/${c.slug}`}
                className="border border-gray-200 hover:border-[#0066CC] hover:bg-blue-50 rounded-xl p-4 transition"
              >
                <div className="font-semibold text-gray-900 mb-1">
                  {c.labelPluriel}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {c.description}
                </p>
              </Link>
            ))}
          </div>
        </article>

        <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Questions frequentes — {region.nom}
          </h2>
          <div className="space-y-4">
            {faqs.map((q, i) => (
              <details
                key={i}
                className="group rounded-xl border border-gray-200 hover:border-blue-200 transition open:border-blue-300 open:bg-blue-50/30"
              >
                <summary className="flex items-start justify-between gap-3 cursor-pointer list-none px-4 py-3 select-none">
                  <h3 className="text-base font-semibold text-gray-900 leading-snug group-open:text-blue-700">
                    {q.question}
                  </h3>
                  <ChevronRight className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400 transition-transform group-open:rotate-90 group-open:text-blue-600" />
                </summary>
                <div className="px-4 pb-4 pt-0 text-sm text-gray-700 leading-relaxed border-l-2 border-blue-100 ml-4">
                  {q.answer}
                </div>
              </details>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
