// Recherche tolérante de fiches pros sanitaire.
// Objectif : qu'une pro retrouve sa fiche même avec une saisie approximative
// (accents, « & » vs « et », mots dans le désordre, mots vides, casse).

// Mots vides ignorés comme tokens : « taxi terre et mer » == « taxi terre mer ».
const STOP_WORDS = new Set(["et", "de", "la", "le", "les", "du", "des", "d", "l"]);

// Groupes d'accents FR pour construire une regex insensible aux accents côté SQL.
const ACCENT_GROUPS: Record<string, string> = {
  a: "[aàâä]",
  e: "[eéèêë]",
  i: "[iîï]",
  o: "[oôö]",
  u: "[uùûü]",
  c: "[cç]",
  y: "[yÿ]",
};

/**
 * Normalise une chaîne pour comparaison : minuscules, « & » -> « et »,
 * suppression des accents.
 */
export function normalizeForMatch(input: string): string {
  return (input || "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Découpe une requête en tokens significatifs (sans mots vides).
 * Si la requête ne contient que des mots vides, on garde tous les tokens
 * pour ne pas renvoyer une recherche vide.
 */
export function tokenize(query: string): string[] {
  const normalized = normalizeForMatch(query);
  const raw = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  const significant = raw.filter((t) => !STOP_WORDS.has(t));
  return significant.length > 0 ? significant : raw;
}

/**
 * Construit un motif regex POSIX (opérateur ~* / imatch) insensible aux accents
 * pour un token déjà normalisé (uniquement [a-z0-9]).
 */
export function buildTokenPattern(token: string): string {
  return Array.from(token)
    .map((ch) => ACCENT_GROUPS[ch] ?? ch)
    .join("");
}

type Fiche = {
  raison_sociale?: string | null;
  nom_commercial?: string | null;
  ville?: string | null;
};

/**
 * Vérifie qu'une fiche correspond à la requête : chaque token doit matcher
 * (AND) sur au moins un des champs raison_sociale / nom_commercial / ville.
 * Fonction pure utilisée pour les tests et comme filtre de sûreté côté serveur.
 */
export function matchesQuery(fiche: Fiche, query: string): boolean {
  const tokens = tokenize(query);
  if (tokens.length === 0) return false;
  const haystack = normalizeForMatch(
    [fiche.raison_sociale, fiche.nom_commercial, fiche.ville]
      .filter(Boolean)
      .join(" ")
  );
  return tokens.every((token) => haystack.includes(token));
}

/**
 * Construit la clause `or` PostgREST pour un token : le token doit matcher
 * (insensible casse + accents) sur raison_sociale OU nom_commercial OU ville.
 */
export function buildOrFilter(token: string): string {
  const pattern = buildTokenPattern(token);
  return [
    `raison_sociale.imatch.${pattern}`,
    `nom_commercial.imatch.${pattern}`,
    `ville.imatch.${pattern}`,
  ].join(",");
}
