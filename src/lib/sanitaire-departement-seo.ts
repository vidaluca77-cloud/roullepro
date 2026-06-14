/**
 * Surcharges SEO editoriales pour les hubs departementaux prioritaires
 * (Phase 1 S1+S2 du plan SEO).
 *
 * Les pages /transport-medical/departement/[code] sont generiques et alimentees
 * par Supabase. Pour les departements a fort potentiel, on injecte un contenu
 * redactionnel cible (title, meta, H1, intro, FAQ) afin de gagner des positions
 * sur les requetes locales departementales. Les departements non listes
 * conservent le rendu generique.
 */

export type DepartementFaqItem = { question: string; answer: string };

export type DepartementSeoOverride = {
  /** Title balise <title>. */
  title: string;
  /** Meta description. */
  description: string;
  /** H1 affiche en tete de page. */
  h1: string;
  /** Intro redactionnelle (~180 mots) ancree sur le departement. */
  intro: string;
  /** FAQ specifique au departement (FAQPage JSON-LD). */
  faq: DepartementFaqItem[];
};

const DEP_06_FAQ: DepartementFaqItem[] = [
  {
    question:
      "Comment trouver un transport médical conventionné CPAM dans les Alpes-Maritimes (06) ?",
    answer:
      "Utilisez l'annuaire RoullePro du département 06 : sélectionnez votre commune (Nice, Cannes, Antibes, Grasse, Menton…) pour accéder aux ambulances, VSL et taxis conventionnés agréés. Chaque fiche indique les coordonnées, l'agrément et les modes de paiement, avec dispense d'avance des frais sur prescription.",
  },
  {
    question:
      "Le transport médical est-il remboursé dans les Alpes-Maritimes ?",
    answer:
      "Oui. Le transport sanitaire (ambulance, VSL, taxi conventionné) prescrit par un médecin est remboursé par la CPAM des Alpes-Maritimes à 55 % du tarif convention, ou 100 % en cas d'ALD, maternité, accident du travail ou hospitalisation. Le tiers payant est appliqué : vous n'avancez pas les frais.",
  },
  {
    question:
      "Quels hôpitaux sont desservis par les transporteurs du 06 ?",
    answer:
      "Les transporteurs conventionnés des Alpes-Maritimes desservent notamment le CHU de Nice (hôpitaux Pasteur 2, l'Archet, Cimiez), le centre hospitalier de Cannes, le centre hospitalier d'Antibes-Juan-les-Pins, le centre hospitalier de Grasse et les cliniques privées du littoral. Réservez 48 h à l'avance pour les soins programmés.",
  },
  {
    question:
      "Quelles villes des Alpes-Maritimes sont couvertes par l'annuaire ?",
    answer:
      "L'annuaire couvre l'ensemble des communes du 06 : Nice, Cannes, Antibes, Grasse, Cagnes-sur-Mer, Le Cannet, Saint-Laurent-du-Var, Menton, Vence, Vallauris, Mandelieu et les communes du moyen et haut-pays. Sélectionnez votre ville pour afficher les professionnels les plus proches.",
  },
  {
    question:
      "Faut-il une prescription pour un taxi conventionné dans le 06 ?",
    answer:
      "Oui, la prescription médicale (bon de transport CERFA 11574) établie par le médecin traitant ou hospitalier est obligatoire pour bénéficier du remboursement CPAM dans les Alpes-Maritimes. Sans prescription, la course est facturée comme un taxi classique au tarif libre, sans prise en charge.",
  },
];

const DEPARTEMENT_SEO_OVERRIDES: Record<string, DepartementSeoOverride> = {
  "06": {
    title: "Transport médical Alpes-Maritimes (06) — Annuaire CPAM | RoullePro",
    description:
      "Annuaire complet des ambulances, VSL et taxis conventionnés CPAM dans les Alpes-Maritimes (06) : Nice, Cannes, Antibes, Grasse, Menton.",
    h1: "Transport médical dans les Alpes-Maritimes — Annuaire CPAM 06",
    intro:
      "Les Alpes-Maritimes (06) figurent parmi les départements français où la demande de transport médical est la plus forte, en raison du vieillissement de la population du littoral et de la densité d'établissements de soins. De Nice à Menton, en passant par Cannes, Antibes, Grasse, Cagnes-sur-Mer, Vence et Saint-Laurent-du-Var, RoullePro centralise les coordonnées officielles des ambulances, VSL et taxis conventionnés agréés par la CPAM 06. Que vous ayez besoin d'un transport pour des séances de dialyse ou de chimiothérapie au CHU de Nice (hôpitaux Pasteur 2, l'Archet, Cimiez), d'un retour d'hospitalisation depuis le centre hospitalier de Cannes ou d'Antibes, ou d'une consultation programmée à Grasse, vous trouverez ici le professionnel adapté. Chaque fiche précise l'agrément, les véhicules disponibles (PMR, brancard) et la dispense d'avance des frais. Le transport prescrit est remboursé à 100 % en cas d'ALD. Sélectionnez votre commune pour accéder immédiatement aux transporteurs conventionnés les plus proches.",
    faq: DEP_06_FAQ,
  },
};

/**
 * Retourne la surcharge SEO editoriale d'un departement prioritaire, ou null si
 * le departement doit conserver le rendu generique alimente par Supabase.
 */
export function getDepartementSeoOverride(
  code: string,
): DepartementSeoOverride | null {
  return DEPARTEMENT_SEO_OVERRIDES[code] ?? null;
}
