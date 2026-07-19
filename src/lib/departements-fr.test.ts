import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  dansLeDepartement,
  duDepartement,
  getAllDepartementCodes,
} from "./departements-fr";

/**
 * Verifie que les compléments de lieu ("dans le/la/l'/les X", "à X") et de nom
 * ("du/de la/de l'/des X", "de X") sont grammaticalement corrects pour chaque
 * département. La table d'articles est explicite (pas d'heuristique) : ces tests
 * verrouillent chaque cas piège relevé (féminins, pluriels, initiale vocalique,
 * h aspiré vs muet, et noms propres sans article des DOM / Paris).
 */

describe("dansLeDepartement", () => {
  it("masculin à consonne -> dans le", () => {
    assert.equal(dansLeDepartement("14"), "dans le Calvados");
    assert.equal(dansLeDepartement("59"), "dans le Nord");
    assert.equal(dansLeDepartement("62"), "dans le Pas-de-Calais");
  });

  it("féminin à consonne -> dans la", () => {
    assert.equal(dansLeDepartement("50"), "dans la Manche");
    assert.equal(dansLeDepartement("51"), "dans la Marne");
    assert.equal(dansLeDepartement("52"), "dans la Haute-Marne");
    assert.equal(dansLeDepartement("55"), "dans la Meuse");
    assert.equal(dansLeDepartement("57"), "dans la Moselle");
    assert.equal(dansLeDepartement("58"), "dans la Nievre");
    assert.equal(dansLeDepartement("73"), "dans la Savoie");
    assert.equal(dansLeDepartement("74"), "dans la Haute-Savoie");
    assert.equal(dansLeDepartement("85"), "dans la Vendee");
    assert.equal(dansLeDepartement("86"), "dans la Vienne");
    assert.equal(dansLeDepartement("87"), "dans la Haute-Vienne");
    assert.equal(dansLeDepartement("42"), "dans la Loire");
    assert.equal(dansLeDepartement("43"), "dans la Haute-Loire");
    assert.equal(dansLeDepartement("44"), "dans la Loire-Atlantique");
    assert.equal(dansLeDepartement("19"), "dans la Correze");
    assert.equal(dansLeDepartement("23"), "dans la Creuse");
    assert.equal(dansLeDepartement("24"), "dans la Dordogne");
    assert.equal(dansLeDepartement("26"), "dans la Drome");
    assert.equal(dansLeDepartement("33"), "dans la Gironde");
    assert.equal(dansLeDepartement("16"), "dans la Charente");
    assert.equal(dansLeDepartement("17"), "dans la Charente-Maritime");
    assert.equal(dansLeDepartement("21"), "dans la Cote-d'Or");
    assert.equal(dansLeDepartement("48"), "dans la Lozere");
    assert.equal(dansLeDepartement("53"), "dans la Mayenne");
    assert.equal(dansLeDepartement("54"), "dans la Meurthe-et-Moselle");
    assert.equal(dansLeDepartement("80"), "dans la Somme");
    assert.equal(dansLeDepartement("72"), "dans la Sarthe");
    assert.equal(dansLeDepartement("76"), "dans la Seine-Maritime");
    assert.equal(dansLeDepartement("77"), "dans la Seine-et-Marne");
    assert.equal(dansLeDepartement("93"), "dans la Seine-Saint-Denis");
    assert.equal(dansLeDepartement("31"), "dans la Haute-Garonne");
    assert.equal(dansLeDepartement("70"), "dans la Haute-Saone");
    assert.equal(dansLeDepartement("71"), "dans la Saone-et-Loire");
    assert.equal(dansLeDepartement("2A"), "dans la Corse-du-Sud");
    assert.equal(dansLeDepartement("2B"), "dans la Haute-Corse");
  });

  it("initiale vocalique (h muet inclus) -> dans l'", () => {
    assert.equal(dansLeDepartement("01"), "dans l'Ain");
    assert.equal(dansLeDepartement("10"), "dans l'Aube");
    assert.equal(dansLeDepartement("11"), "dans l'Aude");
    assert.equal(dansLeDepartement("07"), "dans l'Ardeche");
    assert.equal(dansLeDepartement("09"), "dans l'Ariege");
    assert.equal(dansLeDepartement("03"), "dans l'Allier");
    assert.equal(dansLeDepartement("12"), "dans l'Aveyron");
    assert.equal(dansLeDepartement("27"), "dans l'Eure");
    assert.equal(dansLeDepartement("28"), "dans l'Eure-et-Loir");
    assert.equal(dansLeDepartement("34"), "dans l'Herault");
    assert.equal(dansLeDepartement("38"), "dans l'Isere");
    assert.equal(dansLeDepartement("60"), "dans l'Oise");
    assert.equal(dansLeDepartement("61"), "dans l'Orne");
    assert.equal(dansLeDepartement("89"), "dans l'Yonne");
    assert.equal(dansLeDepartement("36"), "dans l'Indre");
    assert.equal(dansLeDepartement("37"), "dans l'Indre-et-Loire");
    assert.equal(dansLeDepartement("91"), "dans l'Essonne");
  });

  it("pluriel -> dans les", () => {
    assert.equal(dansLeDepartement("40"), "dans les Landes");
    assert.equal(dansLeDepartement("08"), "dans les Ardennes");
    assert.equal(dansLeDepartement("06"), "dans les Alpes-Maritimes");
    assert.equal(dansLeDepartement("05"), "dans les Hautes-Alpes");
    assert.equal(dansLeDepartement("04"), "dans les Alpes-de-Haute-Provence");
    assert.equal(dansLeDepartement("13"), "dans les Bouches-du-Rhone");
    assert.equal(dansLeDepartement("22"), "dans les Cotes-d'Armor");
    assert.equal(dansLeDepartement("79"), "dans les Deux-Sevres");
    assert.equal(dansLeDepartement("92"), "dans les Hauts-de-Seine");
    assert.equal(dansLeDepartement("64"), "dans les Pyrenees-Atlantiques");
    assert.equal(dansLeDepartement("66"), "dans les Pyrenees-Orientales");
    assert.equal(dansLeDepartement("65"), "dans les Hautes-Pyrenees");
    assert.equal(dansLeDepartement("78"), "dans les Yvelines");
    assert.equal(dansLeDepartement("88"), "dans les Vosges");
  });

  it("h aspiré -> le/la/les, jamais d'élision", () => {
    assert.equal(dansLeDepartement("67"), "dans le Bas-Rhin");
    assert.equal(dansLeDepartement("68"), "dans le Haut-Rhin");
    assert.equal(dansLeDepartement("52"), "dans la Haute-Marne");
    assert.equal(dansLeDepartement("92"), "dans les Hauts-de-Seine");
    assert.equal(dansLeDepartement("65"), "dans les Hautes-Pyrenees");
  });

  it("Guadeloupe / Martinique / Guyane -> en (usage idiomatique)", () => {
    assert.equal(dansLeDepartement("971"), "en Guadeloupe");
    assert.equal(dansLeDepartement("972"), "en Martinique");
    assert.equal(dansLeDepartement("973"), "en Guyane");
  });

  it("Paris / La Reunion / Mayotte sans article -> à", () => {
    assert.equal(dansLeDepartement("75"), "à Paris");
    assert.equal(dansLeDepartement("974"), "à La Reunion");
    assert.equal(dansLeDepartement("976"), "à Mayotte");
  });

  it("code inconnu -> chaîne vide", () => {
    assert.equal(dansLeDepartement("999"), "");
    assert.equal(dansLeDepartement(""), "");
  });

  it("normalise les codes à un chiffre", () => {
    assert.equal(dansLeDepartement("1"), "dans l'Ain");
    assert.equal(dansLeDepartement("2a"), "dans la Corse-du-Sud");
  });
});

