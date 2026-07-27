import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SEO_CITY_CONTENT,
  getCityCategoryContent,
  segmenterParagraphe,
} from "./seo-city-content";

/**
 * Les 95 couples ville x categorie effectivement servis en production
 * (source : audit Search Console du 27/07). Chacun doit avoir une entree
 * editoriale redigee a la main : le generateur de repli de seo-city-data ne
 * suffit pas sur ces pages, toutes positionnees en striking distance.
 */
const COMBOS_ATTENDUS = [
  "abymes/ambulance",
  "les-abymes/taxi-conventionne",
  "ambres/taxi-conventionne",
  "amiens/ambulance",
  "amiens/taxi-conventionne",
  "amiens/vsl",
  "antibes/ambulance",
  "antibes/taxi-conventionne",
  "aureilhan/ambulance",
  "aureilhan/taxi-conventionne",
  "bayeux/ambulance",
  "bayeux/taxi-conventionne",
  "beziers/ambulance",
  "beziers/taxi-conventionne",
  "borderes-sur-lechez/taxi-conventionne",
  "boulogne-sur-mer/ambulance",
  "boulogne-sur-mer/taxi-conventionne",
  "brest/ambulance",
  "brest/taxi-conventionne",
  "caen/ambulance",
  "caen/taxi-conventionne",
  "clermont-ferrand/ambulance",
  "clermont-ferrand/taxi-conventionne",
  "dijon/ambulance",
  "dijon/taxi-conventionne",
  "ducos/ambulance",
  "ducos/taxi-conventionne",
  "estrablin/taxi-conventionne",
  "gennevilliers/ambulance",
  "gennevilliers/taxi-conventionne",
  "guerande/ambulance",
  "guerande/taxi-conventionne",
  "hyeres/ambulance",
  "hyeres/taxi-conventionne",
  "kourou/ambulance",
  "kourou/taxi-conventionne",
  "la-seyne-sur-mer/ambulance",
  "la-seyne-sur-mer/taxi-conventionne",
  "le-chambon-feugerolles/ambulance",
  "le-chambon-feugerolles/taxi-conventionne",
  "le-tampon/ambulance",
  "le-tampon/taxi-conventionne",
  "le-vigan/ambulance",
  "le-vigan/taxi-conventionne",
  "longvic/ambulance",
  "longvic/taxi-conventionne",
  "lunel/ambulance",
  "lunel/taxi-conventionne",
  "marseille/ambulance",
  "marseille/taxi-conventionne",
  "maze-milon/taxi-conventionne",
  "mehun-sur-yevre/ambulance",
  "mehun-sur-yevre/taxi-conventionne",
  "montpellier/ambulance",
  "montpellier/taxi-conventionne",
  "narbonne/ambulance",
  "narbonne/taxi-conventionne",
  "nice/ambulance",
  "nice/taxi-conventionne",
  "nimes/ambulance",
  "nimes/taxi-conventionne",
  "paris/ambulance",
  "paris/taxi-conventionne",
  "peille/taxi-conventionne",
  "reims/ambulance",
  "reims/taxi-conventionne",
  "reims/vsl",
  "rohrbach-les-bitche/ambulance",
  "saint-andre/ambulance",
  "saint-andre/taxi-conventionne",
  "saint-denis/ambulance",
  "saint-denis/taxi-conventionne",
  "saint-denis/vsl",
  "saint-jean-le-blanc/ambulance",
  "saint-jean-le-blanc/taxi-conventionne",
  "saint-joseph/ambulance",
  "saint-joseph/taxi-conventionne",
  "saint-louis/ambulance",
  "saint-louis/taxi-conventionne",
  "saint-louis/vsl",
  "saint-paul/ambulance",
  "saint-paul/taxi-conventionne",
  "saint-pierre/ambulance",
  "saint-pierre/taxi-conventionne",
  "saint-raphael/ambulance",
  "saint-raphael/taxi-conventionne",
  "savouges/taxi-conventionne",
  "strasbourg/ambulance",
  "strasbourg/taxi-conventionne",
  "strasbourg/vsl",
  "thionville/ambulance",
  "thionville/taxi-conventionne",
  "thionville/vsl",
  "toulouse/ambulance",
  "toulouse/taxi-conventionne",
  "vignot/taxi-conventionne",
];

