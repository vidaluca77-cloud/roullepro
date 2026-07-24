import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getPartnerStripAudience,
  getPartnerStripPartners,
} from "./partner-strip";

test("accueil => audience public", () => {
  assert.equal(getPartnerStripAudience("/"), "public");
});

test("blog, categorie et article => audience public", () => {
  assert.equal(getPartnerStripAudience("/blog"), "public");
  assert.equal(getPartnerStripAudience("/blog/categorie/actualites"), "public");
  assert.equal(getPartnerStripAudience("/blog/mon-article"), "public");
});

test("dashboard marketplace => audience pro", () => {
  assert.equal(getPartnerStripAudience("/dashboard"), "pro");
  assert.equal(getPartnerStripAudience("/dashboard/depots"), "pro");
  assert.equal(getPartnerStripAudience("/garage/dashboard"), "pro");
});

test("dashboard sanitaire connecte => audience pro", () => {
  assert.equal(getPartnerStripAudience("/transport-medical/pro/dashboard"), "pro");
  assert.equal(getPartnerStripAudience("/transport-medical/pro/messages"), "pro");
});

test("landing pro publique et reclamation publique => masque", () => {
  assert.equal(getPartnerStripAudience("/transport-medical/pro"), null);
  assert.equal(getPartnerStripAudience("/transport-medical/pro/reclamer"), null);
});

test("pages paiement dashboard => masque", () => {
  assert.equal(getPartnerStripAudience("/dashboard/paiements"), null);
  assert.equal(getPartnerStripAudience("/dashboard/transactions/abc"), null);
});

test("page partenaires et routes non ciblees => masque", () => {
  assert.equal(getPartnerStripAudience("/partenaires"), null);
  assert.equal(getPartnerStripAudience("/transport-medical"), null);
});

test("ordre public et pro respecte la consigne", () => {
  assert.deepEqual(
    getPartnerStripPartners("public").map((partner) => partner.name),
    ["Notre Livre", "Giva", "Allopoints Protect"],
  );
  assert.deepEqual(
    getPartnerStripPartners("pro").map((partner) => partner.name),
    ["Giva", "Allopoints Protect", "Notre Livre"],
  );
});
