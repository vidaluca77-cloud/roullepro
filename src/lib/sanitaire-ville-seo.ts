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

/**
 * Construit les 6 questions FAQ standard d'un hub ville à partir des données
 * locales (département, caisse CPAM, établissements de santé). Le contenu reste
 * factuel et conforme à la convention CPAM 2025-2026 ; seules les ancres locales
 * (numéro de département, CHU, communes) varient d'une ville à l'autre.
 */
function buildVilleFaq(params: {
  nom: string;
  codeDepartement: string;
  cpamLibelle: string;
  etablissements: string;
}): VilleFaqItem[] {
  const { nom, codeDepartement, cpamLibelle, etablissements } = params;
  return [
    {
      question: `Comment trouver un taxi conventionné CPAM à ${nom} ?`,
      answer: `Utilisez l'annuaire RoullePro ${nom} qui recense les taxis conventionnés agréés par la ${cpamLibelle} (${codeDepartement}). Chaque fiche indique le numéro d'agrément, les modes de paiement acceptés (dispense d'avance des frais possible), la zone d'intervention et les véhicules adaptés.`,
    },
    {
      question: `Quel est le tarif d'un taxi conventionné à ${nom} ?`,
      answer: `Le tarif est encadré par la convention CPAM signée pour 2025-2026 entre la ${cpamLibelle} et les organisations professionnelles : prise en charge 2,80 €, kilomètre tarif A 1,12 €/km, attente 28,80 €/h. La CPAM rembourse 100 % sur prescription médicale en cas d'ALD, et 65 % pour les autres motifs, avec dispense d'avance des frais.`,
    },
    {
      question: `Faut-il une prescription pour utiliser un taxi conventionné à ${nom} ?`,
      answer: `Oui, la prescription médicale (bon de transport) du médecin traitant ou hospitalier est obligatoire pour bénéficier du remboursement CPAM. Sans prescription, la course est considérée comme un taxi classique au tarif libre.`,
    },
    {
      question: `Quelle différence entre taxi conventionné, VSL et ambulance à ${nom} ?`,
      answer: `Le taxi conventionné transporte un patient autonome en position assise. Le VSL est un véhicule sanitaire léger avec personnel formé, pour patients nécessitant un accompagnement. L'ambulance est requise pour les patients allongés ou en état grave. Le choix est indiqué par le médecin sur la prescription.`,
    },
    {
      question: `Comment réserver un taxi conventionné à ${nom} en urgence ?`,
      answer: `Appelez directement l'une des entreprises listées sur RoullePro ${nom}. Pour une réservation immédiate à toute heure, privilégiez les compagnies disposant d'un standard 24/7 (signalées sur leur fiche). Les trajets vers ${etablissements} doivent être réservés 48 h à l'avance.`,
    },
    {
      question: `Les taxis conventionnés de ${nom} acceptent-ils la dispense d'avance des frais ?`,
      answer: `La majorité des taxis conventionnés CPAM ${codeDepartement} pratiquent la dispense d'avance des frais (tiers payant). Présentez votre carte Vitale et la prescription, le chauffeur facture directement la CPAM. Cette mention est précisée sur chaque fiche entreprise.`,
    },
  ];
}

