import { test } from "node:test";
import assert from "node:assert/strict";
import {
  selectionnerPostsAPublier,
  providersAPublier,
  fusionnerResultats,
  statutGlobal,
  publicationsRestantesMois,
  payloadFacebookFeed,
  payloadInstagramCaption,
  payloadGbpLocalPost,
  type PostAPublier,
  type Connexion,
} from "./studio-social-publish";

function post(partial: Partial<PostAPublier>): PostAPublier {
  return {
    id: "p1",
    pro_id: "pro1",
    contenu: "Bonjour",
    hashtags: ["#ambulance"],
    image_url: null,
    providers_cibles: ["facebook"],
    scheduled_at: "2026-07-24T08:00:00.000Z",
    resultats: null,
    ...partial,
  };
}

function conn(partial: Partial<Connexion>): Connexion {
  return {
    provider: "facebook",
    account_id: "123",
    access_token: "tok",
    refresh_token: null,
    token_expires_at: null,
    statut: "active",
    ...partial,
  };
}

// ─── Sélection ────────────────────────────────────────────────────────────────

test("selectionnerPostsAPublier : ne garde que les échéances passées avec cible", () => {
  const now = new Date("2026-07-24T10:00:00.000Z");
  const futur = post({ id: "futur", scheduled_at: "2026-07-24T12:00:00.000Z" });
  const passe = post({ id: "passe", scheduled_at: "2026-07-24T09:00:00.000Z" });
  const sansDate = post({ id: "sansdate", scheduled_at: null });
  const sansCible = post({ id: "sanscible", providers_cibles: [] });
  const res = selectionnerPostsAPublier([futur, passe, sansDate, sansCible], now, 10);
  assert.deepEqual(res.map((p) => p.id), ["passe"]);
});

test("selectionnerPostsAPublier : trie par échéance croissante et borne au quota", () => {
  const now = new Date("2026-07-24T10:00:00.000Z");
  const a = post({ id: "a", scheduled_at: "2026-07-24T09:30:00.000Z" });
  const b = post({ id: "b", scheduled_at: "2026-07-24T08:00:00.000Z" });
  const c = post({ id: "c", scheduled_at: "2026-07-24T09:00:00.000Z" });
  const res = selectionnerPostsAPublier([a, b, c], now, 2);
  assert.deepEqual(res.map((p) => p.id), ["b", "c"]);
});

test("selectionnerPostsAPublier : quota 0 => vide", () => {
  const now = new Date("2026-07-24T10:00:00.000Z");
  assert.deepEqual(selectionnerPostsAPublier([post({})], now, 0), []);
});

// ─── Providers à publier (idempotence + connexion active) ───────────────────────

test("providersAPublier : cibles connectées non déjà publiées", () => {
  const p = post({ providers_cibles: ["facebook", "instagram", "google_business"] });
  const map = new Map<string, Connexion>([
    ["facebook", conn({ provider: "facebook" })],
    ["instagram", conn({ provider: "instagram", statut: "revoked" })],
    ["google_business", conn({ provider: "google_business" })],
  ]);
  assert.deepEqual(providersAPublier(p, map), ["facebook", "google_business"]);
});

test("providersAPublier : idempotence — ignore une cible déjà publiée", () => {
  const p = post({
    providers_cibles: ["facebook", "google_business"],
    resultats: { facebook: { external_id: "fb_1" } },
  });
  const map = new Map<string, Connexion>([
    ["facebook", conn({ provider: "facebook" })],
    ["google_business", conn({ provider: "google_business" })],
  ]);
  assert.deepEqual(providersAPublier(p, map), ["google_business"]);
});

test("providersAPublier : connexion sans token exclue", () => {
  const p = post({ providers_cibles: ["facebook"] });
  const map = new Map<string, Connexion>([
    ["facebook", conn({ access_token: null })],
  ]);
  assert.deepEqual(providersAPublier(p, map), []);
});

// ─── Fusion des résultats ──────────────────────────────────────────────────────

test("fusionnerResultats : conserve l'existant et ajoute le nouveau", () => {
  const res = fusionnerResultats(
    { facebook: { external_id: "fb" } },
    { instagram: { erreur: "ko" } }
  );
  assert.deepEqual(res, {
    facebook: { external_id: "fb" },
    instagram: { erreur: "ko" },
  });
});

test("fusionnerResultats : le nouveau écrase l'ancien pour un même provider", () => {
  const res = fusionnerResultats(
    { facebook: { erreur: "ko" } },
    { facebook: { external_id: "fb_2" } }
  );
  assert.deepEqual(res, { facebook: { external_id: "fb_2" } });
});

// ─── Statut global ─────────────────────────────────────────────────────────────

test("statutGlobal : publie si toutes les cibles ont un external_id", () => {
  const p = post({ providers_cibles: ["facebook", "instagram"] });
  const r = { facebook: { external_id: "a" }, instagram: { external_id: "b" } };
  assert.equal(statutGlobal(p, r), "publie");
});

test("statutGlobal : echec si au moins une cible en erreur", () => {
  const p = post({ providers_cibles: ["facebook", "instagram"] });
  const r = { facebook: { external_id: "a" }, instagram: { erreur: "ko" } };
  assert.equal(statutGlobal(p, r), "echec");
});

test("statutGlobal : planifie si aucune cible tentée", () => {
  const p = post({ providers_cibles: ["facebook"] });
  assert.equal(statutGlobal(p, {}), "planifie");
});

test("statutGlobal : planifie si aucune cible valide", () => {
  const p = post({ providers_cibles: [] });
  assert.equal(statutGlobal(p, {}), "planifie");
});

// ─── Quota ──────────────────────────────────────────────────────────────────────

test("publicationsRestantesMois : borné à 0", () => {
  assert.equal(publicationsRestantesMois(0), 8);
  assert.equal(publicationsRestantesMois(8), 0);
  assert.equal(publicationsRestantesMois(20), 0);
});

// ─── Payloads ────────────────────────────────────────────────────────────────────

test("payloadFacebookFeed : message = contenu + hashtags", () => {
  const p = post({ contenu: "Texte", hashtags: ["#a", "#b"] });
  assert.equal(payloadFacebookFeed(p).message, "Texte\n\n#a #b");
});

test("payloadInstagramCaption : caption avec hashtags", () => {
  const p = post({ contenu: "Insta", hashtags: ["#x"] });
  assert.equal(payloadInstagramCaption(p), "Insta\n\n#x");
});

test("payloadGbpLocalPost : summary sans hashtags + CTA CALL", () => {
  const p = post({ contenu: "GBP factuel", hashtags: ["#nope"] });
  const body = payloadGbpLocalPost(p) as {
    languageCode: string;
    summary: string;
    callToAction: { actionType: string };
    topicType: string;
  };
  assert.equal(body.languageCode, "fr");
  assert.equal(body.summary, "GBP factuel");
  assert.equal(body.callToAction.actionType, "CALL");
  assert.equal(body.topicType, "STANDARD");
});

test("payloadGbpLocalPost : summary tronqué à 1500 caractères", () => {
  const p = post({ contenu: "a".repeat(2000), hashtags: [] });
  const body = payloadGbpLocalPost(p) as { summary: string };
  assert.equal(body.summary.length, 1500);
});