test("les 95 combos prioritaires (+1 correction de slug) ont une entree editoriale dediee", () => {
  const manquants = COMBOS_ATTENDUS.filter((cle) => !SEO_CITY_CONTENT[cle]);
  assert.deepEqual(manquants, [], `entrees manquantes : ${manquants.join(", ")}`);
  // 95 combos du brief initial + "les-abymes/taxi-conventionne" ajoutee apres
  // verification Supabase : le slug de production "les-abymes" (17 taxis actifs,
  // ~50 impressions GSC cumulees) differe du slug "abymes" (2 ambulances, 258
  // impressions) deja couvert par le brief. Les deux slugs coexistent en base.
  assert.equal(COMBOS_ATTENDUS.length, 96);
});

test("chaque entree respecte le format attendu par le hub", () => {
  for (const [cle, contenu] of Object.entries(SEO_CITY_CONTENT)) {
    assert.equal(contenu.intro.length, 3, `${cle} : il faut 3 paragraphes d'intro`);
    // Les 95 combos prioritaires sont redigees a la cible du brief (80-120
    // mots) ; les entrees historiques restent tolerees plus courtes.
    const plancher = COMBOS_ATTENDUS.includes(cle) ? 70 : 45;
    for (const p of contenu.intro) {
      const mots = p.trim().split(/\s+/).length;
      assert.ok(mots >= plancher && mots <= 170, `${cle} : paragraphe de ${mots} mots`);
    }
    assert.ok(
      contenu.voisines.length >= 3 && contenu.voisines.length <= 8,
      `${cle} : ${contenu.voisines.length} voisines`
    );
    assert.ok(
      contenu.faq.length >= 2 && contenu.faq.length <= 4,
      `${cle} : ${contenu.faq.length} questions`
    );
    for (const q of contenu.faq) {
      assert.ok(q.question.trim().endsWith("?"), `${cle} : question sans point d'interrogation`);
      assert.ok(q.answer.trim().length > 80, `${cle} : reponse trop courte`);
    }
  }
});

