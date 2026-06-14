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

const PARIS_FAQ: VilleFaqItem[] = [
  {
    question: "Comment trouver un taxi conventionné CPAM à Paris ?",
    answer:
      "Utilisez l'annuaire RoullePro Paris qui recense les taxis conventionnés agréés par la CPAM de Paris (75). Chaque fiche indique le numéro d'agrément, les modes de paiement acceptés (dispense d'avance des frais possible), l'arrondissement de rattachement et les véhicules adaptés.",
  },
  {
    question: "Quel est le tarif d'un taxi conventionné à Paris ?",
    answer:
      "Le tarif est encadré par la convention CPAM signée pour 2025-2026 entre la caisse de Paris et les organisations professionnelles. La CPAM rembourse 100 % sur prescription médicale en cas d'ALD, et 65 % pour les autres motifs, avec dispense d'avance des frais.",
  },
  {
    question: "Faut-il une prescription pour utiliser un taxi conventionné à Paris ?",
    answer:
      "Oui, la prescription médicale (bon de transport) du médecin traitant ou hospitalier est obligatoire pour bénéficier du remboursement CPAM. Sans prescription, la course est considérée comme un taxi parisien classique au tarif libre.",
  },
  {
    question: "Quelle différence entre taxi conventionné, VSL et ambulance à Paris ?",
    answer:
      "Le taxi conventionné transporte un patient autonome en position assise. Le VSL est un véhicule sanitaire léger avec personnel formé, pour patients nécessitant un accompagnement. L'ambulance est requise pour les patients allongés ou en état grave. Le choix est indiqué par le médecin sur la prescription.",
  },
  {
    question: "Comment réserver un taxi conventionné à Paris en urgence ?",
    answer:
      "Appelez directement l'une des entreprises listées sur RoullePro Paris. Pour une réservation immédiate à toute heure, privilégiez les compagnies disposant d'un standard 24/7 (signalées sur leur fiche). Les retours d'hospitalisation depuis Pitié-Salpêtrière, Cochin ou Georges-Pompidou doivent être réservés 48 h à l'avance.",
  },
  {
    question: "Les taxis conventionnés de Paris acceptent-ils la dispense d'avance des frais ?",
    answer:
      "La majorité des taxis conventionnés CPAM 75 pratiquent la dispense d'avance des frais (tiers payant). Présentez votre carte Vitale et la prescription, le chauffeur facture directement la CPAM. Cette mention est précisée sur chaque fiche entreprise.",
  },
];

const LYON_FAQ: VilleFaqItem[] = [
  {
    question: "Comment trouver un taxi conventionné CPAM à Lyon ?",
    answer:
      "Utilisez l'annuaire RoullePro Lyon qui recense les taxis conventionnés agréés par la CPAM du Rhône (69). Chaque fiche indique le numéro d'agrément, les modes de paiement acceptés (dispense d'avance des frais possible), la zone d'intervention dans le Grand Lyon et les véhicules adaptés.",
  },
  {
    question: "Quel est le tarif d'un taxi conventionné à Lyon ?",
    answer:
      "Le tarif est encadré par la convention CPAM signée pour 2025-2026 entre la caisse du Rhône et les organisations professionnelles. La CPAM rembourse 100 % sur prescription médicale en cas d'ALD, et 65 % pour les autres motifs, avec dispense d'avance des frais.",
  },
  {
    question: "Faut-il une prescription pour utiliser un taxi conventionné à Lyon ?",
    answer:
      "Oui, la prescription médicale (bon de transport) du médecin traitant ou hospitalier est obligatoire pour bénéficier du remboursement CPAM. Sans prescription, la course est considérée comme un taxi classique au tarif libre.",
  },
  {
    question: "Quelle différence entre taxi conventionné, VSL et ambulance à Lyon ?",
    answer:
      "Le taxi conventionné transporte un patient autonome en position assise. Le VSL est un véhicule sanitaire léger avec personnel formé, pour patients nécessitant un accompagnement. L'ambulance est requise pour les patients allongés ou en état grave. Le choix est indiqué par le médecin sur la prescription.",
  },
  {
    question: "Comment réserver un taxi conventionné à Lyon en urgence ?",
    answer:
      "Appelez directement l'une des entreprises listées sur RoullePro Lyon. Pour une réservation immédiate à toute heure, privilégiez les compagnies disposant d'un standard 24/7 (signalées sur leur fiche). Les trajets vers les Hospices Civils de Lyon, Édouard-Herriot ou le Centre Léon Bérard doivent être réservés 48 h à l'avance.",
  },
  {
    question: "Les taxis conventionnés de Lyon acceptent-ils la dispense d'avance des frais ?",
    answer:
      "La majorité des taxis conventionnés CPAM 69 pratiquent la dispense d'avance des frais (tiers payant). Présentez votre carte Vitale et la prescription, le chauffeur facture directement la CPAM. Cette mention est précisée sur chaque fiche entreprise.",
  },
];

