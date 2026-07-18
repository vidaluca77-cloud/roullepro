import { test } from "node:test";
import assert from "node:assert/strict";
import { estIndisponible, estIndisponibleMaintenant } from "./disponibilite";

const D = (s: string) => new Date(s);

// --- Aucune indisponibilite declaree ---------------------------------------

test("aucune borne (null/null) => toujours disponible", () => {
  assert.equal(estIndisponible(null, null, D("2026-07-18T10:00:00Z")), false);
  assert.equal(estIndisponible(undefined, undefined, D("2026-07-18T10:00:00Z")), false);
});

// --- Periode encadree (debut ET fin) ---------------------------------------

test("date de course dans la periode => indisponible", () => {
  assert.equal(
    estIndisponible("2026-08-01T00:00:00Z", "2026-08-15T23:59:59Z", D("2026-08-10T09:00:00Z")),
    true
  );
});

test("date de course avant la periode => disponible", () => {
  assert.equal(
    estIndisponible("2026-08-01T00:00:00Z", "2026-08-15T23:59:59Z", D("2026-07-31T09:00:00Z")),
    false
  );
});

test("date de course apres la periode => disponible", () => {
  assert.equal(
    estIndisponible("2026-08-01T00:00:00Z", "2026-08-15T23:59:59Z", D("2026-08-16T00:00:01Z")),
    false
  );
});

// --- Bornes exactes (incluses) ---------------------------------------------

test("borne de debut exacte => indisponible (incluse)", () => {
  const debut = "2026-08-01T08:00:00Z";
  assert.equal(estIndisponible(debut, "2026-08-15T00:00:00Z", D(debut)), true);
});

test("borne de fin exacte => indisponible (incluse)", () => {
  const fin = "2026-08-15T18:00:00Z";
  assert.equal(estIndisponible("2026-08-01T00:00:00Z", fin, D(fin)), true);
});

// --- Indispo sans debut (null = depuis toujours) ---------------------------

test("sans debut, course avant la fin => indisponible", () => {
  assert.equal(estIndisponible(null, "2026-08-15T23:59:59Z", D("2000-01-01T00:00:00Z")), true);
});

test("sans debut, course apres la fin => disponible", () => {
  assert.equal(estIndisponible(null, "2026-08-15T23:59:59Z", D("2026-09-01T00:00:00Z")), false);
});

// --- Indispo sans fin (null = sans fin prevue) -----------------------------

test("sans fin, course apres le debut => indisponible", () => {
  assert.equal(estIndisponible("2026-08-01T00:00:00Z", null, D("2030-01-01T00:00:00Z")), true);
});

test("sans fin, course avant le debut => disponible", () => {
  assert.equal(estIndisponible("2026-08-01T00:00:00Z", null, D("2026-07-15T00:00:00Z")), false);
});

// --- Dates passees ----------------------------------------------------------

test("periode entierement passee, course pendant => indisponible", () => {
  assert.equal(
    estIndisponible("2020-01-01T00:00:00Z", "2020-01-31T00:00:00Z", D("2020-01-15T00:00:00Z")),
    true
  );
});

test("periode passee, course aujourd'hui => disponible", () => {
  assert.equal(
    estIndisponible("2020-01-01T00:00:00Z", "2020-01-31T00:00:00Z", D("2026-07-18T00:00:00Z")),
    false
  );
});

// --- Date de course absente (COALESCE => now cote SQL) ---------------------

test("date de course nulle => disponible (pas d'exclusion possible)", () => {
  assert.equal(estIndisponible("2026-08-01T00:00:00Z", "2026-08-15T00:00:00Z", null), false);
});

// --- Formats d'entree tolerants --------------------------------------------

test("accepte les chaines ISO et les Date indifferemment", () => {
  assert.equal(
    estIndisponible(D("2026-08-01T00:00:00Z"), D("2026-08-15T00:00:00Z"), "2026-08-10T00:00:00Z"),
    true
  );
});

test("dates invalides ignorees => pas d'exclusion", () => {
  assert.equal(estIndisponible("pas-une-date", "non-plus", D("2026-08-10T00:00:00Z")), false);
});

// --- estIndisponibleMaintenant ---------------------------------------------

test("estIndisponibleMaintenant : horloge injectee pendant la periode", () => {
  assert.equal(
    estIndisponibleMaintenant("2026-08-01T00:00:00Z", "2026-08-15T00:00:00Z", D("2026-08-05T00:00:00Z")),
    true
  );
});

test("estIndisponibleMaintenant : horloge injectee hors periode", () => {
  assert.equal(
    estIndisponibleMaintenant("2026-08-01T00:00:00Z", "2026-08-15T00:00:00Z", D("2026-09-05T00:00:00Z")),
    false
  );
});
