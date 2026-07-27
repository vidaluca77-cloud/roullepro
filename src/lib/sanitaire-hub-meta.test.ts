import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HUB_TITLE_MAX,
  HUB_DESCRIPTION_MAX,
  tronquerSurMot,
  aVille,
  buildHubTitle,
  buildHubDescription,
} from "./sanitaire-hub-meta";

test("tronquerSurMot ne coupe jamais au milieu d'un mot", () => {
  assert.equal(tronquerSurMot("court", 20), "court");
  const coupe = tronquerSurMot("transport assis remboursé jusqu'a cent pour cent", 30);
  assert.ok(coupe.length <= 30);
  assert.ok(coupe.endsWith("…"));
  assert.ok(!coupe.includes("rembour…"), `mot coupe: ${coupe}`);
});

test("le title reste sous la limite meme pour une commune a nom long", () => {
  for (const ville of ["Paris", "Le Chambon-Feugerolles", "Bordères-sur-l'Échez"]) {
    for (const cat of ["taxi-conventionne", "ambulance", "vsl"]) {
      for (const nb of [0, 1, 12]) {
        const title = buildHubTitle(cat, ville, nb, "Taxis conventionnés");
        assert.ok(
          title.length <= HUB_TITLE_MAX,
          `${cat}/${ville}/${nb} trop long (${title.length}) : ${title}`
        );
        const noyau = ville.replace(/^Les? /, "");
        assert.ok(title.includes(noyau), `${cat}/${ville} sans nom de ville : ${title}`);
      }
    }
  }
});

test("le title taxi conventionne expose le nombre de pros quand il y en a", () => {
  const title = buildHubTitle("taxi-conventionne", "Paris", 12, "Taxis conventionnés");
  assert.ok(title.startsWith("Taxi conventionné Paris"), title);
  assert.ok(title.includes("12"), title);
  assert.ok(title.includes("tarif Sécu"), title);
});

test("le title ambulance mentionne la prise en charge CPAM", () => {
  assert.ok(buildHubTitle("ambulance", "Caen", 8, "Ambulances").includes("Caen"));
  assert.ok(
    buildHubTitle("ambulance", "Caen", 0, "Ambulances").includes("prise en charge CPAM")
  );
});

test("une categorie sans variante dediee retombe sur le title annuaire", () => {
  assert.equal(
    buildHubTitle("autre", "Dijon", 3, "Transporteurs"),
    "Transporteurs à Dijon : 3 pros conventionnés CPAM"
  );
  assert.equal(
    buildHubTitle("autre", "Dijon", 1, "Transporteurs"),
    "Transporteurs à Dijon : 1 pro conventionné CPAM"
  );
});

test("la preposition se contracte avec l'article de la commune", () => {
  assert.equal(aVille("Paris"), "à Paris");
  assert.equal(aVille("Le Tampon"), "au Tampon");
  assert.equal(aVille("Les Abymes"), "aux Abymes");
  assert.equal(aVille("La Seyne-sur-Mer"), "à La Seyne-sur-Mer");
  // Un title long retombe sur une variante avec preposition : elle doit etre correcte.
  assert.ok(
    buildHubTitle("taxi-conventionne", "Le Chambon-Feugerolles", 1, "Taxis conventionnés").includes(
      "au Chambon-Feugerolles"
    )
  );
});

test("les libelles s'accordent en nombre", () => {
  const un = buildHubDescription("taxi-conventionne", "Vignot", 1, 1, "Taxis conventionnés");
  assert.ok(un.startsWith("1 taxi conventionné à Vignot, dont 1 conventionné CPAM."), un);
  const plusieurs = buildHubDescription("ambulance", "Brest", 5, 3, "Ambulances");
  assert.ok(plusieurs.startsWith("5 ambulances à Brest, dont 3 conventionnés CPAM."), plusieurs);
});

test("la description differencie les trois categories d'une meme ville", () => {
  const descriptions = ["taxi-conventionne", "ambulance", "vsl"].map((cat) =>
    buildHubDescription(cat, "Reims", 6, 4, "Taxis conventionnés")
  );
  assert.equal(new Set(descriptions).size, 3, "descriptions identiques entre categories");
  assert.ok(descriptions[0].includes("Transport assis"));
  assert.ok(descriptions[1].includes("Transport allongé"));
  assert.ok(descriptions[2].includes("agréé ARS"));
});

test("la description tient dans la limite Google et reste lisible", () => {
  for (const nb of [0, 1, 42]) {
    for (const ville of ["Paris", "Le Chambon-Feugerolles"]) {
      const d = buildHubDescription("taxi-conventionne", ville, nb, nb, "Taxis conventionnés");
      assert.ok(d.length <= HUB_DESCRIPTION_MAX, `${d.length} : ${d}`);
      assert.ok(d.includes(ville.replace(/^Les? /, "")), d);
    }
  }
});

test("sans pro reference la description reste honnete", () => {
  const d = buildHubDescription("ambulance", "Savouges", 0, 0, "Ambulances");
  assert.ok(d.includes("annuaire gratuit"), d);
  assert.ok(!/\b0 ambulances\b/.test(d), d);
});
