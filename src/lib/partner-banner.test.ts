import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getOrderedPartners,
  getPartnerBannerContext,
  normalizePathname,
} from "./partner-banner";

test("normalise les chemins avec slash final", () => {
  assert.equal(normalizePathname("/blog/"), "/blog");
  assert.equal(normalizePathname("/"), "/");
  assert.equal(normalizePathname(null), "");
});

test("ordre public : Notre Livre puis Giva puis Allopoints", () => {
  assert.deepEqual(
    getOrderedPartners("public").map((partner) => partner.id),
    ["notre-livre", "giva", "allopoints"],
  );
});

test("ordre pro : Giva puis Allopoints puis Notre Livre", () => {
  assert.deepEqual(
    getOrderedPartners("pro").map((partner) => partner.id),
    ["giva", "allopoints", "notre-livre"],
  );
});

test("pages publiques principales : banniere visible en audience public", () => {
  assert.deepEqual(getPartnerBannerContext("/"), {
    show: true,
    audience: "public",
  });
  assert.deepEqual(getPartnerBannerContext("/blog"), {
    show: true,
    audience: "public",
  });
  assert.deepEqual(
    getPartnerBannerContext("/guides/transport-sanitaire-conformite-2026-2027"),
    {
      show: true,
      audience: "public",
    },
  );
});

test("autres pages publiques hors cible : banniere masquee", () => {
  assert.deepEqual(getPartnerBannerContext("/transport-medical"), {
    show: false,
    audience: "public",
  });
  assert.deepEqual(getPartnerBannerContext("/contact"), {
    show: false,
    audience: "public",
  });
  assert.deepEqual(getPartnerBannerContext("/partenaires/assurance-pro"), {
    show: false,
    audience: "public",
  });
});

test("dashboards : banniere visible en audience pro", () => {
  assert.deepEqual(getPartnerBannerContext("/dashboard"), {
    show: true,
    audience: "pro",
  });
  assert.deepEqual(getPartnerBannerContext("/garage/dashboard/depots/123"), {
    show: true,
    audience: "pro",
  });
  assert.deepEqual(
    getPartnerBannerContext("/transport-medical/pro/messages"),
    {
      show: true,
      audience: "pro",
    },
  );
});

test("landing pro publique : pas de banniere", () => {
  assert.deepEqual(getPartnerBannerContext("/transport-medical/pro"), {
    show: false,
    audience: "public",
  });
});

test("tunnels sensibles : banniere masquee", () => {
  for (const pathname of [
    "/partenaires",
    "/auth/register",
    "/transport-medical/inscription",
    "/transport-medical/inscription/merci",
    "/transport-medical/pro/reclamer",
    "/transport-medical/vers/caen",
    "/pricing",
    "/dashboard/paiements",
    "/depot-vente/estimer",
    "/depot-vente/garages/abc123/reserver",
    "/depot-vente/garages/abc123/achat-confirme",
    "/garage/inscription",
    "/suivi-demande/token-123",
  ]) {
    assert.deepEqual(getPartnerBannerContext(pathname), {
      show: false,
      audience: "public",
    });
  }
});
