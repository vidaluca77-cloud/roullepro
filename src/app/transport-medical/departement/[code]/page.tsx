import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ChevronRight, MapPin, Cross, Car, Users } from "lucide-react";
import { getDepartementByCode } from "@/lib/departements-fr";
import { CATEGORIES_SANITAIRE, type CategorieSanitaire } from "@/lib/sanitaire-data";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/sanitaire-seo";
import { getDepartementSeoOverride } from "@/lib/sanitaire-departement-seo";
import { buildTarifBlock, formatNomVille, type FaqItem } from "@/lib/sanitaire-ville-categorie";

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

type VillesParCategorie = Record<CategorieSanitaire, VilleStat[]>;

async function fetchDepartementData(code: string): Promise<{
  villes: VilleStat[];
  counts: CountByCat;
  villesParCat: VillesParCategorie;
} | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Recupere toutes les fiches actives du departement pour agreger les comptages.
  // Les lignes servent a calculer les totaux exacts affiches (H1, badges, FAQ JSON-LD) :
  // on ne peut donc PAS baisser cette limite a 200 sans corrompre les comptages.
  // Le cap est ramene a 5000 (au lieu de 10000) : aucun departement francais n'atteint
  // ce volume de pros sanitaire (le plus dense ~2500), donc comportement identique sur
  // toutes les donnees reelles, tout en bornant le pire cas theorique.
  const { data: pros, error } = await supabase
    .from("pros_sanitaire_public")
    .select("ville, ville_slug, categorie")
    .eq("actif", true)
    .eq("departement", code)
    .limit(5000);

  if (error || !pros || pros.length === 0) return null;

  // Agregation par ville (toutes categories) et par ville x categorie, a partir
  // de l'unique requete ci-dessus : aucun appel supplementaire, pas de N+1.
  const villesMap = new Map<string, VilleStat>();
  const counts: CountByCat = { ambulance: 0, vsl: 0, taxi_conventionne: 0, total: 0 };
  const parCatMap: Record<CategorieSanitaire, Map<string, VilleStat>> = {
    ambulance: new Map(),
    vsl: new Map(),
    taxi_conventionne: new Map(),
  };

  for (const p of pros as Array<{ ville: string; ville_slug: string; categorie: string }>) {
    if (!p.ville_slug) continue;
    const cur = villesMap.get(p.ville_slug);
    if (cur) cur.nb += 1;
    else villesMap.set(p.ville_slug, { ville: p.ville, ville_slug: p.ville_slug, nb: 1 });
    counts.total += 1;
    if (p.categorie === "ambulance") counts.ambulance += 1;
    else if (p.categorie === "vsl") counts.vsl += 1;
    else if (p.categorie === "taxi_conventionne") counts.taxi_conventionne += 1;

    if (p.categorie === "ambulance" || p.categorie === "vsl" || p.categorie === "taxi_conventionne") {
      const catMap = parCatMap[p.categorie];
      const curCat = catMap.get(p.ville_slug);
      if (curCat) curCat.nb += 1;
      else catMap.set(p.ville_slug, { ville: p.ville, ville_slug: p.ville_slug, nb: 1 });
    }
  }

  const trier = (m: Map<string, VilleStat>) =>
    Array.from(m.values()).sort((a, b) => b.nb - a.nb || a.ville.localeCompare(b.ville, "fr"));

  const villes = trier(villesMap);
  const villesParCat: VillesParCategorie = {
    ambulance: trier(parCatMap.ambulance),
    vsl: trier(parCatMap.vsl),
    taxi_conventionne: trier(parCatMap.taxi_conventionne),
  };
  return { villes, counts, villesParCat };
}

