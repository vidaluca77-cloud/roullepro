import { test } from "node:test";
import assert from "node:assert/strict";
import {
  estimerPrixVSL,
  estimerPrixAmbulance,
  estimerPrixCourse,
  REGLES_VSL,
  REGLES_AMBULANCE,
  MENTION_ESTIMATION_TRANSPORT_SANITAIRE,
} from "./tarif-transport-sanitaire";
import { MENTION_ESTIMATION_CPAM } from "./tarif-cpam";

// Dates de reference deterministes (Europe/Paris).
const JOUR_OUVRE_JOUR = "2026-07-15T10:00:00+02:00"; // mercredi, jour, hors ferie
const NUIT = "2026-07-15T22:00:00+02:00"; // mercredi 22h -> nuit
const DIMANCHE = "2026-07-19T10:00:00+02:00"; // dimanche journee
const NUIT_DIMANCHE = "2026-07-19T22:00:00+02:00"; // dimanche 22h -> nuit prime

// --- VSL : exemple chiffre de reference du rapport ---
test("estimerPrixVSL : 20 km, jour, aller simple = 34,45 € (pas de valorisation)", () => {
  const est = estimerPrixVSL({ distanceKm: 20, dateSouhaitee: JOUR_OUVRE_JOUR });
  assert.ok(est);
  // 15,75 + (20-3)*1,10 = 15,75 + 18,70 = 34,45 ; distance > 18 km -> pas de valorisation
  assert.equal(est!.total, 34.45);
  assert.equal(est!.details.type, "vsl");
  assert.equal(est!.details.forfait, 15.75);
  assert.equal(est!.details.kmFactures, 17);
  assert.equal(est!.details.tauxKm, 1.1);
  assert.equal(est!.details.montantKm, 18.7);
  assert.equal(est!.details.valorisationTrajetCourt, 0);
  assert.equal(est!.details.majorationAppliquee, false);
  assert.equal(est!.details.majoration, null);
});

test("estimerPrixVSL : trajet court (10 km) inclut la valorisation", () => {
  const est = estimerPrixVSL({ distanceKm: 10, dateSouhaitee: JOUR_OUVRE_JOUR });
  assert.ok(est);
  // 15,75 + (10-3)*1,10 + 6,35 (>9 et <=10) = 15,75 + 7,70 + 6,35 = 29,80
  assert.equal(est!.details.valorisationTrajetCourt, 6.35);
  assert.equal(est!.total, 29.8);
});

test("estimerPrixVSL : distance <= 3 km -> forfait + valorisation seulement", () => {
  const est = estimerPrixVSL({ distanceKm: 3, dateSouhaitee: JOUR_OUVRE_JOUR });
  assert.ok(est);
  assert.equal(est!.details.kmFactures, 0);
  // 15,75 + 8,54 (<=7 km) = 24,29
  assert.equal(est!.total, 24.29);
});

test("estimerPrixVSL : majoration nuit +50 %", () => {
  const est = estimerPrixVSL({ distanceKm: 20, dateSouhaitee: NUIT });
  assert.ok(est);
  // assiette 34,45 ; +50 % = 17,225 -> 17,23 ; total 51,68
  assert.equal(est!.details.majoration?.libelle, "nuit");
  assert.equal(est!.details.majoration?.taux, REGLES_VSL.tauxNuit);
  assert.equal(est!.details.majoration?.montant, 17.23);
  assert.equal(est!.total, 51.68);
});

test("estimerPrixVSL : majoration dimanche +25 %", () => {
  const est = estimerPrixVSL({ distanceKm: 20, dateSouhaitee: DIMANCHE });
  assert.ok(est);
  // assiette 34,45 ; +25 % = 8,6125 -> 8,61 ; total 43,06
  assert.equal(est!.details.majoration?.libelle, "dimanche_ferie");
  assert.equal(est!.details.majoration?.taux, REGLES_VSL.tauxDimanche);
  assert.equal(est!.total, 43.06);
});

test("estimerPrixVSL : nuit ET dimanche -> seule la nuit (non cumul)", () => {
  const est = estimerPrixVSL({ distanceKm: 20, dateSouhaitee: NUIT_DIMANCHE });
  assert.ok(est);
  assert.equal(est!.details.majoration?.libelle, "nuit");
  assert.equal(est!.details.majoration?.taux, 0.5);
  assert.equal(est!.total, 51.68);
});

test("estimerPrixVSL : aller-retour double le total", () => {
  const est = estimerPrixVSL({ distanceKm: 20, dateSouhaitee: JOUR_OUVRE_JOUR, allerRetour: true });
  assert.ok(est);
  assert.equal(est!.details.allerRetour, true);
  assert.equal(est!.total, 68.9);
});

