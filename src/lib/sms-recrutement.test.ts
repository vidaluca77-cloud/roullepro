import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PLAFOND_SMS_RECRUTEMENT,
  communeSlugRecrutement,
  construireMessageSmsRecrutement,
  dansFenetreEnvoiParis,
  normaliserMobileRecrutement,
  selectionnerCiblesRecrutement,
} from "./sms-recrutement";

// --- communeSlugRecrutement ------------------------------------------------

test("communeSlugRecrutement : slug commune avec traits d'union", () => {
  assert.equal(
    communeSlugRecrutement("Saint-Maurice-de-Gourdans"),
    "saint-maurice-de-gourdans"
  );
});

test("communeSlugRecrutement : accents, espaces et apostrophes normalises", () => {
  assert.equal(communeSlugRecrutement("L'Isle-Adam"), "l-isle-adam");
  assert.equal(communeSlugRecrutement("Thury Harcourt le Hom"), "thury-harcourt-le-hom");
  assert.equal(communeSlugRecrutement("Béziers"), "beziers");
});

test("communeSlugRecrutement : vide ou nul -> null", () => {
  assert.equal(communeSlugRecrutement(""), null);
  assert.equal(communeSlugRecrutement(null), null);
  assert.equal(communeSlugRecrutement("   "), null);
});

// --- normaliserMobileRecrutement (mobiles FR metropole uniquement) ---------

test("normaliserMobileRecrutement : 06/07 nationaux -> +336/+337", () => {
  assert.equal(normaliserMobileRecrutement("0612345678"), "+33612345678");
  assert.equal(normaliserMobileRecrutement("0712345678"), "+33712345678");
});

test("normaliserMobileRecrutement : formats avec espaces/points/tirets", () => {
  assert.equal(normaliserMobileRecrutement("06 12 34 56 78"), "+33612345678");
  assert.equal(normaliserMobileRecrutement("06.12.34.56.78"), "+33612345678");
  assert.equal(normaliserMobileRecrutement("07-12-34-56-78"), "+33712345678");
});

test("normaliserMobileRecrutement : +33 / 0033 / +33 avec 0 en trop", () => {
  assert.equal(normaliserMobileRecrutement("+33612345678"), "+33612345678");
  assert.equal(normaliserMobileRecrutement("+33 6 12 34 56 78"), "+33612345678");
  assert.equal(normaliserMobileRecrutement("0033612345678"), "+33612345678");
  assert.equal(normaliserMobileRecrutement("+330612345678"), "+33612345678");
});

test("normaliserMobileRecrutement : numeros fixes rejetes (non mobile)", () => {
  assert.equal(normaliserMobileRecrutement("0145678910"), null); // 01 fixe
  assert.equal(normaliserMobileRecrutement("0498765432"), null); // 04 fixe
  assert.equal(normaliserMobileRecrutement("0987654321"), null); // 09 VoIP
});

test("normaliserMobileRecrutement : DROM E.164 (+590…) rejetes (hors 06/07)", () => {
  assert.equal(normaliserMobileRecrutement("+590690123456"), null);
  assert.equal(normaliserMobileRecrutement("+262692123456"), null);
});

test("normaliserMobileRecrutement : vide/invalide -> null", () => {
  assert.equal(normaliserMobileRecrutement(""), null);
  assert.equal(normaliserMobileRecrutement(null), null);
  assert.equal(normaliserMobileRecrutement("pas un numero"), null);
  assert.equal(normaliserMobileRecrutement("061234"), null); // trop court
});

// --- dansFenetreEnvoiParis -------------------------------------------------

test("dansFenetreEnvoiParis : 14h30 Paris (ete) -> vrai", () => {
  // 12:30 UTC = 14:30 Europe/Paris (CEST).
  assert.equal(dansFenetreEnvoiParis(new Date("2026-07-20T12:30:00Z")), true);
});

test("dansFenetreEnvoiParis : 7h Paris -> faux (avant 8h)", () => {
  // 05:00 UTC = 07:00 Europe/Paris (CEST).
  assert.equal(dansFenetreEnvoiParis(new Date("2026-07-20T05:00:00Z")), false);
});

test("dansFenetreEnvoiParis : 8h pile Paris -> vrai (borne incluse)", () => {
  // 06:00 UTC = 08:00 Europe/Paris (CEST).
  assert.equal(dansFenetreEnvoiParis(new Date("2026-07-20T06:00:00Z")), true);
});

test("dansFenetreEnvoiParis : 20h pile Paris -> faux (borne exclue)", () => {
  // 18:00 UTC = 20:00 Europe/Paris (CEST).
  assert.equal(dansFenetreEnvoiParis(new Date("2026-07-20T18:00:00Z")), false);
});

