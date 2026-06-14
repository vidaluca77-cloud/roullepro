import type { Metadata } from "next";
import Link from "next/link";
import { Cross, ChevronRight, Shield, Search, MapPin, Phone } from "lucide-react";
import { buildFaqJsonLd, buildBreadcrumbJsonLd } from "@/lib/sanitaire-seo";

export const revalidate = 3600;

const TITLE = "Ambulance autour de moi : trouver une ambulance proche en France 2026";
const DESCRIPTION =
  "Trouvez une ambulance près de chez vous immédiatement. Annuaire complet France : numéros, agréments, dispense d'avance des frais, urgences 24/7.";
const H1 = "Ambulance autour de moi — Trouver une ambulance proche en France";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/ambulance-autour-de-moi" },
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
  { nom: "Saint-Denis", slug: "saint-denis" },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Comment trouver une ambulance autour de moi ?",
    answer:
      "Saisissez le nom de votre ville dans le champ de recherche RoullePro pour afficher les ambulances agréées les plus proches, avec téléphone direct, statut de conventionnement et zone d'intervention. L'annuaire couvre la France entière à partir de données publiques officielles vérifiées.",
  },
  {
    question: "Quel numéro appeler en cas d'urgence vitale ?",
    answer:
      "En cas d'urgence vitale (détresse respiratoire, douleur thoracique, perte de connaissance, accident grave), composez immédiatement le 15 (SAMU), le 18 (pompiers) ou le 112 (numéro d'urgence européen). Ces services dépêchent les secours adaptés. Les ambulances privées de l'annuaire assurent quant à elles les transports programmés ou non urgents.",
  },
  {
    question: "Quelle différence entre ambulance privée et SAMU ?",
    answer:
      "Le SAMU (15) gère la régulation médicale des urgences vitales et engage les moyens publics (SMUR, pompiers). Les ambulances privées agréées assurent les transports sanitaires sur prescription (sorties d'hospitalisation, consultations, transferts) et peuvent être réquisitionnées par le SAMU dans le cadre de la garde départementale. Pour un transport programmé, vous contactez directement une ambulance de l'annuaire.",
  },
  {
    question: "L'ambulance est-elle remboursée par la Sécurité sociale ?",
    answer:
      "Oui, sur prescription médicale. Le remboursement est de 100 % en cas d'ALD en lien avec le transport, d'accident du travail, de maladie professionnelle ou d'hospitalisation, et de 55 % pour les autres motifs. Le tiers payant permet de ne pas avancer les frais sur la part prise en charge. La franchise médicale de 4 € par trajet reste à votre charge.",
  },
  {
    question: "Les ambulances pratiquent-elles la dispense d'avance des frais ?",
    answer:
      "La majorité des ambulances conventionnées pratiquent la dispense d'avance des frais (tiers payant). Présentez votre carte Vitale et la prescription médicale : l'entreprise facture directement la CPAM. Cette mention figure sur chaque fiche de l'annuaire RoullePro.",
  },
  {
    question: "Peut-on réserver une ambulance 24h/24 ?",
    answer:
      "Certaines entreprises disposent d'une astreinte permettant de répondre à toute heure, notamment dans le cadre de la garde ambulancière organisée par le préfet. Pour un transport programmé, réservez 24 à 48 heures à l'avance ; pour une urgence vitale, composez le 15.",
  },
];

