/**
 * Référentiel des auteurs éditoriaux RoullePro.
 * Utilisé pour les JSON-LD Article (author Person) et les blocs auteur visibles sur les guides.
 */

export type AuthorEntry = {
  "@type": "Person";
  name: string;
  url: string;
  sameAs: string[];
  jobTitle: string;
  knowsAbout: string[];
};

export const AUTHORS: Record<string, AuthorEntry> = {
  "lucas-horville": {
    "@type": "Person",
    name: "Lucas Horville",
    url: "https://roullepro.com/auteurs/lucas-horville",
    sameAs: ["https://www.linkedin.com/in/lucas-horville/"],
    jobTitle: "Fondateur de RoullePro",
    knowsAbout: [
      "Transport sanitaire",
      "Conventionnement CPAM",
      "Réglementation ambulance VSL taxi",
    ],
  },
};

export type AuthorKey = keyof typeof AUTHORS;

export function getAuthor(key: AuthorKey): AuthorEntry {
  return AUTHORS[key];
}
