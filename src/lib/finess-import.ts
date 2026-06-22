/**
 * Logique partagee d'import du referentiel FINESS (etablissements de sante).
 *
 * Source : fichier CSV data.gouv.fr "Extraction du fichier des etablissements"
 * (fichier t-finess.csv), publie sous Licence Ouverte 2.0.
 *
 * Ce module est utilise a la fois par :
 *   - scripts/import-finess.ts (run manuel via `npx tsx scripts/import-finess.ts`)
 *   - netlify/functions/etab-refresh-finess.ts (refresh mensuel planifie)
 *
 * Il n'execute rien a l'import : on appelle explicitement `runFinessImport()`.
 */

import fs from "fs";
import os from "os";
import path from "path";
import { parse } from "csv-parse/sync";
import slugify from "slugify";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// URL du fichier ressource t-finess.csv sur data.gouv.fr (dataset "FINESS -
// Extraction du fichier des etablissements", ressource CSV "Etablissements").
// L'URL de la ressource peut etre surchargee via la variable d'env FINESS_CSV_URL
// si data.gouv.fr change le lien.
export const FINESS_CSV_URL =
  process.env.FINESS_CSV_URL ||
  "https://www.data.gouv.fr/api/1/datasets/r/98f3161f-79ff-4f16-8f6a-6d571a80fea2";

// Cache local du CSV telecharge : valable 7 jours.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_FILE = path.join(os.tmpdir(), "roullepro-finess-cache.csv");

// Whitelist STRICTE par code categorie d'etablissement FINESS (colonne `categetab`).
// On ne conserve QUE les 7 familles pertinentes pour le transport sanitaire CPAM.
// Tout code absent de cette table est ignore a l'import (jamais insere) : cela
// exclut pharmacies (620), laboratoires (611), SSIAD (354), SESSAD (182), IME (183),
// ESAT (246), PMI (223), CMP (156), MECS (177), FAM/MAS/SAVS, ITEP (186), ecoles, etc.
//
// Les codes sont les VRAIS codes `categetab` du fichier FINESS (les codes 1101/1102/1103
// evoques ailleurs sont des codes d'agregation `categagretab`, non utilises ici).
export const CATEGORIE_FINESS_MAP: Record<string, string> = {
  // Hopitaux : Centre Hospitalier, CHR/CHU, Centre Hospitalier Specialise (psychiatrie).
  "355": "hopital", // Centre Hospitalier (C.H.)
  "101": "hopital", // Centre Hospitalier Regional (C.H.R. / C.H.U.)
  "292": "hopital", // Centre Hospitalier Specialise lutte Maladies Mentales
  // Cliniques privees.
  "365": "clinique", // Etablissement de Soins Pluridisciplinaire
  "122": "clinique", // Etablissement Soins Obstetriques Chirurgico-Gynecologiques
  // EHPAD (vrai EHPAD uniquement).
  "500": "ehpad", // Etablissement d'hebergement pour personnes agees dependantes
  // Centres de sante (vrai centre de sante uniquement).
  "124": "centre-sante", // Centre de Sante
  // Dialyse.
  "141": "centre-dialyse", // Centre de dialyse
  "146": "centre-dialyse", // Structure d'Alternative a la dialyse en centre
  // Readaptation / SSR.
  "109": "rehabilitation", // Etablissement de sante prive autorise en SSR
  // Maisons de sante pluriprofessionnelles.
  "603": "maison-sante", // Maison de sante (L.6223-3)
};

// Libelles humains par code categetab, pour remplir categorie_finess_libelle
// si le libelle CSV (libcategetab) est absent.
const CATEGORIE_FINESS_LIBELLE: Record<string, string> = {
  "355": "Centre Hospitalier",
  "101": "Centre Hospitalier Regional",
  "292": "Centre Hospitalier Specialise",
  "365": "Etablissement de soins pluridisciplinaire",
  "122": "Etablissement de soins chirurgicaux et obstetricaux",
  "500": "EHPAD",
  "124": "Centre de sante",
  "141": "Centre de dialyse",
  "146": "Structure d'alternative a la dialyse",
  "109": "Etablissement de soins de suite et readaptation",
  "603": "Maison de sante pluriprofessionnelle",
};