const VILLE_SEO_OVERRIDES: Record<string, VilleSeoOverride> = {
  nice: {
    title: "Taxi conventionné Nice 06 | Transport médical CPAM",
    description:
      "Trouvez un taxi conventionné CPAM à Nice et dans les Alpes-Maritimes. 47 entreprises agréées : tarifs, agrément, réservation immédiate.",
    h1: "Taxi conventionné Nice 06 — Trouver un transport médical CPAM dans les Alpes-Maritimes",
    intro:
      "À Nice et dans les Alpes-Maritimes, plus de 47 taxis conventionnés CPAM proposent un transport médical pris en charge à 100 % sur prescription médicale. Que ce soit pour des séances de dialyse au CHU Pasteur, des consultations à l'Archet, ou un retour d'hospitalisation depuis la clinique Saint-Georges, RoullePro centralise les coordonnées et agréments officiels de chaque entreprise. Vous évitez de chercher pendant des heures : tarif convention, numéro d'agrément CPAM 06, modes de paiement (tiers payant, dispense d'avance des frais), véhicules adaptés (PMR, civière, brancard), réservation 7j/7. Notre annuaire est vérifié chaque mois auprès des préfectures et de la CPAM 06. Pour les patients en ALD (affection longue durée), la prescription du médecin traitant suffit pour activer la prise en charge à 100 %. Consultez ci-dessous la liste des taxis conventionnés à Nice classés par quartier, ou utilisez notre recherche par adresse pour trouver immédiatement le transport médical le plus proche de chez vous.",
    faq: NICE_FAQ,
    departement: "06",
  },
  paris: {
    title: "Taxi conventionné Paris 75 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Paris (75). Réservation, tarif convention 2026, agrément vérifié. Tous les arrondissements couverts.",
    h1: "Taxi conventionné Paris — Transport médical CPAM dans les 20 arrondissements",
    intro:
      "Paris concentre l'un des plus importants parcs de taxis conventionnés CPAM de France, avec plus de 600 entreprises agréées par la CPAM 75 pour assurer le transport médical des patients. Que vous habitiez le 16e ou le 19e arrondissement, que vous soyez transféré entre Pitié-Salpêtrière, Cochin, Necker, Saint-Louis ou l'Hôpital européen Georges-Pompidou, RoullePro centralise les coordonnées officielles, numéros d'agrément CPAM et modes de paiement de chaque taxi conventionné parisien. Le tarif est encadré par la convention CPAM 2025-2026 et la prise en charge atteint 100 % en cas d'affection longue durée (ALD) sur prescription médicale. Les taxis conventionnés Paris proposent dispense d'avance des frais, véhicules adaptés PMR, réservation 24/7 pour les retours d'hospitalisation. Filtrez par arrondissement ou par établissement de destination pour trouver immédiatement le transport médical adapté à votre situation, sans devoir contacter dix compagnies une à une.",
    faq: PARIS_FAQ,
    departement: "75",
  },
  lyon: {
    title: "Taxi conventionné Lyon 69 | Transport médical CPAM",
    description:
      "Annuaire taxis conventionnés CPAM Lyon et Métropole. Tarif convention 2026, agrément vérifié, dispense d'avance des frais.",
    h1: "Taxi conventionné Lyon — Transport médical CPAM dans la métropole et le Rhône",
    intro:
      "À Lyon et dans le département du Rhône, plus de 180 taxis conventionnés CPAM assurent le transport médical des patients sur prescription. Que ce soit pour rejoindre les Hospices Civils de Lyon, Hôpital Édouard-Herriot, l'Hôpital de la Croix-Rousse, le Centre Léon Bérard ou des cliniques privées comme Charcot ou Mermoz, RoullePro centralise les fiches officielles validées par la CPAM 69. Chaque entreprise listée affiche son numéro d'agrément, ses modes de paiement (tiers payant possible), ses véhicules adaptés (PMR, brancard) et sa zone d'intervention dans le Grand Lyon. La convention CPAM 2025-2026 fixe le tarif et la prise en charge est de 100 % sur ALD. Pour les séances régulières (dialyse, chimiothérapie, radiothérapie), réservez 48 h à l'avance auprès d'une compagnie avec standard 24/7 pour assurer la continuité du transport médical.",
    faq: LYON_FAQ,
    departement: "69",
  },
  marseille: {
    title: "Taxi conventionné Marseille 13 | Transport médical CPAM",
    description:
      "Taxis conventionnés CPAM à Marseille (13). Annuaire vérifié : agrément, tarif convention, tiers payant, véhicules adaptés.",
    h1: "Taxi conventionné Marseille — Transport médical CPAM dans les Bouches-du-Rhône",
    intro:
      "Marseille est l'un des bassins de transport médical les plus actifs de France, avec plus de 250 taxis conventionnés CPAM agréés sur le département des Bouches-du-Rhône. RoullePro répertorie toutes les entreprises validées par la CPAM 13 pour vos trajets vers l'AP-HM (Timone, Conception, Nord, Sud), l'Hôpital Européen, l'Hôpital Saint-Joseph, l'Institut Paoli-Calmettes ou les cliniques privées d'Aix-Marseille. Sur chaque fiche figurent agrément CPAM, mode de paiement (dispense d'avance des frais largement pratiquée), véhicules adaptés PMR et brancard, zones d'intervention couvertes (Marseille intra-muros, Aix, Aubagne, Salon, étang de Berre). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en ALD ou pour les hospitalisations consécutives à un accident du travail.",
    faq: MARSEILLE_FAQ,
    departement: "13",
  },
  montpellier: {
    title: "Taxi conventionné Montpellier 34 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Montpellier (34) : agrément vérifié, tarif convention, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Montpellier — Transport médical CPAM dans l'Hérault",
    intro:
      "À Montpellier et dans l'Hérault, plus de 120 taxis conventionnés CPAM assurent le transport médical des patients sur prescription, dans l'une des métropoles à la croissance démographique la plus rapide de France. Que ce soit pour des séances de dialyse, de chimiothérapie ou de radiothérapie au CHU de Montpellier (Lapeyronie, Gui de Chauliac, Saint-Éloi), pour une consultation à la clinique du Parc ou pour un retour d'hospitalisation depuis la clinique Beau Soleil, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM 34, les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole (Montpellier intra-muros, Lattes, Castelnau-le-Lez, Juvignac, Pérols). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Montpellier, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: MONTPELLIER_FAQ,
    departement: "34",
  },
  bordeaux: {
    title: "Taxi conventionné Bordeaux 33 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Bordeaux (33) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Bordeaux — Transport médical CPAM en Gironde",
    intro:
      "À Bordeaux et dans toute la Gironde, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse, de chimiothérapie ou de radiothérapie au CHU de Bordeaux (groupe hospitalier Pellegrin), pour une consultation à l'Hôpital Saint-André en centre-ville, ou pour un retour d'hospitalisation depuis l'Hôpital Haut-Lévêque à Pessac, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM de la Gironde (33), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole bordelaise (Bordeaux intra-muros, Mérignac, Pessac, Talence, Bègles, Le Bouscat). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Bordeaux, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Bordeaux",
      codeDepartement: "33",
      cpamLibelle: "CPAM de la Gironde",
      etablissements: "le CHU de Bordeaux-Pellegrin, l'Hôpital Saint-André ou l'Hôpital Haut-Lévêque",
    }),
    departement: "33",
  },
  toulouse: {
    title: "Taxi conventionné Toulouse 31 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Toulouse (31) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Toulouse — Transport médical CPAM en Haute-Garonne",
    intro:
      "À Toulouse et dans la Haute-Garonne, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU de Toulouse-Rangueil, pour une consultation à l'Hôpital Purpan, ou pour un traitement à l'Institut Universitaire du Cancer (IUCT-Oncopole), RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM de la Haute-Garonne (31), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole toulousaine (Toulouse intra-muros, Blagnac, Colomiers, Tournefeuille, Balma, Ramonville). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Toulouse, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Toulouse",
      codeDepartement: "31",
      cpamLibelle: "CPAM de la Haute-Garonne",
      etablissements: "le CHU de Toulouse-Rangueil, l'Hôpital Purpan ou l'IUCT-Oncopole",
    }),
    departement: "31",
  },
  nantes: {
    title: "Taxi conventionné Nantes 44 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Nantes (44) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Nantes — Transport médical CPAM en Loire-Atlantique",
    intro:
      "À Nantes et dans la Loire-Atlantique, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU de Nantes (Hôtel-Dieu), pour une consultation à l'Hôpital Laennec à Saint-Herblain, ou pour un traitement à l'Institut de Cancérologie de l'Ouest, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM de la Loire-Atlantique (44), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole nantaise (Nantes intra-muros, Saint-Herblain, Rezé, Orvault, Vertou, Carquefou). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Nantes, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Nantes",
      codeDepartement: "44",
      cpamLibelle: "CPAM de la Loire-Atlantique",
      etablissements: "le CHU de Nantes-Hôtel-Dieu, l'Hôpital Laennec ou l'Institut de Cancérologie de l'Ouest",
    }),
    departement: "44",
  },
  strasbourg: {
    title: "Taxi conventionné Strasbourg 67 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Strasbourg (67) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Strasbourg — Transport médical CPAM dans le Bas-Rhin",
    intro:
      "À Strasbourg et dans le Bas-Rhin, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie aux Hôpitaux Universitaires de Strasbourg (Hôpital Civil, Hôpital de Hautepierre), ou pour un traitement à l'Institut de Cancérologie Strasbourg Europe (ICANS), RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM du Bas-Rhin (67), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans l'Eurométropole (Strasbourg intra-muros, Schiltigheim, Illkirch-Graffenstaden, Lingolsheim, Hœnheim, Ostwald). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Strasbourg, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Strasbourg",
      codeDepartement: "67",
      cpamLibelle: "CPAM du Bas-Rhin",
      etablissements: "les Hôpitaux Universitaires de Strasbourg (Hôpital Civil, Hautepierre) ou l'ICANS",
    }),
    departement: "67",
  },
  rennes: {
    title: "Taxi conventionné Rennes 35 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Rennes (35) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Rennes — Transport médical CPAM en Ille-et-Vilaine",
    intro:
      "À Rennes et dans l'Ille-et-Vilaine, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU de Rennes (Hôpital Pontchaillou), pour une consultation à l'Hôpital Sud, ou pour un traitement au Centre Eugène Marquis, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM d'Ille-et-Vilaine (35), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole rennaise (Rennes intra-muros, Cesson-Sévigné, Saint-Grégoire, Bruz, Chantepie, Pacé). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Rennes, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Rennes",
      codeDepartement: "35",
      cpamLibelle: "CPAM d'Ille-et-Vilaine",
      etablissements: "le CHU de Rennes-Pontchaillou, l'Hôpital Sud ou le Centre Eugène Marquis",
    }),
    departement: "35",
  },
  lille: {
    title: "Taxi conventionné Lille 59 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Lille (59) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Lille — Transport médical CPAM dans le Nord",
    intro:
      "À Lille et dans le Nord, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU de Lille, pour une consultation à l'Hôpital Roger Salengro, ou pour un traitement au Centre Oscar Lambret, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM du Nord (59), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole européenne de Lille (Lille intra-muros, Roubaix, Tourcoing, Villeneuve-d'Ascq, Lambersart, Marcq-en-Barœul). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Lille, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Lille",
      codeDepartement: "59",
      cpamLibelle: "CPAM du Nord",
      etablissements: "le CHU de Lille, l'Hôpital Roger Salengro ou le Centre Oscar Lambret",
    }),
    departement: "59",
  },
  "saint-etienne": {
    title: "Taxi conventionné Saint-Étienne 42 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Saint-Étienne (42) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Saint-Étienne — Transport médical CPAM dans la Loire",
    intro:
      "À Saint-Étienne et dans la Loire, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU de Saint-Étienne (Hôpital Nord), pour une consultation à l'Hôpital Bellevue, ou pour un traitement à l'Institut de Cancérologie Lucien Neuwirth, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM de la Loire (42), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole stéphanoise (Saint-Étienne intra-muros, Saint-Chamond, Firminy, Saint-Priest-en-Jarez, Roche-la-Molière, La Talaudière). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Saint-Étienne, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Saint-Étienne",
      codeDepartement: "42",
      cpamLibelle: "CPAM de la Loire",
      etablissements: "le CHU de Saint-Étienne-Nord, l'Hôpital Bellevue ou l'Institut de Cancérologie Lucien Neuwirth",
    }),
    departement: "42",
  },
  "le-havre": {
    title: "Taxi conventionné Le Havre 76 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM au Havre (76) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Le Havre — Transport médical CPAM en Seine-Maritime",
    intro:
      "Au Havre et dans la Seine-Maritime, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au Groupe Hospitalier du Havre (Hôpital Jacques Monod à Montivilliers), pour une consultation à l'Hôpital Flaubert, ou pour un retour d'hospitalisation, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM de la Seine-Maritime (76), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans l'agglomération havraise (Le Havre intra-muros, Montivilliers, Sainte-Adresse, Harfleur, Gonfreville-l'Orcher, Octeville-sur-Mer). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés au Havre, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Le Havre",
      codeDepartement: "76",
      cpamLibelle: "CPAM de la Seine-Maritime",
      etablissements: "le Groupe Hospitalier du Havre (Hôpital Jacques Monod) ou l'Hôpital Flaubert",
    }),
    departement: "76",
  },
  "clermont-ferrand": {
    title: "Taxi conventionné Clermont-Ferrand 63 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Clermont-Ferrand (63) : 45 taxis agréés, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Clermont-Ferrand — Transport médical CPAM dans le Puy-de-Dôme",
    intro:
      "À Clermont-Ferrand et dans le Puy-de-Dôme, plus de 45 taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU de Clermont-Ferrand (Hôpital Gabriel-Montpied, Hôpital Estaing), pour un traitement au Centre Jean Perrin (cancérologie), ou pour un retour d'hospitalisation, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM du Puy-de-Dôme (63), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans l'agglomération clermontoise (Clermont-Ferrand intra-muros, Chamalières, Aubière, Cournon-d'Auvergne, Riom, Beaumont, Cébazat). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Clermont-Ferrand, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Clermont-Ferrand",
      codeDepartement: "63",
      cpamLibelle: "CPAM du Puy-de-Dôme",
      etablissements: "le CHU Gabriel-Montpied, l'Hôpital Estaing ou le Centre Jean Perrin",
    }),
    departement: "63",
  },
  brest: {
    title: "Taxi conventionné Brest 29 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Brest (29) : taxis et ambulances agréés, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Brest — Transport médical CPAM dans le Finistère",
    intro:
      "À Brest et dans le Finistère, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHRU de Brest (Hôpital de la Cavale Blanche, Hôpital Morvan), pour une consultation à l'Hôpital d'Instruction des Armées Clermont-Tonnerre, ou pour un retour d'hospitalisation, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM du Finistère (29), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans le pays de Brest (Brest intra-muros, Guipavas, Le Relecq-Kerhuon, Plougastel-Daoulas, Gouesnou, Bohars). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Brest, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Brest",
      codeDepartement: "29",
      cpamLibelle: "CPAM du Finistère",
      etablissements: "le CHRU de Brest (Hôpital de la Cavale Blanche, Hôpital Morvan)",
    }),
    departement: "29",
  },
  amiens: {
    title: "Taxi conventionné Amiens 80 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Amiens (80) : 61 taxis agréés, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Amiens — Transport médical CPAM dans la Somme",
    intro:
      "À Amiens et dans la Somme, plus de 61 taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU Amiens-Picardie, pour une consultation dans un cabinet spécialisé, ou pour un retour d'hospitalisation, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM de la Somme (80), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans l'agglomération amiénoise (Amiens intra-muros, Longueau, Camon, Rivery, Dury, Salouël, Pont-de-Metz). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Amiens, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Amiens",
      codeDepartement: "80",
      cpamLibelle: "CPAM de la Somme",
      etablissements: "le CHU Amiens-Picardie",
    }),
    departement: "80",
  },
  grenoble: {
    title: "Taxi conventionné Grenoble 38 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Grenoble (38) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Grenoble — Transport médical CPAM en Isère",
    intro:
      "À Grenoble et dans l'Isère, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU Grenoble Alpes (Hôpital Michallon à La Tronche), pour une consultation à l'Hôpital Sud à Échirolles, ou pour un retour d'hospitalisation, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM de l'Isère (38), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole grenobloise (Grenoble intra-muros, Échirolles, Saint-Martin-d'Hères, La Tronche, Fontaine, Meylan). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Grenoble, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Grenoble",
      codeDepartement: "38",
      cpamLibelle: "CPAM de l'Isère",
      etablissements: "le CHU Grenoble Alpes (Hôpital Michallon) ou l'Hôpital Sud",
    }),
    departement: "38",
  },
  dijon: {
    title: "Taxi conventionné Dijon 21 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Dijon (21) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Dijon — Transport médical CPAM en Côte-d'Or",
    intro:
      "À Dijon et dans la Côte-d'Or, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU Dijon Bourgogne (Hôpital François Mitterrand, Le Bocage), ou pour un traitement au Centre Georges-François Leclerc, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM de la Côte-d'Or (21), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole dijonnaise (Dijon intra-muros, Chenôve, Talant, Quetigny, Fontaine-lès-Dijon, Longvic). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Dijon, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Dijon",
      codeDepartement: "21",
      cpamLibelle: "CPAM de la Côte-d'Or",
      etablissements: "le CHU Dijon Bourgogne (Le Bocage) ou le Centre Georges-François Leclerc",
    }),
    departement: "21",
  },
  angers: {
    title: "Taxi conventionné Angers 49 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Angers (49) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Angers — Transport médical CPAM en Maine-et-Loire",
    intro:
      "À Angers et dans le Maine-et-Loire, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU d'Angers, ou pour un traitement à l'Institut de Cancérologie de l'Ouest (site Paul Papin), RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM de Maine-et-Loire (49), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans la métropole angevine (Angers intra-muros, Avrillé, Trélazé, Les Ponts-de-Cé, Saint-Barthélemy-d'Anjou, Beaucouzé). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Angers, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Angers",
      codeDepartement: "49",
      cpamLibelle: "CPAM de Maine-et-Loire",
      etablissements: "le CHU d'Angers ou l'Institut de Cancérologie de l'Ouest-Paul Papin",
    }),
    departement: "49",
  },
  reims: {
    title: "Taxi conventionné Reims 51 | Transport médical CPAM",
    description:
      "Annuaire des taxis conventionnés CPAM à Reims (51) : agrément vérifié, tarif convention 2026, dispense d'avance des frais, véhicules adaptés.",
    h1: "Taxi conventionné Reims — Transport médical CPAM dans la Marne",
    intro:
      "À Reims et dans la Marne, les taxis conventionnés CPAM assurent le transport médical des patients sur prescription, avec une prise en charge pouvant atteindre 100 % par la Sécurité sociale. Que ce soit pour des séances de dialyse ou de chimiothérapie au CHU de Reims (Hôpital Robert Debré), pour une consultation à l'Hôpital Maison Blanche, ou pour un traitement à l'Institut Jean Godinot, RoullePro centralise les coordonnées officielles et agréments de chaque entreprise. Chaque fiche précise le numéro d'agrément CPAM de la Marne (51), les modes de paiement (tiers payant, dispense d'avance des frais), les véhicules adaptés (PMR, brancard) et la zone d'intervention dans le Grand Reims (Reims intra-muros, Tinqueux, Bétheny, Cormontreuil, Saint-Brice-Courcelles, Witry-lès-Reims). Le tarif suit la convention CPAM 2025-2026 et la prise en charge atteint 100 % sur prescription pour les patients en affection longue durée (ALD). Pour les soins programmés et réguliers, réservez 48 h à l'avance auprès d'une compagnie disposant d'un standard 24/7. Consultez ci-dessous la liste des taxis conventionnés à Reims, ou utilisez la recherche par adresse pour trouver immédiatement le transport médical le plus proche.",
    faq: buildVilleFaq({
      nom: "Reims",
      codeDepartement: "51",
      cpamLibelle: "CPAM de la Marne",
      etablissements: "le CHU de Reims-Robert Debré, l'Hôpital Maison Blanche ou l'Institut Jean Godinot",
    }),
    departement: "51",
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