// --- Ambulance : exemple chiffre de reference du rapport ---
test("estimerPrixAmbulance : 12 km, jour, aller simple = 84,82 €", () => {
  const est = estimerPrixAmbulance({ distanceKm: 12, dateSouhaitee: JOUR_OUVRE_JOUR });
  assert.ok(est);
  // 57,39 + (12-3)*2,44 + 5,47 (>10 et <=15) = 57,39 + 21,96 + 5,47 = 84,82
  assert.equal(est!.total, 84.82);
  assert.equal(est!.details.type, "ambulance");
  assert.equal(est!.details.forfait, 57.39);
  assert.equal(est!.details.kmFactures, 9);
  assert.equal(est!.details.montantKm, 21.96);
  assert.equal(est!.details.valorisationTrajetCourt, 5.47);
});

test("estimerPrixAmbulance : longue distance (25 km) sans valorisation", () => {
  const est = estimerPrixAmbulance({ distanceKm: 25, dateSouhaitee: JOUR_OUVRE_JOUR });
  assert.ok(est);
  // 57,39 + (25-3)*2,44 = 57,39 + 53,68 = 111,07 ; > 19 km -> pas de valorisation
  assert.equal(est!.details.valorisationTrajetCourt, 0);
  assert.equal(est!.total, 111.07);
});

test("estimerPrixAmbulance : majoration dimanche +50 %", () => {
  const est = estimerPrixAmbulance({ distanceKm: 12, dateSouhaitee: DIMANCHE });
  assert.ok(est);
  // assiette 84,82 ; +50 % = 42,41 ; total 127,23
  assert.equal(est!.details.majoration?.libelle, "dimanche_ferie");
  assert.equal(est!.details.majoration?.taux, REGLES_AMBULANCE.tauxDimanche);
  assert.equal(est!.details.majoration?.montant, 42.41);
  assert.equal(est!.total, 127.23);
});

test("estimerPrixAmbulance : majoration nuit +75 %", () => {
  const est = estimerPrixAmbulance({ distanceKm: 12, dateSouhaitee: NUIT });
  assert.ok(est);
  // assiette 84,82 ; +75 % = 63,61 (arrondi) ; total 148,43
  assert.equal(est!.details.majoration?.libelle, "nuit");
  assert.equal(est!.details.majoration?.taux, 0.75);
  assert.equal(est!.total, 148.43);
});

test("estimerPrixAmbulance : nuit ET dimanche -> seule la nuit (non cumul)", () => {
  const est = estimerPrixAmbulance({ distanceKm: 12, dateSouhaitee: NUIT_DIMANCHE });
  assert.ok(est);
  assert.equal(est!.details.majoration?.libelle, "nuit");
  assert.equal(est!.total, 148.43);
});

test("estimerPrix* : null si distance invalide", () => {
  assert.equal(estimerPrixVSL({ distanceKm: -1 }), null);
  assert.equal(estimerPrixAmbulance({ distanceKm: NaN }), null);
});

// --- Aiguillage estimerPrixCourse ---
test("estimerPrixCourse : VSL utilise la convention transporteurs sanitaires", () => {
  const est = estimerPrixCourse({
    typeTransport: "vsl",
    distanceKm: 20,
    departementCible: "14",
    dateSouhaitee: JOUR_OUVRE_JOUR,
  });
  assert.ok(est);
  assert.equal(est!.total, 34.45);
  assert.equal(est!.details.type, "vsl");
  assert.equal(est!.mention, MENTION_ESTIMATION_TRANSPORT_SANITAIRE);
});

test("estimerPrixCourse : ambulance utilise la convention transporteurs sanitaires", () => {
  const est = estimerPrixCourse({
    typeTransport: "ambulance",
    distanceKm: 12,
    departementCible: "14",
    dateSouhaitee: JOUR_OUVRE_JOUR,
  });
  assert.ok(est);
  assert.equal(est!.total, 84.82);
  assert.equal(est!.details.type, "ambulance");
  assert.equal(est!.mention, MENTION_ESTIMATION_TRANSPORT_SANITAIRE);
});

test("estimerPrixCourse : taxi conserve la grille CPAM (inchangee)", () => {
  const est = estimerPrixCourse({
    typeTransport: "taxi",
    distanceKm: 10,
    departementCible: "14",
    dateSouhaitee: JOUR_OUVRE_JOUR,
  });
  assert.ok(est);
  // Identique au comportement taxi historique : 13 + 6*1,07 = 19,42
  assert.equal(est!.total, 19.42);
  assert.equal(est!.details.type, "taxi");
  assert.equal(est!.mention, MENTION_ESTIMATION_CPAM);
});

test("estimerPrixCourse : taxi null si departement inconnu", () => {
  assert.equal(
    estimerPrixCourse({ typeTransport: "taxi", distanceKm: 10, departementCible: "999" }),
    null
  );
});
