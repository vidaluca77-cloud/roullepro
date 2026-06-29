/**
 * Hub national par categorie : /transport-medical/categorie/[slug]
 * Slugs supportes : "ambulance", "vsl", "taxi-conventionne".
 *
 * Cible les requetes generiques fort volume :
 *  - "ambulance" (522 imp/mois)
 *  - "vsl" (143 imp/mois)
 *  - "taxis conventionnes" (49 imp/mois)
 *  - + variantes geo "ambulance autour de moi", "ambulance + ville"
 *
 * Strategie SEO : page nationale longue, top villes par categorie, FAQ riche,
 * ItemList JSON-LD, schema Service, maillage vers les hubs /transport-medical/[ville]/[categorie].
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
  ShieldCheck,
  Phone,
  BadgeCheck,
} from "lucide-react";
import {
  CATEGORIES_SANITAIRE,
  getCategorieBySlug,
  REGIONS_FR_SEO,
} from "@/lib/sanitaire-data";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/sanitaire-seo";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

type VilleAgg = {
  ville: string;
  ville_slug: string;
  departement: string;
  nb: number;
};

async function fetchCategorieData(catKey: string): Promise<{
  villes: VilleAgg[];
  totalPros: number;
  departementsCount: number;
} | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Cap a 10000 lignes (la categorie la plus dense, taxi-conventionne, a ~50k
  // fiches en base mais on n'utilise que la liste des villes uniques en SSR).
  const { data: pros, error } = await supabase
    .from("pros_sanitaire_public")
    .select("ville, ville_slug, departement")
    .eq("actif", true)
    .eq("suspendu", false)
    .eq("categorie", catKey)
    .limit(10000);

  if (error || !pros || pros.length === 0) return null;

  const villesMap = new Map<string, VilleAgg>();
  const departementsSet = new Set<string>();

  for (const p of pros as Array<{
    ville: string;
    ville_slug: string;
    departement: string;
  }>) {
    if (!p.ville_slug) continue;
    departementsSet.add(p.departement);
    const cur = villesMap.get(p.ville_slug);
    if (cur) cur.nb += 1;
    else
      villesMap.set(p.ville_slug, {
        ville: p.ville,
        ville_slug: p.ville_slug,
        departement: p.departement,
        nb: 1,
      });
  }

  const villes = Array.from(villesMap.values()).sort((a, b) => b.nb - a.nb);
  return {
    villes,
    totalPros: pros.length,
    departementsCount: departementsSet.size,
  };
}

export async function generateStaticParams() {
  return CATEGORIES_SANITAIRE.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategorieBySlug(slug);
  if (!cat) return { title: "Categorie introuvable" };

  const data = await fetchCategorieData(cat.key);
  const total = data?.totalPros || 0;

  // Titles optimises par categorie pour cibler les KW genriques GSC
  const titles: Record<string, string> = {
    ambulance: `Ambulance proche de moi — Annuaire national des ambulances agreees ARS`,
    vsl: `VSL conventionne CPAM — Annuaire national des VSL en France`,
    "taxi-conventionne": `Taxi conventionne CPAM — Annuaire national des taxis conventionnes`,
  };
  const descriptions: Record<string, string> = {
    ambulance: `Trouvez une ambulance pres de chez vous : ${total > 0 ? total + " ambulances agreees ARS" : "annuaire complet"}, telephone direct, tiers payant CPAM. Transport medicalise allonge en France entiere.`,
    vsl: `Annuaire des VSL (Vehicules Sanitaires Legers) conventionnes CPAM : ${total > 0 ? total + " VSL referenced" : "transport assis"} pour dialyse, chimiotherapie, consultations. Remboursement Securite sociale.`,
    "taxi-conventionne": `Taxis conventionnes CPAM en France : ${total > 0 ? total + " taxis conventionnes" : "tiers payant CPAM"}, transport assis pour soins programmes. Annuaire national, telephone direct.`,
  };

  const title = titles[cat.slug] || `${cat.labelPluriel} — Annuaire national`;
  const description = descriptions[cat.slug] || cat.description;

  return {
    title,
    description,
    alternates: { canonical: `/transport-medical/categorie/${cat.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "fr_FR",
      url: `${BASE_URL}/transport-medical/categorie/${cat.slug}`,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function H1({ cat }: { cat: ReturnType<typeof getCategorieBySlug> }) {
  if (!cat) return null;
  const h1Map: Record<string, string> = {
    ambulance: "Ambulance pres de moi — Annuaire national",
    vsl: "VSL conventionne CPAM — Annuaire national",
    "taxi-conventionne": "Taxi conventionne CPAM — Annuaire national",
  };
  return (
    <h1 className="text-3xl sm:text-4xl font-bold mb-3">
      {h1Map[cat.slug] || `${cat.labelPluriel} en France`}
    </h1>
  );
}

function getCategorieFaqs(cat: ReturnType<typeof getCategorieBySlug>) {
  if (!cat) return [];
  if (cat.key === "ambulance") {
    return [
      {
        question: "Comment trouver une ambulance pres de chez moi ?",
        answer:
          "Selectionnez votre ville ci-dessous pour voir la liste des ambulances agreees ARS de votre secteur. Chaque fiche affiche le telephone direct, l'adresse et le statut de conventionnement CPAM. En cas d'urgence vitale composez le 15 (SAMU), pour un transport programme appelez directement la societe d'ambulance.",
      },
      {
        question:
          "Quelle est la difference entre une ambulance et un VSL ?",
        answer:
          "L'ambulance est un transport medicalise allonge realise par un equipage de deux personnes dont au moins un Diplome d'Etat d'Ambulancier (DEA). Le vehicule est equipe d'oxygene, brancard, defibrillateur. Le VSL (Vehicule Sanitaire Leger) est un transport assis pour patients stables, jusqu'a 3 patients par trajet, conduit par un auxiliaire ambulancier.",
      },
      {
        question: "Le transport en ambulance est-il rembourse ?",
        answer:
          "Oui. Sur prescription medicale, le transport en ambulance est rembourse a 55 % par la Securite sociale, et a 100 % en cas d'ALD (Affection Longue Duree), maternite, accident du travail ou hospitalisation. Le tiers payant est applique : vous n'avancez pas les frais. Une participation forfaitaire de 4 euros par trajet (plafonnee 8 euros/jour, 50 euros/an) reste a votre charge.",
      },
      {
        question:
          "Comment savoir si une ambulance est agreee par l'ARS et la CPAM ?",
        answer:
          "Toutes les ambulances de RoullePro sont verifiees agreees par leur Agence Regionale de Sante (numero d'agrement ARS) et conventionnees avec la CPAM departementale. Le badge \"Pro verifie\" en bleu indique une fiche dont les justificatifs ont ete controles par notre equipe.",
      },
      {
        question:
          "Combien coute une course en ambulance conventionnee ?",
        answer:
          "Les tarifs sont fixes par la convention nationale (arrete 23 decembre 2014, revaloration annuelle). Un trajet local comprend une prise en charge forfaitaire (~60 EUR) + un tarif kilometrique. Sur prescription, vous ne payez que la participation forfaitaire de 4 euros. Hors prescription, la course suit le tarif libre.",
      },
      {
        question:
          "Faut-il une prescription medicale pour un transport en ambulance ?",
        answer:
          "Oui, pour beneficier du remboursement Securite sociale, la prescription medicale de transport (cerfa 11574) est obligatoire et doit etre etablie par votre medecin AVANT le transport (sauf urgence). Le medecin choisit le mode de transport adapte : ambulance, VSL ou taxi conventionne selon votre etat.",
      },
    ];
  }
  if (cat.key === "vsl") {
    return [
      {
        question: "Qu'est-ce qu'un VSL conventionne CPAM ?",
        answer:
          "Le VSL (Vehicule Sanitaire Leger) est un transport assis professionnel pour patients en etat stable, dont l'etat de sante necessite une assistance mais pas une ambulance. Conduit par un auxiliaire ambulancier, le VSL transporte jusqu'a 3 patients par trajet. Il est obligatoirement conventionne avec la CPAM pour donner droit au remboursement Securite sociale.",
      },
      {
        question:
          "Quelle est la difference entre un VSL et un taxi conventionne ?",
        answer:
          "Le VSL est un vehicule sanitaire dedie, conduit par un auxiliaire ambulancier ayant suivi une formation dediee, avec equipement specifique (siege adapte, vitres teintees, signaletique). Le taxi conventionne est un taxi classique (licence ADS) qui signe une convention avec la CPAM pour appliquer le tiers payant. Les tarifs sont differents : tarif national pour le VSL, tarif local prefectoral pour le taxi.",
      },
      {
        question:
          "Dans quels cas le medecin prescrit-il un VSL plutot qu'une ambulance ?",
        answer:
          "Le VSL est prescrit pour les patients qui peuvent voyager assis sans assistance medicale : dialyse, chimiotherapie ambulatoire, radiotherapie, consultations specialisees, hospitalisation programmee. L'ambulance est reservee aux patients qui doivent etre transportes allonges ou necessitent une surveillance medicale.",
      },
      {
        question: "Le transport en VSL est-il pris en charge a 100 % ?",
        answer:
          "Le remboursement de base est de 55 %, sauf : ALD (100 %), maternite (100 %), accident du travail (100 %), hospitalisation (100 %), enfant infirme (100 %). En tiers payant, vous n'avancez pas les frais. Une franchise de 4 euros par trajet s'applique (sauf exemptions : ALD, AME, ACS, AME).",
      },
      {
        question:
          "Comment commander un VSL pour une dialyse ou chimiotherapie ?",
        answer:
          "Appelez directement le VSL de votre choix sur RoullePro (telephone visible sur chaque fiche) ou demandez a votre infirmier(e) coordinateur(trice) de l'hopital. Pour les trajets reguliers (dialyse 3x/semaine, chimiotherapie hebdomadaire), demandez a votre medecin une prescription de transport en serie qui couvrira tous vos trajets pendant 6 mois.",
      },
      {
        question: "Combien y a-t-il de VSL en France ?",
        answer:
          "La France compte environ 15 000 vehicules sanitaires legers conventionnes CPAM, repartis sur 5 000 societes de transport sanitaire. RoullePro recense les VSL actifs commune par commune avec leur telephone direct.",
      },
    ];
  }
  // taxi-conventionne
  return [
    {
      question: "Qu'est-ce qu'un taxi conventionne CPAM ?",
      answer:
        "Un taxi conventionne CPAM est un taxi (titulaire d'une licence ADS) qui a signe une convention avec la Caisse Primaire d'Assurance Maladie de son departement. Il peut transporter des patients sur prescription medicale en appliquant le tiers payant : vous n'avancez pas les frais, le taxi est paye directement par la CPAM.",
    },
    {
      question:
        "Comment trouver un taxi conventionne pres de chez moi ?",
      answer:
        "Selectionnez votre ville dans la liste ci-dessous. Chaque fiche taxi conventionne affiche le numero ADS, le telephone direct, la commune de stationnement et le departement de conventionnement CPAM. Tous les taxis sont verifies actifs.",
    },
    {
      question:
        "Quelle est la difference entre un taxi conventionne et un taxi classique ?",
      answer:
        "Le taxi classique facture au tarif prefectoral (compteur). Le taxi conventionne applique en plus une remise tarifaire negociee avec la CPAM (variable selon le departement, generalement 5 a 25 %) et pratique le tiers payant. Tous les taxis conventionnes sont d'abord des taxis classiques : ils peuvent egalement effectuer des courses non medicales au tarif normal.",
    },
    {
      question:
        "Faut-il une prescription medicale pour un taxi conventionne ?",
      answer:
        "Oui. Le taxi conventionne ne peut effectuer un transport rembourse que sur prescription medicale (cerfa 11574) etablie par votre medecin. La prescription precise le mode de transport (taxi/VSL/ambulance) et le motif medical. Sans prescription, la course est facturee au tarif libre prefectoral.",
    },
    {
      question:
        "Le taxi conventionne est-il toujours moins cher qu'un VSL ?",
      answer:
        "Pas necessairement. Les tarifs taxi conventionne sont fixes par convention departementale (CPAM 13, CPAM 75...) et varient. Le VSL applique le tarif national fixe par arrete. Sur de longues distances, le VSL est souvent moins cher ; sur des courses courtes en ville, le taxi conventionne peut etre plus rapide et avantageux. Votre medecin choisit le mode adapte.",
    },
    {
      question: "Combien y a-t-il de taxis conventionnes en France ?",
      answer:
        "Environ 50 000 taxis sont conventionnes CPAM en France metropolitaine et DOM. C'est le premier mode de transport sanitaire en volume devant les ambulances et les VSL. RoullePro recense les taxis conventionnes actifs commune par commune.",
    },
  ];
}

export default async function CategorieNationalePage({ params }: Props) {
  const { slug } = await params;
  const cat = getCategorieBySlug(slug);
  if (!cat) notFound();

  const data = await fetchCategorieData(cat.key);
  const villes = data?.villes || [];
  const totalPros = data?.totalPros || 0;
  const departementsCount = data?.departementsCount || 0;

  const topVilles = villes.slice(0, 60);

  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport medical", url: "/transport-medical" },
    {
      name: cat.labelPluriel,
      url: `/transport-medical/categorie/${cat.slug}`,
    },
  ]);

  const faqs = getCategorieFaqs(cat);
  const faqLd = buildFaqJsonLd(faqs);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cat.labelPluriel} en France — Top ${topVilles.length} villes`,
    itemListElement: topVilles.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${cat.label} ${v.ville}`,
      url: `${BASE_URL}/transport-medical/${v.ville_slug}/${cat.slug}`,
    })),
  };

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: cat.label,
    provider: { "@type": "Organization", name: "RoullePro" },
    areaServed: { "@type": "Country", name: "France" },
    description: cat.description,
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
      {topVilles.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
            <Link href="/transport-medical" className="hover:text-white">
              Annuaire
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{cat.labelPluriel}</span>
          </nav>
          <H1 cat={cat} />
          <p className="text-blue-100 max-w-3xl text-lg">
            {cat.description}
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <BadgeCheck className="w-4 h-4" /> {totalPros} {cat.labelPluriel}
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <MapPin className="w-4 h-4" /> {departementsCount} departements
              couverts
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <ShieldCheck className="w-4 h-4" /> Conventionnes CPAM
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Tout savoir sur {cat.labelPluriel.toLowerCase()} en France
          </h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            {cat.key === "ambulance" && (
              <>
                <p>
                  Une ambulance est un vehicule de transport sanitaire
                  medicalise, equipe d'oxygene, d'un brancard, d'un
                  defibrillateur et d'un equipage compose d'au moins un
                  Diplome d'Etat d'Ambulancier (DEA) et d'un auxiliaire
                  ambulancier. Toutes les societes d'ambulances sont
                  agreees par l'Agence Regionale de Sante (ARS) de leur
                  region et conventionnees avec la CPAM departementale.
                </p>
                <p>
                  Le transport en ambulance est prescrit par votre medecin
                  lorsque votre etat necessite un transport allonge ou une
                  surveillance medicale : sortie d'hospitalisation, transfert
                  inter-etablissement, urgence non vitale, retour a domicile
                  apres intervention. En cas d'urgence vitale, composez le
                  15 (SAMU) qui mobilisera le SMUR ou une ambulance privee
                  selon la gravite.
                </p>
                <p>
                  Sur prescription, le remboursement est de 55 % par la
                  Securite sociale, et 100 % en cas d'ALD, hospitalisation,
                  maternite ou accident du travail. Le tiers payant est
                  obligatoire pour toute ambulance conventionnee : vous
                  n'avancez pas les frais.
                </p>
              </>
            )}
            {cat.key === "vsl" && (
              <>
                <p>
                  Le VSL (Vehicule Sanitaire Leger) est un transport assis
                  professionnel pour les patients en etat stable qui ne
                  necessitent ni ambulance ni assistance medicale pendant
                  le trajet. Conduit par un auxiliaire ambulancier ayant
                  suivi une formation specifique de 70 heures, le VSL peut
                  transporter jusqu'a 3 patients par trajet.
                </p>
                <p>
                  Le VSL est prescrit pour les transports reguliers vers
                  des soins ambulatoires : dialyse (3 fois par semaine),
                  chimiotherapie, radiotherapie, consultations specialisees,
                  reeducation. Le vehicule comporte un siege adapte,
                  vitres teintees et signaletique reglementaire ARS.
                </p>
                <p>
                  Les tarifs VSL sont fixes au niveau national par arrete
                  (revalorisation annuelle), independamment du departement.
                  Sur prescription, le remboursement Securite sociale est
                  de 55 % (100 % en cas d'ALD, hospitalisation, maternite,
                  accident du travail). Tiers payant applique : vous
                  n'avancez pas les frais.
                </p>
              </>
            )}
            {cat.key === "taxi_conventionne" && (
              <>
                <p>
                  Un taxi conventionne CPAM est un taxi titulaire d'une
                  licence ADS (Autorisation De Stationnement) qui a signe
                  une convention avec la Caisse Primaire d'Assurance Maladie
                  de son departement. Cette convention permet au taxi
                  d'appliquer le tiers payant aux patients : vous n'avancez
                  pas les frais, la CPAM regle directement le transporteur.
                </p>
                <p>
                  Le taxi conventionne est prescrit pour les transports
                  assis de patients en etat stable, en alternative ou en
                  complement du VSL. Il est particulierement adapte aux
                  trajets courts en zone urbaine et aux secteurs ou
                  l'offre VSL est limitee.
                </p>
                <p>
                  Les tarifs taxi conventionne sont fixes par convention
                  departementale (CPAM 13, CPAM 75, CPAM 974...) et
                  s'appliquent en plus du tarif prefectoral du taxi. Une
                  remise tarifaire (5 a 25 % selon les departements) est
                  appliquee par rapport au tarif taxi libre. La franchise
                  medicale de 4 euros par trajet reste a votre charge
                  (sauf exemptions : ALD, AME, ACS).
                </p>
              </>
            )}
          </div>
        </article>

        {topVilles.length > 0 && (
          <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {cat.labelPluriel} par ville — Top {topVilles.length}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cliquez sur votre ville pour acceder aux {cat.labelPluriel.toLowerCase()} agreees et conventionnees.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {topVilles.map((v) => (
                <Link
                  key={v.ville_slug}
                  href={`/transport-medical/${v.ville_slug}/${cat.slug}`}
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
            {cat.labelPluriel} par region
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {REGIONS_FR_SEO.map((r) => (
              <Link
                key={r.slug}
                href={`/transport-medical/region/${r.slug}`}
                className="flex items-center justify-between gap-2 bg-gray-50 hover:bg-blue-50 hover:text-[#0066CC] text-gray-800 text-sm px-4 py-2.5 rounded-lg transition border border-gray-100"
              >
                <span className="flex items-center gap-2 min-w-0 truncate">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{r.nom}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </article>

        <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Categories de transport sanitaire
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {CATEGORIES_SANITAIRE.map((c) => {
              const isCurrent = c.slug === cat.slug;
              return (
                <Link
                  key={c.slug}
                  href={`/transport-medical/categorie/${c.slug}`}
                  className={`border rounded-xl p-4 transition ${
                    isCurrent
                      ? "border-[#0066CC] bg-blue-50"
                      : "border-gray-200 hover:border-[#0066CC] hover:bg-blue-50"
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">
                    {c.labelPluriel}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {c.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </article>

        <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Questions frequentes — {cat.labelPluriel}
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

        <article className="bg-gradient-to-br from-[#0066CC] to-[#0052a3] text-white border border-blue-700 rounded-2xl p-6 mt-6">
          <div className="flex items-start gap-4">
            <Phone className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold mb-2">
                Besoin d'un {cat.label.toLowerCase()} maintenant ?
              </h2>
              <p className="text-blue-50 mb-4">
                Selectionnez votre ville dans la liste ci-dessus pour
                appeler directement un {cat.label.toLowerCase()} de votre
                secteur. Tous les professionnels sont verifies agreees ARS
                et conventionnes CPAM.
              </p>
              <Link
                href="/transport-medical"
                className="inline-flex items-center gap-2 bg-white text-[#0066CC] font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition"
              >
                Voir l&apos;annuaire complet
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