// Prefixes a retirer de la raison sociale pour produire un nom_court lisible
// (ex "Centre Hospitalier Universitaire de Caen" -> "de Caen" -> "Hopital de Caen"
// cote affichage). On retire le prefixe redondant, on garde le reste.
const PREFIXES_A_RETIRER = [
  "centre hospitalier universitaire",
  "centre hospitalier regional universitaire",
  "centre hospitalier regional",
  "centre hospitalier intercommunal",
  "centre hospitalier specialise",
  "centre hospitalier",
  "etablissement public de sante",
  "etablissement d'hebergement pour personnes agees dependantes",
  "clinique",
  "polyclinique",
  "hopital local",
  "hopital",
];

export type FinessRow = {
  finess_geo: string;
  finess_juri: string | null;
  raison_sociale: string;
  nom_court: string | null;
  nom_affichage: string;
  search_aliases: string;
  slug: string;
  categorie_finess_code: string | null;
  categorie_finess_libelle: string | null;
  categorie_simple: string;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  ville_slug: string | null;
  departement: string | null;
  region: string | null;
  latitude: number | null;
  longitude: number | null;
  telephone: string | null;
  site_web: string | null;
  capacite_lits: number | null;
  source: string;
  source_updated_at: string | null;
  actif: boolean;
};

export type ImportResult = {
  total_lignes_csv: number;
  retenus: number;
  upserts: number;
  desactives: number;
  erreurs: number;
  duree_ms: number;
};

function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log("[finess-import]", ...args);
}

/** Normalise une chaine pour comparaison (minuscule, sans accents). */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/** Genere un slug stable (lowercase, strict, locale fr). */
export function genererSlug(raisonSociale: string, departement: string | null): string {
  const base = `${raisonSociale} ${departement || ""}`.trim();
  return slugify(base, { lower: true, strict: true, locale: "fr" });
}

