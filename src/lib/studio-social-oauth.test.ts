import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  metaActive,
  gbpActive,
  providerActive,
  construireUrlAuthMeta,
  construireUrlAuthGoogle,
  expiresAtDepuisExpiresIn,
  tokenARafraichir,
  construireEtatConnexions,
  META_SCOPES,
  GOOGLE_SCOPES,
} from "./studio-social-oauth";

function reset() {
  delete process.env.STUDIO_SOCIAL_META_ENABLED;
  delete process.env.STUDIO_SOCIAL_GBP_ENABLED;
  delete process.env.META_APP_ID;
  delete process.env.META_APP_SECRET;
  delete process.env.GOOGLE_OAUTH_CLIENT_ID;
  delete process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  process.env.NEXT_PUBLIC_APP_URL = "https://www.roullepro.com";
}

beforeEach(reset);

// ─── Feature flags ─────────────────────────────────────────────────────────

test("flags off par défaut", () => {
  assert.equal(metaActive(), false);
  assert.equal(gbpActive(), false);
});

test("flags acceptent 1/true/on", () => {
  process.env.STUDIO_SOCIAL_META_ENABLED = "true";
  assert.equal(metaActive(), true);
  process.env.STUDIO_SOCIAL_GBP_ENABLED = "1";
  assert.equal(gbpActive(), true);
});

test("providerActive exige le flag ET la config d'app", () => {
  process.env.STUDIO_SOCIAL_META_ENABLED = "true";
  assert.equal(providerActive("facebook"), false); // pas d'app id/secret
  process.env.META_APP_ID = "x";
  process.env.META_APP_SECRET = "y";
  assert.equal(providerActive("facebook"), true);
  assert.equal(providerActive("instagram"), true);
  assert.equal(providerActive("google_business"), false);
});

// ─── Scopes ──────────────────────────────────────────────────────────────────

test("META_SCOPES : périmètre minimal, sans business_management", () => {
  assert.deepEqual(META_SCOPES, [
    "pages_show_list",
    "pages_manage_posts",
    "pages_read_engagement",
    "instagram_basic",
    "instagram_content_publish",
  ]);
  // Permission élargie retirée pour l'App Review : /me/accounts suffit.
  assert.equal(META_SCOPES.includes("business_management"), false);
});

test("l'URL d'autorisation Meta ne demande pas business_management", () => {
  process.env.META_APP_ID = "appid123";
  const url = new URL(construireUrlAuthMeta("nonce.pro1"));
  assert.equal(url.searchParams.get("scope")!.includes("business_management"), false);
});

// ─── URLs OAuth ──────────────────────────────────────────────────────────────

test("URL Meta contient scopes, redirect et response_type", () => {
  process.env.META_APP_ID = "appid123";
  const url = new URL(construireUrlAuthMeta("nonce.pro1"));
  assert.equal(url.hostname, "www.facebook.com");
  assert.equal(url.searchParams.get("client_id"), "appid123");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("state"), "nonce.pro1");
  assert.equal(url.searchParams.get("scope"), META_SCOPES.join(","));
  assert.equal(
    url.searchParams.get("redirect_uri"),
    "https://www.roullepro.com/api/studio-social/connect/meta/callback"
  );
});

test("URL Google demande offline + consent", () => {
  process.env.GOOGLE_OAUTH_CLIENT_ID = "gid";
  const url = new URL(construireUrlAuthGoogle("nonce.pro1"));
  assert.equal(url.hostname, "accounts.google.com");
  assert.equal(url.searchParams.get("access_type"), "offline");
  assert.equal(url.searchParams.get("prompt"), "consent");
  assert.equal(url.searchParams.get("scope"), GOOGLE_SCOPES.join(" "));
});

// ─── Expiration ──────────────────────────────────────────────────────────────

test("expiresAtDepuisExpiresIn", () => {
  const now = Date.parse("2026-07-24T10:00:00Z");
  assert.equal(expiresAtDepuisExpiresIn(3600, now), "2026-07-24T11:00:00.000Z");
  assert.equal(expiresAtDepuisExpiresIn(null, now), null);
  assert.equal(expiresAtDepuisExpiresIn(0, now), null);
});

test("tokenARafraichir : vrai si expiration proche", () => {
  const now = Date.now();
  const dansUneMinute = new Date(now + 60_000).toISOString();
  const dansUneHeure = new Date(now + 3_600_000).toISOString();
  assert.equal(tokenARafraichir(dansUneMinute, now), true);
  assert.equal(tokenARafraichir(dansUneHeure, now), false);
  assert.equal(tokenARafraichir(null, now), false);
});

// ─── État public des connexions ──────────────────────────────────────────────

test("construireEtatConnexions couvre les 3 providers sans exposer de token", () => {
  process.env.STUDIO_SOCIAL_META_ENABLED = "true";
  process.env.META_APP_ID = "x";
  process.env.META_APP_SECRET = "y";
  const etat = construireEtatConnexions([
    { provider: "facebook", account_name: "Ma Page", statut: "active" },
    { provider: "instagram", account_name: null, statut: "revoked" },
  ]);
  assert.equal(etat.length, 3);
  const fb = etat.find((e) => e.provider === "facebook")!;
  assert.equal(fb.connecte, true);
  assert.equal(fb.disponible, true);
  assert.equal(fb.account_name, "Ma Page");
  const ig = etat.find((e) => e.provider === "instagram")!;
  assert.equal(ig.connecte, false); // statut revoked
  const gbp = etat.find((e) => e.provider === "google_business")!;
  assert.equal(gbp.connecte, false);
  assert.equal(gbp.disponible, false); // flag GBP off
  // Aucune clé "access_token" dans la sortie publique.
  assert.equal(Object.keys(fb).includes("access_token"), false);
});
