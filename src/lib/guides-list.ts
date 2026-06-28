/**
 * Liste statique des guides publiés sur RoullePro.
 * Utilisée par /llms-full.txt et le flux RSS /feed/guides.xml.
 */

export type GuideEntry = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string; // ISO
  updatedAt: string;   // ISO
};

export const GUIDES_LIST: GuideEntry[] = [
  {
    slug: "transport-sanitaire-conformite-2026-2027",
    title: "Conformité transport sanitaire 2026-2027 : guide complet",
    description:
      "Transport sanitaire conformité 2026 : SEFi 2027, convention taxi CPAM 2025, arrêté ambulance 2026, transport partagé. Tout ce qu'il faut savoir pour se mettre en règle.",
    publishedAt: "2026-05-18T08:00:00Z",
    updatedAt: "2026-05-18T08:00:00Z",
  },
  {
    slug: "ambulance-reglementation-conformite-2026",
    title: "Ambulance : réglementation et conformité 2026",
    description:
      "Tout ce que les entreprises d'ambulance doivent savoir sur l'arrêté du 20 avril 2026 : normes techniques, délais de mise en conformité, équipements obligatoires.",
    publishedAt: "2026-05-18T08:00:00Z",
    updatedAt: "2026-05-18T08:00:00Z",
  },
  {
    slug: "ambulance-vs-vsl",
    title: "Ambulance vs VSL : quelles différences, quel transport choisir ?",
    description:
      "Comparatif complet ambulance / VSL : critères médicaux, diplômes, équipements, tarifs et remboursement Sécurité sociale. Guide pratique pour patients et prescripteurs.",
    publishedAt: "2026-06-14T08:00:00Z",
    updatedAt: "2026-06-14T08:00:00Z",
  },
  {
    slug: "comment-se-faire-conventionner-cpam",
    title: "Comment se faire conventionner par la CPAM en tant que transporteur sanitaire ?",
    description:
      "Guide complet pour obtenir le conventionnement CPAM : démarches, dossier, délais, obligations et renouvellement. Pour taxis, ambulanciers et VSL.",
    publishedAt: "2026-06-14T08:00:00Z",
    updatedAt: "2026-06-14T08:00:00Z",
  },
  {
    slug: "taxi-conventionne-convention-cpam-2025",
    title: "Taxi conventionné CPAM : nouvelle convention 2025-2027",
    description:
      "Analyse complète de la convention cadre nationale des taxis conventionnés signée le 13 mai 2025 : nouveaux tarifs, obligations, SEFi 2027 et impact pour les professionnels.",
    publishedAt: "2026-05-18T08:00:00Z",
    updatedAt: "2026-05-18T08:00:00Z",
  },
  {
    slug: "vsl-reglementation-transport-partage",
    title: "VSL : réglementation et transport partagé 2025-2027",
    description:
      "Tout ce que les conducteurs de VSL doivent savoir sur le transport partagé obligatoire depuis avril 2025, le décret 2025-202 et les nouvelles obligations réglementaires.",
    publishedAt: "2026-05-18T08:00:00Z",
    updatedAt: "2026-05-18T08:00:00Z",
  },
  {
    slug: "vsl-vs-taxi-conventionne",
    title: "VSL vs taxi conventionné : quel transport choisir pour vos patients ?",
    description:
      "Comparatif VSL et taxi conventionné pour les prescripteurs : indications médicales, tarifs, remboursement CPAM, droits du patient. Guide pratique et réglementaire.",
    publishedAt: "2026-06-14T08:00:00Z",
    updatedAt: "2026-06-14T08:00:00Z",
  },
];
