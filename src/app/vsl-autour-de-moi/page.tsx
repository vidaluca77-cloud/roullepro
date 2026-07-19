import type { Metadata } from "next";
import Link from "next/link";
import { Car, ChevronRight, Shield, Search, MapPin, Stethoscope } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";

export const revalidate = 3600;

const TITLE = "VSL autour de moi — Véhicule Sanitaire Léger conventionné CPAM";
const DESCRIPTION =
  "Trouvez un VSL (Véhicule Sanitaire Léger) conventionné près de chez vous. Annuaire France : téléphone direct, tiers payant, remboursement CPAM sur prescription, réservation gratuite.";
const H1 = "VSL autour de moi — trouver un Véhicule Sanitaire Léger conventionné";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/vsl-autour-de-moi" },
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

const VILLES: { nom: string; slug: string }[] = [
  { nom: "Paris", slug: "paris" },
  { nom: "Marseille", slug: "marseille" },
  { nom: "Lyon", slug: "lyon" },
  { nom: "Toulouse", slug: "toulouse" },
  { nom: "Nice", slug: "nice" },
  { nom: "Nantes", slug: "nantes" },
  { nom: "Strasbourg", slug: "strasbourg" },
  { nom: "Montpellier", slug: "montpellier" },
  { nom: "Bordeaux", slug: "bordeaux" },
  { nom: "Lille", slug: "lille" },
  { nom: "Rennes", slug: "rennes" },
  { nom: "Reims", slug: "reims" },
  { nom: "Saint-Étienne", slug: "saint-etienne" },
  { nom: "Le Havre", slug: "le-havre" },
  { nom: "Toulon", slug: "toulon" },
  { nom: "Grenoble", slug: "grenoble" },
  { nom: "Dijon", slug: "dijon" },
  { nom: "Angers", slug: "angers" },
  { nom: "Nîmes", slug: "nimes" },
  { nom: "Caen", slug: "caen" },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Comment trouver un VSL près de chez moi ?",
    answer:
      "Saisissez le nom de votre ville ou votre code postal dans le champ de recherche RoullePro pour afficher les VSL (Véhicules Sanitaires Légers) conventionnés les plus proches, avec téléphone direct, statut de conventionnement et zone d'intervention. L'annuaire couvre la France entière à partir de données publiques officielles vérifiées.",
  },
  {
    question: "Le VSL est-il remboursé par la Sécurité sociale ?",
    answer:
      "Oui, sur prescription médicale. Le remboursement est de 100 % en cas d'ALD en lien avec le transport, d'accident du travail, de maladie professionnelle ou d'hospitalisation, et de 65 % pour les autres motifs, le complément relevant de votre mutuelle. Le tiers payant permet de ne pas avancer les frais sur la part prise en charge. La franchise médicale de 4 € par trajet reste à votre charge.",
  },
  {
    question: "VSL ou taxi conventionné : quelle différence ?",
    answer:
      "Le VSL est un véhicule dédié au transport sanitaire, conduit par un auxiliaire ambulancier formé aux gestes de premiers secours, et l'entreprise détient un agrément ARS. Le taxi conventionné est un taxi classique ayant signé une convention avec la CPAM, sans qualification sanitaire spécifique. Les deux transportent des patients assis et sont remboursés à l'identique ; le médecin choisit le mode adapté à votre état sur la prescription.",
  },
  {
    question: "Faut-il une prescription médicale pour un VSL ?",
    answer:
      "Oui. Le transport en VSL nécessite une prescription médicale de transport (formulaire CERFA 11574*07, référence S3138g) établie par votre médecin traitant ou hospitalier. Sans prescription, le trajet n'est pas pris en charge par l'Assurance maladie. Le jour du transport, présentez le bon de transport et votre carte Vitale pour bénéficier du tiers payant.",
  },
  {
    question: "Quels motifs médicaux justifient un VSL ?",
    answer:
      "Le VSL est indiqué pour les patients transportés assis dont l'état nécessite l'aide d'un tiers : séances de dialyse, chimiothérapie, radiothérapie, consultations de suivi d'une ALD, examens d'imagerie, retours d'hospitalisation ou soins de rééducation. Le VSL ne transporte pas de patient allongé et n'intervient pas en urgence : dans ce cas, c'est une ambulance qui est requise.",
  },
  {
    question: "Faut-il réserver son VSL à l'avance ?",
    answer:
      "Pour un transport programmé (consultation, examen, séance de soins itérative, sortie d'hospitalisation), réservez idéalement 24 à 48 heures à l'avance auprès de la société de VSL de votre choix afin de garantir la disponibilité d'un véhicule. Les sociétés disposant d'un standard dédié peuvent traiter certaines demandes le jour même selon leur planning.",
  },
];

