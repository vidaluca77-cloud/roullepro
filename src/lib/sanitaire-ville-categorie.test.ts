import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildTarifBlock,
  buildLocalFaq,
  selectEtablissementsAffichage,
  topVillesDepartement,
  formatNomVille,
  type EtabRow,
} from "./sanitaire-ville-categorie";
import { TAUX_KM_PAR_DEPARTEMENT, REGLES_CPAM } from "./tarif-cpam";
import { REGLES_VSL, REGLES_AMBULANCE } from "./tarif-transport-sanitaire";

// --- formatNomVille --------------------------------------------------------

test("formatNomVille : nom simple en MAJUSCULES", () => {
  assert.equal(formatNomVille("CAEN"), "Caen");
  assert.equal(formatNomVille("PARIS"), "Paris");
});

test("formatNomVille : mot compose a tiret", () => {
  assert.equal(formatNomVille("SAINT-LO"), "Saint-Lo");
  assert.equal(formatNomVille("BOULOGNE-BILLANCOURT"), "Boulogne-Billancourt");
});

test("formatNomVille : apostrophe capitalisee", () => {
  assert.equal(formatNomVille("L'ISLE-ADAM"), "L'Isle-Adam");
  assert.equal(formatNomVille("SAINT-JEAN-D'ANGELY"), "Saint-Jean-d'Angely");
});

test("formatNomVille : apostrophe typographique", () => {
  assert.equal(formatNomVille("L’ISLE-ADAM"), "L’Isle-Adam");
});

test("formatNomVille : particules en minuscules au milieu du nom", () => {
  assert.equal(formatNomVille("AIX-EN-PROVENCE"), "Aix-en-Provence");
  assert.equal(formatNomVille("ROQUEBRUNE-SUR-ARGENS"), "Roquebrune-sur-Argens");
  assert.equal(formatNomVille("BAGNOLS-SUR-CEZE"), "Bagnols-sur-Ceze");
  assert.equal(formatNomVille("LES-SABLES-D-OLONNE"), "Les-Sables-d-Olonne");
});

test("formatNomVille : particule en tete reste capitalisee", () => {
  assert.equal(formatNomVille("LE HAVRE"), "Le Havre");
  assert.equal(formatNomVille("LA ROCHELLE"), "La Rochelle");
  assert.equal(formatNomVille("LES ULIS"), "Les Ulis");
});

test("formatNomVille : espaces conserves et particules en minuscules", () => {
  assert.equal(formatNomVille("AIX EN PROVENCE"), "Aix en Provence");
  assert.equal(formatNomVille("SAINT MICHEL SUR ORGE"), "Saint Michel sur Orge");
});

test("formatNomVille : deja bien formate (idempotent sur casse)", () => {
  assert.equal(formatNomVille("Caen"), "Caen");
  assert.equal(formatNomVille("Aix-en-Provence"), "Aix-en-Provence");
});

test("formatNomVille : accents preserves, aucun accent ajoute", () => {
  assert.equal(formatNomVille("BÉZIERS"), "Béziers");
  assert.equal(formatNomVille("SAINT-LO"), "Saint-Lo");
});

test("formatNomVille : entree vide ou nulle", () => {
  assert.equal(formatNomVille(""), "");
  assert.equal(formatNomVille(null), "");
  assert.equal(formatNomVille(undefined), "");
});

// --- buildTarifBlock -------------------------------------------------------

test("buildTarifBlock taxi : taux km derive de la grille departementale", () => {
  const block = buildTarifBlock("taxi_conventionne", "06", "Alpes-Maritimes");
  assert.ok(block);
  assert.match(block!.simulateur.href, /simulateur-taxi-conventionne/);
  const ligneKm = block!.lignes.find((l) => /kilométrique/.test(l.label));
  assert.ok(ligneKm);
  // La valeur affichee doit correspondre EXACTEMENT a la grille (aucun chiffre en dur).
  const attendu = TAUX_KM_PAR_DEPARTEMENT["06"];
  assert.ok(ligneKm!.valeur.includes(attendu.toLocaleString("fr-FR", { minimumFractionDigits: 2 })));
});

test("buildTarifBlock taxi : null si taux km departemental indisponible", () => {
  const block = buildTarifBlock("taxi_conventionne", "999", "Inconnu");
  assert.equal(block, null);
});

test("buildTarifBlock taxi : forfait de prise en charge issu de REGLES_CPAM", () => {
  const block = buildTarifBlock("taxi_conventionne", "75", "Paris");
  assert.ok(block);
  const ligneForfait = block!.lignes.find((l) => /Prise en charge/.test(l.label));
  assert.ok(ligneForfait!.valeur.includes(String(REGLES_CPAM.forfaitPriseEnCharge)));
});

test("buildTarifBlock vsl : forfait et taux km issus de REGLES_VSL", () => {
  const block = buildTarifBlock("vsl", "14", "Calvados");
  assert.ok(block);
  const forfait = block!.lignes.find((l) => /Forfait/.test(l.label));
  const km = block!.lignes.find((l) => /kilométrique/.test(l.label));
  assert.ok(forfait!.valeur.includes(REGLES_VSL.forfait.toLocaleString("fr-FR", { minimumFractionDigits: 2 })));
  assert.ok(km!.valeur.includes(REGLES_VSL.tauxKm.toLocaleString("fr-FR", { minimumFractionDigits: 2 })));
  assert.match(block!.simulateur.href, /tarif-vsl/);
});

