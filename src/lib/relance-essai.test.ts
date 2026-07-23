import { test } from "node:test";
import assert from "node:assert/strict";
import {
  selectionnerRelance,
  choisirVariante,
  calculerEcheance,
  joursCalendairesParis,
  dateCalendaireParis,
  FENETRES_RELANCE,
  type ProRelance,
} from "./relance-essai";
import { renderRelanceEssai } from "./email-templates/sanitaire/relance-essai";

// Été (CEST, UTC+2). NOW = 23/07/2026 07:30 Paris.
const NOW = new Date("2026-07-23T05:30:00.000Z");

/** Instant ISO dont la date calendaire Paris est décalée de `jours` par rapport à NOW, à 11h Paris. */
function echeanceIso(jours: number): string {
  // 09:00 UTC = 11:00 Paris (été) → milieu de journée, pas d'ambiguïté de bascule.
  const base = new Date("2026-07-23T09:00:00.000Z");
  return new Date(base.getTime() + jours * 86_400_000).toISOString();
}

function pro(over: Partial<ProRelance> = {}): ProRelance {
  return {
    id: "p1",
    claimed: true,
    free_trial_ends_at: null,
    plan_active_until: null,
    stripe_subscription_id: null,
    ...over,
  };
}

// ─── Fenêtres J-7 / J-3 / J-1 ────────────────────────────────────────────────

test("J-7 : échéance dans 7 jours calendaires → relance J7", () => {
  const res = selectionnerRelance({ pro: pro({ plan_active_until: echeanceIso(7) }), now: NOW });
  assert.equal(res?.type, "J7");
  assert.equal(res?.joursRestants, 7);
  assert.equal(res?.echeanceDate, "2026-07-30");
});

test("J-3 : échéance dans 3 jours → relance J3", () => {
  const res = selectionnerRelance({ pro: pro({ plan_active_until: echeanceIso(3) }), now: NOW });
  assert.equal(res?.type, "J3");
  assert.equal(res?.echeanceDate, "2026-07-26");
});

test("J-1 : échéance demain → relance J1", () => {
  const res = selectionnerRelance({ pro: pro({ plan_active_until: echeanceIso(1) }), now: NOW });
  assert.equal(res?.type, "J1");
});

test("hors fenêtre : J-5, J-2, J-0, J+1 (passé) → aucune relance", () => {
  for (const j of [5, 2, 0, -1, 8]) {
    const res = selectionnerRelance({ pro: pro({ plan_active_until: echeanceIso(j) }), now: NOW });
    assert.equal(res, null, `jour ${j} devrait être hors fenêtre`);
  }
});

test("échéance dans 6 mois (offre 6 mois) : hors fenêtre tant qu'on n'est pas à J-7", () => {
  const res = selectionnerRelance({
    pro: pro({ plan_active_until: "2026-11-18T12:00:00.000Z" }),
    now: NOW,
  });
  assert.equal(res, null);
});

// ─── Comparaison par DATE CALENDAIRE Europe/Paris ────────────────────────────

test("comparaison calendaire : échéance juste après minuit Paris compte comme un jour entier", () => {
  // 2026-07-23T23:30:00Z = 2026-07-24 01:30 Paris → date calendaire J+1 → J1,
  // alors qu'en heures glissantes l'écart est < 24h.
  const res = selectionnerRelance({
    pro: pro({ plan_active_until: "2026-07-23T23:30:00.000Z" }),
    now: NOW,
  });
  assert.equal(res?.type, "J1");
  assert.equal(res?.echeanceDate, "2026-07-24");
});

test("dateCalendaireParis convertit bien vers le fuseau Paris", () => {
  // 2026-07-23T22:30:00Z = 2026-07-24 00:30 Paris.
  assert.equal(dateCalendaireParis("2026-07-23T22:30:00.000Z"), "2026-07-24");
});

test("joursCalendairesParis : écart en jours de calendrier", () => {
  assert.equal(joursCalendairesParis(echeanceIso(7), NOW), 7);
  assert.equal(joursCalendairesParis(echeanceIso(0), NOW), 0);
});

test("FENETRES_RELANCE expose bien 7 / 3 / 1", () => {
  assert.deepEqual(FENETRES_RELANCE, { J7: 7, J3: 3, J1: 1 });
});

// ─── COALESCE(free_trial_ends_at, plan_active_until) ─────────────────────────

test("free_trial_ends_at est prioritaire sur plan_active_until", () => {
  const res = selectionnerRelance({
    pro: pro({ free_trial_ends_at: echeanceIso(3), plan_active_until: echeanceIso(7) }),
    now: NOW,
  });
  assert.equal(res?.type, "J3");
});

