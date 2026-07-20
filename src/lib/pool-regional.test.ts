import { test } from "node:test";
import assert from "node:assert/strict";
import { departementsPoolRegional, REGIONS_MUTUALISEES } from "./pool-regional";

const IDF = ["75", "77", "78", "91", "92", "93", "94", "95"];

test("demande 92 (Nanterre) -> tous les departements d'Ile-de-France", () => {
  const pool = departementsPoolRegional("92");
  assert.deepEqual([...pool].sort(), [...IDF].sort());
  // Les pros du 75, 77, 78 et 93 sont bien inclus (bug initial).
  for (const dep of ["75", "77", "78", "93"]) {
    assert.ok(pool.includes(dep), `le departement ${dep} doit etre dans le pool`);
  }
});

test("chaque departement d'IdF donne le meme pool complet", () => {
  for (const dep of IDF) {
    assert.deepEqual([...departementsPoolRegional(dep)].sort(), [...IDF].sort());
  }
});

test("demande hors IdF (14, Caen) -> comportement inchange, departement seul", () => {
  assert.deepEqual(departementsPoolRegional("14"), ["14"]);
});

test("departement DROM ou Corse hors pool -> inchange", () => {
  assert.deepEqual(departementsPoolRegional("974"), ["974"]);
  assert.deepEqual(departementsPoolRegional("2A"), ["2A"]);
});

test("valeur vide ou nulle -> tableau vide", () => {
  assert.deepEqual(departementsPoolRegional(""), []);
  assert.deepEqual(departementsPoolRegional("  "), []);
  assert.deepEqual(departementsPoolRegional(null), []);
  assert.deepEqual(departementsPoolRegional(undefined), []);
});

test("un departement hors region n'est jamais mutualise a plusieurs", () => {
  assert.equal(departementsPoolRegional("59").length, 1);
});

test("REGIONS_MUTUALISEES : departements uniques, aucun chevauchement entre regions", () => {
  const vus = new Set<string>();
  for (const region of REGIONS_MUTUALISEES) {
    assert.ok(region.length > 1, "une region mutualisee contient au moins 2 departements");
    for (const dep of region) {
      assert.ok(!vus.has(dep), `le departement ${dep} appartient a une seule region`);
      vus.add(dep);
    }
  }
});
