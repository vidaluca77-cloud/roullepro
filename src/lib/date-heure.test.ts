import { test } from "node:test";
import assert from "node:assert/strict";
import {
  combineDateHeure,
  splitDateHeure,
  toISODateSouhaitee,
  validerDateHeure,
  formaterRecap,
  bornesDateHeure,
} from "./date-heure";

test("combineDateHeure : date + heure -> chaine locale complete", () => {
  assert.equal(combineDateHeure("2026-07-21", "10:00"), "2026-07-21T10:00");
});

test("combineDateHeure : heure manquante -> chaine vide", () => {
  assert.equal(combineDateHeure("2026-07-21", ""), "");
});

test("combineDateHeure : date manquante -> chaine vide", () => {
  assert.equal(combineDateHeure("", "10:00"), "");
});

test("splitDateHeure : scinde correctement puis round-trip", () => {
  const { date, time } = splitDateHeure("2026-07-21T10:00");
  assert.equal(date, "2026-07-21");
  assert.equal(time, "10:00");
  assert.equal(combineDateHeure(date, time), "2026-07-21T10:00");
});

test("splitDateHeure : valeur vide -> champs vides", () => {
  assert.deepEqual(splitDateHeure(""), { date: "", time: "" });
});

test("toISODateSouhaitee : chaine valide -> ISO, vide/invalide -> null", () => {
  assert.equal(toISODateSouhaitee(""), null);
  assert.equal(toISODateSouhaitee(null), null);
  assert.equal(toISODateSouhaitee("pas-une-date"), null);
  const iso = toISODateSouhaitee("2026-07-21T10:00");
  assert.ok(iso && iso.startsWith("2026-07-"));
});

const NOW = new Date("2026-07-17T09:00:00");

test("validerDateHeure : rien saisi -> pas d'erreur", () => {
  assert.deepEqual(validerDateHeure("", "", NOW), { erreur: null, champ: null });
});

test("validerDateHeure : date sans heure -> erreur sur le champ heure", () => {
  const r = validerDateHeure("2026-07-18", "", NOW);
  assert.equal(r.champ, "heure");
  assert.match(r.erreur ?? "", /heure/i);
});

test("validerDateHeure : heure sans date -> erreur sur le champ date", () => {
  const r = validerDateHeure("", "10:00", NOW);
  assert.equal(r.champ, "date");
  assert.match(r.erreur ?? "", /date/i);
});

test("validerDateHeure : creneau valide dans l'horizon -> null", () => {
  assert.deepEqual(validerDateHeure("2026-07-18", "10:00", NOW), {
    erreur: null,
    champ: null,
  });
});

test("validerDateHeure : date/heure deja passee -> erreur", () => {
  const r = validerDateHeure("2026-07-16", "10:00", NOW);
  assert.ok(r.erreur);
  assert.match(r.erreur ?? "", /passée/i);
});

test("validerDateHeure : marge < 30 min -> erreur", () => {
  const r = validerDateHeure("2026-07-17", "09:10", NOW);
  assert.ok(r.erreur);
  assert.match(r.erreur ?? "", /30 minutes/);
});

test("validerDateHeure : au-dela de 6 mois -> erreur", () => {
  const r = validerDateHeure("2027-02-01", "10:00", NOW);
  assert.ok(r.erreur);
  assert.match(r.erreur ?? "", /6 prochains mois/);
});

test("bornesDateHeure : min = aujourd'hui, max = +6 mois", () => {
  const { minDate, maxDate } = bornesDateHeure(NOW);
  assert.equal(minDate, "2026-07-17");
  assert.equal(maxDate, "2027-01-17");
});

test("formaterRecap : format francais complet", () => {
  const recap = formaterRecap("2026-07-21", "10:00");
  assert.ok(recap);
  assert.match(recap ?? "", /mardi 21 juillet 2026/);
  assert.match(recap ?? "", /à 10h00/);
});

test("formaterRecap : champ manquant -> null", () => {
  assert.equal(formaterRecap("2026-07-21", ""), null);
  assert.equal(formaterRecap("", "10:00"), null);
});
