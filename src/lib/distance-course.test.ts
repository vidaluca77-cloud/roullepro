import { test } from "node:test";
import assert from "node:assert/strict";
import {
  distanceHaversineKm,
  calculerDistanceCourse,
  FACTEUR_ROUTIER,
} from "./distance-course";

test("distanceHaversineKm : deux points identiques -> 0", () => {
  const p = { lat: 49.1829, lng: -0.3707 }; // Caen
  assert.equal(distanceHaversineKm(p, p), 0);
});

test("distanceHaversineKm : Caen -> Paris (~200 km a vol d'oiseau)", () => {
  const caen = { lat: 49.1829, lng: -0.3707 };
  const paris = { lat: 48.8566, lng: 2.3522 };
  const d = distanceHaversineKm(caen, paris);
  // Reference connue : ~200 km orthodromique.
  assert.ok(d > 190 && d < 210, `attendu ~200 km, obtenu ${d}`);
});

test("calculerDistanceCourse : applique le facteur routier et arrondit a 0,1 km", () => {
  const a = { lat: 49.0, lng: 0.0 };
  const b = { lat: 49.09, lng: 0.0 }; // ~10 km au nord
  const res = calculerDistanceCourse(a, b);
  assert.ok(res);
  const brute = distanceHaversineKm(a, b) * FACTEUR_ROUTIER;
  assert.equal(res!.distanceKm, Math.round(brute * 10) / 10);
});

test("calculerDistanceCourse : null si un point manque", () => {
  const a = { lat: 49.0, lng: 0.0 };
  assert.equal(calculerDistanceCourse(a, null), null);
  assert.equal(calculerDistanceCourse(null, a), null);
  assert.equal(calculerDistanceCourse(null, null), null);
});

test("calculerDistanceCourse : null si coordonnees hors bornes", () => {
  const a = { lat: 49.0, lng: 0.0 };
  assert.equal(calculerDistanceCourse(a, { lat: 200, lng: 0 }), null);
  assert.equal(calculerDistanceCourse(a, { lat: 0, lng: 500 }), null);
});

test("calculerDistanceCourse : null si coordonnee non finie", () => {
  const a = { lat: 49.0, lng: 0.0 };
  assert.equal(calculerDistanceCourse(a, { lat: NaN, lng: 0 }), null);
});
