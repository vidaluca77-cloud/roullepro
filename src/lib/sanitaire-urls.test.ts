import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CATEGORIES_URL_COURTE,
  utiliseUrlCourte,
  villeCategorieUrl,
  ficheUrl,
} from "./sanitaire-urls";
import { CATEGORIES_SANITAIRE } from "./sanitaire-data";

test("les categories a URL courte existent dans le referentiel", () => {
  const slugs = CATEGORIES_SANITAIRE.map((c) => c.slug);
  for (const cat of CATEGORIES_URL_COURTE) {
    assert.ok(slugs.includes(cat), `categorie inconnue: ${cat}`);
  }
});

test("utiliseUrlCourte ne cible que ambulance et taxi-conventionne", () => {
  assert.equal(utiliseUrlCourte("ambulance"), true);
  assert.equal(utiliseUrlCourte("taxi-conventionne"), true);
  assert.equal(utiliseUrlCourte("vsl"), false);
  assert.equal(utiliseUrlCourte("inconnue"), false);
});

test("villeCategorieUrl renvoie l'URL courte canonique", () => {
  assert.equal(villeCategorieUrl("ambulance", "paris"), "/ambulance/paris");
  assert.equal(
    villeCategorieUrl("taxi-conventionne", "lyon"),
    "/taxi-conventionne/lyon"
  );
});

test("villeCategorieUrl conserve l'URL longue pour le VSL", () => {
  assert.equal(
    villeCategorieUrl("vsl", "marseille"),
    "/transport-medical/marseille/vsl"
  );
});

test("chaque categorie a URL courte est redirigee en 301 depuis l'URL longue", async () => {
  // Garde-fou : une URL courte sans redirection 301 recreerait la
  // cannibalisation que ce chantier supprime.
  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);
  const nextConfig = require("../../next.config.js");
  const pathToRegexp = require("next/dist/compiled/path-to-regexp");
  const redirects = await nextConfig.redirects();

  for (const cat of CATEGORIES_URL_COURTE) {
    const rule = redirects.find(
      (r: { destination: string }) => r.destination === `/${cat}/:ville`
    );
    assert.ok(rule, `redirection manquante pour ${cat}`);
    assert.equal(rule.permanent, true);

    const match = pathToRegexp.match(rule.source);
    // Une ville normale est capturee...
    assert.ok(match(`/transport-medical/provins/${cat}`), `ville non captee (${cat})`);
    // ...mais jamais le hub national ni une fiche pro.
    assert.equal(match(`/transport-medical/categorie/${cat}`), false);
    assert.equal(match(`/transport-medical/paris/${cat}/une-societe`), false);
  }
});

test("ficheUrl reste sur le chemin long quelle que soit la categorie", () => {
  assert.equal(
    ficheUrl("paris", "ambulance", "ambulances-du-nord"),
    "/transport-medical/paris/ambulance/ambulances-du-nord"
  );
  assert.equal(
    ficheUrl("lyon", "vsl", "vsl-rhone"),
    "/transport-medical/lyon/vsl/vsl-rhone"
  );
});
