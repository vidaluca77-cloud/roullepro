import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Shield,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-static";
export const revalidate = 86400;

type VilleData = {
  slug: string;
  nom: string;
  cp: string;
  region: string;
  departement: string;
  departementNum: string;
  intro: string;
  marche: string;
  villesDesservies: string[];
  typesVehiculesLocaux: string[];
  delaiVenteMoyen: string;
  exempleVehicule: { modele: string; prix: string; delai: string };
};

const VILLES: Record<string, VilleData> = {
  caen: {
    slug: "caen",
    nom: "Caen",
    cp: "14000",
    region: "Normandie",
    departement: "Calvados",
    departementNum: "14",
    intro:
      "Caen, préfecture du Calvados, est un pôle logistique majeur de Normandie avec une forte densité de professionnels du transport, de l'artisanat et des services. Le marché de l'utilitaire d'occasion y est très actif, porté par les besoins des artisans du bâtiment, des transporteurs régionaux et des professionnels de la santé.",
    marche:
      "Le bassin caennais concentre plusieurs milliers d'entreprises utilisatrices d'utilitaires : entreprises du BTP en pleine dynamique avec les grands projets de rénovation urbaine, flottes d'ambulances et VSL pour le CHU de Caen, entreprises de livraison du dernier kilomètre autour du port de Ouistreham. La demande en fourgons d'occasion reste supérieure à l'offre, ce qui tire les prix à la hausse.",
    villesDesservies: [
      "Caen (14000)",
      "Hérouville-Saint-Clair (14200)",
      "Mondeville (14120)",
      "Ifs (14123)",
      "Fleury-sur-Orne (14123)",
      "Bretteville-sur-Odon (14760)",
      "Louvigny (14111)",
      "Saint-Contest (14280)",
      "Carpiquet (14650)",
      "Colombelles (14460)",
    ],
    typesVehiculesLocaux: [
      "Fourgons d'artisans (Renault Master, Peugeot Boxer, Fiat Ducato)",
      "VSL et ambulances (Fiat Scudo, Peugeot Expert, Volkswagen Transporter)",
      "Utilitaires VTC (Mercedes Vito, Volkswagen Caddy)",
      "Pick-up BTP (Ford Ranger, Toyota Hilux)",
      "Fourgonnettes de livraison (Renault Kangoo, Citroën Berlingo)",
    ],
    delaiVenteMoyen: "32 jours",
    exempleVehicule: {
      modele: "Renault Master L2H2 2022 — 68 000 km",
      prix: "22 400 €",
      delai: "28 jours",
    },
  },
  chelles: {
    slug: "chelles",
    nom: "Chelles",
    cp: "77500",
    region: "Île-de-France",
    departement: "Seine-et-Marne",
    departementNum: "77",
    intro:
      "Chelles, troisième commune de Seine-et-Marne, se situe au cœur de l'est parisien, à la frontière du Val-de-Marne et de la Seine-Saint-Denis. Son positionnement stratégique en fait un hub logistique pour les professionnels opérant sur Paris, l'aéroport de Roissy-CDG et la grande couronne est.",
    marche:
      "Le bassin chellois et son aire urbaine comptent plusieurs centaines d'entreprises de transport, de VTC, de livraison e-commerce et d'artisans du BTP. La proximité avec les zones d'activité de Noisy-le-Grand, Villeparisis et Marne-la-Vallée crée une demande constante en utilitaires professionnels, avec un taux de rotation élevé des véhicules.",
    villesDesservies: [
      "Chelles (77500)",
      "Brou-sur-Chantereine (77177)",
      "Courtry (77181)",
      "Vaires-sur-Marne (77360)",
      "Noisiel (77186)",
      "Champs-sur-Marne (77420)",
      "Gagny (93220)",
      "Montfermeil (93370)",
      "Neuilly-sur-Marne (93330)",
      "Noisy-le-Grand (93160)",
    ],
    typesVehiculesLocaux: [
      "Utilitaires VTC haut de gamme (Mercedes Vito, Volkswagen Caravelle)",
      "Fourgonnettes de livraison e-commerce (Renault Kangoo, Peugeot Partner)",
      "Fourgons d'artisans BTP (Master, Boxer, Sprinter)",
      "Taxis parisiens (Toyota Prius, Peugeot 508, Mercedes Classe E)",
      "Véhicules de flotte reconditionnés",
    ],
    delaiVenteMoyen: "26 jours",
    exempleVehicule: {
      modele: "Mercedes Vito Tourer 2021 — 94 000 km",
      prix: "28 900 €",
      delai: "22 jours",
    },
  },
  marseille: {
    slug: "marseille",
    nom: "Marseille",
    cp: "13010",
    region: "Provence-Alpes-Côte d'Azur",
    departement: "Bouches-du-Rhône",
    departementNum: "13",
    intro:
      "Marseille, deuxième ville de France, abrite le premier port maritime français et un tissu économique professionnel extrêmement dense. Le marché de l'utilitaire d'occasion y est l'un des plus dynamiques du sud de la France, porté par les besoins logistiques du port, les flottes de taxis et VTC, et les artisans du BTP en plein essor avec les projets Euroméditerranée.",
    marche:
      "Le bassin marseillais concentre plusieurs dizaines de milliers d'entreprises utilisatrices d'utilitaires. La densité des chantiers du BTP, l'activité portuaire, les flottes de VTC et de taxis de l'aéroport Marseille-Provence, ainsi que les ambulances et VSL de l'AP-HM, génèrent un flux constant de véhicules professionnels à vendre et à acheter. Les prix sont tirés vers le haut par une demande locale soutenue.",
    villesDesservies: [
      "Marseille — 16 arrondissements (13001 à 13016)",
      "Aubagne (13400)",
      "Aix-en-Provence (13090)",
      "Vitrolles (13127)",
      "Marignane (13700)",
      "Martigues (13500)",
      "Istres (13800)",
      "Plan-de-Cuques (13380)",
      "Allauch (13190)",
      "La Ciotat (13600)",
    ],
    typesVehiculesLocaux: [
      "Taxis marseillais (Peugeot 508, Toyota Prius+, Mercedes Classe E)",
      "VTC aéroport Marignane (Mercedes Classe V, Vito, BMW Serie 2 Gran Tourer)",
      "Fourgons BTP grands chantiers (Sprinter, Master, Ducato)",
      "Ambulances et VSL AP-HM (Volkswagen Transporter, Renault Trafic)",
      "Utilitaires portuaires et logistique Fos (camions 3,5T, hayons)",
    ],
    delaiVenteMoyen: "29 jours",
    exempleVehicule: {
      modele: "Peugeot Boxer L3H2 2023 — 45 000 km",
      prix: "26 500 €",
      delai: "24 jours",
    },
  },
};

