import { test } from "node:test";
import assert from "node:assert/strict";
import {
  partitionnerCourses,
  grouperParJourSemaine,
  genererICS,
  genererCSV,
  libelleType,
  type CoursePlanning,
} from "./planning-course";

const NOW = new Date("2026-07-15T10:00:00.000Z");

function course(over: Partial<CoursePlanning>): CoursePlanning {
  return {
    dtp_id: "dtp-1",
    demande_id: "d-1",
    dtp_statut: "acceptee",
    acceptee_at: "2026-07-10T09:00:00.000Z",
    type_transport: "taxi",
    lieu_depart: "1 rue A, Caen",
    lieu_arrivee: "CHU de Caen",
    date_souhaitee: "2026-07-16T08:00:00.000Z",
    aller_retour: false,
    mobilite: "autonome",
    precisions: null,
    distance_km: 12,
    prix_estime: 30,
    demandeur_nom: "Jean Dupont",
    demandeur_telephone: "06 12 34 56 78",
    demandeur_email: "jean@example.com",
    ...over,
  };
}

test("libelleType : mapping connu + fallback", () => {
  assert.equal(libelleType("taxi"), "Taxi conventionné");
  assert.equal(libelleType("vsl"), "VSL");
  assert.equal(libelleType("ambulance"), "Ambulance");
  assert.equal(libelleType(null), "Transport");
  assert.equal(libelleType("inconnu"), "Transport");
});

test("partitionnerCourses : sépare futur (croissant) et passé (décroissant)", () => {
  const courses = [
    course({ dtp_id: "futur-2", date_souhaitee: "2026-07-20T08:00:00.000Z" }),
    course({ dtp_id: "passe-1", date_souhaitee: "2026-07-14T08:00:00.000Z" }),
    course({ dtp_id: "futur-1", date_souhaitee: "2026-07-16T08:00:00.000Z" }),
    course({ dtp_id: "passe-2", date_souhaitee: "2026-07-01T08:00:00.000Z" }),
  ];
  const { aVenir, historique } = partitionnerCourses(courses, NOW);
  assert.deepEqual(
    aVenir.map((c) => c.dtp_id),
    ["futur-1", "futur-2"]
  );
  assert.deepEqual(
    historique.map((c) => c.dtp_id),
    ["passe-1", "passe-2"]
  );
});

test("partitionnerCourses : ignore les non-acceptées et dates invalides", () => {
  const courses = [
    course({ dtp_id: "ok", date_souhaitee: "2026-07-16T08:00:00.000Z" }),
    course({ dtp_id: "proposee", dtp_statut: "proposee" }),
    course({ dtp_id: "sans-date", date_souhaitee: null }),
    course({ dtp_id: "date-ko", date_souhaitee: "pas-une-date" }),
  ];
  const { aVenir, historique } = partitionnerCourses(courses, NOW);
  assert.deepEqual(aVenir.map((c) => c.dtp_id), ["ok"]);
  assert.deepEqual(historique, []);
});

test("partitionnerCourses : une course à l'instant présent est « à venir »", () => {
  const courses = [course({ date_souhaitee: NOW.toISOString() })];
  const { aVenir, historique } = partitionnerCourses(courses, NOW);
  assert.equal(aVenir.length, 1);
  assert.equal(historique.length, 0);
});

test("grouperParJourSemaine : renvoie 7 jours incluant les jours vides", () => {
  const jours = grouperParJourSemaine([], NOW);
  assert.equal(jours.length, 7);
  assert.ok(jours.every((j) => j.courses.length === 0));
});

test("grouperParJourSemaine : place les courses dans le bon jour, hors fenêtre exclu", () => {
  const courses = [
    course({ dtp_id: "j0", date_souhaitee: "2026-07-15T14:00:00.000Z" }),
    course({ dtp_id: "j1", date_souhaitee: "2026-07-16T08:00:00.000Z" }),
    course({ dtp_id: "hors", date_souhaitee: "2026-07-30T08:00:00.000Z" }),
  ];
  const jours = grouperParJourSemaine(courses, NOW);
  const total = jours.reduce((n, j) => n + j.courses.length, 0);
  assert.equal(total, 2);
  const ids = jours.flatMap((j) => j.courses.map((c) => c.dtp_id));
  assert.ok(ids.includes("j0"));
  assert.ok(ids.includes("j1"));
  assert.ok(!ids.includes("hors"));
});

test("genererICS : structure VCALENDAR/VEVENT et champs clés", () => {
  const ics = genererICS([course({ dtp_id: "abc" })], NOW);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR"));
  assert.ok(ics.trimEnd().endsWith("END:VCALENDAR"));
  assert.ok(ics.includes("BEGIN:VEVENT"));
  assert.ok(ics.includes("UID:abc@roullepro.com"));
  assert.ok(ics.includes("DTSTART:20260716T080000Z"));
  assert.ok(ics.includes("DTEND:20260716T090000Z"));
  assert.ok(ics.includes("SUMMARY:Taxi conventionné"));
  // Lignes séparées par CRLF (RFC 5545).
  assert.ok(ics.includes("\r\n"));
});

test("genererICS : échappe les caractères spéciaux (virgule, point-virgule)", () => {
  const ics = genererICS(
    [course({ lieu_depart: "1 rue A; B, C" })],
    NOW
  );
  assert.ok(ics.includes("LOCATION:1 rue A\\; B\\, C"));
});

test("genererICS : n'émet aucun VEVENT pour une liste vide", () => {
  const ics = genererICS([], NOW);
  assert.ok(!ics.includes("BEGIN:VEVENT"));
});

test("genererCSV : entêtes, BOM et échappement du séparateur", () => {
  const csv = genererCSV([course({ lieu_arrivee: "CHU; aile B" })]);
  assert.ok(csv.startsWith("﻿"));
  const lignes = csv.replace("﻿", "").split("\r\n");
  assert.ok(lignes[0].startsWith("Date;Heure;Type;"));
  // Le champ contenant « ; » est entre guillemets.
  assert.ok(lignes[1].includes('"CHU; aile B"'));
  assert.ok(lignes[1].includes("Jean Dupont"));
});

test("genererCSV : inclut les courses terminées, ignore les non prises", () => {
  const csv = genererCSV([
    course({ dtp_id: "term", dtp_statut: "terminee" }),
    course({ dtp_id: "prop", dtp_statut: "proposee" }),
    course({ dtp_id: "decl", dtp_statut: "declinee" }),
  ]);
  const lignes = csv.replace("﻿", "").split("\r\n");
  assert.equal(lignes.length, 2); // entête + la course terminée
});

test("partitionnerCourses : une course terminée va dans l'historique", () => {
  const courses = [
    course({ dtp_id: "term-futur", dtp_statut: "terminee", date_souhaitee: "2026-07-20T08:00:00.000Z" }),
  ];
  const { aVenir, historique } = partitionnerCourses(courses, NOW);
  assert.deepEqual(aVenir, []);
  assert.deepEqual(historique.map((c) => c.dtp_id), ["term-futur"]);
});
