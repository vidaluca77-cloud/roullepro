import { test } from "node:test";
import assert from "node:assert/strict";
import {
  construireMessageFacebook,
  extraireVille,
  publierDemandeSurFacebook,
  type DemandeFacebook,
} from "./facebook-publish";

const URL_INSCRIPTION = "https://roullepro.com/transport-medical/inscription";

// --- construireMessageFacebook : format nominal -----------------------------

test("construireMessageFacebook : format complet conforme a l'exemple", () => {
  const msg = construireMessageFacebook({
    typeTransport: "taxi",
    dateSouhaitee: "2026-07-20T09:15:00.000Z", // 11h15 Europe/Paris (ete = +2)
    villeDepart: "Voreppe",
    villeArrivee: "Grenoble",
    departementCible: "38",
  });
  assert.equal(
    msg,
    [
      "Nouvelle demande de course — TAXI CONVENTIONNÉ",
      "Lundi 20 juillet, 11h15 — Voreppe → Grenoble (38)",
      `Vous êtes professionnel conventionné dans ce département ? Créez votre fiche gratuite et recevez ces demandes : ${URL_INSCRIPTION}`,
    ].join("\n")
  );
});

test("construireMessageFacebook : libelles VSL et Ambulance en majuscules", () => {
  const vsl = construireMessageFacebook({
    typeTransport: "vsl",
    dateSouhaitee: "2026-07-20T09:15:00.000Z",
    villeDepart: "Caen",
    departementCible: "14",
  });
  assert.match(vsl, /^Nouvelle demande de course — VSL$/m);

  const amb = construireMessageFacebook({
    typeTransport: "ambulance",
    dateSouhaitee: "2026-07-20T09:15:00.000Z",
    villeDepart: "Caen",
    departementCible: "14",
  });
  assert.match(amb, /^Nouvelle demande de course — AMBULANCE$/m);
});

// --- Anonymisation : aucune fuite de donnee personnelle ---------------------

test("construireMessageFacebook : ne laisse fuiter aucune donnee personnelle", () => {
  const demande = {
    typeTransport: "taxi" as const,
    dateSouhaitee: "2026-07-20T09:15:00.000Z",
    villeDepart: "Voreppe",
    villeArrivee: "Grenoble",
    departementCible: "38",
    // Champs qui NE doivent PAS etre passes au module ; ajoutes ici pour
    // verifier qu'aucune valeur personnelle n'apparait meme par accident.
    lieuDepart: "12 rue des Lilas, 38340 Voreppe, France",
    lieuArrivee: "3 avenue Alsace-Lorraine, 38000 Grenoble, France",
  };
  const msg = construireMessageFacebook(demande);

  // Aucune rue / numero de voie.
  assert.doesNotMatch(msg, /rue des Lilas/i);
  assert.doesNotMatch(msg, /avenue Alsace/i);
  assert.doesNotMatch(msg, /\b12\b/);
  // Un telephone / email / nom hypothetiques ne doivent jamais apparaitre.
  assert.doesNotMatch(msg, /06\d{8}|\+33\d/);
  assert.doesNotMatch(msg, /@/);
  assert.doesNotMatch(msg, /undefined/);
});

test("extraireVille : ne renvoie que la ville, jamais la rue", () => {
  assert.equal(
    extraireVille("12 rue des Lilas, 38340 Voreppe, France"),
    "Voreppe"
  );
  assert.equal(
    extraireVille("3 avenue Alsace-Lorraine, 38000 Grenoble, France"),
    "Grenoble"
  );
  // Sans code postal reconnaissable : on prefere null a une fuite d'adresse.
  assert.equal(extraireVille("12 rue des Lilas"), null);
  assert.equal(extraireVille(""), null);
  assert.equal(extraireVille(null), null);
});

// --- Gestion des champs manquants -------------------------------------------

