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

// Codes categorie FINESS a conserver, mappes vers un groupe SEO simplifie
// (categorie_simple). On accepte deux espaces de codes :
//   - le code d'agregation (categagretab), plus stable et large ;
//   - le code categorie d'etablissement (categetab), plus fin.
// Le filtrage teste les deux (agregation prioritaire) afin de couvrir un
// maximum d'etablissements sans casser les categories deja importees.
export const CATEGORIE_FINESS_MAP: Record<string, string> = {
  // Hopitaux (codes d'agregation)
  "1101": "hopital", // Centre Hospitalier Universitaire (CHU)
  "1102": "hopital", // Centre Hospitalier (CH)
  "1103": "hopital", // Autre etablissement hospitalier rattache
  // Cliniques
  "365": "clinique", // Etablissement de Soins Pluridisciplinaire (clinique MCO privee)
  "122": "clinique", // Centre Hospitalier prive / clinique
  "412": "clinique", // Etablissement de soins chirurgicaux
  "800": "clinique", // Etablissement de soins medicaux
  "801": "clinique", // Etablissement de soins obstetricaux
  // EHPAD et hebergement personnes agees
  "500": "ehpad", // EHPAD
  "502": "ehpad", // Logement-foyer
  "355": "ehpad", // Maison de Repos et Convalescence
  "200": "ehpad", // Maison de retraite
  "202": "ehpad", // Maison de retraite (variante)
  "207": "ehpad", // Etablissement d'hebergement pour personnes agees
  "230": "ehpad", // Logement-foyer pour personnes agees
  "4101": "ehpad", // EHPAD (code categorie etablissement)
  "4102": "ehpad", // EHPA
  "4103": "ehpad", // Etablissement d'hebergement temporaire
  "4106": "ehpad", // Accueil de jour personnes agees
  // Centres de sante
  "437": "centre-sante", // Centre Medico-Psychologique (CMP)
  "124": "centre-sante", // Centre de sante
  "603": "centre-sante", // Centre de sante polyvalent
  "604": "centre-sante", // Centre de sante medical
  "605": "centre-sante", // Centre de sante infirmier
  // Dialyse
  "354": "centre-dialyse", // Centre de Dialyse / Autodialyse
  "138": "centre-dialyse", // Unite de dialyse
  "142": "centre-dialyse", // Centre d'hemodialyse
  "199": "centre-dialyse", // Autodialyse
  // Oncologie et readaptation
  "130": "centre-oncologie", // Etablissement de Lutte Contre le Cancer
  "156": "rehabilitation", // Etablissement de Readaptation Fonctionnelle
  "158": "rehabilitation", // Etablissement de Soins Longue Duree
};

// Libelles humains par code, pour remplir categorie_finess_libelle si absent du CSV.
const CATEGORIE_FINESS_LIBELLE: Record<string, string> = {
  "1101": "Centre Hospitalier Universitaire",
  "1102": "Centre Hospitalier",
  "1103": "Etablissement hospitalier",
  "365": "Etablissement de soins pluridisciplinaire",
  "122": "Clinique",
  "412": "Etablissement de soins chirurgicaux",
  "800": "Etablissement de soins medicaux",
  "801": "Etablissement de soins obstetricaux",
  "500": "EHPAD",
  "502": "Logement-foyer",
  "355": "Maison de repos et convalescence",
  "200": "Maison de retraite",
  "202": "Maison de retraite",
  "207": "Hebergement pour personnes agees",
  "230": "Logement-foyer pour personnes agees",
  "4101": "EHPAD",
  "4102": "EHPA",
  "4103": "Hebergement temporaire personnes agees",
  "4106": "Accueil de jour personnes agees",
  "437": "Centre medico-psychologique",
  "124": "Centre de sante",
  "603": "Centre de sante polyvalent",
  "604": "Centre de sante medical",
  "605": "Centre de sante infirmier",
  "354": "Centre de dialyse",
  "138": "Unite de dialyse",
  "142": "Centre d'hemodialyse",
  "199": "Autodialyse",
  "130": "Etablissement de lutte contre le cancer",
  "156": "Etablissement de readaptation fonctionnelle",
  "158": "Etablissement de soins longue duree",
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
    // On teste d'abord le code d'agregation (categagretab), puis, a defaut,
    // le code categorie d'etablissement (categetab) plus fin. Le premier qui
    // correspond a CATEGORIE_FINESS_MAP determine la categorie_simple.
    const codeAgreg = (r.categagretab || r.categagr || "").trim();
    const codeCat = (r.categetab || r.categ || "").trim();
    const codeMatch = CATEGORIE_FINESS_MAP[codeAgreg]
      ? codeAgreg
      : CATEGORIE_FINESS_MAP[codeCat]
        ? codeCat
        : "";
    if (!codeMatch) continue;

    const finessGeo = (r.nofiness || r.nofiness_et || "").trim();
    if (!finessGeo) continue;

    const raisonSociale = (r.rslongue || r.rs || "").trim();
    if (!raisonSociale) continue;

    const departement = (r.departement || "").trim() || null;
    const ville = (r.commune || r.ligneacheminement || "").trim() || null;
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

    retenus.push({
      finess_geo: finessGeo,
      finess_juri: (r.nofinessej || "").trim() || null,
      raison_sociale: raisonSociale,
      nom_court: genererNomCourt(raisonSociale),
      slug,
      categorie_finess_code: codeMatch,
      categorie_finess_libelle:
        (r.libcategagretab || "").trim() ||
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
