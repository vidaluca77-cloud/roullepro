import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { MapPin, Phone, Shield, ChevronRight, Star, BadgeCheck } from "lucide-react";
import { getCategorieBySlug, deslugifyVille, type ProSanitaire } from "@/lib/sanitaire-data";
import { buildFaqJsonLd, buildBreadcrumbJsonLd, getVilleFaq } from "@/lib/sanitaire-seo";
import { getCityCategoryContent } from "@/lib/seo-city-content";
import { getDepartementByCode } from "@/lib/departements-fr";
import {
  buildTarifBlock,
  buildLocalFaq,
  topVillesDepartement,
  type FaqItem,
} from "@/lib/sanitaire-ville-categorie";
import EtablissementsVilleCategorie from "@/components/etablissements/EtablissementsVilleCategorie";
import OpenStatusBadge from "@/components/sanitaire/OpenStatusBadge";
import AmeliBadge from "@/components/sanitaire/AmeliBadge";
import AmeliFilterToggle from "@/components/sanitaire/AmeliFilterToggle";

export const revalidate = 3600;

type Props = {
  params: Promise<{ ville: string; categorie: string }>;
  searchParams: Promise<{ ameli?: string }>;
};

async function fetchProsVilleCategorie(villeSlug: string, categorieKey: string, ameliOnly = false) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  let query = supabase
    .from("pros_sanitaire_public")
    .select("*")
    .eq("actif", true).eq("suspendu", false)
    .eq("ville_slug", villeSlug)
    .eq("categorie", categorieKey)
    .order("plan", { ascending: false })
    .order("claimed", { ascending: false })
    .order("raison_sociale")
    .limit(200);
  if (ameliOnly) query = query.eq("ameli_conventionne", true).not("ameli_last_seen", "is", null);
  const { data } = await query;
  return (data || []) as ProSanitaire[];
}

/**
 * Une seule requete pour le departement : compteur exact (part 5) + villes pour
 * le maillage (part 6). La vue publique applique deja le filtre taxi.
 */
async function fetchDepartementCategorie(departement: string, categorieKey: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, count } = await supabase
    .from("pros_sanitaire_public")
    .select("ville, ville_slug", { count: "exact" })
    .eq("actif", true)
    .eq("suspendu", false)
    .eq("departement", departement)
    .eq("categorie", categorieKey)
    .limit(2000);
  return {
    rows: (data || []) as { ville: string; ville_slug: string }[],
    total: count ?? 0,
  };
}