const MARSEILLE_FAQ: VilleFaqItem[] = [
  {
    question: "Comment trouver un taxi conventionné CPAM à Marseille ?",
    answer:
      "Utilisez l'annuaire RoullePro Marseille qui recense les taxis conventionnés agréés par la CPAM des Bouches-du-Rhône (13). Chaque fiche indique le numéro d'agrément, les modes de paiement acceptés (dispense d'avance des frais possible), la zone d'intervention et les véhicules adaptés.",
  },
  {
    question: "Quel est le tarif d'un taxi conventionné à Marseille ?",
    answer:
      "Le tarif est encadré par la convention CPAM signée pour 2025-2026 entre la caisse des Bouches-du-Rhône et les organisations professionnelles. La CPAM rembourse 100 % sur prescription médicale en cas d'ALD, et 65 % pour les autres motifs, avec dispense d'avance des frais.",
  },
  {
    question: "Faut-il une prescription pour utiliser un taxi conventionné à Marseille ?",
    answer:
      "Oui, la prescription médicale (bon de transport) du médecin traitant ou hospitalier est obligatoire pour bénéficier du remboursement CPAM. Sans prescription, la course est considérée comme un taxi classique au tarif libre.",
  },
  {
    question: "Quelle différence entre taxi conventionné, VSL et ambulance à Marseille ?",
    answer:
      "Le taxi conventionné transporte un patient autonome en position assise. Le VSL est un véhicule sanitaire léger avec personnel formé, pour patients nécessitant un accompagnement. L'ambulance est requise pour les patients allongés ou en état grave. Le choix est indiqué par le médecin sur la prescription.",
  },
  {
    question: "Comment réserver un taxi conventionné à Marseille en urgence ?",
    answer:
      "Appelez directement l'une des entreprises listées sur RoullePro Marseille. Pour une réservation immédiate à toute heure, privilégiez les compagnies disposant d'un standard 24/7 (signalées sur leur fiche). Les trajets vers l'AP-HM (Timone, Conception, Nord), l'Hôpital Européen ou l'Institut Paoli-Calmettes doivent être réservés 48 h à l'avance.",
  },
  {
    question: "Les taxis conventionnés de Marseille acceptent-ils la dispense d'avance des frais ?",
    answer:
      "La majorité des taxis conventionnés CPAM 13 pratiquent la dispense d'avance des frais (tiers payant). Présentez votre carte Vitale et la prescription, le chauffeur facture directement la CPAM. Cette mention est précisée sur chaque fiche entreprise.",
  },
];

