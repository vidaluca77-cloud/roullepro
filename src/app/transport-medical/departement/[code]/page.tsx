import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ChevronRight, MapPin, Cross, Car, Users } from "lucide-react";
import { getDepartementByCode } from "@/lib/departements-fr";
import { CATEGORIES_SANITAIRE } from "@/lib/sanitaire-data";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/sanitaire-seo";

export const revalidate = 3600;

type Props = {
  params: Promise<{ code: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

type VilleStat = {
  ville: string;
  ville_slug: string;
  nb: number;
};

type CountByCat = {
  ambulance: number;
  vsl: number;
  taxi_conventionne: number;
  total: number;
};

async function fetchDepartementData(code: string): Promise<{
  villes: VilleStat[];
  counts: CountByCat;
} | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Recupere toutes les fiches actives du departement
  const { data: pros, error } = await supabase
    .from("pros_sanitaire")
    .select("ville, ville_slug, categorie")
    .eq("actif", true)
    .eq("departement", code)
    .limit(10000);

  if (error || !pros || pros.length === 0) return null;

  // Agregation par ville
  const villesMap = new Map<string, VilleStat>();
  const counts: CountByCat = { ambulance: 0, vsl: 0, taxi_conventionne: 0, total: 0 };

  for (const p of pros as Array<{ ville: string; ville_slug: string; categorie: string }>) {
    if (!p.ville_slug) continue;
    const cur = villesMap.get(p.ville_slug);
    if (cur) cur.nb += 1;
    else villesMap.set(p.ville_slug, { ville: p.ville, ville_slug: p.ville_slug, nb: 1 });
    counts.total += 1;
    if (p.categorie === "ambulance") counts.ambulance += 1;
    else if (p.categorie === "vsl") counts.vsl += 1;
    else if (p.categorie === "taxi_conventionne") counts.taxi_conventionne += 1;
  }

  const villes = Array.from(villesMap.values()).sort((a, b) => b.nb - a.nb);
  return { villes, counts };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const dep = getDepartementByCode(code);
  if (!dep) return { title: "Departement introuvable" };
  const data = await fetchDepartementData(dep.code);
  const total = data?.counts.total || 0;
  const titre = `Transport medical ${dep.nom} (${dep.code}) — Ambulances, VSL et taxis conventionnes`;
  const description = `Annuaire complet des transports sanitaires dans le ${dep.nom} (${dep.code}) : ${total > 0 ? total + " professionnels" : "ambulances, VSL et taxis"} agrees ARS et conventionnes CPAM. Recherche par ville, telephone direct.`;
  return {
    title: titre,
    description,
    alternates: { canonical: `/transport-medical/departement/${dep.code}` },
    openGraph: {
      title: titre,
      description,
      type: "website",
      locale: "fr_FR",
    },
    twitter: { card: "summary_large_image", title: titre, description },
  };
}

export default async function DepartementPage({ params }: Props) {
  const { code } = await params;
  const dep = getDepartementByCode(code);
  if (!dep) notFound();

  const data = await fetchDepartementData(dep.code);
  if (!data || data.villes.length === 0) {
    // Page existe mais aucune fiche : on rend quand meme avec un message
  }

  const villes = data?.villes || [];
  const counts = data?.counts || { ambulance: 0, vsl: 0, taxi_conventionne: 0, total: 0 };

  const breadLd = buildBreadcrumbJsonLd([
    { name: "Annuaire", url: "/transport-medical" },
    { name: `Departement ${dep.nom} (${dep.code})`, url: `/transport-medical/departement/${dep.code}` },
  ]);

  const faqs = [
    {
      question: `Combien y a-t-il de societes de transport sanitaire dans le ${dep.nom} ?`,
      answer: `${counts.total} professionnels du transport sanitaire sont referencies dans le departement ${dep.code} (${dep.nom}) : ${counts.ambulance} societes d'ambulances, ${counts.vsl} VSL et ${counts.taxi_conventionne} taxis conventionnes CPAM.`,
    },
    {
      question: `Comment trouver une ambulance dans le ${dep.nom} ?`,
      answer: `Selectionnez votre commune dans la liste ci-dessous pour acceder aux ambulances, VSL et taxis conventionnes les plus proches. Tous les professionnels sont agrees par l'Agence Regionale de Sante (ARS) ${dep.region}.`,
    },
    {
      question: `Le transport est-il rembourse dans le ${dep.nom} ?`,
      answer: `Oui. Le transport sanitaire (ambulance, VSL, taxi conventionne) prescrit par un medecin est rembourse par la Securite sociale a 65 % du tarif conventionne, ou 100 % en cas d'ALD, maternite ou hospitalisation. La CPAM ${dep.code} applique le tiers payant aux transports conventionnes.`,
    },
    {
      question: `Quelle est la prefecture du ${dep.nom} ?`,
      answer: `La prefecture du departement ${dep.code} (${dep.nom}) est ${dep.prefecture}, en region ${dep.region}.`,
    },
  ];
  const faqLd = buildFaqJsonLd(faqs);

  // ItemList JSON-LD pour les villes
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Villes du ${dep.nom} avec transport sanitaire`,
    itemListElement: villes.slice(0, 100).map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: v.ville,
      url: `${BASE_URL}/transport-medical/${v.ville_slug}`,
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      {villes.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      )}

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
            <Link href="/transport-medical" className="hover:text-white">Annuaire</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{dep.nom} ({dep.code})</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Transport sanitaire dans le {dep.nom} ({dep.code})
          </h1>
          <p className="text-blue-100 max-w-3xl">
            Annuaire des ambulances, VSL et taxis conventionnes du departement {dep.code}, en region {dep.region}. Prefecture : {dep.prefecture}.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <Cross className="w-4 h-4" /> {counts.ambulance} ambulances
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <Car className="w-4 h-4" /> {counts.vsl} VSL
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <Users className="w-4 h-4" /> {counts.taxi_conventionne} taxis conventionnes
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">A propos du transport sanitaire dans le {dep.nom}</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              Le departement du {dep.nom} ({dep.code}) compte {counts.total} professionnels du transport sanitaire reference sur RoullePro :
              {" "}{counts.ambulance} societes d'ambulances, {counts.vsl} Vehicules Sanitaires Legers (VSL) et {counts.taxi_conventionne} taxis
              conventionnes par la CPAM. Tous sont agrees par l'Agence Regionale de Sante {dep.region} et exercent dans le respect du cadre reglementaire
              du Code de la sante publique.
            </p>
            <p>
              Le transport sanitaire prescrit par un medecin est pris en charge par l'Assurance maladie a 65 % du tarif conventionne, et a 100 %
              en cas d'Affection Longue Duree (ALD), de maternite, d'accident du travail ou de soins lies a une hospitalisation.
              Le tiers payant est applique : le patient n'avance pas les frais. Une franchise medicale de 4 euros par trajet (plafonnee a 8 euros par jour
              et 50 euros par an) reste a la charge du patient.
            </p>
            <p>
              <strong>Ambulance</strong> : transport medicalise allonge, equipage compose d'un Diplome d'Etat d'Ambulancier et d'un auxiliaire,
              vehicule equipe d'oxygene, d'un brancard et d'un defibrillateur.
              <strong> VSL</strong> : transport assis pour patients en etat stable (dialyse, chimiotherapie, consultations), jusqu'a 3 patients par vehicule.
              <strong> Taxi conventionne CPAM</strong> : transport assis pour soins programmes, conventionnement signe avec la caisse departementale.
            </p>
          </div>
        </article>

        {villes.length > 0 ? (
          <article className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Villes du {dep.nom} avec transport sanitaire
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {villes.length} communes referencees. Cliquez pour acceder aux professionnels.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {villes.map((v) => (
                <Link
                  key={v.ville_slug}
                  href={`/transport-medical/${v.ville_slug}`}
                  className="flex items-center justify-between gap-2 bg-gray-50 hover:bg-blue-50 hover:text-[#0066CC] text-gray-800 text-sm px-4 py-2.5 rounded-lg transition border border-gray-100"
                >
                  <span className="flex items-center gap-2 min-w-0 truncate">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{v.ville}</span>
                  </span>
                  <span className="text-xs text-gray-500 flex-shrink-0">{v.nb}</span>
                </Link>
              ))}
            </div>
          </article>
        ) : (
          <article className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aucune fiche referencee dans ce departement</h2>
            <p className="text-sm text-gray-600">
              Aucun professionnel du transport sanitaire n'est encore reference dans le {dep.nom} sur RoullePro. Si vous etes
              ambulancier, exploitant VSL ou taxi conventionne dans ce departement,{" "}
              <Link href="/transport-medical/inscription" className="text-[#0066CC] underline">inscrivez votre entreprise gratuitement</Link>.
            </p>
          </article>
        )}

        <article className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Categories de transport sanitaire</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {CATEGORIES_SANITAIRE.map((cat) => (
              <div key={cat.slug} className="border border-gray-200 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-1">{cat.labelPluriel}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Questions frequentes — {dep.nom}</h2>
          <div className="space-y-4">
            {faqs.map((q, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-1">{q.question}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
