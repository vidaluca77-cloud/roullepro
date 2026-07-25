import { test } from "node:test";
import assert from "node:assert/strict";
import {
  moisParis,
  bornesMoisParis,
  construireQuotaEtat,
  nombrePostsGenerables,
  normaliserHashtag,
  normaliserHashtags,
  parserPostsGeneres,
  construirePromptGeneration,
  textePourProvider,
  estProviderValide,
  ajustementReservation,
  QUOTA_POSTS_MOIS,
  QUOTA_PUBLICATIONS_MOIS,
  type ProStudioContexte,
} from "./studio-social";
import { peutUtiliserStudioSocial } from "./sanitaire-plans";

const proExemple: ProStudioContexte = {
  id: "p1",
  raison_sociale: "Ambulances du Léman SARL",
  nom_commercial: "Ambulances du Léman",
  ville: "Thonon-les-Bains",
  departement: "74",
  categorie: "ambulance",
  description: "Transport sanitaire agréé, 4 véhicules.",
};

// ─── moisParis / bornesMoisParis ─────────────────────────────────────────────

test("moisParis renvoie le mois calendaire Europe/Paris", () => {
  // 31/01 23:30 UTC = 1er février 00:30 Paris (hiver, UTC+1).
  assert.equal(moisParis(new Date("2026-01-31T23:30:00Z")), "2026-02");
  // 30/06 22:30 UTC = 1er juillet 00:30 Paris (été, UTC+2).
  assert.equal(moisParis(new Date("2026-06-30T22:30:00Z")), "2026-07");
});

test("bornesMoisParis encadre le mois courant Paris", () => {
  const { debut, fin } = bornesMoisParis(new Date("2026-07-15T10:00:00Z"));
  // Été : 1er juillet 00:00 Paris = 30 juin 22:00 UTC.
  assert.equal(debut, "2026-06-30T22:00:00.000Z");
  assert.equal(fin, "2026-07-31T22:00:00.000Z");
});

// ─── Quotas ──────────────────────────────────────────────────────────────────

test("construireQuotaEtat calcule les restes bornés à zéro", () => {
  const q = construireQuotaEtat(3, 9);
  assert.equal(q.postsRestants, QUOTA_POSTS_MOIS - 3);
  assert.equal(q.publicationsRestantes, 0); // 9 > 8 → borné
  assert.equal(q.publicationsUtilisees, 9);
});

test("nombrePostsGenerables borne par le quota restant", () => {
  assert.equal(nombrePostsGenerables(8, 0), 8);
  assert.equal(nombrePostsGenerables(8, 5), 3);
  assert.equal(nombrePostsGenerables(4, 8), 0);
  assert.equal(nombrePostsGenerables(4, QUOTA_POSTS_MOIS + 2), 0);
});

// ─── Hashtags ──────────────────────────────────────────────────────────────

test("normaliserHashtag préfixe # et nettoie", () => {
  assert.equal(normaliserHashtag("ambulance"), "#ambulance");
  assert.equal(normaliserHashtag("#Thonon les Bains"), "#ThononlesBains");
  assert.equal(normaliserHashtag("  "), "");
});

test("normaliserHashtags dédoublonne (insensible à la casse) et limite à 12", () => {
  const out = normaliserHashtags(["#Ambulance", "ambulance", "VSL", "vsl", "Thonon"]);
  assert.deepEqual(out, ["#Ambulance", "#VSL", "#Thonon"]);
  const beaucoup = Array.from({ length: 20 }, (_, i) => `tag${i}`);
  assert.equal(normaliserHashtags(beaucoup).length, 12);
});

// ─── parserPostsGeneres ──────────────────────────────────────────────────────

test("parserPostsGeneres lit un objet {posts:[...]}", () => {
  const raw = JSON.stringify({
    posts: [
      { sujet: "Conseils CPAM", contenu: "Voici un post assez long pour valider.", hashtags: ["cpam"] },
    ],
  });
  const posts = parserPostsGeneres(raw);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].sujet, "Conseils CPAM");
  assert.deepEqual(posts[0].hashtags, ["#cpam"]);
});

test("parserPostsGeneres tolère un tableau nu et le markdown ```json", () => {
  const arr = JSON.stringify([
    { sujet: "Zone desservie", contenu: "Nous desservons tout le bassin lémanique." },
  ]);
  assert.equal(parserPostsGeneres(arr).length, 1);
  const fence = "```json\n" + arr + "\n```";
  assert.equal(parserPostsGeneres(fence).length, 1);
});

