import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { MapPin, Phone, Shield, ChevronRight, Star, BadgeCheck } from "lucide-react";
import { getCategorieBySlug, deslugifyVille, type ProSanitaire } from "@/lib/sanitaire-data";

export const revalidate = 3600;

type Props = {
  params: Promise<{ ville: string; categorie: string }>;
};

async function fetchProsVilleCategorie(villeSlug: string, categorieKey: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("pros_sanitaire")
    .select("*")
    .eq("ville_slug", villeSlug)
    .eq("categorie", categorieKey)
    .order("plan", { ascending: false })
    .order("claimed", { ascending: false })
    .order("raison_sociale")
    .limit(200);
  return (data || []) as ProSanitaire[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville, categorie } = await params;
  const cat = getCategorieBySlug(categorie);
  if (!cat) return {};
  const nomVille = deslugifyVille(ville);
  const pros = await fetchProsVilleCategorie(ville, cat.key);
  return {
    title: `${cat.label} à ${nomVille} — ${pros.length} professionnels`,
    description: `Liste complète des ${cat.labelPluriel.toLowerCase()} à ${nomVille}. ${cat.description} Numéros directs, horaires, remboursement Sécurité sociale.`,
    alternates: { canonical: `/transport-medical/${ville}/${categorie}` },
    openGraph: {
      title: `${cat.labelPluriel} à ${nomVille}`,
      description: `${pros.length} ${cat.labelPluriel.toLowerCase()} à ${nomVille} — annuaire gratuit.`,
      type: "website",
    },
  };
}

export default async function VilleCategoriePage({ params }: Props) {
  const { ville, categorie } = await params;
  const cat = getCategorieBySlug(categorie);
  if (!cat) notFound();

  const pros = await fetchProsVilleCategorie(ville, cat.key);
  const nomVille = pros.length > 0 ? pros[0].ville : deslugifyVille(ville);
  const departement = pros.length > 0 ? pros[0].departement : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cat.labelPluriel} à ${nomVille}`,
    description: `Annuaire des ${cat.labelPluriel.toLowerCase()} à ${nomVille}`,
    url: `https://roullepro.com/transport-medical/${ville}/${categorie}`,
  };

  const seoContent = buildSeoContent(cat.key, nomVille, pros.length);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
            <Link href="/transport-medical" className="hover:text-white">Annuaire</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/transport-medical/${ville}`} className="hover:text-white">{nomVille}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{cat.labelPluriel}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{cat.labelPluriel} à {nomVille}</h1>
          <p className="text-blue-100">{pros.length} professionnels référencés {departement ? `· Département ${departement}` : ""}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="prose prose-sm max-w-none text-gray-700 mb-8 leading-relaxed">
          {seoContent.map((p, i) => (
            <p key={i} className="mb-3">{p}</p>
          ))}
        </div>

        {pros.length === 0 ? (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-gray-700">
            Aucun {cat.label.toLowerCase()} référencé à {nomVille} pour l'instant.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {pros.map((pro) => (
              <ProCard key={pro.id} pro={pro} villeSlug={ville} categorieSlug={categorie} />
            ))}
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
      `Sur prescription médicale, le transport en ambulance est pris en charge par la Sécurité sociale à hauteur de 65 %, le reste pouvant être couvert par votre complémentaire santé. Pensez à demander une prescription de transport à votre médecin avant le déplacement.`,
    ];
  }
  if (categorie === "vsl") {
    return [
      `Le VSL (Véhicule Sanitaire Léger) est destiné au transport assis de patients en situation stable, ne nécessitant pas d'assistance médicalisée. ${count} professionnels du VSL exercent à ${ville}, prêts à vous accompagner pour vos rendez-vous médicaux, dialyses, séances de chimiothérapie ou consultations spécialisées.`,
      `Contrairement à l'ambulance, le VSL se réserve sur prescription médicale et ne dispose pas de matériel de réanimation. Le chauffeur, titulaire du diplôme d'auxiliaire ambulancier, assure néanmoins votre sécurité et votre confort pendant le trajet.`,
      `Le remboursement par la Sécurité sociale est de 65 % sur la base du tarif conventionné, avec tiers payant chez la plupart des VSL de ${ville}. Vous n'avancez rien si vous disposez d'une prescription et d'une mutuelle complémentaire.`,
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