export default function AmbulanceAutourDeMoiPage() {
  const faqLd = buildFaqJsonLd(FAQ);
  const breadLd = buildBreadcrumbJsonLd([
    { name: "Accueil", url: "/" },
    { name: "Transport médical", url: "/transport-medical" },
    { name: "Ambulance autour de moi", url: "/ambulance-autour-de-moi" },
  ]);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Recherche d'ambulance agréée proche",
    name: "Trouver une ambulance autour de moi",
    description:
      "Annuaire France entière des ambulances agréées et conventionnées CPAM. Recherche par ville, téléphone direct, dispense d'avance des frais.",
    provider: { "@type": "Organization", name: "RoullePro", url: BASE_URL },
    areaServed: { "@type": "Country", name: "France" },
    audience: { "@type": "Patient" },
    url: `${BASE_URL}/ambulance-autour-de-moi`,
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
            <span className="text-white">Ambulance autour de moi</span>
          </nav>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Cross className="w-3.5 h-3.5" />
            Annuaire géolocalisé des ambulances agréées
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{H1}</h1>
          <p className="text-blue-100 max-w-2xl mb-6">
            Trouvez immédiatement une ambulance proche de chez vous. Recherchez votre ville pour afficher les
            entreprises agréées, avec téléphone direct et dispense d'avance des frais.
          </p>
          <form action="/transport-medical/recherche" className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-xl">
            <input type="hidden" name="categorie" value="ambulance" />
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
          <h2>Comment trouver une ambulance près de chez vous</h2>
          <p>
            Lorsqu'un transport en ambulance est nécessaire — sortie d'hospitalisation, transfert entre
            établissements, consultation pour un patient devant rester allongé — trouver rapidement une entreprise
            agréée et disponible autour de vous est essentiel. L'annuaire RoullePro recense les ambulances de toute
            la France à partir de données publiques officielles : vous saisissez votre ville ou votre code postal,
            et la plateforme affiche les entreprises les plus proches avec leur téléphone direct, leur zone
            d'intervention et leur statut de conventionnement CPAM. Vous évitez ainsi de contacter une à une
            plusieurs compagnies. Chaque fiche indique si l'entreprise pratique la dispense d'avance des frais
            (tiers payant) et si elle dispose d'une astreinte. Le service est gratuit et sans inscription pour les
            patients comme pour leurs proches.
          </p>
        </section>

        <section id="reflexes">
          <h2>Les bons réflexes en cas d'urgence</h2>
          <p>
            En cas d'urgence vitale, l'ambulance privée n'est pas le premier réflexe : ce sont les services de
            secours publics qu'il faut joindre immédiatement.
          </p>
          <ul>
            <li><strong>15 (SAMU)</strong> : urgence médicale, malaise grave, détresse respiratoire, douleur thoracique ;</li>
            <li><strong>18 (Pompiers)</strong> : accident, incendie, situation nécessitant un secours immédiat ;</li>
            <li><strong>112</strong> : numéro d'urgence européen, joignable partout en Europe, y compris depuis un mobile sans réseau de l'opérateur ;</li>
            <li><strong>114</strong> : numéro d'urgence par SMS pour les personnes sourdes ou malentendantes.</li>
          </ul>
          <p>
            L'ambulance privée agréée intervient pour les transports programmés ou non urgents. Elle peut aussi
            être engagée par le SAMU dans le cadre de la garde départementale.
          </p>
        </section>

        <section id="urgence-vs-programme">
          <h2>Différence urgence vitale et transport médical programmé</h2>
          <p>
            Une urgence vitale met en jeu le pronostic vital immédiat : elle relève de la régulation du SAMU
            (15), qui dépêche les moyens adaptés (SMUR, pompiers, ambulance réquisitionnée). Le transport médical
            programmé, lui, concerne un patient dont l'état est connu et stable : retour d'hospitalisation,
            transfert pour examen, consultation spécialisée, séance de soins. Il nécessite une prescription
            médicale et se réserve à l'avance auprès d'une ambulance, d'un VSL ou d'un taxi conventionné selon
            l'état du patient. Pour comparer ces modes, consultez notre{" "}
            <Link href="/transport-medical">guide du transport médical</Link>.
          </p>
        </section>

        <section id="villes">
          <h2>Sélectionner une ambulance par ville</h2>
          <p>
            Accédez directement aux ambulances agréées de votre agglomération parmi les principales villes de
            France :
          </p>
          <div className="not-prose grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 my-6">
            {VILLES.map((v) => (
              <Link
                key={v.slug}
                href={`/transport-medical/${v.slug}`}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl px-3 py-2 text-sm font-semibold text-gray-900 transition"
              >
                Ambulance {v.nom}
              </Link>
            ))}
          </div>
        </section>

        <section id="remboursement">
          <h2>Quand l'ambulance est-elle remboursée</h2>
          <p>
            Le transport en ambulance prescrit par un médecin est pris en charge par la Sécurité sociale lorsque
            l'état du patient justifie un transport allongé ou sous surveillance. Le remboursement atteint 100 %
            en cas d'affection longue durée (ALD) en lien avec le transport, d'accident du travail, de maladie
            professionnelle ou d'hospitalisation, et 55 % pour les autres motifs, le complément relevant de la
            mutuelle. Le tiers payant évite l'avance des frais sur la part remboursée. La franchise médicale de
            4 € par trajet (plafonnée à 8 € par jour et 50 € par an) reste à la charge de l'assuré.
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
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Une urgence vitale ?</h2>
          <p className="text-blue-100 mb-2 leading-relaxed">
            En cas d'urgence vitale, composez le <strong className="text-white">15</strong> (SAMU) ou le{" "}
            <strong className="text-white">112</strong>.
          </p>
          <p className="text-blue-100 mb-6 leading-relaxed inline-flex items-center gap-2 justify-center">
            <Phone className="w-4 h-4" /> Pour un transport programmé, recherchez une ambulance par ville
            ci-dessus.
          </p>
          <div>
            <Link
              href="/transport-medical"
              className="inline-flex items-center gap-2 bg-white text-[#0066CC] font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
            >
              Voir tout l'annuaire du transport sanitaire
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
