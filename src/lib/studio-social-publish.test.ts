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
  reclamerPost,
  repartirEquitablement,
  resultatPersistable,
  erreurHttp,
  erreurReseau,
  tokenRejete,
  estLocationGbp,
  publierGbp,
  attendreConteneurPret,
  type PostAPublier,
  type Connexion,
  type ClientClaim,
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

// ─── Claim atomique ───────────────────────────────────────────────────────────

/** Table en mémoire : l'update ne rend une ligne que si le statut correspond. */
function clientClaim(statutInitial: string) {
  const etat = { statut: statutInitial, updates: 0 };
  const client: ClientClaim = {
    from: () => ({
      update: (valeurs: Record<string, unknown>) => ({
        eq: () => ({
          eq: (_col: string, attendu: unknown) => ({
            select: async () => {
              if (etat.statut !== attendu) return { data: [] };
              etat.statut = String(valeurs.statut);
              etat.updates += 1;
              return { data: [{ id: "p1" }] };
            },
          }),
        }),
      }),
    }),
  };
  return { client, etat };
}

test("reclamerPost : un post planifié est réclamé et passe en publication_en_cours", async () => {
  const { client, etat } = clientClaim("planifie");
  assert.equal(await reclamerPost(client, "p1"), true);
  assert.equal(etat.statut, "publication_en_cours");
});

test("reclamerPost : deux runs concurrents, un seul obtient le claim", async () => {
  const { client, etat } = clientClaim("planifie");
  const [a, b] = [await reclamerPost(client, "p1"), await reclamerPost(client, "p1")];
  assert.deepEqual([a, b], [true, false]);
  assert.equal(etat.updates, 1);
});

test("reclamerPost : un post déjà en cours ou publié n'est jamais réclamé", async () => {
  for (const statut of ["publication_en_cours", "publie", "echec"]) {
    const { client } = clientClaim(statut);
    assert.equal(await reclamerPost(client, "p1"), false);
  }
});

// ─── Équité entre pros ────────────────────────────────────────────────────────

test("repartirEquitablement : borne par pro et entrelace les pros", () => {
  const posts = [
    ...[1, 2, 3, 4, 5].map((n) => post({ id: `a${n}`, pro_id: "A" })),
    ...[1, 2].map((n) => post({ id: `b${n}`, pro_id: "B" })),
  ];
  const res = repartirEquitablement(posts, 2, 10);
  assert.deepEqual(res.map((p) => p.id), ["a1", "b1", "a2", "b2"]);
});

test("repartirEquitablement : un pro saturé ne monopolise pas le run", () => {
  const posts = [
    ...Array.from({ length: 50 }, (_, i) => post({ id: `a${i}`, pro_id: "A" })),
    post({ id: "b1", pro_id: "B" }),
  ];
  const res = repartirEquitablement(posts, 3, 4);
  assert.equal(res.filter((p) => p.pro_id === "A").length, 3);
  assert.equal(res.filter((p) => p.pro_id === "B").length, 1);
});

test("repartirEquitablement : respecte maxTotal", () => {
  const posts = Array.from({ length: 10 }, (_, i) => post({ id: `p${i}`, pro_id: `pro${i}` }));
  assert.equal(repartirEquitablement(posts, 3, 4).length, 4);
});

// ─── Retry sûr et classification des erreurs ──────────────────────────────────

test("erreurHttp : rejouable seulement sur 429 et 5xx", () => {
  assert.equal(erreurHttp({ status: 429 }, {}).retryable, true);
  assert.equal(erreurHttp({ status: 503 }, {}).retryable, true);
  assert.equal(erreurHttp({ status: 400 }, {}).retryable, undefined);
  assert.equal(erreurHttp({ status: 403 }, {}).retryable, undefined);
});

test("erreurReseau : un timeout n'est jamais rejouable", () => {
  const abort = Object.assign(new Error("aborted"), { name: "AbortError" });
  const res = erreurReseau(abort);
  assert.equal(res.retryable, undefined);
  assert.match(res.erreur!, /délai dépassé/);
});

test("tokenRejete : 401, code Meta 190, invalid_grant, UNAUTHENTICATED", () => {
  assert.equal(tokenRejete(401, {}), true);
  assert.equal(tokenRejete(400, { error: { code: 190 } }), true);
  assert.equal(tokenRejete(400, { error: "invalid_grant" }), true);
  assert.equal(tokenRejete(403, { error: { status: "UNAUTHENTICATED" } }), true);
  assert.equal(tokenRejete(400, { error: { code: 100 } }), false);
});

test("resultatPersistable : n'écrit jamais les métadonnées de tentative", () => {
  const r = resultatPersistable({
    external_id: "1",
    url: "u",
    erreur: "e",
    retryable: true,
    tokenInvalide: true,
  });
  assert.deepEqual(r, { external_id: "1", url: "u", erreur: "e" });
});

// ─── Ressource GBP publiable ──────────────────────────────────────────────────

test("estLocationGbp : seule une ressource accounts/x/locations/y est publiable", () => {
  assert.equal(estLocationGbp("accounts/123/locations/456"), true);
  assert.equal(estLocationGbp("accounts/123"), false);
  assert.equal(estLocationGbp("locations/456"), false);
  assert.equal(estLocationGbp(null), false);
});

test("publierGbp : refuse une connexion sans établissement sélectionné", async () => {
  const res = await publierGbp(
    conn({ provider: "google_business", account_id: "accounts/123" }),
    post({ providers_cibles: ["google_business"] })
  );
  assert.equal(res.external_id, undefined);
  assert.match(res.erreur!, /établissement Google Business/);
});

// ─── Polling du conteneur média Instagram (fix "Media ID is not available") ──

test("attendreConteneurPret : prêt immédiatement si status_code=FINISHED", async () => {
  const originalFetch = global.fetch;
  let appels = 0;
  global.fetch = (async () => {
    appels += 1;
    return {
      ok: true,
      json: async () => ({ status_code: "FINISHED" }),
    } as Response;
  }) as typeof fetch;
  try {
    const res = await attendreConteneurPret("container1", "token1");
    assert.deepEqual(res, { pret: true });
    assert.equal(appels, 1); // pas d'attente inutile si c'est prêt du premier coup
  } finally {
    global.fetch = originalFetch;
  }
});

test("attendreConteneurPret : renvoie une erreur définitive sur status_code=ERROR (pas de nouvelle tentative)", async () => {
  const originalFetch = global.fetch;
  let appels = 0;
  global.fetch = (async () => {
    appels += 1;
    return {
      ok: true,
      json: async () => ({ status_code: "ERROR" }),
    } as Response;
  }) as typeof fetch;
  try {
    const res = await attendreConteneurPret("container1", "token1");
    assert.equal(res.pret, false);
    assert.match(res.erreur!, /échoué \(ERROR\)/);
    assert.equal(appels, 1); // ERROR est définitif, inutile de réessayer le polling
  } finally {
    global.fetch = originalFetch;
  }
});

test("attendreConteneurPret : passe de IN_PROGRESS à FINISHED sur un second appel", async () => {
  const originalFetch = global.fetch;
  let appels = 0;
  global.fetch = (async () => {
    appels += 1;
    const statut = appels === 1 ? "IN_PROGRESS" : "FINISHED";
    return {
      ok: true,
      json: async () => ({ status_code: statut }),
    } as Response;
  }) as typeof fetch;
  try {
    const res = await attendreConteneurPret("container1", "token1");
    assert.deepEqual(res, { pret: true });
    assert.equal(appels, 2); // a bien attendu le passage IN_PROGRESS → FINISHED
  } finally {
    global.fetch = originalFetch;
  }
});
