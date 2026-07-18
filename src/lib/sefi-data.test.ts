import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DATE_VERIFICATION,
  NON_COMMUNIQUE,
  SOURCES,
  FAITS_REGLEMENTAIRES,
  CALENDRIER,
  SOLUTIONS,
  SOLUTIONS_PERIPHERIQUES,
  REPERES_COUTS_GEOLOC,
  SOLUTIONS_GEOLOC,
  STATUT_LABEL,
  CITATION_ARTICLE_L322_5_3,
} from "./sefi-data";

test("DATE_VERIFICATION est bien le 18 juillet 2026", () => {
  assert.equal(DATE_VERIFICATION, "18 juillet 2026");
});

test("toutes les sources ont un nom et une URL http(s) valide", () => {
  for (const [key, src] of Object.entries(SOURCES)) {
    assert.ok(src.nom.length > 0, `source ${key} sans nom`);
    assert.match(src.url, /^https?:\/\//, `source ${key} URL invalide`);
  }
});

test("chaque fait réglementaire est sourcé", () => {
  assert.ok(FAITS_REGLEMENTAIRES.length >= 5);
  for (const f of FAITS_REGLEMENTAIRES) {
    assert.ok(f.contenu.length > 0);
    assert.match(f.source.url, /^https?:\/\//);
  }
});

test("le calendrier contient les 3 dates clés attendues", () => {
  const iso = CALENDRIER.map((e) => e.dateIso);
  assert.deepEqual(iso, ["2025-11-01", "2026-05-31", "2027-01-01"]);
  for (const e of CALENDRIER) {
    assert.match(e.source.url, /^https?:\/\//);
  }
});

test("la citation de l'article L. 322-5-3 mentionne les deux équipements obligatoires", () => {
  assert.match(CITATION_ARTICLE_L322_5_3, /géolocalisation/);
  assert.match(CITATION_ARTICLE_L322_5_3, /facturation intégré/);
});

test("les solutions sont ordonnées : certifiées CNDA d'abord", () => {
  const rang: Record<string, number> = { certifie: 0, revendique: 1, en_attente: 2 };
  let precedent = -1;
  for (const s of SOLUTIONS) {
    const r = rang[s.statutCnda];
    assert.ok(
      r >= precedent,
      `ordre rompu à ${s.nom} (statut ${s.statutCnda})`
    );
    precedent = r;
  }
});

test("chaque solution a au moins une source et un statut connu", () => {
  assert.ok(SOLUTIONS.length >= 20);
  for (const s of SOLUTIONS) {
    assert.ok(s.nom.length > 0);
    assert.ok(s.editeur.length > 0);
    assert.ok(STATUT_LABEL[s.statutCnda], `statut inconnu pour ${s.nom}`);
    assert.ok(s.sources.length >= 1, `${s.nom} sans source`);
    for (const src of s.sources) {
      assert.match(src.url, /^https?:\/\//);
    }
  }
});

test("les prix non renseignés utilisent la mention non communiqué", () => {
  // Aucune solution ne doit afficher la mention brute « n.a. ».
  for (const s of SOLUTIONS) {
    assert.doesNotMatch(s.prix, /\bn\.a\.?\b/i, `${s.nom} contient n.a.`);
  }
  assert.equal(NON_COMMUNIQUE, "non communiqué");
});

test("solutions périphériques et repères de coûts sont sourcés", () => {
  assert.ok(SOLUTIONS_PERIPHERIQUES.length >= 1);
  assert.ok(REPERES_COUTS_GEOLOC.length >= 1);
  assert.ok(SOLUTIONS_GEOLOC.length >= 1);
  for (const s of [...SOLUTIONS_PERIPHERIQUES, ...SOLUTIONS_GEOLOC]) {
    assert.match(s.source.url, /^https?:\/\//);
  }
  for (const r of REPERES_COUTS_GEOLOC) {
    assert.match(r.source.url, /^https?:\/\//);
  }
});
