import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isPaidPlan,
  peutAccepterCourses,
  echeanceOffre,
  abonnementActif,
} from "./sanitaire-plans";

// Date de reference deterministe : 17/07/2026 12:00 UTC.
const NOW = new Date("2026-07-17T12:00:00Z").getTime();
const FUTUR = "2026-07-24T12:00:00Z"; // NOW + 7 jours
const PASSE = "2026-07-16T12:00:00Z"; // NOW - 1 jour

test("isPaidPlan : gratuit/vide/null -> faux ; essential/pro -> vrai", () => {
  assert.equal(isPaidPlan("gratuit"), false);
  assert.equal(isPaidPlan(""), false);
  assert.equal(isPaidPlan(null), false);
  assert.equal(isPaidPlan(undefined), false);
  assert.equal(isPaidPlan("essential"), true);
  assert.equal(isPaidPlan("pro"), true);
  assert.equal(isPaidPlan("premium"), true);
});

test("peutAccepterCourses : plan gratuit -> faux", () => {
  assert.equal(
    peutAccepterCourses(
      { plan: "gratuit", plan_expires_at: null, stripe_subscription_id: null },
      NOW
    ),
    false
  );
});

test("peutAccepterCourses : essai essential en cours (expiration future) -> vrai", () => {
  assert.equal(
    peutAccepterCourses(
      { plan: "essential", plan_expires_at: FUTUR, stripe_subscription_id: null },
      NOW
    ),
    true
  );
});

test("peutAccepterCourses : essai essential expire -> faux (garde-fou avant le cron)", () => {
  assert.equal(
    peutAccepterCourses(
      { plan: "essential", plan_expires_at: PASSE, stripe_subscription_id: null },
      NOW
    ),
    false
  );
});

test("peutAccepterCourses : abonne Stripe (plan_expires_at nul) -> vrai", () => {
  assert.equal(
    peutAccepterCourses(
      { plan: "essential", plan_expires_at: null, stripe_subscription_id: "sub_123" },
      NOW
    ),
    true
  );
});

test("peutAccepterCourses : abonne Stripe meme avec date passee -> vrai", () => {
  assert.equal(
    peutAccepterCourses(
      { plan: "essential", plan_expires_at: PASSE, stripe_subscription_id: "sub_123" },
      NOW
    ),
    true
  );
});

test("peutAccepterCourses : essential sans date et sans Stripe -> faux", () => {
  assert.equal(
    peutAccepterCourses(
      { plan: "essential", plan_expires_at: null, stripe_subscription_id: null },
      NOW
    ),
    false
  );
});

test("peutAccepterCourses : date invalide -> faux", () => {
  assert.equal(
    peutAccepterCourses(
      { plan: "essential", plan_expires_at: "pas-une-date", stripe_subscription_id: null },
      NOW
    ),
    false
  );
});

test("peutAccepterCourses : pro null/undefined -> faux", () => {
  assert.equal(peutAccepterCourses(null, NOW), false);
  assert.equal(peutAccepterCourses(undefined, NOW), false);
});

// ─── echeanceOffre : COALESCE(free_trial_ends_at, plan_active_until, plan_expires_at) ───

test("echeanceOffre : priorite free_trial_ends_at > plan_active_until > plan_expires_at", () => {
  assert.equal(
    echeanceOffre({ free_trial_ends_at: FUTUR, plan_active_until: PASSE, plan_expires_at: PASSE }),
    FUTUR
  );
  assert.equal(echeanceOffre({ plan_active_until: FUTUR, plan_expires_at: PASSE }), FUTUR);
  assert.equal(echeanceOffre({ plan_expires_at: FUTUR }), FUTUR);
});

test("echeanceOffre : aucune colonne renseignee ou date invalide -> null", () => {
  assert.equal(echeanceOffre({}), null);
  assert.equal(
    echeanceOffre({ free_trial_ends_at: null, plan_active_until: null, plan_expires_at: null }),
    null
  );
  assert.equal(echeanceOffre({ plan_expires_at: "pas-une-date" }), null);
});

// ─── abonnementActif ─────────────────────────────────────────────────────────

test("abonnementActif : plan payant + subscription id -> vrai", () => {
  assert.equal(abonnementActif({ plan: "essential", stripe_subscription_id: "sub_1" }), true);
});

test("abonnementActif : resiliation (plan remis a gratuit) -> faux malgre le subscription id", () => {
  assert.equal(abonnementActif({ plan: "gratuit", stripe_subscription_id: "sub_1" }), false);
});

test("abonnementActif : pas de subscription id -> faux", () => {
  assert.equal(abonnementActif({ plan: "essential", stripe_subscription_id: null }), false);
  assert.equal(abonnementActif(null), false);
});
