import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeForMatch,
  tokenize,
  buildTokenPattern,
  buildOrFilter,
  matchesQuery,
  slugWordConcatenations,
  matchesVilleSlug,
  buildVilleOrFilter,
} from "./sanitaire-search";

// Fiche réelle à l'origine du bug production.
const TAXI_TERRE_MER = {
  raison_sociale: "MAXIMILIENNE BARRIERE (DEMONIE) (TAXIS BREHALAIS)",
  nom_commercial: "Taxi Terre & Mer",
  ville: "Bréhal",
};

test("normalizeForMatch : minuscules, accents supprimés, & -> et", () => {
  assert.equal(normalizeForMatch("Bréhal"), "brehal");
  assert.equal(normalizeForMatch("Terre & Mer"), "terre  et  mer");
  assert.equal(normalizeForMatch("ÉÈÊË àâä çÇ"), "eeee aaa cc");
});

test("tokenize : les mots vides (et, de, la...) sont ignorés", () => {
  assert.deepEqual(tokenize("taxi terre et mer"), ["taxi", "terre", "mer"]);
  assert.deepEqual(tokenize("terre de la mer"), ["terre", "mer"]);
});

test("tokenize : « & » équivaut à « et » et est ignoré", () => {
  assert.deepEqual(tokenize("taxi terre & mer"), ["taxi", "terre", "mer"]);
});

test("tokenize : accents et casse normalisés, espaces multiples ignorés", () => {
  assert.deepEqual(tokenize("  Barrière   Bréhal "), ["barriere", "brehal"]);
});

test("tokenize : requête composée uniquement de mots vides -> tokens bruts", () => {
  assert.deepEqual(tokenize("les des"), ["les", "des"]);
});

test("buildTokenPattern : construit une regex insensible aux accents", () => {
  assert.equal(buildTokenPattern("brehal"), "br[eéèêë]h[aàâä]l");
  assert.equal(buildTokenPattern("mer"), "m[eéèêë]r");
});

test("buildOrFilter : clause PostgREST sur les 3 champs", () => {
  assert.equal(
    buildOrFilter("mer"),
    "raison_sociale.imatch.m[eéèêë]r,nom_commercial.imatch.m[eéèêë]r,ville.imatch.m[eéèêë]r"
  );
});

test("matchesQuery : « taxi terre et mer » trouve la fiche (via nom_commercial)", () => {
  assert.equal(matchesQuery(TAXI_TERRE_MER, "taxi terre et mer"), true);
});

test("matchesQuery : « taxi terre & mer » trouve la fiche", () => {
  assert.equal(matchesQuery(TAXI_TERRE_MER, "taxi terre & mer"), true);
});

test("matchesQuery : « terre mer » (mots dans le désordre / partiels) trouve la fiche", () => {
  assert.equal(matchesQuery(TAXI_TERRE_MER, "terre mer"), true);
});

test("matchesQuery : « barriere brehal » trouve la fiche (raison_sociale + ville)", () => {
  assert.equal(matchesQuery(TAXI_TERRE_MER, "barriere brehal"), true);
});

test("matchesQuery : accents indifférents (« brehal » == « bréhal »)", () => {
  assert.equal(matchesQuery(TAXI_TERRE_MER, "brehal"), true);
  assert.equal(matchesQuery(TAXI_TERRE_MER, "bréhal"), true);
});

test("matchesQuery : « brehalais » (sous-chaîne inverse) trouve la fiche", () => {
  assert.equal(matchesQuery(TAXI_TERRE_MER, "taxis brehalais"), true);
});

test("matchesQuery : un token absent -> pas de correspondance (AND)", () => {
  assert.equal(matchesQuery(TAXI_TERRE_MER, "taxi terre mer paris"), false);
  assert.equal(matchesQuery(TAXI_TERRE_MER, "ambulance dupont"), false);
});

// ---------------------------------------------------------------------------
// Recherche par ville multi-mots (bug prod « thury harcourt » / « le hom »).
// ---------------------------------------------------------------------------

const THURY = "thury-harcourt-le-hom";

test("slugWordConcatenations : concaténations depuis chaque mot", () => {
  assert.deepEqual(slugWordConcatenations(THURY), [
    "thuryharcourtlehom",
    "harcourtlehom",
    "lehom",
    "hom",
  ]);
});

test("matchesVilleSlug : « thury harcourt » (bug prod principal) matche", () => {
  assert.equal(matchesVilleSlug(THURY, "thury harcourt"), true);
});

test("matchesVilleSlug : « le hom » matche (le = mot vide, hom conservé)", () => {
  assert.equal(matchesVilleSlug(THURY, "le hom"), true);
});

test("matchesVilleSlug : nom complet « Thury Harcourt le hom » matche", () => {
  assert.equal(matchesVilleSlug(THURY, "Thury Harcourt le hom"), true);
});

test("matchesVilleSlug : mono-mot « thury » matche (non régression)", () => {
  assert.equal(matchesVilleSlug(THURY, "thury"), true);
});

test("matchesVilleSlug : slug exact matche", () => {
  assert.equal(matchesVilleSlug("bayeux", "bayeux"), true);
  assert.equal(matchesVilleSlug(THURY, "thury-harcourt-le-hom"), true);
});

test("matchesVilleSlug : accents indifférents (« évreux » == « evreux »)", () => {
  assert.equal(matchesVilleSlug("evreux", "évreux"), true);
  assert.equal(matchesVilleSlug("evreux", "evreux"), true);
});

test("matchesVilleSlug : apostrophe tolérée (« l'isle adam » / « lisle adam »)", () => {
  assert.equal(matchesVilleSlug("l-isle-adam", "l'isle adam"), true);
  assert.equal(matchesVilleSlug("l-isle-adam", "lisle adam"), true);
  assert.equal(matchesVilleSlug("l-isle-adam", "l isle adam"), true);
});

test("matchesVilleSlug : « saint pierre » matche plusieurs villes", () => {
  assert.equal(matchesVilleSlug("saint-pierre-sur-dives", "saint pierre"), true);
  assert.equal(matchesVilleSlug("saint-pierre-eglise", "saint pierre"), true);
});

test("matchesVilleSlug : token absent -> pas de correspondance", () => {
  assert.equal(matchesVilleSlug(THURY, "thury paris"), false);
  assert.equal(matchesVilleSlug(THURY, "caen"), false);
});

test("matchesVilleSlug : sous-chaîne au milieu d'un mot ne matche PAS (préfixe requis)", () => {
  // « hom » ne doit pas matcher « thomery » (h milieu de mot).
  assert.equal(matchesVilleSlug("thomery", "hom"), false);
});

test("matchesVilleSlug : ville nulle/vide -> false", () => {
  assert.equal(matchesVilleSlug(null, "thury"), false);
  assert.equal(matchesVilleSlug("", "thury"), false);
});

test("buildVilleOrFilter : sous-chaîne slug OU regex accent-insensible nom", () => {
  assert.equal(
    buildVilleOrFilter("evreux"),
    "ville_slug.ilike.*evreux*,ville.imatch.[eéèêë]vr[eéèêë][uùûü]x"
  );
});
