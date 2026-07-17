import type { Metadata } from "next";
import Link from "next/link";
import { Cross, ChevronRight, Shield, Search, MapPin } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";

export const revalidate = 3600;

const TITLE =
  "Transport sanitaire 2026 : ambulance, VSL, démarches et remboursement";
const DESCRIPTION =
  "Transport sanitaire en France 2026 : ambulance, VSL, taxi conventionné. Prescription, agrément, tarifs, remboursement CPAM 100 %. Annuaire vérifié.";
const H1 =
  "Transport sanitaire en France — Guide 2026 et annuaire des entreprises agréées";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/transport-sanitaire" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Qu'est-ce que le transport sanitaire ?",
    answer:
      "Le transport sanitaire désigne le transport, sur prescription médicale, de personnes malades, blessées ou parturientes, réalisé par une entreprise agréée par l'Agence Régionale de Santé (ARS). Il recouvre deux modes : l'ambulance (transport allongé ou surveillé) et le VSL (Véhicule Sanitaire Léger, transport assis avec aide). Le cadre légal impose un agrément, des véhicules conformes et du personnel diplômé.",
  },
  {
    question: "Quelle différence entre transport sanitaire et transport médical ?",
    answer:
      "Le transport sanitaire est une notion juridique stricte : il regroupe les transports réalisés par des entreprises agréées ARS (ambulances et VSL), avec personnel formé. Le transport médical est un terme plus large, employé par le grand public, qui inclut aussi le taxi conventionné CPAM — lequel n'est pas un transport sanitaire au sens réglementaire, faute d'agrément ARS et de qualification sanitaire du chauffeur.",
  },
  {
    question: "Quels sont les types de transport sanitaire ?",
    answer:
      "Deux types relèvent du transport sanitaire agréé : l'ambulance, pour les patients devant être transportés allongés ou nécessitant une surveillance, avec un équipage de deux personnes dont un diplômé d'État d'ambulancier (DEA) ; et le VSL, pour les patients stables transportés assis avec l'aide d'un auxiliaire ambulancier. Le taxi conventionné, lui, complète l'offre mais reste hors champ sanitaire stricto sensu.",
  },
  {
    question: "Le transport sanitaire est-il remboursé par la CPAM ?",
    answer:
      "Oui, sur prescription médicale. Le remboursement est de 100 % en cas d'affection longue durée (ALD) en lien avec le transport, d'accident du travail, de maladie professionnelle ou d'hospitalisation, et de 55 % à 65 % selon le mode pour les autres motifs. Le tiers payant évite l'avance des frais sur la part prise en charge.",
  },
  {
    question: "Qu'est-ce qu'un agrément de transport sanitaire ?",
    answer:
      "L'agrément est délivré par l'ARS de la région. Il atteste que l'entreprise dispose de véhicules conformes (catégorie A, C ou D), d'un personnel diplômé en nombre suffisant et qu'elle respecte les obligations de garde départementale. Sans agrément ARS, une entreprise ne peut exploiter ni ambulance ni VSL.",
  },
  {
    question: "Qu'est-ce qu'un transport sanitaire bariatrique ?",
    answer:
      "Le transport bariatrique est un transport sanitaire adapté aux patients en situation d'obésité sévère. Il mobilise des véhicules et des brancards renforcés, supportant des charges élevées, et un équipage formé à la manutention spécifique. Il est prescrit comme tout transport sanitaire et pris en charge par l'Assurance maladie.",
  },
  {
    question: "Comment trouver une entreprise de transport sanitaire agréée ?",
    answer:
      "Utilisez l'annuaire RoullePro : recherchez votre ville ou votre département pour afficher les ambulances et VSL agréés, avec téléphone direct et statut de conventionnement. L'annuaire couvre la France entière à partir de données publiques officielles vérifiées.",
  },
  {
    question: "Faut-il réserver un transport sanitaire à l'avance ?",
    answer:
      "Pour un transport programmé (consultation, dialyse, sortie d'hospitalisation), il est recommandé de réserver 24 à 48 heures à l'avance afin de garantir la disponibilité d'un véhicule et d'un équipage. Les entreprises disposant d'une astreinte peuvent traiter certaines demandes le jour même. En cas d'urgence vitale, composez le 15 (SAMU).",
  },
];