test("dansFenetreEnvoiParis : 23h Paris -> faux", () => {
  // 21:00 UTC = 23:00 Europe/Paris (CEST).
  assert.equal(dansFenetreEnvoiParis(new Date("2026-07-20T21:00:00Z")), false);
});

test("dansFenetreEnvoiParis : hiver, 9h Paris -> vrai", () => {
  // 08:00 UTC = 09:00 Europe/Paris (CET).
  assert.equal(dansFenetreEnvoiParis(new Date("2026-01-15T08:00:00Z")), true);
});

// --- construireMessageSmsRecrutement ---------------------------------------

test("construireMessageSmsRecrutement : format attendu, sans accent", () => {
  const msg = construireMessageSmsRecrutement({
    typeTransport: "taxi",
    dateSouhaitee: "2026-07-20T12:30:00Z", // 14h30 Paris
    villeDepart: "Saint-Maurice-de-Gourdans",
    url: "https://roullepro.com/transport-medical/pro/reclamer?pro=abc",
  });
  assert.equal(
    msg,
    "RoullePro: un patient cherche un taxi conventionne a Saint-Maurice-de-Gourdans le 20/07 a 14h30. Activez votre fiche gratuite pour voir et accepter la demande: https://roullepro.com/transport-medical/pro/reclamer?pro=abc"
  );
});

test("construireMessageSmsRecrutement : libelles VSL et ambulance", () => {
  const vsl = construireMessageSmsRecrutement({
    typeTransport: "vsl",
    dateSouhaitee: "2026-07-20T12:30:00Z",
    villeDepart: "Caen",
    url: "u",
  });
  assert.match(vsl, /cherche un VSL a Caen/);
  const amb = construireMessageSmsRecrutement({
    typeTransport: "ambulance",
    dateSouhaitee: "2026-07-20T12:30:00Z",
    villeDepart: "Caen",
    url: "u",
  });
  assert.match(amb, /cherche un ambulance a Caen/);
});

test("construireMessageSmsRecrutement : aucune coordonnee patient", () => {
  const msg = construireMessageSmsRecrutement({
    typeTransport: "taxi",
    dateSouhaitee: "2026-07-20T12:30:00Z",
    villeDepart: "Lyon",
    url: "u",
  });
  assert.ok(!/\+?\d{9,}/.test(msg.replace("u", "")), "pas de numero patient");
});

// --- selectionnerCiblesRecrutement -----------------------------------------

test("selectionnerCiblesRecrutement : garde les mobiles, ecarte fixes/vides", () => {
  const cibles = selectionnerCiblesRecrutement({
    pros: [
      { id: "a", telephone_public: "0612345678" },
      { id: "b", telephone_public: "0145678910" }, // fixe -> exclu
      { id: "c", telephone_public: null }, // vide -> exclu
      { id: "d", telephone_public: "07 22 33 44 55" },
    ],
  });
  assert.deepEqual(cibles, [
    { proId: "a", numero: "+33612345678" },
    { proId: "d", numero: "+33722334455" },
  ]);
});

test("selectionnerCiblesRecrutement : deduplication des numeros partages", () => {
  const cibles = selectionnerCiblesRecrutement({
    pros: [
      { id: "a", telephone_public: "0612345678" },
      { id: "b", telephone_public: "06.12.34.56.78" }, // meme numero
    ],
  });
  assert.equal(cibles.length, 1);
  assert.equal(cibles[0].proId, "a");
});

test("selectionnerCiblesRecrutement : exclusion des numeros en opt-out", () => {
  const cibles = selectionnerCiblesRecrutement({
    pros: [
      { id: "a", telephone_public: "0612345678" },
      { id: "b", telephone_public: "0722334455" },
    ],
    optout: new Set(["+33612345678"]),
  });
  assert.deepEqual(cibles, [{ proId: "b", numero: "+33722334455" }]);
});

test("selectionnerCiblesRecrutement : plafond respecte", () => {
  const pros = Array.from({ length: 20 }, (_, i) => ({
    id: `p${i}`,
    telephone_public: `06${String(10000000 + i)}`,
  }));
  const cibles = selectionnerCiblesRecrutement({ pros, plafond: 8 });
  assert.equal(cibles.length, 8);
});

test("selectionnerCiblesRecrutement : plafond par defaut = PLAFOND_SMS_RECRUTEMENT", () => {
  const pros = Array.from({ length: 20 }, (_, i) => ({
    id: `p${i}`,
    telephone_public: `06${String(10000000 + i)}`,
  }));
  const cibles = selectionnerCiblesRecrutement({ pros });
  assert.equal(cibles.length, PLAFOND_SMS_RECRUTEMENT);
});

test("selectionnerCiblesRecrutement : liste vide -> aucune cible", () => {
  assert.deepEqual(selectionnerCiblesRecrutement({ pros: [] }), []);
});
