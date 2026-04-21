import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ Dépôt-vente | RoullePro",
  description:
    "Questions fréquentes sur le dépôt-vente de véhicules professionnels : fonctionnement, délais, commissions, récupération à domicile, fiscalité.",
  alternates: { canonical: "https://roullepro.com/depot-vente/faq" },
  openGraph: {
    title: "FAQ Dépôt-vente | RoullePro",
    description:
      "Tout ce qu'il faut savoir sur le dépôt-vente de VTC, taxi et utilitaires pros avec RoullePro.",
    url: "https://roullepro.com/depot-vente/faq",
    type: "website",
  },
};

type FAQItem = { q: string; a: string };

const FAQ: FAQItem[] = [
  {
    q: "Qu'est-ce que le dépôt-vente RoullePro ?",
    a: "Le dépôt-vente est un service qui vous permet de confier votre véhicule professionnel (VTC, taxi, utilitaire) à un garage partenaire RoullePro. Le garage se charge de la préparation, de la présentation et des essais aux acquéreurs pendant 90 jours. Vous n'avez rien à gérer : pas d'appels, pas de visites, pas de négociation.",
  },
  {
    q: "Combien vais-je toucher en tant que vendeur ?",
    a: "Sur le prix de vente final, vous touchez 88%. Les 12% restants se répartissent ainsi : 7% + 250€ de forfait préparation pour le garage partenaire, 4% de commission pour la plateforme RoullePro, et environ 1% de frais de paiement Stripe supportés par RoullePro. Vous recevez votre paiement sous 7 jours ouvrés après la vente effective.",
  },
  {
    q: "Combien de temps dure un dépôt ?",
    a: "Le mandat de dépôt-vente est conclu pour 90 jours calendaires à compter du dépôt effectif du véhicule chez le garage. Si le véhicule n'est pas vendu dans ce délai, vous pouvez soit le récupérer gratuitement sous 10 jours ouvrés, soit prolonger le dépôt de 30 jours supplémentaires.",
  },
  {
    q: "Que se passe-t-il si mon véhicule ne se vend pas ?",
    a: "Aucune pénalité, aucun frais caché. Vous récupérez votre véhicule gratuitement au garage dans un délai de 10 jours ouvrés. Si vous aviez opté pour la récupération à domicile à l'aller, les frais de 79€ restent dus mais vous ne payez rien pour reprendre le véhicule.",
  },
  {
    q: "Le garage peut-il venir chercher mon véhicule chez moi ?",
    a: "Oui. Nous proposons une option de récupération à domicile au forfait de 79€, valable dans un rayon de 50 km autour du garage partenaire. Les frais sont déduits du produit de la vente. Ce service inclut le transport et l'assurance pendant le trajet.",
  },
  {
    q: "Comment est calculé le prix de vente ?",
    a: "Nous vous proposons une estimation sur la base des Argus professionnels, des ventes comparables sur le marché VTC/taxi/utilitaire, et de l'état déclaré du véhicule. Le garage partenaire affine ensuite cette estimation après expertise physique (contrôle mécanique, carrosserie, intérieur). Le prix final est validé avec vous avant la mise en vente.",
  },
  {
    q: "Qui s'occupe des visites et des essais ?",
    a: "Le garage partenaire gère intégralement la relation avec les acheteurs : prise de contact, réponses aux questions, organisation des essais, négociation. Vous n'avez pas à vous déplacer ni à gérer les appels. Vous êtes uniquement sollicité au moment d'accepter une offre finale.",
  },
  {
    q: "Les garages partenaires sont-ils certifiés ?",
    a: "Oui. Tous nos garages partenaires sont vérifiés : numéro SIRET contrôlé auprès de l'INSEE, assurance professionnelle vérifiée, minimum 3 ans d'ancienneté, capacité de stationnement couverte, et engagement contractuel sur la charte qualité RoullePro.",
  },
  {
    q: "Pourquoi le nom du garage n'est-il pas affiché publiquement ?",
    a: "Pour préserver leur exclusivité commerciale et éviter la sollicitation directe, nos garages partenaires sont identifiés par leur ville uniquement (exemple : 'Partenaire RoullePro — Caen'). L'identité complète du garage vous est communiquée dès que vous lancez une candidature de dépôt, afin d'organiser le rendez-vous.",
  },
  {
    q: "Quelle est la fiscalité d'une vente en dépôt ?",
    a: "Pour un véhicule professionnel : la vente génère une plus-value ou moins-value qui s'intègre au résultat comptable de votre entreprise (réintégration de TVA le cas échéant). RoullePro vous fournit une facture détaillée après la vente. Pour un particulier, la vente est non imposable sauf si vous relevez du régime des biens d'occasion de plus de 5 000€. Consultez votre expert-comptable pour votre situation précise.",
  },
  {
    q: "Mon véhicule est-il assuré pendant le dépôt ?",
    a: "Oui. Dès la remise effective au garage partenaire, votre véhicule est couvert par l'assurance professionnelle (garage) du dépositaire : stationnement, vol, incendie, et essais routiers avec acquéreurs potentiels. Vous pouvez résilier votre propre assurance pendant la durée du dépôt si vous le souhaitez.",
  },
  {
    q: "Puis-je récupérer mon véhicule avant la fin des 90 jours ?",
    a: "Oui, à tout moment. Si vous souhaitez annuler le dépôt avant son terme (vente trouvée ailleurs, changement d'avis), aucun frais ne s'applique sauf si des frais de préparation (nettoyage, petites réparations) ont déjà été engagés par le garage. Dans ce cas, un forfait est facturé au réel.",
  },
  {
    q: "Quels types de véhicules acceptez-vous ?",
    a: "Notre spécialité couvre les véhicules professionnels : VTC (berlines, premium), taxis, utilitaires légers (fourgonnettes, fourgons), VUL (véhicules utilitaires légers jusqu'à 3,5t), et certains VU aménagés. Les véhicules doivent avoir moins de 10 ans, moins de 300 000 km, et un contrôle technique de moins de 6 mois.",
  },
  {
    q: "Qu'est-ce qui distingue le dépôt-vente de la vente directe ou de la reprise concession ?",
    a: "Vente directe sur un marketplace : vous touchez potentiellement plus mais gérez tout vous-même (photos, appels, visites, négociation) pendant des semaines. Reprise concession : très rapide mais vous perdez 20 à 30% du prix marché. Dépôt-vente RoullePro : vous ne gérez rien, vous touchez 88% du prix marché réel, et vous êtes payé sous 7 jours après la vente.",
  },
  {
    q: "Comment sont sécurisés les paiements ?",
    a: "Tous les paiements transitent par Stripe (leader mondial du paiement en ligne, agréé AMF). L'acheteur paie sur une page sécurisée, les fonds sont mis en séquestre, et le reversement vers vous (88%) et le garage (7% + 250€) est déclenché automatiquement une fois la remise du véhicule confirmée. Aucune transaction ne passe en main propre.",
  },
];

export default function FAQDepotVentePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="text-sm text-slate-500 mb-8" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:text-slate-700">Accueil</Link>
            <span className="mx-2">/</span>
            <Link href="/depot-vente" className="hover:text-slate-700">Dépôt-vente</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-900">FAQ</span>
          </nav>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Questions fréquentes
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Tout ce qu'il faut savoir sur le dépôt-vente RoullePro avant de confier votre véhicule.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
            {FAQ.map((item, idx) => (
              <details
                key={idx}
                className="group p-6 hover:bg-slate-50/50 transition-colors"
                open={idx < 3}
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                  <h2 className="text-base md:text-lg font-semibold text-slate-900 flex-1">
                    {item.q}
                  </h2>
                  <span
                    aria-hidden
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-open:rotate-45 transition-transform"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-slate-700 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Une autre question ?
            </h2>
            <p className="text-slate-700 mb-6">
              Notre équipe répond sous 24h ouvrées. Vous pouvez aussi démarrer une estimation gratuite dès maintenant.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/depot-vente/estimer"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Estimer mon véhicule
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-300 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Poser ma question
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