test("les slugs de voisines sont normalises et ne pointent pas sur la ville elle-meme", () => {
  for (const [cle, contenu] of Object.entries(SEO_CITY_CONTENT)) {
    const villeSlug = cle.split("/")[0];
    const vus = new Set<string>();
    for (const v of contenu.voisines) {
      assert.match(v.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${cle} : slug invalide ${v.slug}`);
      assert.notEqual(v.slug, villeSlug, `${cle} : se lie a elle-meme`);
      assert.ok(!vus.has(v.slug), `${cle} : voisine dupliquee ${v.slug}`);
      vus.add(v.slug);
      assert.ok(v.nom.trim().length > 0, `${cle} : voisine sans nom`);
      assert.ok(!v.nom.includes("("), `${cle} : parenthese dans le nom ${v.nom}`);
    }
  }
});

test("aucune ATSU n'est nommee : la donnee est non verifiee pour toutes les villes", () => {
  // Regle du brief : citer une ATSU nominativement reviendrait a publier une
  // information qu'aucune source n'a permis de confirmer.
  for (const [cle, contenu] of Object.entries(SEO_CITY_CONTENT)) {
    const texte = [
      ...contenu.intro,
      ...contenu.faq.flatMap((q) => [q.question, q.answer]),
    ].join(" ");
    assert.ok(!/ATSU/i.test(texte), `${cle} : mention d'une ATSU`);
  }
});

test("le contenu editorial prime sur le generateur de repli", () => {
  const cle = COMBOS_ATTENDUS[0];
  const [ville, categorie] = cle.split("/");
  assert.equal(getCityCategoryContent(ville, categorie), SEO_CITY_CONTENT[cle]);
});

test("chaque page cite le taux de remboursement de sa propre categorie", () => {
  // Un taxi conventionne rembourse a 65 % hors ALD, une ambulance a 55 % :
  // publier le mauvais taux serait une erreur factuelle opposable.
  for (const [cle, contenu] of Object.entries(SEO_CITY_CONTENT)) {
    const categorie = cle.split("/")[1];
    const texte = [...contenu.intro, ...contenu.faq.map((q) => q.answer)].join(" ");
    const attendu = categorie === "ambulance" ? "55 %" : "65 %";
    assert.ok(texte.includes(attendu), `${cle} : taux ${attendu} absent`);
    assert.ok(texte.includes("100 %"), `${cle} : taux ALD absent`);
  }
});

test("chaque etablissement lie cite un nom present tel quel dans l'intro", () => {
  // Le rendu remplace une sous-chaine exacte du paragraphe : si le nom derive du
  // texte, le lien disparait silencieusement sans qu'aucune page ne casse.
  for (const [cle, contenu] of Object.entries(SEO_CITY_CONTENT)) {
    if (!contenu.etablissements) continue;
    assert.ok(contenu.etablissements.length > 0, `${cle} : champ etablissements vide`);
    for (const e of contenu.etablissements) {
      assert.match(e.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${cle} : slug invalide ${e.slug}`);
      assert.ok(
        contenu.intro.some((p) => p.includes(e.nom)),
        `${cle} : "${e.nom}" absent des paragraphes d'intro`
      );
    }
  }
});

test("segmenterParagraphe rend le texte inchange sans etablissements", () => {
  const p = "Le CHU de Nice compte trois sites.";
  assert.deepEqual(segmenterParagraphe(p, undefined), [{ texte: p }]);
  assert.deepEqual(segmenterParagraphe(p, []), [{ texte: p }]);
});

test("segmenterParagraphe isole la mention et conserve le texte integral", () => {
  const p = "Les urgences de l'hôpital Pasteur accueillent les patients.";
  const segments = segmenterParagraphe(p, [
    { nom: "hôpital Pasteur", slug: "chu-de-nice-hopital-pasteur-06" },
  ]);
  assert.deepEqual(segments, [
    { texte: "Les urgences de l'" },
    { texte: "hôpital Pasteur", slug: "chu-de-nice-hopital-pasteur-06" },
    { texte: " accueillent les patients." },
  ]);
  assert.equal(segments.map((s) => s.texte).join(""), p);
});

test("segmenterParagraphe ne lie que la premiere occurrence d'un meme slug", () => {
  const p = "L'hôpital Nord puis l'hôpital Nord de nouveau.";
  const segments = segmenterParagraphe(p, [
    { nom: "hôpital Nord", slug: "aphm-hopital-nord-13" },
  ]);
  assert.equal(segments.filter((s) => s.slug).length, 1);
  assert.equal(segments.map((s) => s.texte).join(""), p);
});

test("segmenterParagraphe privilegie le nom le plus long en cas d'imbrication", () => {
  const p = "L'Hôpital Renée Sabran de Giens dispose d'un plateau technique.";
  const segments = segmenterParagraphe(p, [
    { nom: "Hôpital Renée Sabran", slug: "hopital-renee-sabran-hyeres-83" },
    { nom: "Hôpital Renée Sabran de Giens", slug: "hopital-renee-sabran-hyeres-83" },
  ]);
  const lies = segments.filter((s) => s.slug);
  assert.equal(lies.length, 1);
  assert.equal(lies[0].texte, "Hôpital Renée Sabran de Giens");
  assert.equal(segments.map((s) => s.texte).join(""), p);
});

test("segmenterParagraphe laisse le texte intact quand aucun nom ne correspond", () => {
  const p = "Aucun etablissement n'est cite ici.";
  assert.deepEqual(
    segmenterParagraphe(p, [{ nom: "hôpital Cochin", slug: "x-75" }]),
    [{ texte: p }]
  );
});

test("le rendu concatene des segments reconstitue chaque paragraphe publie", () => {
  for (const [cle, contenu] of Object.entries(SEO_CITY_CONTENT)) {
    for (const p of contenu.intro) {
      const segments = segmenterParagraphe(p, contenu.etablissements);
      assert.equal(segments.map((s) => s.texte).join(""), p, `${cle} : paragraphe altere`);
    }
  }
});

// Le tsconfig cible ES5 : pas de classes Unicode \p{L}, on enumere les plages.
const ALPHANUM = /[0-9A-Za-z\u00C0-\u024F]/;

test("aucun lien ne coupe un mot en deux", () => {
  // Un nom mal choisi ("Institut" seul) produirait un lien au milieu d'un mot :
  // la mention liee doit toujours etre bordee par une frontiere de mot.
  for (const [cle, contenu] of Object.entries(SEO_CITY_CONTENT)) {
    if (!contenu.etablissements) continue;
    for (const p of contenu.intro) {
      let pos = 0;
      for (const seg of segmenterParagraphe(p, contenu.etablissements)) {
        if (seg.slug) {
          const avant = pos > 0 ? p[pos - 1] : " ";
          const apres = pos + seg.texte.length < p.length ? p[pos + seg.texte.length] : " ";
          assert.ok(
            !ALPHANUM.test(avant) && !ALPHANUM.test(apres),
            `${cle} : "${seg.texte}" coupe un mot`
          );
        }
        pos += seg.texte.length;
      }
    }
  }
});
