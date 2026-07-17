import { test } from "node:test";
import assert from "node:assert/strict";
import {
  estimerPrixCPAM,
  majorationNuitWeApplicable,
  TAUX_KM_PAR_DEPARTEMENT,
  REGLES_CPAM,
} from "./tarif-cpam";

// Date de reference deterministe : mercredi 15/07/2026 10:00 Paris (jour ouvre,
// hors ferie, hors nuit) -> aucune majoration.
const JOUR_OUVRE_JOUR = "2026-07-15T10:00:00+02:00";

test("estimerPrixCPAM : course simple (14, 10 km, jour ouvre) sans majoration", () => {
  const est = estimerPrixCPAM({
    distanceKm: 10,
    departementCible: "14",
    dateSouhaitee: JOUR_OUVRE_JOUR,
  });
  assert.ok(est);
  // 13 (forfait) + max(0,10-4)=6 km * 1.07 = 6.42 -> 19.42
  assert.equal(est!.total, 19.42);
  assert.equal(est!.details.forfait, 13);
  assert.equal(est!.details.kmFactures, 6);
  assert.equal(est!.details.tauxKm, TAUX_KM_PAR_DEPARTEMENT["14"]);
  assert.equal(est!.details.montantKm, 6.42);
  assert.equal(est!.details.forfaitGrandeVille, 0);
  assert.equal(est!.details.majorationNuitWeAppliquee, false);
});

test("estimerPrixCPAM : distance <= 4 km -> seulement le forfait", () => {
  const est = estimerPrixCPAM({
    distanceKm: 3,
    departementCible: "14",
    dateSouhaitee: JOUR_OUVRE_JOUR,
  });
  assert.ok(est);
  assert.equal(est!.details.kmFactures, 0);
  assert.equal(est!.total, 13);
});

test("estimerPrixCPAM : forfait grande ville (Paris) ajoute 15 €", () => {
  const est = estimerPrixCPAM({
    distanceKm: 10,
    departementCible: "75",
    villeDepart: "Paris",
    dateSouhaitee: JOUR_OUVRE_JOUR,
  });
  assert.ok(est);
  // 13 + 15 + 6 * 1.22 (dept 75) = 13 + 15 + 7.32 = 35.32
  assert.equal(est!.details.forfaitGrandeVille, REGLES_CPAM.forfaitGrandeVille);
  assert.equal(est!.total, 35.32);
});

test("estimerPrixCPAM : forfait grande ville via departement 92/93/94", () => {
  const est = estimerPrixCPAM({
    distanceKm: 10,
    departementCible: "93",
    departementDepart: "93",
    dateSouhaitee: JOUR_OUVRE_JOUR,
  });
  assert.ok(est);
  assert.equal(est!.details.forfaitGrandeVille, 15);
});

test("estimerPrixCPAM : majoration nuit (+50% du socle)", () => {
  const est = estimerPrixCPAM({
    distanceKm: 10,
    departementCible: "14",
    dateSouhaitee: "2026-07-15T22:00:00+02:00",
  });
  assert.ok(est);
  // socle 19.42, majoration 9.71 -> 29.13
  assert.equal(est!.details.majorationNuitWeAppliquee, true);
  assert.equal(est!.details.majorationNuitWe, 9.71);
  assert.equal(est!.total, 29.13);
});

test("estimerPrixCPAM : aller-retour double le total", () => {
  const est = estimerPrixCPAM({
    distanceKm: 10,
    departementCible: "14",
    dateSouhaitee: JOUR_OUVRE_JOUR,
    allerRetour: true,
  });
  assert.ok(est);
  assert.equal(est!.details.allerRetour, true);
  assert.equal(est!.total, 38.84);
});

test("estimerPrixCPAM : supplement DROM (+3 €/trajet)", () => {
  const est = estimerPrixCPAM({
    distanceKm: 10,
    departementCible: "974",
    dateSouhaitee: JOUR_OUVRE_JOUR,
  });
  assert.ok(est);
  // 13 + 6 * 1.22 (dept 974) + 3 = 13 + 7.32 + 3 = 23.32
  assert.equal(est!.details.supplementDrom, REGLES_CPAM.supplementDrom);
  assert.equal(est!.total, 23.32);
});

test("estimerPrixCPAM : null si departement inconnu", () => {
  assert.equal(
    estimerPrixCPAM({ distanceKm: 10, departementCible: "999" }),
    null
  );
});

test("estimerPrixCPAM : null si distance invalide", () => {
  assert.equal(estimerPrixCPAM({ distanceKm: -1, departementCible: "14" }), null);
  assert.equal(estimerPrixCPAM({ distanceKm: NaN, departementCible: "14" }), null);
});

test("majorationNuitWeApplicable : nuit / dimanche / samedi apres-midi / ferie", () => {
  // Nuit (22h)
  assert.equal(majorationNuitWeApplicable(new Date("2026-07-15T22:00:00+02:00")), true);
  // Tot le matin (6h)
  assert.equal(majorationNuitWeApplicable(new Date("2026-07-15T06:00:00+02:00")), true);
  // Dimanche 19/07/2026 en journee
  assert.equal(majorationNuitWeApplicable(new Date("2026-07-19T10:00:00+02:00")), true);
  // Samedi 18/07/2026 apres 12h
  assert.equal(majorationNuitWeApplicable(new Date("2026-07-18T14:00:00+02:00")), true);
  // Samedi 18/07/2026 matin : pas de majoration
  assert.equal(majorationNuitWeApplicable(new Date("2026-07-18T10:00:00+02:00")), false);
  // Jour ferie : 14/07/2026 en journee
  assert.equal(majorationNuitWeApplicable(new Date("2026-07-14T10:00:00+02:00")), true);
  // Lundi de Paques 06/04/2026 (ferie mobile)
  assert.equal(majorationNuitWeApplicable(new Date("2026-04-06T10:00:00+02:00")), true);
  // Jour ouvre en journee : pas de majoration
  assert.equal(majorationNuitWeApplicable(new Date(JOUR_OUVRE_JOUR)), false);
  // Valeur nulle / invalide
  assert.equal(majorationNuitWeApplicable(null), false);
  assert.equal(majorationNuitWeApplicable(new Date("invalide")), false);
});
