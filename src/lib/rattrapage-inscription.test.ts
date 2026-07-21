import { test } from "node:test";
import assert from "node:assert/strict";
import {
  selectionnerDemandesEligibles,
  FENETRE_RATTRAPAGE_JOURS,
  type DemandeRattrapage,
  type ProRattrapage,
} from "./rattrapage-inscription";

const NOW = new Date("2026-07-21T10:00:00.000Z");

/** Decalage en jours (positif = futur) au format ISO. */
function iso(joursDepuisNow: number): string {
  return new Date(NOW.getTime() + joursDepuisNow * 24 * 3600 * 1000).toISOString();
}

/** Demande de base valide (taxi, IdF geocodee), surchargeable par test. */
function demande(over: Partial<DemandeRattrapage> = {}): DemandeRattrapage {
  return {
    id: "d1",
    type_transport: "taxi",
    statut: "envoyee",
    date_souhaitee: iso(2), // dans le futur
    created_at: iso(-1), // deposee hier
    departement_cible: "92",
    ville_cible: "Nanterre",
    lieu_depart_lat: 48.892,
    lieu_depart_lng: 2.206,
    ...over,
  };
}

// Pro taxi conventionne du 93 (IdF), localise a Saint-Denis, ville_slug distinct.
const proIdf: ProRattrapage = {
  categorie: "taxi_conventionne",
  departement: "93",
  ville_slug: "saint-denis",
  latitude: 48.936,
  longitude: 2.357,
};

function selection(pro: ProRattrapage, demandes: DemandeRattrapage[]) {
  return selectionnerDemandesEligibles({ pro, demandes, now: NOW });
}

test("pool regional IdF : un pro du 93 recupere une demande du 92", () => {
  const res = selection(proIdf, [demande({ departement_cible: "92" })]);
  assert.equal(res.length, 1);
  assert.equal(res[0].id, "d1");
});

test("hors IdF : pas de pool, le departement seul ne suffit pas sans commune/geo", () => {
  const proCaen: ProRattrapage = {
    categorie: "taxi_conventionne",
    departement: "14",
    ville_slug: "caen",
    latitude: null,
    longitude: null,
  };
  // Demande dans le 14 mais autre commune et non geocodee -> non eligible
  // (le pool [14] a un seul departement, on ne mutualise pas).
  const res = selection(proCaen, [
    demande({
      departement_cible: "14",
      ville_cible: "Bayeux",
      lieu_depart_lat: null,
      lieu_depart_lng: null,
    }),
  ]);
  assert.equal(res.length, 0);
});

test("meme commune (ville_slug) hors pool : eligible", () => {
  const proCaen: ProRattrapage = {
    categorie: "taxi_conventionne",
    departement: "14",
    ville_slug: "caen",
    latitude: null,
    longitude: null,
  };
  const res = selection(proCaen, [
    demande({
      departement_cible: "14",
      ville_cible: "Caen",
      lieu_depart_lat: null,
      lieu_depart_lng: null,
    }),
  ]);
  assert.equal(res.length, 1);
});

test("repli 15 km : demande geocodee proche, commune differente, hors pool", () => {
  // Pro a Lyon 1er, demande a ~2 km (Villeurbanne), meme dept 69 mais pool[69]=1.
  const proLyon: ProRattrapage = {
    categorie: "taxi_conventionne",
    departement: "69",
    ville_slug: "lyon",
    latitude: 45.767,
    longitude: 4.834,
  };
  const proche = demande({
    departement_cible: "69",
    ville_cible: "Villeurbanne",
    lieu_depart_lat: 45.771,
    lieu_depart_lng: 4.879,
  });
  assert.equal(selection(proLyon, [proche]).length, 1);

  // Demande a > 15 km (Vienne, ~30 km) -> exclue.
  const loin = demande({
    id: "d-loin",
    departement_cible: "38",
    ville_cible: "Vienne",
    lieu_depart_lat: 45.525,
    lieu_depart_lng: 4.874,
  });
  assert.equal(selection(proLyon, [loin]).length, 0);
});

test("categorie : un pro VSL ne recoit pas une demande taxi", () => {
  const proVsl: ProRattrapage = { ...proIdf, categorie: "vsl" };
  const res = selection(proVsl, [demande({ type_transport: "taxi" })]);
  assert.equal(res.length, 0);
});

test("categorie : un taxi conventionne recoit aussi les demandes VSL (compatibilite)", () => {
  const res = selection(proIdf, [demande({ type_transport: "vsl" })]);
  assert.equal(res.length, 1);
});

test("categorie : un pro ambulance ne recoit que les demandes ambulance", () => {
  const proAmb: ProRattrapage = { ...proIdf, categorie: "ambulance" };
  assert.equal(selection(proAmb, [demande({ type_transport: "taxi" })]).length, 0);
  assert.equal(
    selection(proAmb, [demande({ type_transport: "ambulance" })]).length,
    1
  );
});

test("fenetre 7 jours : demande deposee il y a 6 jours -> eligible", () => {
  const res = selection(proIdf, [
    demande({ created_at: iso(-6), date_souhaitee: iso(3) }),
  ]);
  assert.equal(res.length, 1);
});

test("fenetre 7 jours : demande deposee il y a 8 jours -> exclue", () => {
  const res = selection(proIdf, [
    demande({ created_at: iso(-8), date_souhaitee: iso(3) }),
  ]);
  assert.equal(res.length, 0);
});

test("date_souhaitee dans le passe -> exclue", () => {
  const res = selection(proIdf, [demande({ date_souhaitee: iso(-0.1) })]);
  assert.equal(res.length, 0);
});

test("statut ferme (acceptee/annulee/expiree/terminee) -> exclue", () => {
  for (const statut of ["acceptee", "annulee", "expiree", "terminee"]) {
    const res = selection(proIdf, [demande({ statut })]);
    assert.equal(res.length, 0, `statut ${statut} doit etre exclu`);
  }
});

test("statut nul ou 'envoyee' -> considere ouvert", () => {
  assert.equal(selection(proIdf, [demande({ statut: null })]).length, 1);
  assert.equal(selection(proIdf, [demande({ statut: "envoyee" })]).length, 1);
});

test("dates invalides ou manquantes -> exclues sans crash", () => {
  assert.equal(selection(proIdf, [demande({ date_souhaitee: null })]).length, 0);
  assert.equal(selection(proIdf, [demande({ created_at: null })]).length, 0);
  assert.equal(
    selection(proIdf, [demande({ date_souhaitee: "pas-une-date" })]).length,
    0
  );
});

test("selection multiple : ne retient que les demandes qualifiantes", () => {
  const demandes = [
    demande({ id: "ok-pool" }), // 92, IdF, taxi -> ok
    demande({ id: "ko-vieille", created_at: iso(-10) }), // hors fenetre
    demande({ id: "ko-passee", date_souhaitee: iso(-1) }), // date passee
    demande({ id: "ko-categorie", type_transport: "ambulance" }), // categorie
    demande({
      id: "ko-geo",
      departement_cible: "59",
      ville_cible: "Lille",
      lieu_depart_lat: 50.63,
      lieu_depart_lng: 3.06,
    }), // hors pool, autre commune, > 15 km
  ];
  const res = selection(proIdf, demandes).map((d) => d.id);
  assert.deepEqual(res, ["ok-pool"]);
});

test("la fenetre exportee vaut 7 jours", () => {
  assert.equal(FENETRE_RATTRAPAGE_JOURS, 7);
});
