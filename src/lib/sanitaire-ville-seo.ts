/**
 * Surcharges SEO editoriales pour les hubs villes prioritaires (Phase 1 S1 du plan SEO).
 *
 * Les pages /transport-medical/[ville] sont generiques et alimentees par Supabase.
 * Pour les villes a fort potentiel ("taxi conventionne [ville]"), on injecte un
 * contenu redactionnel cible (title, meta, H1, intro, FAQ) afin de gagner des positions
 * sur les requetes locales. Le contenu reste factuel et conforme a la convention CPAM
 * 2025-2026. Les villes non listees conservent le rendu generique.
 */

export type VilleFaqItem = { question: string; answer: string };

export type VilleSeoOverride = {
  /** Title balise <title> (<= 60 caracteres recommande). */
  title: string;
  /** Meta description (<= 155 caracteres recommande). */
  description: string;
  /** H1 affiche en tete de page. */
  h1: string;
  /** Intro redactionnelle (<= 180 mots). */
  intro: string;
  /** 6 questions FAQ specifiques a la ville (FAQPage JSON-LD). */
  faq: VilleFaqItem[];
  /** Departement servi, pour le Service schema (areaServed). */
  departement: string;
};

const NICE_FAQ: VilleFaqItem[] = [
  {
    question: "Comment trouver un taxi conventionné CPAM à Nice ?",
    answer:
      "Utilisez l'annuaire RoullePro Nice qui recense les 47 taxis conventionnés agréés par la CPAM des Alpes-Maritimes. Chaque fiche indique le numéro d'agrément, les modes de paiement acceptés (dispense d'avance des frais possible) et les véhicules adaptés.",
  },
  {
    question: "Quel est le tarif d'un taxi conventionné à Nice ?",
    answer:
      "Le tarif est fixé par la convention CPAM signée pour 2025-2026 : prise en charge 2,80 €, kilomètre tarif A 1,12 €/km, attente 28,80 €/h. La CPAM rembourse 100 % sur prescription médicale en cas d'ALD, et 65 % pour les autres motifs.",
  },
  {
    question: "Faut-il une prescription pour utiliser un taxi conventionné à Nice ?",
    answer:
      "Oui, la prescription médicale (bon de transport) du médecin traitant ou hospitalier est obligatoire pour bénéficier du remboursement CPAM. Sans prescription, la course est considérée comme un taxi classique au tarif libre.",
  },
  {
    question: "Quelle différence entre taxi conventionné, VSL et ambulance à Nice ?",
    answer:
      "Le taxi conventionné transporte un patient autonome en position assise. Le VSL est un véhicule sanitaire léger avec personnel formé, pour patients nécessitant un accompagnement. L'ambulance est requise pour les patients allongés ou en état grave. Le choix est indiqué par le médecin sur la prescription.",
  },
  {
    question: "Comment réserver un taxi conventionné à Nice en urgence ?",
    answer:
      "Appelez directement l'une des entreprises listées sur RoullePro Nice. Pour une réservation immédiate à toute heure, privilégiez les compagnies disposant d'un standard 24/7 (signalées sur leur fiche). Les hospitalisations programmées doivent être réservées 48 h à l'avance.",
  },
  {
    question: "Les taxis conventionnés de Nice acceptent-ils la dispense d'avance des frais ?",
    answer:
      "La majorité des taxis conventionnés CPAM 06 pratiquent la dispense d'avance des frais (tiers payant). Présentez votre carte Vitale et la prescription, le chauffeur facture directement la CPAM. Cette mention est précisée sur chaque fiche entreprise.",
  },
];

const VILLE_SEO_OVERRIDES: Record<string, VilleSeoOverride> = {
  nice: {
    title: "Taxi conventionné Nice 06 | Transport médical CPAM | RoullePro",
    description:
      "Trouvez un taxi conventionné CPAM à Nice et dans les Alpes-Maritimes. 47 entreprises agréées : tarifs, agrément, réservation immédiate.",
    h1: "Taxi conventionné Nice 06 — Trouver un transport médical CPAM dans les Alpes-Maritimes",
    intro:
      "À Nice et dans les Alpes-Maritimes, plus de 47 taxis conventionnés CPAM proposent un transport médical pris en charge à 100 % sur prescription médicale. Que ce soit pour des séances de dialyse au CHU Pasteur, des consultations à l'Archet, ou un retour d'hospitalisation depuis la clinique Saint-Georges, RoullePro centralise les coordonnées et agréments officiels de chaque entreprise. Vous évitez de chercher pendant des heures : tarif convention, numéro d'agrément CPAM 06, modes de paiement (tiers payant, dispense d'avance des frais), véhicules adaptés (PMR, civière, brancard), réservation 7j/7. Notre annuaire est vérifié chaque mois auprès des préfectures et de la CPAM 06. Pour les patients en ALD (affection longue durée), la prescription du médecin traitant suffit pour activer la prise en charge à 100 %. Consultez ci-dessous la liste des taxis conventionnés à Nice classés par quartier, ou utilisez notre recherche par adresse pour trouver immédiatement le transport médical le plus proche de chez vous.",
    faq: NICE_FAQ,
    departement: "06",
  },
};

/**
 * Retourne la surcharge SEO editoriale d'une ville prioritaire, ou null si la ville
 * doit conserver le rendu generique alimente par Supabase.
 */
export function getVilleSeoOverride(villeSlug: string): VilleSeoOverride | null {
  return VILLE_SEO_OVERRIDES[villeSlug] ?? null;
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

/**
 * Service schema (transport médical conventionné) pour une page hub ville.
 * areaServed = la ville ; couvre la requete "taxi conventionné [ville]".
 */
export function buildVilleServiceJsonLd(nomVille: string, villeSlug: string, departement: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Transport médical conventionné",
    name: `Taxi conventionné et transport médical CPAM à ${nomVille}`,
    description: `Annuaire des taxis conventionnés, VSL et ambulances agréés CPAM à ${nomVille} (${departement}). Transport médical sur prescription, remboursé par la Sécurité sociale.`,
    provider: {
      "@type": "Organization",
      name: "RoullePro",
      url: BASE_URL,
    },
    areaServed: {
      "@type": "City",
      name: nomVille,
    },
    audience: {
      "@type": "Patient",
    },
    url: `${BASE_URL}/transport-medical/${villeSlug}`,
  };
}