test("buildTarifBlock ambulance : majorations en pourcentage depuis REGLES_AMBULANCE", () => {
  const block = buildTarifBlock("ambulance", "35", "Ille-et-Vilaine");
  assert.ok(block);
  const nuit = block!.lignes.find((l) => /nuit/.test(l.label));
  assert.equal(nuit!.valeur, "+" + Math.round(REGLES_AMBULANCE.tauxNuit * 100) + " %");
  assert.match(block!.simulateur.href, /tarif-ambulance/);
});

test("buildTarifBlock : aucune ligne tarifaire vide", () => {
  for (const dep of ["06", "75", "14"]) {
    for (const cat of ["taxi_conventionne", "vsl", "ambulance"] as const) {
      const block = buildTarifBlock(cat, dep, "Test");
      assert.ok(block);
      for (const l of block!.lignes) {
        assert.ok(l.valeur.trim().length > 0, `ligne vide ${cat} ${dep}`);
      }
    }
  }
});

// --- buildLocalFaq ---------------------------------------------------------

test("buildLocalFaq : 5 questions avec variables ville/departement", () => {
  const faq = buildLocalFaq("Caen", "Calvados", "vsl");
  assert.equal(faq.length, 5);
  assert.ok(faq.every((q) => q.question.length > 0 && q.answer.length > 0));
  assert.ok(faq.some((q) => q.question.includes("Caen")));
  assert.ok(faq.some((q) => q.question.includes("Calvados")));
});

test("buildLocalFaq : question specifique ambulance vs assis", () => {
  const amb = buildLocalFaq("Lyon", "Rhône", "ambulance");
  assert.ok(amb.some((q) => /ambulance plutôt qu'un VSL/.test(q.question)));
  const vsl = buildLocalFaq("Lyon", "Rhône", "vsl");
  assert.ok(vsl.some((q) => /dialyse, chimiothérapie/.test(q.question)));
});

test("buildLocalFaq : reponses sans montant tarifaire en dur", () => {
  for (const cat of ["taxi_conventionne", "vsl", "ambulance"] as const) {
    const faq = buildLocalFaq("Rennes", "Ille-et-Vilaine", cat);
    for (const q of faq) {
      assert.ok(!/€/.test(q.answer), `montant en euros dans une reponse (${cat})`);
      assert.ok(!/\d+\s?€\/km/.test(q.answer), `taux km en dur (${cat})`);
    }
  }
});

// --- selectEtablissementsAffichage ----------------------------------------

function etab(id: string): EtabRow {
  return {
    id,
    slug: "etab-" + id,
    raison_sociale: "Etab " + id,
    nom_court: null,
    nom_affichage: null,
    categorie_simple: "hopital",
  };
}

test("selectEtablissements : >= 3 en ville -> scope ville, plafonne a 6", () => {
  const ville = [etab("1"), etab("2"), etab("3"), etab("4"), etab("5"), etab("6"), etab("7")];
  const res = selectEtablissementsAffichage(ville, [], 6);
  assert.equal(res.scope, "ville");
  assert.equal(res.rows.length, 6);
});

test("selectEtablissements : < 3 en ville -> complete avec le departement", () => {
  const ville = [etab("1")];
  const dept = [etab("1"), etab("2"), etab("3"), etab("4")];
  const res = selectEtablissementsAffichage(ville, dept, 6);
  assert.equal(res.scope, "departement");
  assert.deepEqual(res.rows.map((r) => r.id), ["1", "2", "3", "4"]);
});

test("selectEtablissements : aucune donnee -> liste vide", () => {
  const res = selectEtablissementsAffichage([], [], 6);
  assert.equal(res.rows.length, 0);
});

test("selectEtablissements : ville < 3 et departement vide -> scope ville", () => {
  const res = selectEtablissementsAffichage([etab("1"), etab("2")], [], 6);
  assert.equal(res.scope, "ville");
  assert.equal(res.rows.length, 2);
});

// --- topVillesDepartement --------------------------------------------------

test("topVillesDepartement : compte, exclut la ville courante, trie desc", () => {
  const rows = [
    { ville: "Caen", ville_slug: "caen" },
    { ville: "Caen", ville_slug: "caen" },
    { ville: "Lisieux", ville_slug: "lisieux" },
    { ville: "Bayeux", ville_slug: "bayeux" },
    { ville: "Bayeux", ville_slug: "bayeux" },
    { ville: "Bayeux", ville_slug: "bayeux" },
  ];
  const top = topVillesDepartement(rows, "caen", 8);
  assert.deepEqual(top.map((v) => v.slug), ["bayeux", "lisieux"]);
  assert.equal(top[0].count, 3);
});

test("topVillesDepartement : respecte la limite max", () => {
  const rows = Array.from({ length: 20 }, (_, i) => ({
    ville: "Ville" + i,
    ville_slug: "ville-" + i,
  }));
  const top = topVillesDepartement(rows, "aucune", 8);
  assert.equal(top.length, 8);
});
