import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normaliserTelephoneComparaison,
  normaliserLieu,
  memeDateSouhaitee,
  estDoublonDemande,
  trouverDoublon,
  type DemandeComparable,
} from "./demande-doublon";

// --- normaliserTelephoneComparaison ----------------------------------------

test("normaliserTelephoneComparaison : formats varies -> forme nationale", () => {
  assert.equal(normaliserTelephoneComparaison("0663603304"), "0663603304");
  assert.equal(normaliserTelephoneComparaison("+33663603304"), "0663603304");
  assert.equal(normaliserTelephoneComparaison("+33 6 63 60 33 04"), "0663603304");
  assert.equal(normaliserTelephoneComparaison("0033663603304"), "0663603304");
  assert.equal(normaliserTelephoneComparaison("06.63.60.33.04"), "0663603304");
});

test("normaliserTelephoneComparaison : fixe FR aussi normalise", () => {
  assert.equal(normaliserTelephoneComparaison("0143567890"), "0143567890");
  assert.equal(normaliserTelephoneComparaison("+33143567890"), "0143567890");
});

test("normaliserTelephoneComparaison : vide -> chaine vide", () => {
  assert.equal(normaliserTelephoneComparaison(""), "");
  assert.equal(normaliserTelephoneComparaison(null), "");
  assert.equal(normaliserTelephoneComparaison(undefined), "");
});

// --- normaliserLieu --------------------------------------------------------

test("normaliserLieu : casse, accents, espaces, ponctuation", () => {
  assert.equal(
    normaliserLieu("12 Rue de l'Hôpital, CAEN"),
    "12 rue de l'hopital caen"
  );
  assert.equal(normaliserLieu("  Gare   SNCF  "), "gare sncf");
  assert.equal(normaliserLieu(null), "");
});

// --- memeDateSouhaitee -----------------------------------------------------

test("memeDateSouhaitee : meme instant vrai, sinon faux", () => {
  assert.equal(
    memeDateSouhaitee("2026-07-27T08:45:00.000Z", "2026-07-27T08:45:00.000Z"),
    true
  );
  assert.equal(
    memeDateSouhaitee("2026-07-27T08:45:00.000Z", "2026-07-28T08:45:00.000Z"),
    false
  );
  assert.equal(memeDateSouhaitee(null, "2026-07-27T08:45:00.000Z"), false);
});

// --- estDoublonDemande -----------------------------------------------------

const base: DemandeComparable = {
  telephone: "0663603304",
  lieu_depart: "12 rue de l'Hopital, Caen",
  lieu_arrivee: "CHU de Caen",
  date_souhaitee: "2026-07-27T08:45:00.000Z",
};

test("estDoublonDemande : re-soumission identique (formats differents) = doublon", () => {
  const nouvelle: DemandeComparable = {
    telephone: "+33 6 63 60 33 04",
    lieu_depart: "12 Rue de l'Hôpital, CAEN",
    lieu_arrivee: "CHU de Caen",
    date_souhaitee: "2026-07-27T08:45:00.000Z",
  };
  assert.equal(estDoublonDemande(nouvelle, base), true);
});

test("estDoublonDemande : date differente = PAS un doublon", () => {
  const nouvelle = { ...base, date_souhaitee: "2026-07-28T08:45:00.000Z" };
  assert.equal(estDoublonDemande(nouvelle, base), false);
});

test("estDoublonDemande : trajet retour (depart/arrivee inverses) = PAS un doublon", () => {
  const retour: DemandeComparable = {
    ...base,
    lieu_depart: "CHU de Caen",
    lieu_arrivee: "12 rue de l'Hopital, Caen",
  };
  assert.equal(estDoublonDemande(retour, base), false);
});

test("estDoublonDemande : trajet different = PAS un doublon", () => {
  const nouvelle = { ...base, lieu_arrivee: "Clinique Saint-Martin" };
  assert.equal(estDoublonDemande(nouvelle, base), false);
});

test("estDoublonDemande : telephone different = PAS un doublon", () => {
  const nouvelle = { ...base, telephone: "0711223344" };
  assert.equal(estDoublonDemande(nouvelle, base), false);
});

test("estDoublonDemande : arrivees toutes deux vides = doublon possible", () => {
  const a: DemandeComparable = { ...base, lieu_arrivee: null };
  const b: DemandeComparable = { ...base, lieu_arrivee: "" };
  assert.equal(estDoublonDemande(a, b), true);
});

test("estDoublonDemande : telephone vide ne matche jamais", () => {
  const a: DemandeComparable = { ...base, telephone: "" };
  const b: DemandeComparable = { ...base, telephone: "" };
  assert.equal(estDoublonDemande(a, b), false);
});

// --- trouverDoublon --------------------------------------------------------

test("trouverDoublon : retrouve la ligne correspondante dans une liste", () => {
  const existantes: DemandeComparable[] = [
    { ...base, telephone: "0700000000" },
    { ...base, lieu_arrivee: "Autre lieu" },
    base,
  ];
  const nouvelle: DemandeComparable = { ...base, telephone: "+33663603304" };
  assert.equal(trouverDoublon(nouvelle, existantes), existantes[2]);
});

test("trouverDoublon : aucune correspondance -> null", () => {
  const existantes: DemandeComparable[] = [{ ...base, date_souhaitee: "2026-08-01T08:45:00.000Z" }];
  assert.equal(trouverDoublon(base, existantes), null);
});