test("construireMessageFacebook : ville d'arrivee manquante -> depart seul", () => {
  const msg = construireMessageFacebook({
    typeTransport: "vsl",
    dateSouhaitee: "2026-07-20T09:15:00.000Z",
    villeDepart: "Voreppe",
    departementCible: "38",
  });
  assert.match(msg, /Lundi 20 juillet, 11h15 — Voreppe \(38\)/);
  assert.doesNotMatch(msg, /→/);
  assert.doesNotMatch(msg, /undefined/);
});

test("construireMessageFacebook : heure manquante -> trajet seul, pas d'undefined", () => {
  const msg = construireMessageFacebook({
    typeTransport: "taxi",
    dateSouhaitee: null,
    villeDepart: "Voreppe",
    villeArrivee: "Grenoble",
    departementCible: "38",
  });
  const lignes = msg.split("\n");
  assert.equal(lignes[1], "Voreppe → Grenoble (38)");
  assert.doesNotMatch(msg, /undefined/);
});

test("construireMessageFacebook : ville manquante -> repli sur le departement", () => {
  const msg = construireMessageFacebook({
    typeTransport: "taxi",
    dateSouhaitee: "2026-07-20T09:15:00.000Z",
    departementCible: "38",
  });
  assert.match(msg, /Departement 38/);
  assert.doesNotMatch(msg, /undefined/);
});

test("construireMessageFacebook : ville extraite d'une adresse complete si champ ville absent", () => {
  const msg = construireMessageFacebook({
    typeTransport: "taxi",
    dateSouhaitee: "2026-07-20T09:15:00.000Z",
    lieuDepart: "12 rue des Lilas, 38340 Voreppe, France",
    lieuArrivee: "3 avenue Alsace-Lorraine, 38000 Grenoble, France",
    departementCible: "38",
  });
  assert.match(msg, /Voreppe → Grenoble \(38\)/);
  assert.doesNotMatch(msg, /rue|avenue/i);
});

test("construireMessageFacebook : date invalide traitee comme absente", () => {
  const msg = construireMessageFacebook({
    typeTransport: "taxi",
    dateSouhaitee: "pas-une-date",
    villeDepart: "Voreppe",
    departementCible: "38",
  });
  assert.doesNotMatch(msg, /undefined|Invalid|NaN/);
  assert.match(msg, /Voreppe \(38\)/);
});

// --- publierDemandeSurFacebook : no-op si env vars absentes ------------------

const demandeMinimale: DemandeFacebook = {
  typeTransport: "taxi",
  dateSouhaitee: "2026-07-20T09:15:00.000Z",
  villeDepart: "Voreppe",
  villeArrivee: "Grenoble",
  departementCible: "38",
};

test("publierDemandeSurFacebook : ne fait aucun appel reseau sans env vars", async () => {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  delete process.env.FACEBOOK_PAGE_ID;
  delete process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  const fetchOrig = globalThis.fetch;
  let appele = false;
  globalThis.fetch = (async () => {
    appele = true;
    return new Response("{}", { status: 200 });
  }) as typeof fetch;

  try {
    await publierDemandeSurFacebook(demandeMinimale);
    assert.equal(appele, false, "aucun appel fetch ne doit etre fait");
  } finally {
    globalThis.fetch = fetchOrig;
    if (pageId !== undefined) process.env.FACEBOOK_PAGE_ID = pageId;
    if (token !== undefined) process.env.FACEBOOK_PAGE_ACCESS_TOKEN = token;
  }
});

test("publierDemandeSurFacebook : n'echoue jamais si l'API renvoie une erreur", async () => {
  process.env.FACEBOOK_PAGE_ID = "123";
  process.env.FACEBOOK_PAGE_ACCESS_TOKEN = "token-test";

  const fetchOrig = globalThis.fetch;
  const errOrig = console.error;
  globalThis.fetch = (async () =>
    new Response("erreur", { status: 500 })) as typeof fetch;
  console.error = () => {};

  try {
    // Ne doit pas throw malgre le 500.
    await publierDemandeSurFacebook(demandeMinimale);
  } finally {
    globalThis.fetch = fetchOrig;
    console.error = errOrig;
    delete process.env.FACEBOOK_PAGE_ID;
    delete process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  }
});
