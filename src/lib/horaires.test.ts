import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseCreneaux,
  resolveHoraires,
  isOpenNow,
  buildOpeningHoursSpecification,
} from "./horaires";

// Helper : construit une Date UTC correspondant a une heure locale Paris approx.
// On passe par une chaine ISO avec offset explicite pour rester deterministe.
function parisDate(iso: string): Date {
  return new Date(iso);
}

test("parseCreneaux : creneau simple", () => {
  assert.deepEqual(parseCreneaux("08:00-19:00"), [{ opens: "08:00", closes: "19:00" }]);
});

test("parseCreneaux : demi-cadratin et pause dejeuner", () => {
  assert.deepEqual(parseCreneaux("08:00–12:00, 14:00–19:00"), [
    { opens: "08:00", closes: "12:00" },
    { opens: "14:00", closes: "19:00" },
  ]);
});

test("parseCreneaux : format HHhMM", () => {
  assert.deepEqual(parseCreneaux("8h30-18h"), [{ opens: "08:30", closes: "18:00" }]);
});

test("parseCreneaux : 24h/24", () => {
  assert.deepEqual(parseCreneaux("24h/24"), [{ opens: "00:00", closes: "23:59" }]);
});

test("parseCreneaux : ferme / vide", () => {
  assert.deepEqual(parseCreneaux("Fermé"), []);
  assert.deepEqual(parseCreneaux(""), []);
  assert.deepEqual(parseCreneaux(null), []);
});

test("resolveHoraires : null si vide", () => {
  assert.equal(resolveHoraires(null), null);
  assert.equal(resolveHoraires({}), null);
  assert.equal(resolveHoraires({ lundi: "Fermé", mardi: "" }), null);
});

test("resolveHoraires : format legacy general", () => {
  const r = resolveHoraires({ general: "24h/24" });
  assert.ok(r);
  assert.deepEqual(r!.lundi, [{ opens: "00:00", closes: "23:59" }]);
  assert.deepEqual(r!.dimanche, [{ opens: "00:00", closes: "23:59" }]);
});

test("isOpenNow : null si aucun horaire", () => {
  assert.equal(isOpenNow(null), null);
  assert.equal(isOpenNow({}), null);
});

test("isOpenNow : ouvert un mercredi a 10h Paris", () => {
  // 2026-06-10 est un mercredi. 10:00 heure d'ete Paris = 08:00 UTC.
  const now = parisDate("2026-06-10T08:00:00Z");
  const status = isOpenNow({ mercredi: "08:00-12:00, 14:00-19:00" }, now);
  assert.ok(status);
  assert.equal(status!.open, true);
  assert.equal(status!.nextChange, "12:00");
});

test("isOpenNow : ferme pendant la pause dejeuner, rouvre l'apres-midi", () => {
  // Mercredi 13:00 Paris (ete) = 11:00 UTC, entre les deux creneaux.
  const now = parisDate("2026-06-10T11:00:00Z");
  const status = isOpenNow({ mercredi: "08:00-12:00, 14:00-19:00" }, now);
  assert.ok(status);
  assert.equal(status!.open, false);
  assert.equal(status!.nextChange, "14:00");
});

test("isOpenNow : ferme le soir, ouvre le lendemain", () => {
  // Mercredi 21:00 Paris (ete) = 19:00 UTC, apres fermeture. Jeudi ouvert.
  const now = parisDate("2026-06-10T19:00:00Z");
  const status = isOpenNow(
    { mercredi: "08:00-19:00", jeudi: "08:00-19:00" },
    now
  );
  assert.ok(status);
  assert.equal(status!.open, false);
  assert.equal(status!.nextDayLabel, "demain");
  assert.equal(status!.nextChange, "08:00");
});

test("buildOpeningHoursSpecification : null si vide", () => {
  assert.equal(buildOpeningHoursSpecification(null), null);
  assert.equal(buildOpeningHoursSpecification({ lundi: "Fermé" }), null);
});

test("buildOpeningHoursSpecification : mapping jours + creneaux", () => {
  const spec = buildOpeningHoursSpecification({
    lundi: "08:00-12:00, 14:00-19:00",
    samedi: "Fermé",
  });
  assert.ok(spec);
  assert.deepEqual(spec, [
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "08:00", closes: "12:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "14:00", closes: "19:00" },
  ]);
});
