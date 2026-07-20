import { test } from "node:test";
import assert from "node:assert/strict";
import { analyserLienRecuperation } from "./reset-password";

// --- Flux PKCE nominal : un code a echanger --------------------------------

test("code PKCE en query => code extrait, pas d'erreur", () => {
  const r = analyserLienRecuperation("?code=abc123", "");
  assert.equal(r.code, "abc123");
  assert.equal(r.erreur, false);
  assert.equal(r.messageErreur, null);
});

test("code avec next additionnel => seul le code est retenu", () => {
  const r = analyserLienRecuperation("?code=xyz&next=/dashboard", "");
  assert.equal(r.code, "xyz");
  assert.equal(r.erreur, false);
});

// --- URL sans parametre : ni code ni erreur --------------------------------

test("aucun parametre => pas de code, pas d'erreur", () => {
  const r = analyserLienRecuperation("", "");
  assert.equal(r.code, null);
  assert.equal(r.erreur, false);
  assert.equal(r.messageErreur, null);
});

// --- Lien expire : erreur dans le hash (cas Supabase courant) --------------

test("erreur otp_expired dans le hash => message lien expire", () => {
  const hash =
    "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired";
  const r = analyserLienRecuperation("", hash);
  assert.equal(r.code, null);
  assert.equal(r.erreur, true);
  assert.match(r.messageErreur ?? "", /expiré/);
});

// --- Lien expire : erreur en query (flux PKCE) -----------------------------

test("erreur expired en query => message lien expire", () => {
  const r = analyserLienRecuperation(
    "?error=access_denied&error_description=Email%20link%20is%20invalid%20or%20has%20expired",
    ""
  );
  assert.equal(r.erreur, true);
  assert.match(r.messageErreur ?? "", /expiré/);
});

// --- Erreur generique (autre que expiration) -------------------------------

test("erreur generique => message invalide", () => {
  const r = analyserLienRecuperation("?error=server_error", "");
  assert.equal(r.erreur, true);
  assert.match(r.messageErreur ?? "", /invalide/);
});
