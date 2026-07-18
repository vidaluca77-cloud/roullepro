import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeForMatch,
  tokenize,
  buildTokenPattern,
  buildOrFilter,
  matchesQuery,
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
