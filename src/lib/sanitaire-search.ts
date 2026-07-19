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

// ---------------------------------------------------------------------------
// Recherche par VILLE tolérante aux saisies multi-mots partielles.
// Bug prod : « thury harcourt » ou « le hom » ne retrouvaient pas la ville
// « Thury-Harcourt-le-Hom » (slug thury-harcourt-le-hom) car l'ancien filtre
// comparait la requête brute (avec espaces) au nom de ville (avec traits
// d'union) ou exigeait un slug exact. On matche désormais par tokens : chaque
// token doit être le préfixe d'un mot du nom de ville.
// ---------------------------------------------------------------------------

/**
 * Concaténations des mots du slug à partir de chaque position. Permet de matcher
 * un token même à cheval sur une élision (ex. « lisle » vs « l-isle-adam »).
 * « thury-harcourt-le-hom » -> ["thuryharcourtlehom","harcourtlehom","lehom","hom"].
 */
export function slugWordConcatenations(villeSlug: string): string[] {
  const words = normalizeForMatch(villeSlug)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    out.push(words.slice(i).join(""));
  }
  return out;
}

/**
 * Vrai si chaque token de la requête est le préfixe d'un mot du nom de ville,
 * insensible à la casse, aux accents, aux traits d'union et aux apostrophes.
 * Ex. « thury harcourt », « le hom », « Thury Harcourt le hom » matchent tous
 * « thury-harcourt-le-hom » ; « saint pierre » matche « saint-pierre-sur-dives ».
 * Fonction pure : filtre de sûreté côté serveur + base des tests.
 */
export function matchesVilleSlug(
  villeSlug: string | null | undefined,
  query: string
): boolean {
  if (!villeSlug) return false;
  const tokens = tokenize(query);
  if (tokens.length === 0) return false;
  const parts = slugWordConcatenations(villeSlug);
  return tokens.every((token) => parts.some((part) => part.startsWith(token)));
}

/**
 * Clause `.or()` PostgREST pour un token de ville : sous-chaîne sur le slug
 * (déjà minuscule/sans accent) OU sur le nom de ville (regex insensible aux
 * accents). Combiner plusieurs `.or()` = AND (chaque token doit matcher). Le
 * filtrage précis « préfixe de mot » est fait ensuite via matchesVilleSlug.
 */
export function buildVilleOrFilter(token: string): string {
  const pattern = buildTokenPattern(token);
  return [`ville_slug.ilike.*${token}*`, `ville.imatch.${pattern}`].join(",");
}