export default function VslAutourDeMoiPage() {
  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "VSL autour de moi", url: "/vsl-autour-de-moi" },
  ]);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Recherche de VSL (Véhicule Sanitaire Léger) conventionné proche",
    name: "Trouver un VSL autour de moi",
    description:
      "Annuaire France entière des VSL agréés ARS et conventionnés CPAM. Recherche par ville, téléphone direct, tiers payant, remboursement Sécurité sociale sur prescription.",
    provider: { "@type": "Organization", name: "RoullePro", url: BASE_URL },
    areaServed: { "@type": "Country", name: "France" },
    audience: { "@type": "Patient" },
    url: `${BASE_URL}/vsl-autour-de-moi`,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <nav className="flex items-center gap-2 text-xs text-blue-200 mb-4 flex-wrap">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/transport-medical" className="hover:text-white">Transport médical</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">VSL autour de moi</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Car className="w-3.5 h-3.5" />
            Annuaire géolocalisé des VSL conventionnés
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl mb-6">
            Trouvez immédiatement un VSL (Véhicule Sanitaire Léger) conventionné proche de chez vous. Recherchez
            votre ville pour afficher les sociétés disponibles, avec téléphone direct, tiers payant et
            remboursement Sécurité sociale sur prescription.
          </p>
          <form action="/transport-medical/recherche" className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-xl">
            <input type="hidden" name="categorie" value="vsl" />
            <div className="flex-1 flex items-center gap-3 px-4">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                name="q"
                placeholder="Votre ville ou code postal"
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

      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm sm:prose-base max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700">

        <section id="trouver">
          <h2>Comment trouver un VSL près de chez vous</h2>
          <p>
            Lorsqu&apos;un transport médical assis est prescrit — séance de dialyse, de chimiothérapie ou de
            radiothérapie, consultation de suivi, examen d&apos;imagerie, sortie d&apos;hospitalisation — trouver
            rapidement un VSL conventionné disponible autour de vous facilite vos démarches. L&apos;annuaire
            RoullePro recense les Véhicules Sanitaires Légers de toute la France à partir de données publiques
            officielles : vous saisissez votre ville ou votre code postal, et la plateforme affiche les sociétés de
            VSL les plus proches, avec leur téléphone direct, leur zone d&apos;intervention et leur statut de
            conventionnement CPAM. Chaque fiche précise si le transporteur pratique le tiers payant. Le service est
            gratuit et sans inscription, pour les patients comme pour leurs proches.
          </p>
        </section>

        <section id="definition">
          <h2>Qu&apos;est-ce qu&apos;un VSL ?</h2>
          <p>
            Le VSL, ou <strong>Véhicule Sanitaire Léger</strong>, est un véhicule de transport assis
            professionnalisé, agréé par l&apos;Agence Régionale de Santé (ARS) et conventionné avec la CPAM. Il est
            destiné aux patients dont l&apos;état est stable mais qui ne peuvent pas se déplacer seuls et doivent
            voyager en position assise, sans surveillance médicale constante. Il s&apos;agit le plus souvent
            d&apos;une berline ou d&apos;un monospace banalisé, identifié par une étoile bleue à six branches,
            pouvant transporter jusqu&apos;à trois patients simultanément. Le conducteur est titulaire d&apos;une
            attestation de formation aux gestes et soins d&apos;urgence et, le plus souvent, du diplôme
            d&apos;auxiliaire ambulancier. Le transport en VSL est <strong>remboursé par la Sécurité sociale</strong>
            {" "}sur prescription médicale, avec dispense d&apos;avance des frais (tiers payant).
          </p>
        </section>

        <section id="vsl-taxi-ambulance">
          <h2>VSL, taxi conventionné ou ambulance : lequel choisir ?</h2>
          <p>
            Trois modes de transport sanitaire coexistent et répondent chacun à un besoin précis indiqué par le
            médecin sur la prescription. Le <strong>VSL</strong> transporte les patients assis en état stable, avec
            un conducteur formé aux premiers secours et un agrément ARS. Le <strong>taxi conventionné</strong> est un
            taxi classique agréé par la CPAM : il transporte lui aussi les patients autonomes assis, mais sans
            qualification sanitaire ; VSL et taxi conventionné sont <strong>remboursés à l&apos;identique</strong>.
            L&apos;<strong>ambulance</strong>, enfin, est réservée aux patients devant être transportés allongés ou
            sous surveillance médicale. Pour un transport allongé ou en urgence, trouvez une{" "}
            <Link href="/ambulance-autour-de-moi">ambulance autour de vous</Link> ; pour un transport assis en taxi,
            consultez <Link href="/taxi-vsl-autour-de-moi">taxi conventionné et VSL autour de moi</Link>. Pour tout
            comprendre, lisez nos guides{" "}
            <Link href="/guides/vsl-vs-taxi-conventionne">VSL ou taxi conventionné</Link> et{" "}
            <Link href="/guides/vsl-reglementation-transport-partage">VSL, réglementation et transport partagé</Link>.
          </p>
        </section>

        <section id="villes">
          <h2>Sélectionner un VSL par ville</h2>
          <p>
            Accédez directement aux VSL conventionnés de votre agglomération parmi les principales villes de France.
            Chaque page ville liste les VSL aux côtés des ambulances et taxis conventionnés :
          </p>
          <div className="not-prose grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-6">
            {VILLES.map((v) => (
              <Link
                key={v.slug}
                href={`/vsl/${v.slug}`}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition"
              >
                VSL {v.nom}
              </Link>
            ))}
          </div>
          <p>
            Vous pouvez aussi consulter le{" "}
            <Link href="/vsl">guide national du VSL</Link>, la{" "}
            <Link href="/transport-medical/autour-de-moi">recherche géolocalisée tous transports</Link> ou le{" "}
            <Link href="/glossaire">glossaire du transport sanitaire</Link>.
          </p>
        </section>

        <section id="remboursement">
          <h2>Quand le VSL est-il remboursé</h2>
          <p>
            Le transport en VSL prescrit par un médecin est pris en charge par la Sécurité sociale lorsque
            l&apos;état du patient justifie un transport assis accompagné. Le remboursement atteint 100 % en cas
            d&apos;affection longue durée (ALD) en lien avec le transport, d&apos;accident du travail, de maladie
            professionnelle ou d&apos;hospitalisation, et 65 % pour les autres motifs, le complément relevant de la
            mutuelle. Le tiers payant évite l&apos;avance des frais sur la part remboursée. La franchise médicale de
            4 € par trajet (plafonnée à 8 € par jour et 50 € par an) reste à la charge de l&apos;assuré.
          </p>
        </section>
      </article>

      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
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
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Un transport en VSL à organiser ?</h2>
          <p className="text-blue-100 mb-6 leading-relaxed inline-flex items-center gap-2 justify-center">
            <Stethoscope className="w-4 h-4" /> Recherchez un VSL conventionné par ville ci-dessus, ou explorez tout
            l&apos;annuaire du transport sanitaire.
          </p>
          <div>
            <Link
              href="/transport-medical"
              className="inline-flex items-center gap-2 bg-white text-[#0066CC] font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Voir tout l&apos;annuaire du transport sanitaire
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