export default function TransportSanitairePage() {
  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "Transport sanitaire", url: "/transport-sanitaire" },
  ]);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Transport sanitaire agréé ARS (ambulance et VSL)",
    name: "Annuaire national du transport sanitaire",
    description:
      "Annuaire France entière des entreprises de transport sanitaire agréées par l'ARS : ambulances et VSL conventionnés CPAM, sur prescription médicale.",
    provider: { "@type": "Organization", name: "RoullePro", url: BASE_URL },
    areaServed: { "@type": "Country", name: "France" },
    audience: { "@type": "Patient" },
    url: `${BASE_URL}/transport-sanitaire`,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/transport-medical" className="hover:text-white">Transport médical</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Transport sanitaire</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Cross className="w-3.5 h-3.5" />
            Guide 2026 et annuaire des entreprises agréées ARS
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl">
            Cadre légal, agrément ARS, types de transport sanitaire, spécialités, tarifs et remboursement CPAM.
            Le guide complet du transport sanitaire en France, avec annuaire des ambulances et VSL vérifiés.
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">

        <section id="definition">
          <h2>Définition du transport sanitaire</h2>
          <p>
            Le transport sanitaire désigne, au sens du Code de la santé publique, le transport de personnes
            malades, blessées ou parturientes effectué sur prescription médicale par une entreprise agréée. Cet
            agrément est délivré par l'Agence Régionale de Santé (ARS) : il garantit que l'entreprise dispose de
            véhicules conformes, d'un personnel diplômé et qu'elle participe à la garde départementale organisée
            par le préfet. Le transport sanitaire est encadré par une réglementation stricte qui le distingue du
            simple transport de personnes.
          </p>
          <p>
            Deux modes relèvent du transport sanitaire : l'ambulance, pour les transports allongés ou surveillés,
            et le VSL (Véhicule Sanitaire Léger), pour les transports assis avec aide. Tous deux sont conventionnés
            avec la CPAM, ce qui permet la prise en charge par la Sécurité sociale et le tiers payant.
          </p>
        </section>

        <section id="vs-medical">
          <h2>Différence transport sanitaire et transport médical</h2>
          <p>
            Les expressions « transport sanitaire » et « transport médical » sont souvent confondues, mais elles
            ne recouvrent pas exactement le même périmètre. Le transport sanitaire est une catégorie juridique :
            il regroupe uniquement les ambulances et les VSL exploités par des entreprises agréées ARS, avec
            personnel sanitaire formé. Le transport médical est un terme générique du grand public qui englobe en
            plus le taxi conventionné CPAM. Or le taxi conventionné, faute d'agrément ARS et de qualification
            sanitaire du chauffeur, n'est pas un transport sanitaire au sens réglementaire, même s'il assure bien
            un transport de patients remboursé.
          </p>
          <p>
            Pour un panorama complet incluant le taxi conventionné, consultez notre{" "}
            <Link href="/transport-medical">guide du transport médical</Link>.
          </p>
        </section>

        <section id="types">
          <h2>Les types de transport sanitaire</h2>
          <p>
            Le transport sanitaire se décline en deux modes complémentaires, chacun prescrit selon l'état du
            patient :
          </p>
          <ul>
            <li>
              <strong>L'ambulance</strong> : véhicule équipé (brancard, oxygène, matériel de secours) avec un
              équipage de deux personnes dont un diplômé d'État d'ambulancier (DEA). Indiquée pour les patients
              devant voyager allongés, sous surveillance, ou en cas d'urgence relevant du transport programmé.
            </li>
            <li>
              <strong>Le VSL (Véhicule Sanitaire Léger)</strong> : berline ou monospace conduit par un auxiliaire
              ambulancier formé aux premiers secours, pour les patients stables transportés assis ayant besoin
              d'une aide pour se déplacer. Détail complet sur notre page{" "}
              <Link href="/vsl">VSL</Link>.
            </li>
          </ul>
          <p>
            Le taxi conventionné est exclu du transport sanitaire stricto sensu : il complète l'offre pour les
            patients autonomes, sans relever du régime d'agrément ARS.
          </p>
          <p>
            Pour estimer et comparer le prix d'un taxi conventionné, d'un VSL ou d'une ambulance sur votre trajet,
            utilisez nos{" "}
            <Link href="/simulateur-transport-sanitaire">simulateurs de transport sanitaire</Link>.
          </p>
        </section>

        <section id="specialites">
          <h2>Spécialités du transport sanitaire</h2>
          <p>
            Au-delà du transport courant, certaines entreprises agréées proposent des prestations spécialisées
            répondant à des besoins médicaux précis :
          </p>
          <ul>
            <li><strong>Transport bariatrique</strong> : véhicules et brancards renforcés pour les patients en obésité sévère ;</li>
            <li><strong>Transport néonatal et pédiatrique</strong> : équipements adaptés au nourrisson et à l'enfant ;</li>
            <li><strong>Transport psychiatrique</strong> : personnel formé à l'accompagnement des patients en souffrance psychique ;</li>
            <li><strong>Transport pour dialyse</strong> : trajets itératifs plusieurs fois par semaine, souvent en transport partagé ;</li>
            <li><strong>Transport pour chimiothérapie</strong> : trajets réguliers vers les centres d'oncologie ;</li>
            <li><strong>Transport pour radiothérapie</strong> : séances quotidiennes sur plusieurs semaines, planification fiable indispensable.</li>
          </ul>
        </section>

        <section id="tarifs">
          <h2>Tarifs et conventions</h2>
          <p>
            Les tarifs du transport sanitaire sont fixés par la convention nationale conclue entre l'Assurance
            maladie et les organisations de transporteurs sanitaires pour la période 2025-2026. Pour le VSL, le
            tarif se compose d'un forfait de prise en charge de 13,50 € et d'une indemnité kilométrique de
            0,93 €/km en tarif A urbain. Pour l'ambulance, le tarif repose sur un forfait départemental majoré du
            kilométrage et d'éventuelles majorations (nuit, dimanche, jours fériés, urgence). Le transport partagé
            bénéficie d'une tarification réduite pour les soins itératifs.
          </p>
        </section>

        <section id="remboursement">
          <h2>Remboursement du transport sanitaire</h2>
          <p>
            Le transport sanitaire prescrit est pris en charge par la Sécurité sociale. Le taux dépend du motif :
          </p>
          <ul>
            <li>
              <strong>100 %</strong> en cas d'ALD en lien avec le transport, d'accident du travail, de maladie
              professionnelle, d'hospitalisation, de maternité à partir du 1er jour du 6e mois, ou pour les
              bénéficiaires de la CSS et de l'AME ;
            </li>
            <li>
              <strong>65 %</strong> pour le VSL et <strong>55 %</strong> pour l'ambulance dans les autres cas ; le
              complément relève de la mutuelle.
            </li>
          </ul>
          <p>
            Le tiers payant évite l'avance des frais. La franchise médicale de 4 € par trajet (plafonnée à 8 € par
            jour et 50 € par an) reste à la charge du patient. Pour aller plus loin, consultez notre article{" "}
            <Link href="/blog/remboursement-transport-medical">remboursement du transport médical</Link>.
          </p>
        </section>
      </article>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes sur le transport sanitaire</h2>
          <div className="space-y-4">
            {FAQ.map((q, i) => (
              <div key={i}>
                <h3 className="font-semibold text-gray-900 mb-1">{q.question}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white mb-4">
            <Shield className="w-3.5 h-3.5" />
            Annuaire public, gratuit, sans inscription
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Trouver un transport sanitaire près de chez moi
          </h2>
          <p className="text-blue-100 mb-6 leading-relaxed">
            Recherchez par ville pour afficher les ambulances et VSL agréés autour de vous.
          </p>
          <form action="/transport-medical/recherche" className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-4">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Votre ville (ex : Lille, Rennes, Dijon...)"
                className="w-full py-3 text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              <Search className="w-4 h-4" />
              Rechercher
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
