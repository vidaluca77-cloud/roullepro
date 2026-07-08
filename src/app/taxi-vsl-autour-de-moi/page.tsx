import type { Metadata } from "next";
import Link from "next/link";
import { Car, ChevronRight, Shield, Search, MapPin, Stethoscope } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";

export const revalidate = 3600;

const TITLE = "Taxi conventionné & VSL autour de moi : trouver un transport CPAM proche 2026";
const DESCRIPTION =
  "Trouvez un taxi conventionné CPAM ou un VSL près de chez vous. Annuaire France : téléphone direct, tiers payant, remboursement Sécurité sociale, réservation gratuite.";
const H1 = "Taxi conventionné et VSL autour de moi — Trouver un transport CPAM proche";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/taxi-vsl-autour-de-moi" },
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
    question: "Comment trouver un taxi conventionné ou un VSL autour de moi ?",
    answer:
      "Saisissez le nom de votre ville ou votre code postal dans le champ de recherche RoullePro pour afficher les taxis conventionnés CPAM et les VSL les plus proches, avec téléphone direct, statut de conventionnement et zone d'intervention. L'annuaire couvre la France entière à partir de données publiques officielles vérifiées.",
  },
  {
    question: "Quelle différence entre un taxi conventionné et un VSL ?",
    answer:
      "Le VSL (véhicule sanitaire léger) est un véhicule dédié au transport de patients assis, conduit par un auxiliaire ambulancier, avec matériel médical de base à bord. Le taxi conventionné est un taxi classique ayant signé une convention avec la CPAM : il transporte les patients assis autonomes. Les deux sont remboursés à l'identique par la Sécurité sociale sur prescription médicale ; le choix dépend de votre autonomie et de l'offre disponible près de chez vous.",
  },
  {
    question: "Le taxi conventionné et le VSL sont-ils remboursés par la CPAM ?",
    answer:
      "Oui, sur prescription médicale. Le remboursement est de 100 % en cas d'ALD en lien avec le transport, d'accident du travail, de maladie professionnelle ou d'hospitalisation, et de 55 % pour les autres motifs. Le tiers payant permet de ne pas avancer les frais sur la part prise en charge. La franchise médicale de 4 € par trajet reste à votre charge.",
  },
  {
    question: "Comment vérifier qu'un taxi est bien conventionné CPAM ?",
    answer:
      "Un taxi conventionné dispose d'un numéro de convention CPAM et affiche généralement l'autocollant « Taxi conventionné Assurance Maladie ». Sur RoullePro, chaque fiche indique clairement le statut de conventionnement à partir des données publiques. Vous pouvez aussi demander directement le numéro de convention au chauffeur avant votre trajet.",
  },
  {
    question: "Faut-il réserver son taxi conventionné ou son VSL à l'avance ?",
    answer:
      "Pour un transport programmé (consultation, examen, séance de soins, sortie d'hospitalisation), réservez idéalement 24 à 48 heures à l'avance auprès du transporteur de votre choix. Munissez-vous de votre prescription médicale de transport, de votre carte Vitale et de votre attestation de mutuelle pour bénéficier du tiers payant.",
  },
];