/** Genere un nom court en retirant les prefixes administratifs redondants. */
export function genererNomCourt(raisonSociale: string): string {
  const norm = normalize(raisonSociale);
  for (const prefixe of PREFIXES_A_RETIRER) {
    if (norm.startsWith(prefixe)) {
      // On retire la longueur du prefixe sur la chaine originale (en gardant la casse).
      const reste = raisonSociale.slice(prefixe.length).replace(/^[\s,'-]+/, "").trim();
      if (reste.length >= 3) return reste;
    }
  }
  return raisonSociale.trim();
}

// Mots conserves en minuscule lors de la capitalisation (sauf en tete de chaine).
const MOTS_MINUSCULES = new Set([
  "de", "du", "la", "le", "les", "des", "et", "sur", "en", "aux", "au",
  "d", "l", "a", "sous", "lez", "les", "ile", "the",
]);

// Restauration ciblee d'accents/typographie sur des noms connus
// (les donnees FINESS sont en majuscules non accentuees). Applique apres
// capitalisation, en remplacant la forme capitalisee par la forme propre.
const ACCENTS_CONNUS: Array<[RegExp, string]> = [
  [/\bC[ôo]te De Nacre\b/gi, "Côte de Nacre"],
  [/\bPitie[- ]?Salpetriere\b/gi, "Pitié-Salpêtrière"],
  [/\bSalpetriere\b/gi, "Salpêtrière"],
  [/\bHotel[- ]?Dieu\b/gi, "Hôtel-Dieu"],
  [/\bHopital\b/gi, "Hôpital"],
  [/\bHopitaux\b/gi, "Hôpitaux"],
  [/\bGeneral\b/gi, "Général"],
  [/\bRegional\b/gi, "Régional"],
  [/\bSaint /gi, "Saint-"],
  [/\bSainte /gi, "Sainte-"],
];

/** Capitalise proprement une chaine (mots de liaison conserves en minuscule). */
function capitaliserMots(s: string): string {
  return s
    .toLowerCase()
    .replace(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g, (mot: string, offset: number) => {
      if (offset > 0 && MOTS_MINUSCULES.has(mot)) return mot;
      return mot.charAt(0).toUpperCase() + mot.slice(1);
    });
}

/** Capitalise puis restaure les accents connus. */
function capitaliserAvecAccents(s: string): string {
  let out = capitaliserMots(s);
  for (const [re, val] of ACCENTS_CONNUS) out = out.replace(re, val);
  return out.replace(/\s+/g, " ").trim();
}

/**
 * Corps de nom apres un prefixe ("CHU", "Centre Hospitalier"...) : on capitalise
 * et on remet en minuscule un mot de liaison initial ("De Caen" -> "de Caen").
 */
function corpsApresPrefixe(reste: string): string {
  return capitaliserAvecAccents(reste).replace(
    /^(De|Du|Des|D'|La|Le|Les|L')\b/,
    (m) => m.toLowerCase()
  );
}

/**
 * Genere un nom d'affichage lisible a partir de la raison sociale FINESS brute.
 * Exemples :
 *   "CENTRE HOSPITALIER UNIVERSITAIRE  COTE DE NACRE" (Caen) -> "CHU Côte de Nacre (Caen)"
 *   "GHU APHP SORBONNE UNIVERSITE SITE PITIE SALPETRIERE" -> "Hôpital Pitié-Salpêtrière (AP-HP)"
 *   "GHU APHP CENTRE-UNIVERSITE PARIS CITE SITE COCHIN PORT ROYAL" -> "Hôpital Cochin (AP-HP)"
 */
export function genererNomAffichage(raisonSociale: string, ville: string | null): string {
  const nom = (raisonSociale || "").replace(/\s+/g, " ").trim();
  if (!nom) return "";
  const villeClean = (ville || "").trim();
  const villeAffichee = villeClean ? capitaliserAvecAccents(villeClean) : "";

  const ajouterVille = (base: string): string => {
    if (villeClean && !normalize(base).includes(normalize(villeClean))) {
      return `${base} (${villeAffichee})`;
    }
    return base;
  };

  // 1. AP-HP (Assistance Publique - Hopitaux de Paris).
  if (/\b(GHU\s+APHP|AP[- ]?HP|APHP)\b/i.test(nom)) {
    if (/COCHIN/i.test(nom)) return "Hôpital Cochin (AP-HP)";
    const siteMatch = nom.match(/\bSITE\s+(.+)$/i);
    if (siteMatch) {
      return `Hôpital ${capitaliserAvecAccents(siteMatch[1])} (AP-HP)`;
    }
    const reste = nom
      .replace(/\b(GHU\s+APHP|APHP|AP[- ]?HP)\b/gi, "")
      .replace(/\bSORBONNE UNIVERSITE\b/gi, "")
      .replace(/\bUNIVERSITE PARIS CITE\b/gi, "")
      .replace(/\bCENTRE[- ]UNIVERSITE\b/gi, "")
      .replace(/\b(USLD|SUN)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    if (reste.length >= 3) return `Hôpital ${capitaliserAvecAccents(reste)} (AP-HP)`;
    return "AP-HP";
  }

  // 2. CHR / CHU (Centre Hospitalier Regional / Universitaire).
  if (/CENTRE HOSPITALIER (REGIONAL )?UNIVERSITAIRE|C\.?H\.?R\.?U\.?|\bCHU\b/i.test(nom)) {
    const reste = nom
      .replace(/CENTRE HOSPITALIER REGIONAL UNIVERSITAIRE/gi, "")
      .replace(/CENTRE HOSPITALIER UNIVERSITAIRE/gi, "")
      .replace(/\bCHRU\b/gi, "")
      .replace(/\bCHU\b/gi, "")
      .replace(/^[\s,'-]+/, "")
      .replace(/\s+/g, " ")
      .trim();
    const corps = reste ? corpsApresPrefixe(reste) : "";
    return ajouterVille(corps ? `CHU ${corps}` : "CHU");
  }

  // 3. CHR seul.
  if (/CENTRE HOSPITALIER REGIONAL|\bCHR\b/i.test(nom)) {
    const reste = nom
      .replace(/CENTRE HOSPITALIER REGIONAL/gi, "")
      .replace(/\bCHR\b/gi, "")
      .replace(/^[\s,'-]+/, "")
      .replace(/\s+/g, " ")
      .trim();
    const corps = reste ? corpsApresPrefixe(reste) : "";
    return ajouterVille(corps ? `CHR ${corps}` : "CHR");
  }

  // 4. Centre Hospitalier Specialise (psychiatrie).
  if (/CENTRE HOSPITALIER SPECIALISE/i.test(nom)) {
    const reste = nom
      .replace(/CENTRE HOSPITALIER SPECIALISE/gi, "")
      .replace(/^[\s,'-]+/, "")
      .replace(/\s+/g, " ")
      .trim();
    const corps = reste ? corpsApresPrefixe(reste) : "";
    return ajouterVille(corps ? `CHS ${corps}` : "CHS");
  }

  // 5. Centre Hospitalier simple.
  if (/^CENTRE HOSPITALIER\b/i.test(nom)) {
    const reste = nom
      .replace(/^CENTRE HOSPITALIER/i, "")
      .replace(/^[\s,'-]+/, "")
      .replace(/\s+/g, " ")
      .trim();
    const corps = reste ? corpsApresPrefixe(reste) : "";
    return corps ? `Centre Hospitalier ${corps}` : "Centre Hospitalier";
  }

  // 6. EHPAD : on conserve l'acronyme en majuscules.
  if (/^EHPAD\b/i.test(nom)) {
    const reste = nom.replace(/^EHPAD/i, "").replace(/^[\s,'-]+/, "").trim();
    const corps = reste ? corpsApresPrefixe(reste) : "";
    return corps ? `EHPAD ${corps}` : "EHPAD";
  }

  // 7. Defaut : capitalisation propre + accents connus.
  return capitaliserAvecAccents(nom);
}

/**
 * Genere une chaine d'alias de recherche (concatenee, separateur " | ").
 * Contient : raison sociale, nom d'affichage, ville, leurs variantes sans
 * accents, plus des alias semantiques ("chu caen", "ap-hp pitie", "pitie"...).
 * Exploitee en ILIKE par /api/etablissements/search.
 */
export function genererSearchAliases(
  raisonSociale: string,
  nomAffichage: string,
  ville: string | null
): string {
  const parts = new Set<string>();
  const add = (v: string | null | undefined) => {
    if (!v) return;
    const t = v.toLowerCase().replace(/\s+/g, " ").trim();
    if (!t) return;
    parts.add(t);
    parts.add(normalize(t));
  };

  add(raisonSociale);
  add(nomAffichage);
  add(ville);

  const rsN = normalize(raisonSociale);
  const villeN = ville ? normalize(ville) : "";

  // Alias CHU / CHR bases sur la ville ("chu caen", "chu de caen", "chr caen").
  if (/centre hospitalier (regional )?universitaire|chru|\bchu\b/.test(rsN) && villeN) {
    add(`chu ${villeN}`);
    add(`chu de ${villeN}`);
  }
  if (/centre hospitalier regional|\bchr\b/.test(rsN) && villeN) {
    add(`chr ${villeN}`);
  }

  // Alias AP-HP par site ("ap-hp pitie salpetriere", "hopital cochin"...).
  if (/aphp|ap[- ]?hp/.test(rsN)) {
    const siteMatch = rsN.match(/\bsite\s+(.+)$/);
    if (siteMatch) {
      const site = siteMatch[1].trim();
      add(`ap-hp ${site}`);
      add(`aphp ${site}`);
      add(`hopital ${site}`);
    }
  }

  // Alias canoniques pour les sites emblematiques.
  if (/pitie salpetriere/.test(rsN)) {
    ["pitié", "pitie", "salpetriere", "salpêtrière", "pitié-salpêtrière", "pitie-salpetriere"].forEach(add);
  }
  if (/cochin/.test(rsN)) {
    ["cochin", "hopital cochin", "hôpital cochin"].forEach(add);
  }

  return Array.from(parts).join(" | ");
}

/** Telecharge le CSV FINESS avec cache local 7 jours. */
export async function telechargerCsv(forceRefresh = false): Promise<string> {
  if (!forceRefresh && fs.existsSync(CACHE_FILE)) {
    const age = Date.now() - fs.statSync(CACHE_FILE).mtimeMs;
    if (age < CACHE_TTL_MS) {
      log(`CSV depuis cache local (${Math.round(age / 1000 / 60)} min)`);
      return fs.readFileSync(CACHE_FILE, "utf-8");
    }
  }

  log(`Telechargement CSV FINESS depuis ${FINESS_CSV_URL}`);
  const res = await fetch(FINESS_CSV_URL);
  if (!res.ok) {
    throw new Error(`Echec telechargement FINESS : HTTP ${res.status}`);
  }
  const csv = await res.text();
  try {
    fs.writeFileSync(CACHE_FILE, csv, "utf-8");
    log(`CSV mis en cache : ${CACHE_FILE} (${Math.round(csv.length / 1024)} Ko)`);
  } catch (e) {
    log("Mise en cache impossible (non bloquant) :", e instanceof Error ? e.message : e);
  }
  return csv;
}

/**
 * Le fichier t-finess.csv utilise des enregistrements multi-lignes (structure
 * geographique + juridique) separes par ';'. On parse de facon defensive :
 * on accepte les en-tetes nommees si presentes, sinon on lit par index de colonne.
 *
 * Colonnes attendues (extraction etablissements data.gouv.fr) :
 *   nofiness, nofinessej, rs (raison sociale), rslongue, complrs, compldistrib,
 *   numvoie, typvoie, voie, compvoie, lieuditbp, commune, departement, libdepartement,
 *   ligneacheminement, telephone, telecopie, categetab, libcategetab,
 *   categagretab (code agregation), libcategagretab, ...
 *
 * On filtre sur categagretab (code d'agregation) contre CATEGORIE_FINESS_MAP.
 */
export function parserEtFiltrer(csv: string, sourceDate: string): FinessRow[] {
  const records: Record<string, string>[] = parse(csv, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    trim: true,
  });

  log(`CSV parse : ${records.length} enregistrements bruts`);

  const retenus: FinessRow[] = [];
  const slugsVus = new Map<string, number>();

  for (const r of records) {
    // Filtrage STRICT par code categorie d'etablissement (categetab) : on ne
    // conserve que les codes de la whitelist (7 familles transport CPAM). Tout
    // autre code (pharmacie, labo, SSIAD, IME, ESAT, PMI, CMP, MECS...) est ignore.
    const codeCat = (r.categetab || r.categ || "").trim();
    if (!CATEGORIE_FINESS_MAP[codeCat]) continue;
    const codeMatch = codeCat;

    const finessGeo = (r.nofiness || r.nofiness_et || "").trim();
    if (!finessGeo) continue;

    const raisonSociale = (r.rslongue || r.rs || "").trim();
    if (!raisonSociale) continue;

    const departement = (r.departement || "").trim() || null;
    // FINESS : la colonne "commune" contient le code commune INSEE local (3 chiffres),
    // pas le nom de la ville. Le nom est dans ligneacheminement sous la forme
    // "01440 VIRIAT" ou "06001 NICE CEDEX 1". On extrait la partie texte apres le CP.
    const ligneAch = (r.ligneacheminement || "").trim();
    const villeMatch = ligneAch.match(/^\d{5}\s+(.+?)(?:\s+CEDEX(?:\s+\d+)?)?$/i);
    let ville: string | null = villeMatch ? villeMatch[1].trim() : null;
    if (!ville && ligneAch) {
      // Fallback : si pas de pattern "CP NOM", garder la ligne entiere sans CP.
      ville = ligneAch.replace(/^\d{5}\s*/, "").trim() || null;
    }
    // Capitalisation propre : "NICE" -> "Nice", "SAINT-ETIENNE" -> "Saint-Etienne".
    if (ville) {
      ville = ville.toLowerCase().replace(/(^|[\s\-'])([a-zà-ÿ])/g, (_, sep, c) => sep + c.toUpperCase());
    }
    const villeSlug = ville ? slugify(ville, { lower: true, strict: true, locale: "fr" }) : null;

    // Construction de l'adresse depuis les composants de voie FINESS.
    const adresseParts = [r.numvoie, r.typvoie, r.voie, r.compvoie, r.lieuditbp]
      .map((p) => (p || "").trim())
      .filter(Boolean);
    const adresse = adresseParts.length ? adresseParts.join(" ") : null;

    const codePostal = (r.ligneacheminement || "").match(/\b(\d{5})\b/)?.[1] || null;

    const slugBase = genererSlug(raisonSociale, departement);
    const collision = slugsVus.get(slugBase) || 0;
    let slug = slugBase;
    if (collision > 0) slug = `${slugBase}-${collision + 1}`;
    slugsVus.set(slugBase, collision + 1);

    const lat = parseFloat((r.coordy || r.latitude || "").replace(",", ".")) || null;
    const lng = parseFloat((r.coordx || r.longitude || "").replace(",", ".")) || null;

    const nomAffichage = genererNomAffichage(raisonSociale, ville);
    const searchAliases = genererSearchAliases(raisonSociale, nomAffichage, ville);

    retenus.push({
      finess_geo: finessGeo,
      finess_juri: (r.nofinessej || "").trim() || null,
      raison_sociale: raisonSociale,
      nom_court: genererNomCourt(raisonSociale),
      nom_affichage: nomAffichage,
      search_aliases: searchAliases,
      slug,
      categorie_finess_code: codeMatch,
      categorie_finess_libelle:
        (r.libcategetab || "").trim() ||
        CATEGORIE_FINESS_LIBELLE[codeMatch] ||
        null,
      categorie_simple: CATEGORIE_FINESS_MAP[codeMatch],
      adresse,
      code_postal: codePostal,
      ville,
      ville_slug: villeSlug,
      departement,
      region: null,
      latitude: lat,
      longitude: lng,
      telephone: (r.telephone || "").trim() || null,
      site_web: null,
      capacite_lits: null,
      source: "finess",
      source_updated_at: sourceDate,
      actif: true,
    });
  }

  log(`${retenus.length} etablissements retenus apres filtrage categorie`);
  return retenus;
}

function adminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis pour l'import FINESS"
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Execute l'import complet : telechargement, parsing, UPSERT par finess_geo,
 * puis desactivation des fiches disparues du dump. Ne s'execute QUE si appele
 * explicitement (jamais a l'import du module).
 */
export async function runFinessImport(options?: { forceRefresh?: boolean }): Promise<ImportResult> {
  const debut = Date.now();
  const sourceDate = new Date().toISOString().slice(0, 10);

  const csv = await telechargerCsv(options?.forceRefresh);
  const rows = parserEtFiltrer(csv, sourceDate);
  const totalCsv = csv.split("\n").length - 1;

  const supabase = adminClient();
  let upserts = 0;
  let erreurs = 0;

  // UPSERT par lots de 500 pour limiter la taille des requetes.
  const LOT = 500;
  for (let i = 0; i < rows.length; i += LOT) {
    const lot = rows.slice(i, i + LOT);
    const { error } = await supabase
      .from("etablissements_sante")
      .upsert(lot, { onConflict: "finess_geo" });
    if (error) {
      erreurs += lot.length;
      log(`Erreur UPSERT lot ${i / LOT} :`, error.message);
    } else {
      upserts += lot.length;
    }
    log(`UPSERT ${Math.min(i + LOT, rows.length)}/${rows.length}`);
  }

  // Desactivation des fiches dont le finess_geo n'apparait plus dans ce dump.
  const finessVus = rows.map((r) => r.finess_geo);
  let desactives = 0;
  if (finessVus.length > 0) {
    const { data, error } = await supabase
      .from("etablissements_sante")
      .update({ actif: false, updated_at: new Date().toISOString() })
      .eq("actif", true)
      .not("finess_geo", "in", `(${finessVus.map((f) => `"${f}"`).join(",")})`)
      .select("id");
    if (error) {
      log("Erreur desactivation des disparus :", error.message);
    } else {
      desactives = data?.length ?? 0;
    }
  }

  const result: ImportResult = {
    total_lignes_csv: totalCsv,
    retenus: rows.length,
    upserts,
    desactives,
    erreurs,
    duree_ms: Date.now() - debut,
  };

  log("Resume import :", JSON.stringify(result, null, 2));
  return result;
}
