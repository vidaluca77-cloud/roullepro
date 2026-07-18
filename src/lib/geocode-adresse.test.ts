import { test } from "node:test";
import assert from "node:assert/strict";
import {
  extraireCodePostal,
  departementCoherentAvecSaisie,
  geocodageEstFiable,
  geocodeAdresse,
  type GeocodeAdresseResult,
} from "./geocode-adresse";

/** Fabrique un resultat de geocodage minimal pour les tests. */
function resultat(
  partial: Partial<GeocodeAdresseResult> & Pick<GeocodeAdresseResult, "latitude" | "longitude" | "departement">
): GeocodeAdresseResult {
  return {
    code_postal: null,
    ville: null,
    score: 0.9,
    label: "",
    ...partial,
  };
}

// --- extraireCodePostal -----------------------------------------------------

test("extraireCodePostal : extrait un CP a 5 chiffres au milieu d'une saisie", () => {
  assert.equal(
    extraireCodePostal("63360 Gerzat, France 11, résidence le Colombier"),
    "63360"
  );
});

test("extraireCodePostal : null quand aucun CP (saisie ville seule)", () => {
  assert.equal(extraireCodePostal("1 bis allée des jardins fleuris verzy"), null);
});

test("extraireCodePostal : ne confond pas un numero de voie avec un CP", () => {
  assert.equal(extraireCodePostal("11 rue de la Paix"), null);
});

// --- departementCoherentAvecSaisie ------------------------------------------

test("departementCoherentAvecSaisie : true si pas de CP dans la saisie", () => {
  assert.equal(departementCoherentAvecSaisie("verzy", "54"), true);
});

test("departementCoherentAvecSaisie : CP 63360 vs departement 95 -> incoherent", () => {
  assert.equal(departementCoherentAvecSaisie("63360 Gerzat", "95"), false);
});

test("departementCoherentAvecSaisie : CP 63360 vs departement 63 -> coherent", () => {
  assert.equal(departementCoherentAvecSaisie("63360 Gerzat", "63"), true);
});

// --- geocodageEstFiable : cas reel n°1 (Gerzat) -----------------------------

test("cas Gerzat : CP 63360 geocode en Cormeilles-en-Vexin (95) -> NON fiable", () => {
  const geo = resultat({ latitude: 49.117, longitude: 2.018, departement: "95", ville: "Cormeilles-en-Vexin" });
  assert.equal(
    geocodageEstFiable("63360 Gerzat, France 11, résidence le Colombier", geo),
    false
  );
});

test("cas Gerzat : meme saisie geocodee correctement dans le 63 -> fiable", () => {
  const geo = resultat({ latitude: 45.83, longitude: 3.15, departement: "63", ville: "Gerzat" });
  assert.equal(
    geocodageEstFiable("63360 Gerzat, France 11, résidence le Colombier", geo),
    true
  );
});

// --- geocodageEstFiable : garde-fou distance (arrivee sans CP) ---------------

test("saisie courte sans CP, resultat a >300 km du depart -> NON fiable", () => {
  const depart = { lat: 45.83, lng: 3.15 }; // Clermont-Ferrand
  const geo = resultat({ latitude: 48.85, longitude: 2.35, departement: "75", ville: "Paris" });
  assert.equal(geocodageEstFiable("les tilleuls", geo, { reference: depart }), false);
});

test("saisie longue sans CP, meme resultat lointain -> le garde-fou distance ne s'applique pas", () => {
  const depart = { lat: 45.83, lng: 3.15 };
  const geo = resultat({ latitude: 48.85, longitude: 2.35, departement: "75", ville: "Paris" });
  const saisieLongue = "résidence les grands tilleuls, boulevard du général de gaulle";
  assert.equal(geocodageEstFiable(saisieLongue, geo, { reference: depart }), true);
});

test("saisie sans CP, resultat proche du depart -> fiable", () => {
  const depart = { lat: 49.1, lng: 4.15 }; // proche Verzy (51)
  const geo = resultat({ latitude: 49.15, longitude: 4.15, departement: "51", ville: "Verzy" });
  assert.equal(geocodageEstFiable("verzy", geo, { reference: depart }), true);
});

// --- Pas de faux positif Corse / DROM ---------------------------------------

test("Corse : CP 20000 (2A) vs departement geocode 2A -> coherent", () => {
  const geo = resultat({ latitude: 41.92, longitude: 8.74, departement: "2A", ville: "Ajaccio" });
  assert.equal(geocodageEstFiable("10 cours Napoléon, 20000 Ajaccio", geo), true);
});

test("Corse : CP 20200 (2B) vs departement geocode 2B -> coherent", () => {
  const geo = resultat({ latitude: 42.7, longitude: 9.45, departement: "2B", ville: "Bastia" });
  assert.equal(geocodageEstFiable("place Saint-Nicolas, 20200 Bastia", geo), true);
});

test("DROM : CP 97400 (974) vs departement geocode 974 -> coherent", () => {
  const geo = resultat({ latitude: -20.88, longitude: 55.45, departement: "974", ville: "Saint-Denis" });
  assert.equal(geocodageEstFiable("rue de Paris, 97400 Saint-Denis", geo), true);
});

test("DROM : CP 97400 (974) vs departement geocode metropole 97 mal lu -> incoherent capte", () => {
  // Un resultat en Guadeloupe (971) pour un CP reunionnais (974) est incoherent.
  const geo = resultat({ latitude: 16.24, longitude: -61.53, departement: "971", ville: "Basse-Terre" });
  assert.equal(geocodageEstFiable("rue de Paris, 97400 Saint-Denis", geo), false);
});

// --- geocodeAdresse : le biais geographique corrige la commune (cas n°2) -----

test("cas Verzy : le biais autour du depart resout 'verzy' dans le 51 et non le 54", async () => {
  const original = globalThis.fetch;
  // Sans biais lat/lon -> l'API renverrait Nancy (54). Avec biais -> Verzy (51).
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    const biaise = url.includes("lat=") && url.includes("lon=");
    const feature = biaise
      ? {
          geometry: { coordinates: [4.153, 49.152] },
          properties: { score: 0.9, label: "Verzy", postcode: "51380", city: "Verzy", citycode: "51611" },
        }
      : {
          geometry: { coordinates: [6.184, 48.692] },
          properties: { score: 0.9, label: "Nancy", postcode: "54000", city: "Nancy", citycode: "54395" },
        };
    return {
      ok: true,
      json: async () => ({ features: [feature] }),
    } as Response;
  }) as typeof fetch;

  try {
    const sansBiais = await geocodeAdresse("1 bis allée des jardins fleuris verzy");
    assert.equal(sansBiais?.departement, "54"); // mauvaise commune sans biais

    const avecBiais = await geocodeAdresse("1 bis allée des jardins fleuris verzy", {
      biais: { lat: 49.1, lng: 4.15 },
    });
    assert.equal(avecBiais?.departement, "51");
    assert.equal(avecBiais?.ville, "Verzy");
    // Le resultat biaise est fiable vis-a-vis du depart (Verzy).
    assert.equal(
      geocodageEstFiable("1 bis allée des jardins fleuris verzy", avecBiais!, {
        reference: { lat: 49.1, lng: 4.15 },
      }),
      true
    );
  } finally {
    globalThis.fetch = original;
  }
});