test("parserPostsGeneres filtre les entrées invalides et ne lève jamais", () => {
  const raw = JSON.stringify({
    posts: [
      { sujet: "ok", contenu: "Un contenu suffisamment long pour passer." },
      { sujet: "x", contenu: "trop court" }, // contenu < 20 → rejeté
      { contenu: "" },
    ],
  });
  const posts = parserPostsGeneres(raw);
  assert.equal(posts.length, 1);
  assert.deepEqual(parserPostsGeneres("pas du json"), []);
  assert.deepEqual(parserPostsGeneres(null), []);
});

// ─── construirePromptGeneration ──────────────────────────────────────────────

test("construirePromptGeneration personnalise avec la fiche pro", () => {
  const { system, user } = construirePromptGeneration(proExemple, 8);
  assert.match(system, /JSON/);
  assert.match(user, /Ambulances du Léman/);
  assert.match(user, /Thonon-les-Bains/);
  assert.match(user, /74/);
  assert.match(user, /8 posts/);
});

// ─── textePourProvider ───────────────────────────────────────────────────────

test("textePourProvider ajoute les hashtags sauf pour Google Business", () => {
  const contenu = "Besoin d'un transport ? Appelez-nous.";
  assert.equal(textePourProvider("google_business", contenu, ["#cpam"]), contenu);
  assert.equal(
    textePourProvider("facebook", contenu, ["cpam", "vsl"]),
    `${contenu}\n\n#cpam #vsl`
  );
  assert.equal(textePourProvider("instagram", contenu, []), contenu);
});

test("estProviderValide", () => {
  assert.ok(estProviderValide("facebook"));
  assert.ok(estProviderValide("google_business"));
  assert.ok(!estProviderValide("tiktok"));
});

// ─── Gating plan (peutUtiliserStudioSocial) ──────────────────────────────────

test("peutUtiliserStudioSocial : abonné Stripe actif", () => {
  assert.ok(
    peutUtiliserStudioSocial({ plan: "essential", stripe_subscription_id: "sub_1", plan_expires_at: null })
  );
});

test("peutUtiliserStudioSocial : essai en cours vs expiré", () => {
  const futur = new Date(Date.now() + 86_400_000).toISOString();
  const passe = new Date(Date.now() - 86_400_000).toISOString();
  assert.ok(peutUtiliserStudioSocial({ plan: "essential", plan_expires_at: futur, stripe_subscription_id: null }));
  assert.ok(!peutUtiliserStudioSocial({ plan: "essential", plan_expires_at: passe, stripe_subscription_id: null }));
});

test("peutUtiliserStudioSocial : plan gratuit refusé", () => {
  assert.ok(!peutUtiliserStudioSocial({ plan: "gratuit", plan_expires_at: null, stripe_subscription_id: null }));
  assert.ok(!peutUtiliserStudioSocial(null));
});

test("les quotas mensuels valent 8", () => {
  assert.equal(QUOTA_POSTS_MOIS, 8);
  assert.equal(QUOTA_PUBLICATIONS_MOIS, 8);
});

// ─── Réservation atomique sur compteurs monotones ─────────────────────────────

test("ajustementReservation : réservation entièrement dans le quota", () => {
  assert.deepEqual(ajustementReservation(3, 3, 8), { autorise: 3, rembourser: 0 });
});

test("ajustementReservation : réservation partiellement au-delà du quota", () => {
  // 6 déjà consommés, 4 réservés => total 10 : seuls 2 sont autorisés.
  assert.deepEqual(ajustementReservation(10, 4, 8), { autorise: 2, rembourser: 2 });
});

test("ajustementReservation : quota déjà atteint => tout est remboursé", () => {
  assert.deepEqual(ajustementReservation(11, 3, 8), { autorise: 0, rembourser: 3 });
});

test("ajustementReservation : deux réservations concurrentes ne dépassent pas le quota", () => {
  // Deux appels simultanés incrémentent le compteur monotone : 0→5 puis 5→10.
  const a = ajustementReservation(5, 5, 8);
  const b = ajustementReservation(10, 5, 8);
  assert.equal(a.autorise + b.autorise, 8);
});
