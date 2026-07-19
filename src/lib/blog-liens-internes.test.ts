import { test } from "node:test";
import assert from "node:assert/strict";
import {
  selectionnerLiensInternes,
  detecterVille,
} from "./blog-liens-internes";

const hrefs = (contexte: Parameters<typeof selectionnerLiensInternes>[0]) =>
  selectionnerLiensInternes(contexte).map((l) => l.href);

test("cas VSL : pilier + simulateur VSL", () => {
  const liens = selectionnerLiensInternes({
    titre: "VSL : definition, prescription et remboursement",
    slug: "vsl-definition-remboursement",
    tags: ["vsl", "vehicule sanitaire leger"],
  });
  const urls = liens.map((l) => l.href);
  assert.ok(urls.includes("/vsl"));
  assert.ok(urls.includes("/tarif-vsl"));
});

test("cas taxi / CPAM : pilier taxi + simulateur taxi", () => {
  const urls = hrefs({
    titre: "Agrement CPAM du taxi conventionne",
    slug: "agrement-cpam-taxi-conventionne",
    tags: ["taxi conventionne", "cpam"],
  });
  assert.ok(urls.includes("/taxi-conventionne"));
  assert.ok(urls.includes("/simulateur-taxi-conventionne"));
});

test("cas ambulance : annuaire + simulateur ambulance", () => {
  const urls = hrefs({
    titre: "Ambulance privee ou publique : que choisir ?",
    slug: "ambulance-privee-vs-publique-2026",
    tags: ["ambulance"],
  });
  assert.ok(urls.includes("/transport-medical/categorie/ambulance"));
  assert.ok(urls.includes("/tarif-ambulance"));
});

test("cas bon de transport : pilier bon de transport", () => {
  const urls = hrefs({
    titre: "Bon de transport medical : CERFA 11574 explique",
    slug: "bon-transport-medical-cerfa-11574",
    tags: ["bon de transport", "prescription"],
  });
  assert.ok(urls.includes("/bon-de-transport"));
});

test("cas ville detectee : page transport medical de la ville", () => {
  const urls = hrefs({
    titre: "Ambulance a Caen : trouver une societe agreee",
    slug: "ambulance-caen-urgences-cpam-2026",
    tags: ["ambulance", "caen"],
  });
  assert.ok(urls.includes("/transport-medical/caen"));
});

test("ville multi-mots (Saint-Etienne) detectee via le slug", () => {
  const ville = detecterVille({
    titre: "VSL a Saint-Etienne : le guide",
    slug: "vsl-saint-etienne-2026",
  });
  assert.deepEqual(ville, { nom: "Saint-Etienne", slug: "saint-etienne" });
});

test("aucun match : repli sur les 3 piliers", () => {
  const liens = selectionnerLiensInternes({
    titre: "Vendre un utilitaire d'occasion entre professionnels",
    slug: "vendre-utilitaire-occasion-entre-professionnels",
    tags: ["vente fourgon"],
  });
  assert.deepEqual(
    liens.map((l) => l.href),
    ["/vsl", "/taxi-conventionne", "/bon-de-transport"]
  );
});

test("toujours entre 3 et 6 liens, sans doublon d'href", () => {
  const liens = selectionnerLiensInternes({
    titre: "Ambulance, VSL ou taxi conventionne a Nice : bon de transport CPAM",
    slug: "ambulance-vsl-taxi-conventionne-nice-bon-transport",
    tags: ["ambulance", "vsl", "taxi conventionne", "remboursement", "nice"],
  });
  assert.ok(liens.length >= 3 && liens.length <= 6);
  const urls = liens.map((l) => l.href);
  assert.equal(new Set(urls).size, urls.length);
});

test("les ancres sont des chaines non vides", () => {
  for (const l of selectionnerLiensInternes({
    titre: "Tarif VSL 2026",
    slug: "tarif-vsl-2026",
  })) {
    assert.ok(l.label.length > 0);
    assert.ok(l.href.startsWith("/"));
  }
});