/** Fusionne des FAQ en dedoublonnant par question (une seule FAQPage). */
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
  const { ville, categorie } = await params;
  const cat = getCategorieBySlug(categorie);
  if (!cat) return {};
  const nomVille = deslugifyVille(ville);
  const pros = await fetchProsVilleCategorie(ville, cat.key);
  const nb = pros.length;
  const conventionnes = pros.filter((p) => p.ameli_conventionne).length;

  // Title : action + nombre = signal d'utilité + AI search.
  // Le suffixe " | RoullePro" est ajouté automatiquement par title.template (layout).
  const title = nb > 1
    ? `${cat.labelPluriel} à ${nomVille} : ${nb} pros conventionnés CPAM`
    : nb === 1
      ? `${cat.labelPluriel} à ${nomVille} : 1 pro conventionné CPAM`
      : `${cat.labelPluriel} à ${nomVille}`;

  // Description : nombre pros, % conventionnés, tiers payant, devis gratuit
  const description = nb > 0
    ? `${nb} ${cat.labelPluriel.toLowerCase()} à ${nomVille}${conventionnes > 0 ? `, dont ${conventionnes} conventionnés CPAM` : ""}. Téléphone direct, tarif Sécu, tiers payant. Réservation gratuite en ligne.`.slice(0, 160)
    : `${cat.labelPluriel} à ${nomVille} : annuaire gratuit. Tarif Sécurité sociale, tiers payant, réservation en ligne.`.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/transport-medical/${ville}/${categorie}` },
    openGraph: {
      title: `${cat.labelPluriel} à ${nomVille} — ${nb} pros`,
      description,
      type: "website",
      locale: "fr_FR",
    },
    twitter: {
      card: "summary",
      title: `${cat.labelPluriel} à ${nomVille}`,
      description,
    },
  };
}

export default async function VilleCategoriePage({ params, searchParams }: Props) {
  const { ville, categorie } = await params;
  const { ameli } = await searchParams;
  const ameliOnly = ameli === "1";
  const cat = getCategorieBySlug(categorie);
  if (!cat) notFound();

  const pros = await fetchProsVilleCategorie(ville, cat.key, ameliOnly);
  const nomVille = pros.length > 0 ? pros[0].ville : deslugifyVille(ville);
  const departement = pros.length > 0 ? pros[0].departement : "";

  // JSON-LD ItemList enrichi : Google peut afficher en carrousel local
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${cat.labelPluriel} à ${nomVille}`,
    description: `Annuaire des ${cat.labelPluriel.toLowerCase()} conventionnés CPAM à ${nomVille}`,
    url: `https://roullepro.com/transport-medical/${ville}/${categorie}`,
    numberOfItems: pros.length,
    itemListElement: pros.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://roullepro.com/transport-medical/${ville}/${categorie}/${p.slug}`,
      name: p.nom_commercial || p.raison_sociale,
    })),
  };

  // Contenu editorial enrichi pour les pages hub prioritaires (striking distance).
  const enriched = getCityCategoryContent(ville, categorie);

  // Departement : compteur exact + maillage villes (une seule requete), tarifs
  // conventionnels et FAQ locale generee.
  const depInfo = departement ? getDepartementByCode(departement) : null;
  const { rows: deptRows, total: deptTotal } = departement
    ? await fetchDepartementCategorie(departement, cat.key)
    : { rows: [], total: 0 };
  const autresVilles = topVillesDepartement(deptRows, ville, 8);
  const tarifBlock = depInfo ? buildTarifBlock(cat.key, depInfo.code, depInfo.nom) : null;

  const generatedFaq = buildLocalFaq(nomVille, depInfo?.nom ?? departement, cat.key);
  const villeFaq = getVilleFaq(nomVille, pros.length);
  const localFaq = enriched?.faq ?? [];
  const faqLd = buildFaqJsonLd(dedupeFaq([...generatedFaq, ...localFaq, ...villeFaq]));

  // Fil d'Ariane hierarchique : Annuaire -> Departement -> Ville -> Categorie.
  // Le niveau departement renforce le maillage interne vers les pages departementales.
  const breadItems: { name: string; url: string }[] = [
    { name: "Annuaire", url: "/transport-medical" },
  ];
  if (depInfo) {
    breadItems.push({
      name: `${depInfo.nom} (${depInfo.code})`,
      url: `/transport-medical/departement/${depInfo.code}`,
    });
  }
  breadItems.push(
    { name: nomVille, url: `/transport-medical/${ville}` },
    { name: cat.labelPluriel, url: `/transport-medical/${ville}/${categorie}` }
  );
  const breadLd = buildBreadcrumbJsonLd(breadItems);

  const seoContent = enriched?.intro ?? buildSeoContent(cat.key, nomVille, pros.length);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
            <Link href="/transport-medical" className="hover:text-white">Annuaire</Link>
            <ChevronRight className="w-3 h-3" />
            {depInfo && (
              <>
                <Link
                  href={`/transport-medical/departement/${depInfo.code}`}
                  className="hover:text-white"
                >
                  {depInfo.nom} ({depInfo.code})
                </Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <Link href={`/transport-medical/${ville}`} className="hover:text-white">{nomVille}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{cat.labelPluriel}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{cat.labelPluriel} à {nomVille}</h1>
          <p className="text-blue-100">
            {pros.length} {cat.labelPluriel.toLowerCase()} à {nomVille}
            {depInfo && deptTotal > 0
              ? ` · ${deptTotal} professionnels dans le département ${depInfo.nom} (${depInfo.code})`
              : departement
                ? ` · Département ${departement}`
                : ""}
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="prose prose-sm max-w-none text-gray-700 mb-8 leading-relaxed">
          {seoContent.map((p, i) => (
            <p key={i} className="mb-3">{p}</p>
          ))}
        </div>

        <div className="mb-6">
          <AmeliFilterToggle active={ameliOnly} />
        </div>

        {pros.length === 0 ? (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-gray-700">
            {ameliOnly ? (
              <>
                Aucun {cat.label.toLowerCase()} conventionné CPAM confirmé à {nomVille} pour l&apos;instant.{" "}
                <Link href={`/transport-medical/${ville}/${categorie}`} className="text-[#0066CC] font-medium hover:underline">
                  Afficher tous les {cat.labelPluriel.toLowerCase()}
                </Link>
                .
              </>
            ) : (
              <>Aucun {cat.label.toLowerCase()} référencé à {nomVille} pour l&apos;instant.</>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pros.map((pro) => (
              <ProCard key={pro.id} pro={pro} villeSlug={ville} categorieSlug={categorie} />
            ))}
          </div>
        )}

        {categorie === "ambulance" && (
          <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm text-gray-700">
              Besoin d&apos;une ambulance rapidement, où que vous soyez ?
            </p>
            <Link
              href="/ambulance-autour-de-moi"
              className="mt-2 inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900"
            >
              Trouver une ambulance autour de moi
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {tarifBlock && (
          <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{tarifBlock.titre}</h2>
            <p className="text-sm text-gray-600 mb-4">{tarifBlock.intro}</p>
            <dl className="divide-y divide-gray-100">
              {tarifBlock.lignes.map((l) => (
                <div key={l.label} className="flex items-center justify-between py-2 gap-4">
                  <dt className="text-sm text-gray-700">{l.label}</dt>
                  <dd className="text-sm font-semibold text-gray-900 whitespace-nowrap">{l.valeur}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-gray-500">{tarifBlock.mention}</p>
            <Link
              href={tarifBlock.simulateur.href}
              className="mt-4 inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900"
            >
              {tarifBlock.simulateur.label}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        <EtablissementsVilleCategorie
          villeSlug={ville}
          nomVille={nomVille}
          departement={departement}
        />

        {enriched && enriched.voisines.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {cat.labelPluriel} dans les villes voisines
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Étendez votre recherche aux communes proches de {nomVille}, dans le même département.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {enriched.voisines.map((v) => (
                <Link
                  key={v.slug}
                  href={`/transport-medical/${v.slug}/${categorie}`}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition"
                >
                  {cat.label} {v.nom}
                </Link>
              ))}
            </div>
          </div>
        )}

        {autresVilles.length > 0 && (!enriched || enriched.voisines.length === 0) && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {cat.labelPluriel} dans les autres villes {depInfo ? `du département ${depInfo.nom} (${depInfo.code})` : "du département"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {autresVilles.map((v) => (
                <Link
                  key={v.slug}
                  href={`/transport-medical/${v.slug}/${categorie}`}
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition"
                >
                  {cat.label} {v.nom}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Questions fréquentes — {cat.labelPluriel.toLowerCase()} à {nomVille}
          </h2>
          <div className="space-y-4">
            {generatedFaq.map((q, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-1">{q.question}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {localFaq.length > 0 && (
          <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              En savoir plus sur les {cat.labelPluriel.toLowerCase()} à {nomVille}
            </h2>
            <div className="space-y-4">
              {localFaq.map((q, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-gray-900 mb-1">{q.question}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function buildSeoContent(categorie: string, ville: string, count: number): string[] {
  if (categorie === "ambulance") {
    return [
      `Vous cherchez une ambulance à ${ville} ? Notre annuaire recense ${count} entreprises d'ambulance locales. Ces professionnels interviennent pour le transport médicalisé d'urgence ou programmé, avec un équipage composé d'un diplômé d'État ambulancier (DEA) et d'un auxiliaire ambulancier.`,
      `Les ambulances de ${ville} sont équipées du matériel médical nécessaire (oxygène, défibrillateur, brancard, matelas coquille). Elles assurent les transports allongés, les sorties d'hôpital, les transferts inter-établissements et les interventions régulées par le SAMU.`,
      `Sur prescription médicale, le transport en ambulance est pris en charge par la Sécurité sociale à hauteur de 55 %, le reste pouvant être couvert par votre complémentaire santé. Pensez à demander une prescription de transport à votre médecin avant le déplacement.`,
    ];
  }
  if (categorie === "vsl") {
    return [
      `Le VSL (Véhicule Sanitaire Léger) est destiné au transport assis de patients en situation stable, ne nécessitant pas d'assistance médicalisée. ${count} professionnels du VSL exercent à ${ville}, prêts à vous accompagner pour vos rendez-vous médicaux, dialyses, séances de chimiothérapie ou consultations spécialisées.`,
      `Contrairement à l'ambulance, le VSL se réserve sur prescription médicale et ne dispose pas de matériel de réanimation. Le chauffeur, titulaire du diplôme d'auxiliaire ambulancier, assure néanmoins votre sécurité et votre confort pendant le trajet.`,
      `Le remboursement par la Sécurité sociale est de 55 % sur la base du tarif conventionné, avec tiers payant chez la plupart des VSL de ${ville}. Vous n'avancez rien si vous disposez d'une prescription et d'une mutuelle complémentaire.`,
    ];
  }
  return [
    `Le taxi conventionné de ${ville} est un taxi agréé par l'Assurance Maladie pour effectuer des transports de patients assis sur prescription médicale. ${count} taxis conventionnés exercent à ${ville} et acceptent le tiers payant.`,
    `À la différence du VSL, le taxi conventionné peut aussi faire de la course classique. Quand il transporte un patient sur prescription, il applique un tarif conventionné CPAM et se fait rembourser directement par la Sécurité sociale — vous n'avancez pas les frais.`,
    `Les taxis conventionnés de ${ville} sont particulièrement adaptés aux rendez-vous médicaux, aux sorties d'hôpital courtes, aux consultations et aux séances de soins régulières. Demandez une prescription médicale à votre médecin avant de réserver.`,
  ];
}

function ProCard({
  pro,
  villeSlug,
  categorieSlug,
}: {
  pro: ProSanitaire;
  villeSlug: string;
  categorieSlug: string;
}) {
  const isPremium = pro.plan === "premium" || pro.plan === "pro_plus";
  return (
    <Link
      href={`/transport-medical/${villeSlug}/${categorieSlug}/${pro.slug}`}
      className={`block bg-white rounded-2xl p-5 border transition hover:shadow-lg ${
        isPremium ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-200 hover:border-blue-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{pro.nom_commercial || pro.raison_sociale}</div>
          <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {pro.adresse ? `${pro.adresse}, ${pro.code_postal} ${pro.ville}` : `${pro.code_postal} ${pro.ville}`}
          </div>
        </div>
        {pro.verified && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-[#0066CC] px-2 py-0.5 rounded-full">
            <BadgeCheck className="w-3 h-3" />
            Vérifié
          </span>
        )}
        {isPremium && !pro.verified && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
            <Star className="w-3 h-3" />
            Recommandé
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <OpenStatusBadge horaires={pro.horaires} variant="card" />
        <AmeliBadge conventionne={pro.ameli_conventionne} lastSeen={pro.ameli_last_seen} variant="sm" />
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-3">
        {pro.telephone_public ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-[#0066CC]">
            <Phone className="w-3.5 h-3.5" />
            {pro.telephone_public}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Shield className="w-3 h-3" />
            Non vérifié
          </span>
        )}
        <span className="ml-auto text-xs text-[#0066CC] font-medium inline-flex items-center gap-0.5">
          Voir la fiche <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