const MONTPELLIER_FAQ: VilleFaqItem[] = [
  {
    question: "Comment trouver un taxi conventionné CPAM à Montpellier ?",
    answer:
      "Utilisez l'annuaire RoullePro Montpellier qui recense les taxis conventionnés agréés par la CPAM de l'Hérault (34). Chaque fiche indique le numéro d'agrément, les modes de paiement acceptés (dispense d'avance des frais possible), la zone d'intervention dans la métropole et les véhicules adaptés.",
  },
  {
    question: "Quel est le tarif d'un taxi conventionné à Montpellier ?",
    answer:
      "Le tarif est encadré par la convention CPAM signée pour 2025-2026 entre la caisse de l'Hérault et les organisations professionnelles. La CPAM rembourse 100 % sur prescription médicale en cas d'ALD, et 65 % pour les autres motifs, avec dispense d'avance des frais.",
  },
  {
    question: "Faut-il une prescription pour utiliser un taxi conventionné à Montpellier ?",
    answer:
      "Oui, la prescription médicale (bon de transport) du médecin traitant ou hospitalier est obligatoire pour bénéficier du remboursement CPAM. Sans prescription, la course est considérée comme un taxi classique au tarif libre.",
  },
  {
    question: "Quelle différence entre taxi conventionné, VSL et ambulance à Montpellier ?",
    answer:
      "Le taxi conventionné transporte un patient autonome en position assise. Le VSL est un véhicule sanitaire léger avec personnel formé, pour patients nécessitant un accompagnement. L'ambulance est requise pour les patients allongés ou en état grave. Le choix est indiqué par le médecin sur la prescription.",
  },
  {
    question: "Comment réserver un taxi conventionné à Montpellier en urgence ?",
    answer:
      "Appelez directement l'une des entreprises listées sur RoullePro Montpellier. Pour une réservation immédiate à toute heure, privilégiez les compagnies disposant d'un standard 24/7 (signalées sur leur fiche). Les trajets vers le CHU de Montpellier (Lapeyronie, Gui de Chauliac, Saint-Éloi), la clinique du Parc ou Beau Soleil doivent être réservés 48 h à l'avance.",
  },
  {
    question: "Les taxis conventionnés de Montpellier acceptent-ils la dispense d'avance des frais ?",
    answer:
      "La majorité des taxis conventionnés CPAM 34 pratiquent la dispense d'avance des frais (tiers payant). Présentez votre carte Vitale et la prescription, le chauffeur facture directement la CPAM. Cette mention est précisée sur chaque fiche entreprise.",
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
  paris: {
    title: "Taxi conventionné Paris 75 | Transport médical CPAM | RoullePro",
    description:
      "Annuaire des taxis conventionnés CPAM à Paris (75). Réservation, tarif convention 2026, agrément vérifié. Tous les arrondissements couverts.",
    h1: "Taxi conventionné Paris — Transport médical CPAM dans les 20 arrondissements",
    intro:
      "Paris concentre l'un des plus importants parcs de taxis conventionnés CPAM de France, avec plus de 600 entreprises agréées par la CPAM 75 pour assurer le transport médical des patients. Que vous habitiez le 16e ou le 19e arrondissement, que vous soyez transféré entre Pitié-Salpêtrière, Cochin, Necker, Saint-Louis ou l'Hôpital européen Georges-Pompidou, RoullePro centralise les coordonnées officielles, numéros d'agrément CPAM et modes de paiement de chaque taxi conventionné parisien. Le tarif est encadré par la convention CPAM 2025-2026 et la prise en charge atteint 100 % en cas d'affection longue durée (ALD) sur prescription médicale. Les taxis conventionnés Paris proposent dispense d'avance des frais, véhicules adaptés PMR, réservation 24/7 pour les retours d'hospitalisation. Filtrez par arrondissement ou par établissement de destination pour trouver immédiatement le transport médical adapté à votre situation, sans devoir contacter dix compagnies une à une.",
    faq: PARIS_FAQ,
    departement: "75",
  },
  lyon: {
    title: "Taxi conventionné Lyon 69 | Transport médical CPAM | RoullePro",
    description:
      "Annuaire taxis conventionnés CPAM Lyon et Métropole. Tarif convention 2026, agrément vérifié, dispense d'avance des frais.",
    h1: "Taxi conventionné Lyon — Transport médical CPAM dans la métropole et le Rhône",
    intro:
      "À Lyon et dans le département du Rhône, plus de 180 taxis conventionnés CPAM assurent le transport médical des patients sur prescription. Que ce soit pour rejoindre les Hospices Civils de Lyon, Hôpital Édouard-Herriot, l'Hôpital de la Croix-Rousse, le Centre Léon Bérard ou des cliniques privées comme Charcot ou Mermoz, RoullePro centralise les fiches officielles validées par la CPAM 69. Chaque entreprise listée affiche son numéro d'agrément, ses modes de paiement (tiers payant possible), ses véhicules adaptés (PMR, brancard) et sa zone d'intervention dans le Grand Lyon. La convention CPAM 2025-2026 fixe le tarif et la prise en charge est de 100 % sur ALD. Pour les séances régulières (dialyse, chimiothérapie, radiothérapie), réservez 48 h à l'avance auprès d'une compagnie avec standard 24/7 pour assurer la continuité du transport médical.",
    faq: LYON_FAQ,
    departement: "69",
  },
  marseille: {
    title: "Taxi conventionné Marseille 13 | Transport médical CPAM | RoullePro",
    description:
      "Taxis conventionnés CPAM à Marseille (13). Annuaire vérifié : agrément, tarif convention, tiers payant, véhicules adaptés.",
    h1: "Taxi conventionné Marseille — Transport médical CPAM dans les Bouches-du-Rhône",
    intro:
      "Marseille est l'un des bassins de transport médical les plus actifs de France, avec plus de 250 taxis conventionnés CPAM agréés sur le département des Bouches-du-Rhône. RoullePro répertorie toutes les entreprises validées par la CPAM 13 pour vos trajets vers l'AP-HM (Timone, Conception, Nord, Sud), l'Hôpital Européen, l'Hôpital Saint-Joseph, l'Institut Paoli-Calmettes ou les cliniques privées d'Aix-Marseille. Sur chaque fiche figurent agrément CPAM, mode de paiement (dispense d'avance des frais largement pratiquée), véhicules adaptés PMR et brancard, zones d'intervention couvertes (Marseille intra-muros, Aix, Aubagne, Salon, étang de Berre). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en ALD ou pour les hospitalisations consécutives à un accident du travail.",
    faq: MARSEILLE_FAQ,
    departement: "13",
  },
  montpellier: {
    title: "Taxi conventionné Montpellier 34 | Transport médical CPAM | RoullePro",
    description:
      "Annuaire des taxis conventionnés CPAM à Montpellier (34) : agrément vérifié, tarif convention, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Montpellier — Transport médical CPAM dans l'Hérault",
    intro:
      "À Montpellier et dans l'Hérault, plus de 120 taxis conventionnés CPAM assurent le transport médical des patients sur prescription, dans l'une des métropoles à la croissance démographique la plus rapide de France. Que ce soit pour des séances de dialyse, de chimiothérapie ou de radiothérapie au CHU de Montpellier (Lapeyronie, Gui de Chauliac, Saint-Éloi), pour une consultation à la clinique du Parc ou pour un retour d'hospitalisation depuis la clinique Beau Soleil, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM 34, les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole (Montpellier intra-muros, Lattes, Castelnau-le-Lez, Juvignac, Pérols). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Montpellier, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: MONTPELLIER_FAQ,
    departement: "34",
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
