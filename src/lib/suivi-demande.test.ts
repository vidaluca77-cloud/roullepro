import { test } from "node:test";
import assert from "node:assert/strict";
import { construireStatutSuivi } from "./suivi-demande";

// --- Annulee : priorite maximale -------------------------------------------

test("statut annulee => affichage annulee, non annulable", () => {
  const r = construireStatutSuivi({
    statut: "annulee",
    prosNotifies: 5,
    nbVues: 3,
    accepteur: { nom: "Ambulances Dupont", telephone: "0102030405" },
  });
  assert.equal(r.statut, "annulee");
  assert.equal(r.peutAnnuler, false);
  assert.equal(r.accepteur, null);
});

// --- Acceptee : identite du pro accepteur exposee --------------------------

test("statut acceptee avec accepteur => titre et telephone visibles", () => {
  const r = construireStatutSuivi({
    statut: "acceptee",
    prosNotifies: 4,
    nbVues: 2,
    accepteur: { nom: "Taxi Martin", telephone: "0611223344" },
  });
  assert.equal(r.statut, "acceptee");
  assert.match(r.titre, /Taxi Martin/);
  assert.match(r.description, /0611223344/);
  assert.deepEqual(r.accepteur, { nom: "Taxi Martin", telephone: "0611223344" });
  assert.equal(r.peutAnnuler, true);
});

test("accepteur present sans statut acceptee => quand meme acceptee", () => {
  const r = construireStatutSuivi({
    statut: "envoyee",
    prosNotifies: 4,
    nbVues: 0,
    accepteur: { nom: "VSL Lyon", telephone: null },
  });
  assert.equal(r.statut, "acceptee");
  assert.match(r.titre, /VSL Lyon/);
  assert.equal(r.accepteur?.telephone, null);
});

test("acceptee sans nom => libelle generique", () => {
  const r = construireStatutSuivi({
    statut: "acceptee",
    prosNotifies: 1,
    nbVues: 1,
    accepteur: { nom: "  ", telephone: "0102030405" },
  });
  assert.match(r.titre, /Un professionnel/);
});

// --- Vue : au moins un pro a consulte --------------------------------------

test("des vues sans acceptation => statut vue", () => {
  const r = construireStatutSuivi({
    statut: "envoyee",
    prosNotifies: 6,
    nbVues: 2,
    accepteur: null,
  });
  assert.equal(r.statut, "vue");
  assert.match(r.titre, /2 professionnels/);
  assert.match(r.description, /6 professionnels/);
  assert.equal(r.peutAnnuler, true);
});

test("une seule vue => singulier", () => {
  const r = construireStatutSuivi({
    statut: "envoyee",
    prosNotifies: 1,
    nbVues: 1,
    accepteur: null,
  });
  assert.match(r.titre, /1 professionnel\b/);
});

// --- Envoyee : notifiee mais pas encore vue --------------------------------

test("notifiee sans vue => statut envoyee", () => {
  const r = construireStatutSuivi({
    statut: "envoyee",
    prosNotifies: 3,
    nbVues: 0,
    accepteur: null,
  });
  assert.equal(r.statut, "envoyee");
  assert.match(r.titre, /3 professionnels/);
  assert.equal(r.peutAnnuler, true);
});

// --- En recherche : aucun pro notifie --------------------------------------

test("aucun pro notifie => en_recherche", () => {
  const r = construireStatutSuivi({
    statut: "envoyee",
    prosNotifies: 0,
    nbVues: 0,
    accepteur: null,
  });
  assert.equal(r.statut, "en_recherche");
  assert.equal(r.peutAnnuler, true);
});

test("valeurs nulles => en_recherche sans planter", () => {
  const r = construireStatutSuivi({
    statut: null,
    prosNotifies: null,
    nbVues: null,
    accepteur: null,
  });
  assert.equal(r.statut, "en_recherche");
});

test("compteurs negatifs => normalises a zero", () => {
  const r = construireStatutSuivi({
    statut: "envoyee",
    prosNotifies: -5,
    nbVues: -2,
    accepteur: null,
  });
  assert.equal(r.statut, "en_recherche");
});