/** Fusionne des FAQ en dedoublonnant par question (une seule FAQPage JSON-LD). */
function dedupeFaq(items: FaqItem[]): FaqItem[] {
  const vues = new Set<string>();
  const out: FaqItem[] = [];
  for (const q of items) {
    const cle = q.question.trim().toLowerCase();
    if (vues.has(cle)) continue;
    vues.add(cle);
    out.push(q);
  }
  return out;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const dep = getDepartementByCode(code);
  if (!dep) return { title: "Departement introuvable" };

  // Hubs departementaux prioritaires : title/meta editoriaux cibles.
  const seoOverride = getDepartementSeoOverride(dep.code);
  if (seoOverride) {
    return {
      title: seoOverride.title,
      description: seoOverride.description,
      alternates: { canonical: `/transport-medical/departement/${dep.code}` },
      openGraph: {
        title: seoOverride.title,
        description: seoOverride.description,
        type: "website",
        locale: "fr_FR",
      },
      twitter: {
        card: "summary_large_image",
        title: seoOverride.title,
        description: seoOverride.description,
      },
    };
  }

  const data = await fetchDepartementData(dep.code);
  const nbTaxi = data?.counts.taxi_conventionne || 0;
  // Title elargi : couvre taxi conventionne + VSL + ambulance sans perdre la
  // cible taxi. Le suffixe " | RoullePro" est ajoute par title.template (layout).
  const titre = `Taxi conventionné, VSL et ambulance dans le ${dep.nom} (${dep.code}) — annuaire CPAM`;
  const description = `Taxis conventionnés, VSL et ambulances dans le ${dep.nom} (${dep.code}) agréés Assurance Maladie : ${nbTaxi > 0 ? nbTaxi + " taxis conventionnés" : "annuaire CPAM"}, tarifs indicatifs, téléphone direct, tiers payant et remboursement sur prescription.`.slice(0, 160);
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
  const villesParCat: VillesParCategorie = data?.villesParCat || {
    ambulance: [],
    vsl: [],
    taxi_conventionne: [],
  };

  const seoOverride = getDepartementSeoOverride(dep.code);

  // Bloc tarifs departemental (differenciateur SEO). Reutilise buildTarifBlock :
  // pour le taxi, renvoie null si le taux km prefectoral du departement est
  // indisponible dans la lib -> on n'affiche alors que VSL et ambulance, jamais
  // de valeur inventee. Aucun chiffre tarifaire en dur ici.
  const tarifBlocks = CATEGORIES_SANITAIRE.map((cat) =>
    buildTarifBlock(cat.key, dep.code, dep.nom)
  ).filter((b): b is NonNullable<typeof b> => b !== null);

  const breadLd = buildBreadcrumbJsonLd(
    seoOverride
      ? [
          { name: "Accueil", url: "/" },
          { name: "Transport médical", url: "/transport-medical" },
          { name: dep.nom, url: `/transport-medical/departement/${dep.code}` },
        ]
      : [
          { name: "Annuaire", url: "/transport-medical" },
          { name: `Departement ${dep.nom} (${dep.code})`, url: `/transport-medical/departement/${dep.code}` },
        ],
  );

  const genericFaqs = [
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
      answer: `Oui. Le transport sanitaire (ambulance, VSL, taxi conventionne) prescrit par un medecin est rembourse par la Securite sociale a 55 % du tarif conventionne, ou 100 % en cas d'ALD, maternite ou hospitalisation. La CPAM ${dep.code} applique le tiers payant aux transports conventionnes.`,
    },
    {
      question: `Quelle est la prefecture du ${dep.nom} ?`,
      answer: `La prefecture du departement ${dep.code} (${dep.nom}) est ${dep.prefecture}, en region ${dep.region}.`,
    },
  ];
  // Questions ciblees "liste taxi conventionne cpam [dept]" ajoutees a toutes les pages departement.
  const taxiListeFaqs = [
    {
      question: `Où trouver la liste des taxis conventionnés CPAM ${dep.code} (${dep.nom}) ?`,
      answer: `La liste des taxis conventionnés CPAM du ${dep.nom} (${dep.code}) est disponible sur RoullePro : ${counts.taxi_conventionne > 0 ? `${counts.taxi_conventionne} taxis conventionnés` : "les taxis conventionnés"} agréés par l'Assurance Maladie sont référencés par commune, avec téléphone direct et conventionnement vérifié. Sélectionnez votre ville dans la liste ci-dessous pour les afficher.`,
    },
    {
      question: `Comment être remboursé d'un taxi conventionné dans le ${dep.nom} ?`,
      answer: `Pour être remboursé, présentez au taxi conventionné votre prescription médicale de transport (bon de transport CERFA 11574) et votre carte Vitale. La CPAM ${dep.code} rembourse alors la course à 55 % du tarif conventionné, ou 100 % en cas d'ALD, accident du travail, maternité ou hospitalisation. Le tiers payant vous évite d'avancer les frais.`,
    },
    {
      question: `Comment savoir si un taxi est conventionné CPAM ?`,
      answer: `Un taxi conventionné CPAM affiche un autocollant "conventionné Assurance Maladie" et figure sur la liste des taxis conventionnés de sa caisse départementale. Sur RoullePro, chaque fiche du ${dep.nom} indique le statut de conventionnement, vérifié auprès des données publiques Ameli. En cas de doute, demandez au chauffeur son numéro de convention avant la course.`,
    },
  ];
  // Questions departementales ciblant "tarif taxi conventionne / vsl [dept]" et
  // "trouver un transport conventionne [dept]". Les reponses renvoient au bloc
  // tarifs / aux simulateurs sans citer de montant en dur.
  const tarifDepFaqs: FaqItem[] = [
    {
      question: `Quel est le tarif d'un taxi conventionné dans le ${dep.nom} (${dep.code}) ?`,
      answer: `Le tarif d'un taxi conventionné dans le ${dep.nom} suit la convention CPAM : un forfait de prise en charge national et un tarif kilométrique propre au département ${dep.code}, majorés la nuit, le dimanche et les jours fériés. Le détail figure dans la section « Tarifs » de cette page ; vous pouvez aussi estimer votre course avec le simulateur de taxi conventionné.`,
    },
    {
      question: `Combien coûtent un VSL et une ambulance dans le ${dep.nom} ?`,
      answer: `Les tarifs VSL et ambulance sont fixés par la convention nationale des transporteurs sanitaires (avenant 11) : un forfait départemental, un tarif kilométrique national et des majorations nuit et dimanche. Ils sont identiques d'un professionnel à l'autre. Consultez la section « Tarifs » de cette page ou nos simulateurs VSL et ambulance pour une estimation.`,
    },
    {
      question: `Comment trouver un transport conventionné dans le ${dep.nom} ?`,
      answer: `Sélectionnez votre commune dans la liste ci-dessous, ou parcourez les sous-sections ambulance, VSL et taxi conventionné de cette page pour accéder aux professionnels agréés du ${dep.nom} (${dep.code}). Chaque fiche affiche le téléphone direct, le conventionnement et les horaires. Le transport conventionné est remboursé par la CPAM ${dep.code} sur prescription médicale.`,
    },
  ];
  const faqs = dedupeFaq([
    ...taxiListeFaqs,
    ...tarifDepFaqs,
    ...(seoOverride ? seoOverride.faq : genericFaqs),
  ]);
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
            {seoOverride ? seoOverride.h1 : `Taxi conventionné, VSL et ambulance dans le ${dep.nom} (${dep.code})`}
          </h1>
          <p className="text-blue-100 max-w-3xl">
            Taxis conventionnés CPAM, ambulances et VSL agréés Assurance Maladie dans le {dep.nom} ({dep.code}), en région {dep.region}. Préfecture : {dep.prefecture}.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <Cross className="w-4 h-4" /> {counts.ambulance} ambulances
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <Car className="w-4 h-4" /> {counts.vsl} VSL
            </span>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-3 py-1.5 rounded-full text-sm">
              <Users className="w-4 h-4" /> {counts.taxi_conventionne} taxis conventionnés
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <article className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Liste des taxis conventionnés CPAM dans le {dep.nom} ({dep.code})</h2>
          <div className="space-y-3 text-gray-700 leading-relaxed">
            <p>
              Vous cherchez la <strong>liste des taxis conventionnés CPAM {dep.code}</strong> ({dep.nom}) ? RoullePro recense
              {" "}{counts.taxi_conventionne > 0 ? `${counts.taxi_conventionne} taxis conventionnés` : "les taxis conventionnés"}{" "}
              agréés par l&apos;Assurance Maladie (Ameli) dans le département, aux côtés des ambulances et des VSL. Un taxi conventionné
              est un taxi ayant signé une convention avec la CPAM {dep.code} : sur prescription médicale (bon de transport), vos trajets
              vers un soin ou une consultation sont remboursés par la Sécurité sociale, avec dispense d&apos;avance des frais (tiers payant).
              Sélectionnez votre commune ci-dessous pour afficher les taxis conventionnés les plus proches, avec téléphone direct.
            </p>
            {seoOverride && <p>{seoOverride.intro}</p>}
            <p>
              Le département du {dep.nom} ({dep.code}) compte {counts.total} professionnels du transport sanitaire référencés sur RoullePro :
              {" "}{counts.ambulance} sociétés d&apos;ambulances, {counts.vsl} Véhicules Sanitaires Légers (VSL) et {counts.taxi_conventionne} taxis
              conventionnés par la CPAM. Tous sont agréés par l&apos;Agence Régionale de Santé {dep.region} et exercent dans le respect du cadre réglementaire
              du Code de la santé publique.
            </p>
            <p>
              Le transport sanitaire prescrit par un médecin est pris en charge par l&apos;Assurance maladie à 55 % du tarif conventionné, et à 100 %
              en cas d&apos;Affection Longue Durée (ALD), de maternité, d&apos;accident du travail ou de soins liés à une hospitalisation.
              Le tiers payant est appliqué : le patient n&apos;avance pas les frais. Une franchise médicale de 4 euros par trajet (plafonnée à 8 euros par jour
              et 50 euros par an) reste à la charge du patient.
            </p>
            <p>
              <strong>Ambulance</strong> : transport médicalisé allongé, équipage composé d&apos;un Diplôme d&apos;État d&apos;Ambulancier et d&apos;un auxiliaire,
              véhicule équipé d&apos;oxygène, d&apos;un brancard et d&apos;un défibrillateur.
              <strong> VSL</strong> : transport assis pour patients en état stable (dialyse, chimiothérapie, consultations), jusqu&apos;à 3 patients par véhicule.
              <strong> Taxi conventionné CPAM</strong> : transport assis pour soins programmés, conventionnement signé avec la caisse départementale.
            </p>
          </div>
        </article>

        {villes.length > 0 ? (
          <article className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Villes du {dep.nom} avec transport sanitaire
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {villes.length} communes référencées. Cliquez pour accéder aux professionnels.
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
            <h2 className="text-lg font-bold text-gray-900 mb-2">Aucune fiche référencée dans ce département</h2>
            <p className="text-sm text-gray-600">
              Aucun professionnel du transport sanitaire n&apos;est encore référencé dans le {dep.nom} sur RoullePro. Si vous êtes
              ambulancier, exploitant VSL ou taxi conventionné dans ce département,{" "}
              <Link href="/transport-medical/inscription" className="text-[#0066CC] underline">inscrivez votre entreprise gratuitement</Link>.
            </p>
          </article>
        )}

        {counts.total > 0 && (
          <div className="space-y-6 mt-6">
            {CATEGORIES_SANITAIRE.map((cat) => {
              const nb = counts[cat.key];
              if (nb === 0) return null;
              const topVilles = villesParCat[cat.key].slice(0, 12);
              return (
                <article key={cat.key} className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {cat.labelPluriel} dans le {dep.nom} ({dep.code}) : {nb} professionnel{nb > 1 ? "s" : ""}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">{cat.description}</p>
                  {topVilles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {topVilles.map((v) => (
                        <Link
                          key={v.ville_slug}
                          href={`/transport-medical/${v.ville_slug}/${cat.slug}`}
                          className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 transition"
                        >
                          {cat.label} {formatNomVille(v.ville)}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {tarifBlocks.length > 0 && (
          <div className="space-y-6 mt-6">
            {tarifBlocks.map((bloc) => (
              <article key={bloc.titre} className="bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">{bloc.titre}</h2>
                <p className="text-sm text-gray-600 mb-4">{bloc.intro}</p>
                <dl className="divide-y divide-gray-100">
                  {bloc.lignes.map((l) => (
                    <div key={l.label} className="flex items-center justify-between py-2 gap-4">
                      <dt className="text-sm text-gray-700">{l.label}</dt>
                      <dd className="text-sm font-semibold text-gray-900 whitespace-nowrap">{l.valeur}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-xs text-gray-500">{bloc.mention}</p>
                <Link
                  href={bloc.simulateur.href}
                  className="mt-4 inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900"
                >
                  {bloc.simulateur.label}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </article>
            ))}
          </div>
        )}

        <article className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">En savoir plus sur le transport conventionné</h2>
          <p className="text-sm text-gray-600 mb-4">
            Comprendre le remboursement, le bon de transport et chaque mode de transport sanitaire dans le {dep.nom}.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <Link
              href="/taxi-conventionne"
              className="flex items-center justify-between gap-2 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 hover:bg-blue-50 hover:text-[#0066CC] transition"
            >
              Taxi conventionné
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
            <Link
              href="/vsl"
              className="flex items-center justify-between gap-2 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 hover:bg-blue-50 hover:text-[#0066CC] transition"
            >
              VSL (Véhicule Sanitaire Léger)
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
            <Link
              href="/bon-de-transport"
              className="flex items-center justify-between gap-2 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 hover:bg-blue-50 hover:text-[#0066CC] transition"
            >
              Bon de transport
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          </div>
        </article>

        <article className="bg-white border border-gray-200 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Catégories de transport sanitaire</h2>
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">Questions fréquentes — {dep.nom}</h2>
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
