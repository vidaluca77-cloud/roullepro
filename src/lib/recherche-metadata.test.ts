import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveRechercheMetadata } from "./recherche-metadata";

// --- Categorie seule : canonical vers la page dediee -----------------------

test("categorie=vsl -> canonical /vsl-autour-de-moi, indexable", () => {
  const m = resolveRechercheMetadata({ categorie: "vsl" });
  assert.equal(m.canonicalPath, "/vsl-autour-de-moi");
  assert.equal(m.index, true);
});

test("categorie=ambulance -> canonical /ambulance-autour-de-moi, indexable", () => {
  const m = resolveRechercheMetadata({ categorie: "ambulance" });
  assert.equal(m.canonicalPath, "/ambulance-autour-de-moi");
  assert.equal(m.index, true);
});

test("categorie=taxi_conventionne (key) -> canonical /taxi-vsl-autour-de-moi", () => {
  const m = resolveRechercheMetadata({ categorie: "taxi_conventionne" });
  assert.equal(m.canonicalPath, "/taxi-vsl-autour-de-moi");
  assert.equal(m.index, true);
});

test("categorie=taxi-conventionne (slug) -> meme canonical que la key", () => {
  const m = resolveRechercheMetadata({ categorie: "taxi-conventionne" });
  assert.equal(m.canonicalPath, "/taxi-vsl-autour-de-moi");
  assert.equal(m.index, true);
});

test("categorie insensible a la casse et aux espaces", () => {
  const m = resolveRechercheMetadata({ categorie: "  VSL  " });
  assert.equal(m.canonicalPath, "/vsl-autour-de-moi");
});

// --- Recherche libre (?q) : noindex + canonical auto -----------------------

test("q non vide -> noindex,follow + canonical page de recherche", () => {
  const m = resolveRechercheMetadata({ q: "Marseille" });
  assert.equal(m.index, false);
  assert.equal(m.canonicalPath, "/transport-medical/recherche");
});

test("q prioritaire sur categorie (recherche libre = noindex)", () => {
  const m = resolveRechercheMetadata({ q: "Lyon", categorie: "vsl" });
  assert.equal(m.index, false);
  assert.equal(m.canonicalPath, "/transport-medical/recherche");
});

test("q compose uniquement d'espaces est ignore", () => {
  const m = resolveRechercheMetadata({ q: "   " });
  assert.equal(m.index, true);
  assert.equal(m.canonicalPath, "/transport-medical/recherche");
});

// --- Geolocalisation (?lat/?lng) : noindex ---------------------------------

test("geo=true -> noindex,follow + canonical page de recherche", () => {
  const m = resolveRechercheMetadata({ geo: true });
  assert.equal(m.index, false);
  assert.equal(m.canonicalPath, "/transport-medical/recherche");
});

// --- Sans parametre / categorie inconnue : page canonique indexable --------

test("sans parametre -> canonical page de recherche, indexable", () => {
  const m = resolveRechercheMetadata({});
  assert.equal(m.index, true);
  assert.equal(m.canonicalPath, "/transport-medical/recherche");
  assert.ok(m.title.length > 0);
  assert.ok(m.description.length > 0);
});

test("categorie inconnue -> fallback page de recherche indexable", () => {
  const m = resolveRechercheMetadata({ categorie: "inconnu" });
  assert.equal(m.index, true);
  assert.equal(m.canonicalPath, "/transport-medical/recherche");
});