test("fallback sur plan_active_until quand free_trial_ends_at est null", () => {
  assert.equal(calculerEcheance(pro({ plan_active_until: echeanceIso(1) })), echeanceIso(1));
});

test("aucune date renseignée → pas d'échéance, pas de relance", () => {
  assert.equal(calculerEcheance(pro()), null);
  assert.equal(selectionnerRelance({ pro: pro(), now: NOW }), null);
});

// ─── Filtre claimed ──────────────────────────────────────────────────────────

test("pro non claimed → jamais de relance même dans la fenêtre", () => {
  const res = selectionnerRelance({
    pro: pro({ claimed: false, plan_active_until: echeanceIso(7) }),
    now: NOW,
  });
  assert.equal(res, null);
});

// ─── Idempotence : clé stable (pro_id, echeance_date, type_relance) ──────────

test("idempotence : la même échéance produit la même echeanceDate sur des runs successifs", () => {
  const p = pro({ plan_active_until: echeanceIso(3) });
  // Run le lendemain : NOW+1 jour, l'échéance recule d'une fenêtre (J3 → J2 = hors fenêtre).
  const jour1 = selectionnerRelance({ pro: p, now: NOW });
  const jour2 = selectionnerRelance({ pro: p, now: new Date(NOW.getTime() + 86_400_000) });
  assert.equal(jour1?.echeanceDate, "2026-07-26");
  assert.equal(jour1?.type, "J3");
  // Le lendemain il ne reste que 2 jours → aucune relance (pas de doublon possible).
  assert.equal(jour2, null);
});

test("idempotence : la clé echeanceDate est indépendante de l'heure de la journée de NOW", () => {
  const p = pro({ plan_active_until: echeanceIso(7) });
  const matin = selectionnerRelance({ pro: p, now: new Date("2026-07-23T05:30:00.000Z") });
  const soir = selectionnerRelance({ pro: p, now: new Date("2026-07-23T20:00:00.000Z") });
  assert.equal(matin?.echeanceDate, soir?.echeanceDate);
  assert.equal(matin?.type, soir?.type);
});

// ─── Choix de variante (template) ────────────────────────────────────────────

test("choisirVariante : carte enregistrée → informatif", () => {
  assert.equal(choisirVariante(pro({ stripe_subscription_id: "sub_123" })), "informatif");
});

test("choisirVariante : pas de carte → conversion", () => {
  assert.equal(choisirVariante(pro({ stripe_subscription_id: null })), "conversion");
});

// ─── Rendu des templates ─────────────────────────────────────────────────────

test("template informatif : ton rassurant, bascule automatique, CTA gestion", () => {
  const tpl = renderRelanceEssai({
    variante: "informatif",
    type: "J3",
    nomAffiche: "Ambulances Test",
    ville: "Caen",
    echeanceIso: echeanceIso(3),
    ctaUrl: "https://x/dashboard",
    dashboardUrl: "https://x/dashboard",
  });
  assert.match(tpl.text, /automatiquement/);
  assert.match(tpl.text, /Aucune action/);
  assert.match(tpl.html, /Gérer mon abonnement/);
  assert.match(tpl.subject, /automatique/);
});

test("template conversion : incite à souscrire, CTA plan Pro", () => {
  const tpl = renderRelanceEssai({
    variante: "conversion",
    type: "J3",
    nomAffiche: "Ambulances Test",
    ville: "Caen",
    echeanceIso: echeanceIso(3),
    ctaUrl: "https://x/tarifs",
    dashboardUrl: "https://x/dashboard",
  });
  assert.match(tpl.text, /passez au plan Pro|plan Pro/);
  assert.match(tpl.text, /sans engagement/);
  assert.match(tpl.subject, /plan Pro|offre/);
});

test("template J-1 conversion : dernier jour explicite", () => {
  const tpl = renderRelanceEssai({
    variante: "conversion",
    type: "J1",
    nomAffiche: "Ambulances Test",
    ville: null,
    echeanceIso: echeanceIso(1),
    ctaUrl: "https://x/tarifs",
    dashboardUrl: "https://x/dashboard",
  });
  assert.match(tpl.text, /dernier jour/);
  assert.match(tpl.subject, /[Dd]ernier jour/);
});

test("template : échappe le HTML du nom affiché (anti-XSS)", () => {
  const tpl = renderRelanceEssai({
    variante: "conversion",
    type: "J7",
    nomAffiche: '<script>alert(1)</script>',
    ville: null,
    echeanceIso: echeanceIso(7),
    ctaUrl: "https://x/tarifs",
    dashboardUrl: "https://x/dashboard",
  });
  assert.doesNotMatch(tpl.html, /<script>alert/);
  assert.match(tpl.html, /&lt;script&gt;/);
});