export default function TaxiVslAutourDeMoiPage() {
  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "Taxi conventionné et VSL autour de moi", url: "/taxi-vsl-autour-de-moi" },
  ]);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Recherche de taxi conventionné CPAM et VSL proche",
    name: "Trouver un taxi conventionné ou un VSL autour de moi",
    description:
      "Annuaire France entière des taxis conventionnés CPAM et VSL. Recherche par ville, téléphone direct, tiers payant, remboursement Sécurité sociale.",
    provider: { "@type": "Organization", name: "RoullePro", url: BASE_URL },
    areaServed: { "@type": "Country", name: "France" },
    audience: { "@type": "Patient" },
    url: `${BASE_URL}/taxi-vsl-autour-de-moi`,
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
            <span className="text-white">Taxi conventionné et VSL autour de moi</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Car className="w-3.5 h-3.5" />
            Annuaire géolocalisé des taxis conventionnés et VSL
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl mb-6">
            Trouvez immédiatement un taxi conventionné CPAM ou un VSL proche de chez vous. Recherchez votre ville
            pour afficher les transporteurs disponibles, avec téléphone direct, tiers payant et remboursement
            Sécurité sociale.
          </p>
          <form action="/transport-medical/recherche" className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-xl">
            <input type="hidden" name="categorie" value="taxi-conventionne" />
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
          <h2>Comment trouver un taxi conventionné ou un VSL près de chez vous</h2>
          <p>
            Lorsqu&apos;un transport médical assis est prescrit — consultation, examen, séance de dialyse, de chimiothérapie
            ou de radiothérapie, sortie d&apos;hospitalisation — trouver rapidement un taxi conventionné CPAM ou un VSL
            disponible autour de vous facilite vos démarches. L&apos;annuaire RoullePro recense les transporteurs de toute
            la France à partir de données publiques officielles : vous saisissez votre ville ou votre code postal, et la
            plateforme affiche les taxis conventionnés et les VSL les plus proches, avec leur téléphone direct, leur zone
            d&apos;intervention et leur statut de conventionnement. Chaque fiche précise si le transporteur pratique le
            tiers payant. Le service est gratuit et sans inscription, pour les patients comme pour leurs proches.
          </p>
        </section>

        <section id="taxi-vs-vsl">
          <h2>Taxi conventionné ou VSL : lequel choisir ?</h2>
          <p>
            Le <strong>VSL (véhicule sanitaire léger)</strong> est un véhicule dédié au transport sanitaire de patients
            assis, conduit par un auxiliaire ambulancier et équipé d&apos;un matériel médical de base. Le
            <strong> taxi conventionné</strong> est un taxi classique ayant signé une convention avec l&apos;Assurance
            Maladie : il transporte les patients autonomes en position assise. Les deux modes sont
            <strong> remboursés à l&apos;identique</strong> par la Sécurité sociale sur prescription médicale. Le choix
            dépend de votre autonomie, de la nature du soin et de l&apos;offre disponible près de chez vous. Pour un
            transport allongé ou sous surveillance, il faut en revanche une{" "}
            <Link href="/ambulance-autour-de-moi">ambulance</Link>.
          </p>
        </section>

        <section id="villes">
          <h2>Sélectionner un taxi conventionné ou un VSL par ville</h2>
          <p>
            Accédez directement aux taxis conventionnés et VSL de votre agglomération parmi les principales villes de
            France :
          </p>
          <div className="not-prose grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-6">
            {VILLES.map((v) => (
              <Link
                key={v.slug}
                href={`/transport-medical/${v.slug}/taxi-conventionne`}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition"
              >
                Taxi conventionné {v.nom}
              </Link>
            ))}
          </div>
        </section>

        <section id="remboursement">
          <h2>Quand le taxi conventionné et le VSL sont-ils remboursés</h2>
          <p>
            Le transport en taxi conventionné ou en VSL prescrit par un médecin est pris en charge par la Sécurité
            sociale lorsque l&apos;état du patient justifie un transport assis accompagné. Le remboursement atteint 100 %
            en cas d&apos;affection longue durée (ALD) en lien avec le transport, d&apos;accident du travail, de maladie
            professionnelle ou d&apos;hospitalisation, et 55 % pour les autres motifs, le complément relevant de la
            mutuelle. Le tiers payant évite l&apos;avance des frais sur la part remboursée. La franchise médicale de
            4 € par trajet (plafonnée à 8 € par jour et 50 € par an) reste à la charge de l&apos;assuré. Pour tout
            savoir, consultez notre{" "}
            <Link href="/blog/remboursement-transport-medical">guide du remboursement du transport médical</Link>.
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
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Un transport médical assis à organiser ?</h2>
          <p className="text-blue-100 mb-6 leading-relaxed inline-flex items-center gap-2 justify-center">
            <Stethoscope className="w-4 h-4" /> Recherchez un taxi conventionné ou un VSL par ville ci-dessus, ou
            explorez tout l&apos;annuaire du transport sanitaire.
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
