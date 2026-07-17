import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normaliserTelephoneFr,
  retirerAccents,
  construireMessageSmsCourse,
  envoyerSmsTransactionnel,
  telephoneSmsParDefaut,
} from "./sms";

// --- normaliserTelephoneFr -------------------------------------------------

test("normaliserTelephoneFr : 06/07 nationaux -> E.164", () => {
  assert.equal(normaliserTelephoneFr("0612345678"), "+33612345678");
  assert.equal(normaliserTelephoneFr("0712345678"), "+33712345678");
});

test("normaliserTelephoneFr : espaces, points, tirets tolerables", () => {
  assert.equal(normaliserTelephoneFr("06 12 34 56 78"), "+33612345678");
  assert.equal(normaliserTelephoneFr("06.12.34.56.78"), "+33612345678");
  assert.equal(normaliserTelephoneFr("06-12-34-56-78"), "+33612345678");
});

test("normaliserTelephoneFr : formats +33 et 0033", () => {
  assert.equal(normaliserTelephoneFr("+33612345678"), "+33612345678");
  assert.equal(normaliserTelephoneFr("+33 6 12 34 56 78"), "+33612345678");
  assert.equal(normaliserTelephoneFr("0033612345678"), "+33612345678");
  // +33 avec un 0 en trop
  assert.equal(normaliserTelephoneFr("+330612345678"), "+33612345678");
});

test("normaliserTelephoneFr : mobiles DROM nationaux (0690/0694)", () => {
  assert.equal(normaliserTelephoneFr("0690123456"), "+33690123456");
  assert.equal(normaliserTelephoneFr("0694123456"), "+33694123456");
});

test("normaliserTelephoneFr : DROM deja en E.164 laisses tels quels", () => {
  assert.equal(normaliserTelephoneFr("+590690123456"), "+590690123456");
  assert.equal(normaliserTelephoneFr("+262692123456"), "+262692123456");
});

test("normaliserTelephoneFr : numeros invalides -> null", () => {
  assert.equal(normaliserTelephoneFr(""), null);
  assert.equal(normaliserTelephoneFr("0123456789"), null); // fixe
  assert.equal(normaliserTelephoneFr("0512345678"), null); // fixe
  assert.equal(normaliserTelephoneFr("061234567"), null); // trop court
  assert.equal(normaliserTelephoneFr("06123456789"), null); // trop long
  assert.equal(normaliserTelephoneFr("abcdefghij"), null);
  assert.equal(normaliserTelephoneFr("+33512345678"), null); // +33 fixe
});

// --- telephoneSmsParDefaut -------------------------------------------------

test("telephoneSmsParDefaut : conserve un numero SMS deja renseigne (undefined)", () => {
  // undefined = ne pas inclure le champ dans l'update, on ne touche pas au choix du pro.
  assert.equal(
    telephoneSmsParDefaut({
      telephoneSmsActuel: "+33612345678",
      phoneE164: "+33699999999",
      telephonePublic: "0788888888",
    }),
    undefined
  );
});

test("telephoneSmsParDefaut : pre-remplit depuis phone_e164 en priorite", () => {
  assert.equal(
    telephoneSmsParDefaut({
      telephoneSmsActuel: null,
      phoneE164: "+33612345678",
      telephonePublic: "0788888888",
    }),
    "+33612345678"
  );
});

test("telephoneSmsParDefaut : fallback sur telephone_public (mobile)", () => {
  assert.equal(
    telephoneSmsParDefaut({
      telephoneSmsActuel: "",
      phoneE164: null,
      telephonePublic: "06 12 34 56 78",
    }),
    "+33612345678"
  );
});

test("telephoneSmsParDefaut : null si aucun mobile FR exploitable (fixe)", () => {
  assert.equal(
    telephoneSmsParDefaut({
      telephoneSmsActuel: null,
      phoneE164: null,
      telephonePublic: "0231234567", // fixe -> non exploitable
    }),
    null
  );
});

test("telephoneSmsParDefaut : null si aucune source", () => {
  assert.equal(telephoneSmsParDefaut({}), null);
});

// --- retirerAccents --------------------------------------------------------

test("retirerAccents : supprime tous les accents", () => {
  assert.equal(retirerAccents("dépôt à Caen été"), "depot a Caen ete");
  assert.equal(retirerAccents("Île-de-France"), "Ile-de-France");
});

// --- construireMessageSmsCourse -------------------------------------------

test("construireMessageSmsCourse : format factuel attendu, sans accents", () => {
  const msg = construireMessageSmsCourse({
    typeTransport: "vsl",
    dateSouhaitee: "2026-07-21T08:00:00.000Z", // 10h00 Europe/Paris (heure d'ete)
    villeDepart: "Caen",
    departement: "14",
    url: "roullepro.com/pro/demandes",
  });
  assert.equal(
    msg,
    "RoullePro: nouvelle course VSL le 21/07 a 10h00, depart Caen (14). Voir et accepter: roullepro.com/pro/demandes"
  );
});

test("construireMessageSmsCourse : <= 160 caracteres (1 credit GSM-7)", () => {
  const msg = construireMessageSmsCourse({
    typeTransport: "ambulance",
    dateSouhaitee: "2026-07-21T08:00:00.000Z",
    villeDepart: "Saint-Germain-en-Laye",
    departement: "78",
    url: "roullepro.com/pro/demandes",
  });
  assert.ok(msg.length <= 160, `longueur ${msg.length}`);
});

test("construireMessageSmsCourse : type en majuscules + heure Europe/Paris", () => {
  const msg = construireMessageSmsCourse({
    typeTransport: "taxi",
    dateSouhaitee: "2026-07-21T08:00:00.000Z",
    villeDepart: "Lyon",
    departement: "69",
  });
  assert.ok(msg.includes("TAXI"));
  assert.ok(msg.includes("a 10h00"));
});

test("construireMessageSmsCourse : ville avec accents nettoyee", () => {
  const msg = construireMessageSmsCourse({
    typeTransport: "vsl",
    dateSouhaitee: "2026-07-21T08:00:00.000Z",
    villeDepart: "Bézier",
    departement: "34",
  });
  assert.ok(msg.includes("depart Bezier (34)"));
  // Aucun caractere accentue ne doit subsister.
  assert.equal(msg, retirerAccents(msg));
});

// --- envoyerSmsTransactionnel (no-op sans cle) ----------------------------

test("envoyerSmsTransactionnel : no-op silencieux sans BREVO_API_KEY", async () => {
  const prev = process.env.BREVO_API_KEY;
  delete process.env.BREVO_API_KEY;
  try {
    const res = await envoyerSmsTransactionnel({
      to: "0612345678",
      content: "test",
    });
    assert.equal(res.ok, false);
    assert.equal(res.erreur, "BREVO_API_KEY manquant");
  } finally {
    if (prev !== undefined) process.env.BREVO_API_KEY = prev;
  }
});
