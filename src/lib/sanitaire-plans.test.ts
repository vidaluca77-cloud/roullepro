import { test } from "node:test";
import assert from "node:assert/strict";
import { isPaidPlan, peutAccepterCourses } from "./sanitaire-plans";

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
