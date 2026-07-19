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
// token doit être le préfixe d'un mot du nom de ville, À N'IMPORTE QUELLE
// POSITION dans le slug (frontières de mots = traits d'union). « le hom » doit
// matcher « thury-harcourt-le-hom » (le mot « hom » est en fin de slug), pas
// seulement « hombourg-haut »/« homecourt » où « hom » est en tête.
// ---------------------------------------------------------------------------

/**
 * Découpe une chaîne (requête ou slug) en mots normalisés, en CONSERVANT les
 * mots vides (« le », « la »...). Sert au matching de phrase consécutive, où
 * « le » de « le hom » est signifiant pour retrouver le segment « -le-hom ».
 */
function normalizedWords(input: string): string[] {
  return normalizeForMatch(input)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/**
 * Échappe les caractères spéciaux LIKE (`%`, `_`, `\`) dans une valeur destinée
 * à un motif `ilike` PostgREST, pour éviter toute injection de jokers. Les
 * tokens/phrases issus de la normalisation ne contiennent que [a-z0-9-], mais on
 * échappe par sûreté si la source d'entrée venait à changer.
 */
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

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
 * Score de pertinence d'un slug de ville pour une requête (0 = aucun match).
 * Plus le score est élevé, plus le match est précis. Permet de classer les villes
 * qui contiennent la requête comme SUITE DE MOTS consécutifs avant celles où un
 * simple token est préfixe d'un mot isolé.
 *   3 = la requête apparaît comme une suite de mots ENTIERS consécutifs du slug
 *       (« le hom » -> « thury-harcourt-[le-hom] », « caen » -> « caen ») ;
 *   2 = suite de mots consécutifs dont chaque mot est un préfixe du mot du slug
 *       (« thury harc » -> « [thury-harc]ourt-le-hom », « hom » -> « [hom]bourg ») ;
 *   1 = chaque token significatif est préfixe d'un mot du slug, sans être
 *       forcément consécutif ni dans l'ordre (« hom thury », élisions...) ;
 *   0 = pas de correspondance.
 */
export function villeSlugMatchScore(
  villeSlug: string | null | undefined,
  query: string
): number {
  if (!villeSlug) return 0;
  const slugWords = normalizedWords(villeSlug);
  const queryWords = normalizedWords(query);
  if (queryWords.length === 0) return 0;
  // Recherche de la requête comme suite de mots consécutifs dans le slug.
  let best = 0;
  for (let i = 0; i + queryWords.length <= slugWords.length; i++) {
    let allPrefix = true;
    let allExact = true;
    for (let k = 0; k < queryWords.length; k++) {
      const slugWord = slugWords[i + k];
      if (!slugWord.startsWith(queryWords[k])) {
        allPrefix = false;
        break;
      }
      if (slugWord !== queryWords[k]) allExact = false;
    }
    if (allPrefix) {
      if (allExact) return 3;
      best = Math.max(best, 2);
    }
  }
  if (best > 0) return best;
  // Fallback : match par tokens (ordre libre, élisions) via matchesVilleSlug.
  return matchesVilleSlug(villeSlug, query) ? 1 : 0;
}

/**
 * Clause `.or()` PostgREST pour un token de ville : le token doit être en DÉBUT
 * de mot du slug — au début du slug (`token*`) OU après un trait d'union
 * (`*-token*`, mot interne) — OU matcher le nom de ville (regex insensible aux
 * accents). Le matching par frontière de mot évite le bruit des sous-chaînes en
 * milieu de mot (« hom » ne doit pas matcher « thomery »). Combiner plusieurs
 * `.or()` = AND (chaque token doit matcher). Filtrage précis ensuite via
 * matchesVilleSlug / villeSlugMatchScore.
 */
export function buildVilleOrFilter(token: string): string {
  const pattern = buildTokenPattern(token);
  const safe = escapeLikePattern(token);
  return [
    `ville_slug.ilike.${safe}*`,
    `ville_slug.ilike.*-${safe}*`,
    `ville.imatch.${pattern}`,
  ].join(",");
}

/**
 * Clause `.or()` PostgREST ciblant la requête multi-mots comme SUITE DE MOTS
 * consécutifs dans le slug : en tête (`phrase*`) OU en milieu de slug
 * (`*-phrase*`). Ex. « le hom » -> `ville_slug.ilike.le-hom*` /
 * `ville_slug.ilike.*-le-hom*`, ce qui retrouve « thury-harcourt-le-hom » et
 * écarte « hombourg-haut ». Renvoie `null` pour une requête mono-mot (le filtre
 * par token suffit). Les mots vides sont conservés (« le » est signifiant ici).
 */
export function buildVillePhraseFilter(query: string): string | null {
  const words = normalizedWords(query);
  if (words.length < 2) return null;
  const phrase = escapeLikePattern(words.join("-"));
  return [`ville_slug.ilike.${phrase}*`, `ville_slug.ilike.*-${phrase}*`].join(
    ","
  );
}