describe("duDepartement", () => {
  it("masculin à consonne -> du", () => {
    assert.equal(duDepartement("14"), "du Calvados");
    assert.equal(duDepartement("59"), "du Nord");
  });

  it("féminin à consonne -> de la", () => {
    assert.equal(duDepartement("50"), "de la Manche");
    assert.equal(duDepartement("2A"), "de la Corse-du-Sud");
    assert.equal(duDepartement("2B"), "de la Haute-Corse");
  });

  it("initiale vocalique -> de l'", () => {
    assert.equal(duDepartement("01"), "de l'Ain");
    assert.equal(duDepartement("34"), "de l'Herault");
    assert.equal(duDepartement("28"), "de l'Eure-et-Loir");
    assert.equal(duDepartement("89"), "de l'Yonne");
  });

  it("pluriel -> des", () => {
    assert.equal(duDepartement("40"), "des Landes");
    assert.equal(duDepartement("92"), "des Hauts-de-Seine");
    assert.equal(duDepartement("78"), "des Yvelines");
  });

  it("Guadeloupe / Martinique / Guyane -> de (forme naturelle)", () => {
    assert.equal(duDepartement("971"), "de Guadeloupe");
    assert.equal(duDepartement("972"), "de Martinique");
    assert.equal(duDepartement("973"), "de Guyane");
  });

  it("Paris / La Reunion / Mayotte sans article -> de", () => {
    assert.equal(duDepartement("75"), "de Paris");
    assert.equal(duDepartement("974"), "de La Reunion");
    assert.equal(duDepartement("976"), "de Mayotte");
  });

  it("code inconnu -> chaîne vide", () => {
    assert.equal(duDepartement("999"), "");
  });
});

describe("couverture exhaustive", () => {
  it("chaque département a un complément de lieu et de nom non vide", () => {
    for (const code of getAllDepartementCodes()) {
      assert.notEqual(dansLeDepartement(code), "", `dansLeDepartement(${code}) vide`);
      assert.notEqual(duDepartement(code), "", `duDepartement(${code}) vide`);
    }
  });
});