const VILLES_SLUGS = Object.keys(VILLES);

export function generateStaticParams() {
  return VILLES_SLUGS.map((ville) => ({ ville }));
}

export async function generateMetadata({
  params,
}: {
  params: { ville: string };
}): Promise<Metadata> {
  const data = VILLES[params.ville];
  if (!data) return {};
  const title = `Dépôt-vente véhicule professionnel à ${data.nom} (${data.cp}) — RoullePro`;
  const description = `Vendez votre utilitaire, VSL, taxi ou VTC via le dépôt-vente RoullePro à ${data.nom}. Garage partenaire certifié, 88% du prix reversé, délai moyen ${data.delaiVenteMoyen}. Reprise garantie si pas vendu sous 90 jours.`;
  return {
    title,
    description,
    alternates: { canonical: `https://roullepro.com/depot-vente/${data.slug}` },
    openGraph: {
      title,
      description,
      url: `https://roullepro.com/depot-vente/${data.slug}`,
      siteName: "RoullePro",
      locale: "fr_FR",
      type: "website",
    },
  };
}

export default function VilleDepotVentePage({
  params,
}: {
  params: { ville: string };
}) {
  const data = VILLES[params.ville];
  if (!data) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Dépôt-vente de véhicules professionnels",
    provider: {
      "@type": "Organization",
      name: "RoullePro",
      url: "https://roullepro.com",
    },
    areaServed: {
      "@type": "City",
      name: data.nom,
      address: {
        "@type": "PostalAddress",
        addressLocality: data.nom,
        postalCode: data.cp,
        addressRegion: data.region,
        addressCountry: "FR",
      },
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      description: `Dépôt-vente de véhicule professionnel à ${data.nom}. 88% du prix de vente reversé au vendeur.`,
    },
    url: `https://roullepro.com/depot-vente/${data.slug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://roullepro.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dépôt-vente",
        item: "https://roullepro.com/depot-vente",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Dépôt-vente ${data.nom}`,
        item: `https://roullepro.com/depot-vente/${data.slug}`,
      },
    ],
  };

  const autresVilles = VILLES_SLUGS.filter((s) => s !== data.slug).map(
    (s) => VILLES[s],
  );

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <MapPin size={14} />
              {data.nom} — {data.departement} ({data.departementNum})
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Dépôt-vente véhicule <br className="hidden sm:block" />
              professionnel à{" "}
              <span className="text-blue-400">{data.nom}</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              {data.intro}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/depot-vente/estimer"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold px-8 py-4 rounded-xl transition text-base"
              >
                Estimer mon véhicule gratuitement
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/depot-vente/garages"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-4 rounded-xl transition text-base backdrop-blur-sm"
              >
                Voir le garage partenaire {data.nom}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400">
              {[
                `Délai de vente moyen : ${data.delaiVenteMoyen}`,
                "88% du prix reversé au vendeur",
                "Reprise garantie à 90 jours",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-blue-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARCHE LOCAL */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Le marché de l&apos;utilitaire d&apos;occasion à {data.nom}
            </h2>
            <p className="text-slate-600 leading-relaxed mb-4">{data.marche}</p>
            <p className="text-slate-600 leading-relaxed">
              RoullePro couvre l&apos;ensemble du bassin de{" "}
              {data.nom} via son garage partenaire certifié. Nous prenons en
              charge toutes les démarches de vente de votre véhicule
              professionnel : expertise technique 40 points, photos HD, annonce
              optimisée, gestion des visites et des offres, sécurisation du
              paiement.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
            <h3 className="font-bold text-lg mb-6">
              Exemple récent de vente à {data.nom}
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                  Véhicule
                </div>
                <div className="font-semibold">
                  {data.exempleVehicule.modele}
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                  Prix de vente
                </div>
                <div className="text-2xl font-extrabold">
                  {data.exempleVehicule.prix}
                </div>
              </div>
              <div>
                <div className="text-blue-200 text-xs uppercase tracking-wide mb-1">
                  Délai de vente
                </div>
                <div className="font-semibold">
                  {data.exempleVehicule.delai}
                </div>
              </div>
            </div>
            <p className="text-blue-200 text-xs mt-6">
              Exemple représentatif. Les délais réels varient selon le modèle,
              l&apos;état et le prix fixé.
            </p>
          </div>
        </div>
      </section>

      {/* TYPES DE VEHICULES LOCAUX */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Les véhicules les plus demandés à {data.nom}
            </h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Le tissu économique local oriente la demande vers des profils
              spécifiques de véhicules utilitaires.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.typesVehiculesLocaux.map((type) => (
              <div
                key={type}
                className="bg-white rounded-xl p-5 border border-slate-100 flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={16} className="text-blue-600" />
                </div>
                <span className="text-slate-700 text-sm leading-relaxed">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ZONE COUVERTE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Zone couverte autour de {data.nom}
          </h2>
          <p className="text-slate-500 text-lg">
            Le garage partenaire RoullePro {data.nom} peut récupérer votre
            véhicule à domicile dans un rayon de 50 km (79 € forfait).
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.villesDesservies.map((ville) => (
            <div
              key={ville}
              className="bg-white border border-slate-100 rounded-lg px-4 py-3 text-sm text-slate-700 flex items-center gap-2"
            >
              <MapPin size={14} className="text-blue-500 flex-shrink-0" />
              {ville}
            </div>
          ))}
        </div>
      </section>

      {/* POURQUOI ROULLEPRO A [VILLE] */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Pourquoi choisir RoullePro à {data.nom}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Clock,
                title: `Délai moyen ${data.delaiVenteMoyen}`,
                desc: `Le bassin de ${data.nom} bénéficie d'une demande soutenue en utilitaires professionnels. Nos véhicules partent en moyenne en ${data.delaiVenteMoyen}.`,
              },
              {
                icon: Shield,
                title: "Reprise garantie 90 jours",
                desc: "Si votre véhicule n'est pas vendu dans les 90 jours, vous le récupérez sans frais et sans pénalité. Zéro risque.",
              },
              {
                icon: TrendingUp,
                title: "88% du prix reversé",
                desc: "Notre commission reste parmi les plus basses du marché : 7% garage, 4% RoullePro, 250 € de préparation. Le reste vous revient.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-6 border border-slate-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-14 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Vendez votre véhicule à {data.nom}
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Estimation gratuite en 2 minutes. Sans engagement. Notre équipe vous
            rappelle dans la journée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/depot-vente/estimer"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-base transition"
            >
              Estimer mon véhicule
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-base transition backdrop-blur-sm"
            >
              <Phone size={16} /> Être rappelé
            </Link>
          </div>
        </div>
      </section>

      {/* MAILLAGE AUTRES VILLES */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          Dépôt-vente RoullePro dans d&apos;autres villes
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {autresVilles.map((v) => (
            <Link
              key={v.slug}
              href={`/depot-vente/${v.slug}`}
              className="bg-white border border-slate-100 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-semibold text-slate-900">
                  Dépôt-vente {v.nom}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {v.cp} — {v.region}
                </div>
              </div>
              <ArrowRight
                size={18}
                className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
