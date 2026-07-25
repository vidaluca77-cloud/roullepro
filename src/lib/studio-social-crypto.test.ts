import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "crypto";
import {
  decoderCle,
  tokenKeyConfigured,
  chiffrerToken,
  dechiffrerToken,
} from "./studio-social-crypto";

const CLE_HEX = "a".repeat(64);

function avecCle<T>(valeur: string | undefined, fn: () => T): T {
  const avant = process.env.STUDIO_SOCIAL_TOKEN_KEY;
  if (valeur === undefined) delete process.env.STUDIO_SOCIAL_TOKEN_KEY;
  else process.env.STUDIO_SOCIAL_TOKEN_KEY = valeur;
  try {
    return fn();
  } finally {
    if (avant === undefined) delete process.env.STUDIO_SOCIAL_TOKEN_KEY;
    else process.env.STUDIO_SOCIAL_TOKEN_KEY = avant;
  }
}

test("decoderCle accepte 64 caractères hex ou 32 octets en base64", () => {
  assert.equal(decoderCle(CLE_HEX)?.length, 32);
  assert.equal(decoderCle(randomBytes(32).toString("base64"))?.length, 32);
});

test("decoderCle refuse une clé absente ou de mauvaise longueur", () => {
  assert.equal(decoderCle(undefined), null);
  assert.equal(decoderCle(""), null);
  assert.equal(decoderCle("trop-court"), null);
  assert.equal(decoderCle(randomBytes(16).toString("base64")), null);
});

test("tokenKeyConfigured reflète la présence d'une clé valide", () => {
  assert.equal(avecCle(CLE_HEX, tokenKeyConfigured), true);
  assert.equal(avecCle(undefined, tokenKeyConfigured), false);
  assert.equal(avecCle("invalide", tokenKeyConfigured), false);
});

test("chiffrerToken / dechiffrerToken : aller-retour fidèle", () => {
  avecCle(CLE_HEX, () => {
    const clair = "EAAG-token-de-page-très-secret";
    const stocke = chiffrerToken(clair)!;
    assert.ok(stocke.startsWith("v1."));
    assert.equal(stocke.includes(clair), false);
    assert.equal(dechiffrerToken(stocke), clair);
  });
});

test("chiffrerToken : IV aléatoire => deux chiffrés différents pour le même clair", () => {
  avecCle(CLE_HEX, () => {
    assert.notEqual(chiffrerToken("tok"), chiffrerToken("tok"));
  });
});

test("chiffrerToken : entrée vide => null (colonne laissée à NULL)", () => {
  avecCle(CLE_HEX, () => {
    assert.equal(chiffrerToken(null), null);
    assert.equal(chiffrerToken(""), null);
  });
});

test("chiffrerToken : sans clé, échoue bruyamment plutôt que stocker en clair", () => {
  avecCle(undefined, () => {
    assert.throws(() => chiffrerToken("tok"), /STUDIO_SOCIAL_TOKEN_KEY/);
  });
});

test("dechiffrerToken : renvoie null sur donnée absente, malformée ou altérée", () => {
  avecCle(CLE_HEX, () => {
    assert.equal(dechiffrerToken(null), null);
    assert.equal(dechiffrerToken("pas-un-token"), null);
    assert.equal(dechiffrerToken("v2.a.b.c"), null);
    const stocke = chiffrerToken("tok")!;
    const parts = stocke.split(".");
    // Ciphertext altéré : le tag GCM doit faire échouer l'authentification.
    parts[3] = Buffer.from("autre-chose").toString("base64");
    assert.equal(dechiffrerToken(parts.join(".")), null);
  });
});

test("dechiffrerToken : clé différente => null (pas de token en clair récupérable)", () => {
  const stocke = avecCle(CLE_HEX, () => chiffrerToken("tok")!);
  assert.equal(avecCle("b".repeat(64), () => dechiffrerToken(stocke)), null);
});
