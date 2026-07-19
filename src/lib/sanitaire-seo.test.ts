import { test } from "node:test";
import assert from "node:assert/strict";
import { getVilleFaq } from "./sanitaire-seo";

// --- getVilleFaq : cas nominal (pros > 0) ----------------------------------

test("getVilleFaq : nbPros > 0 annonce le compteur reel", () => {
  const faq = getVilleFaq("Caen", 12);
  assert.ok(faq.length >= 4);
  assert.ok(faq[0].answer.includes("12 professionnels"));
  assert.ok(faq.every((q) => q.question.includes("Caen") || /ARS/.test(q.question)));
});

// --- getVilleFaq : cas 0 pro (defaut 2b) -----------------------------------

test("getVilleFaq : 0 pro n'affiche jamais « 0 professionnels » comme un fait", () => {
  const faq = getVilleFaq("Draguignan", 0, {
    categorieLabel: "vsl",
    categorieLabelPluriel: "vsl",
    depNom: "Var",
    depTotal: 48,
  });
  for (const q of faq) {
    assert.ok(!/0 professionnels/.test(q.answer), "ne doit pas afficher 0 professionnels");
  }
});

test("getVilleFaq : 0 pro renvoie vers le compteur departemental reel", () => {
  const faq = getVilleFaq("Draguignan", 0, {
    categorieLabel: "vsl",
    categorieLabelPluriel: "vsl",
    depNom: "Var",
    depTotal: 48,
  });
  const item = faq[0];
  assert.match(item.question, /Draguignan/);
  assert.match(item.answer, /Aucun vsl/);
  assert.match(item.answer, /48 professionnels/);
  assert.match(item.answer, /département Var/);
  assert.match(item.answer, /villes voisines/);
});

test("getVilleFaq : 0 pro sans compteur departemental -> repli generique", () => {
  const faq = getVilleFaq("Draguignan", 0, {
    categorieLabel: "vsl",
    categorieLabelPluriel: "vsl",
    depNom: "Var",
    depTotal: 0,
  });
  const item = faq[0];
  assert.match(item.answer, /Aucun vsl/);
  assert.ok(!/0 professionnels/.test(item.answer));
  assert.match(item.answer, /élargissez votre recherche au département/);
});

test("getVilleFaq : 0 pro sans options -> libelle generique, pas de « 0 »", () => {
  const faq = getVilleFaq("Draguignan", 0);
  assert.ok(!/0 professionnels/.test(faq[0].answer));
  assert.match(faq[0].answer, /professionnel du transport sanitaire/);
});
