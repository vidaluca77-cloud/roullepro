/**
 * Purge + reimport propre du referentiel FINESS (etablissements_sante).
 *
 * Objectif : repartir d'un import sain apres durcissement de la whitelist
 * categetab (7 familles transport CPAM) et generation de nom_affichage /
 * search_aliases. On supprime les fiches FINESS existantes puis on reinjecte
 * les lignes filtrees du CSV.
 *
 * Protection absolue :
 *   - Seules les fiches `source = 'finess'` sont supprimees ; les fiches
 *     creees/reclamees par des pros (autre source) ne sont jamais touchees.
 *   - La fiche Etienne PETIT (id 4275105a-4d45-46fd-9012-6701f1c9ea81) est
 *     exclue de la suppression par garde-fou explicite.
 *
 * Usage :
 *   npx tsx scripts/repurge-and-reimport-finess.ts --dry-run   # parse + stats, AUCUN write
 *   npx tsx scripts/repurge-and-reimport-finess.ts             # purge + reimport reel
 *
 * Le reimport reel exige NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 * (ou execution via scripts/import-finess-via-proxy.ts).
 */

import { createClient } from "@supabase/supabase-js";
import {
  telechargerCsv,
  parserEtFiltrer,
  type FinessRow,
} from "@/lib/finess-import";

// Fiche a ne jamais supprimer/modifier (regle metier absolue).
const ETIENNE_PETIT_ID = "4275105a-4d45-46fd-9012-6701f1c9ea81";

function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log("[repurge-finess]", ...args);
}

function compterParCategorie(rows: FinessRow[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of rows) {
    counts[r.categorie_simple] = (counts[r.categorie_simple] || 0) + 1;
  }
  return counts;
}

/** Affiche quelques exemples de nom_affichage pour controle visuel. */
function exemplesNomAffichage(rows: FinessRow[]) {
  const trouve = (predicat: (r: FinessRow) => boolean) => rows.find(predicat);
  const cas: Array<[string, FinessRow | undefined]> = [
    ["CHU Caen (cote de nacre)", trouve((r) => /cote de nacre/i.test(r.raison_sociale) && /caen/i.test(r.ville || ""))],
    ["Pitie-Salpetriere", trouve((r) => /pitie salpetriere/i.test(r.raison_sociale))],
    ["Cochin", trouve((r) => /cochin/i.test(r.raison_sociale) && /aphp/i.test(r.raison_sociale))],
    ["Hopital (CH) local", trouve((r) => r.categorie_simple === "hopital" && /^centre hospitalier\b/i.test(r.raison_sociale))],
    ["EHPAD", trouve((r) => r.categorie_simple === "ehpad")],
  ];
  log("Exemples de nom_affichage genere :");
  for (const [label, row] of cas) {
    if (row) {
      // eslint-disable-next-line no-console
      console.log(`   - ${label}: "${row.raison_sociale}" -> "${row.nom_affichage}"`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`   - ${label}: (aucune ligne correspondante)`);
    }
  }
}

export async function repurgeEtReimport(options?: {
  dryRun?: boolean;
  forceRefresh?: boolean;
}): Promise<void> {
  const dryRun = options?.dryRun ?? false;

  const csv = await telechargerCsv(options?.forceRefresh);
  const sourceDate = new Date().toISOString().slice(0, 10);
  const rows = parserEtFiltrer(csv, sourceDate);

  const counts = compterParCategorie(rows);
  log(`Lignes retenues : ${rows.length}`);
  log("Repartition par categorie_simple :", JSON.stringify(counts, null, 2));
  exemplesNomAffichage(rows);

  if (dryRun) {
    log("Mode --dry-run : aucune ecriture en base.");
    return;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis pour le reimport reel."
    );
  }
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Purge des fiches FINESS (jamais les fiches d'autres sources, jamais Etienne PETIT).
  log("Suppression des fiches source='finess' (hors fiche protegee)...");
  const { error: delError } = await supabase
    .from("etablissements_sante")
    .delete()
    .eq("source", "finess")
    .neq("id", ETIENNE_PETIT_ID);
  if (delError) {
    throw new Error(`Echec de la purge FINESS : ${delError.message}`);
  }

  // 2. Reinjection par lots de 500 (UPSERT par finess_geo).
  let upserts = 0;
  let erreurs = 0;
  const LOT = 500;
  for (let i = 0; i < rows.length; i += LOT) {
    const lot = rows.slice(i, i + LOT);
    const { error } = await supabase
      .from("etablissements_sante")
      .upsert(lot, { onConflict: "finess_geo" });
    if (error) {
      erreurs += lot.length;
      log(`Erreur UPSERT lot ${i / LOT} : ${error.message}`);
    } else {
      upserts += lot.length;
    }
    log(`UPSERT ${Math.min(i + LOT, rows.length)}/${rows.length}`);
  }

  log(`Reimport termine : ${upserts} fiches inserees, ${erreurs} erreurs.`);
  log("Repartition finale (theorique) :", JSON.stringify(counts, null, 2));
}

// Entree CLI directe.
const estCli = typeof require !== "undefined" && require.main === module;
if (estCli) {
  const dryRun = process.argv.includes("--dry-run");
  const forceRefresh = process.argv.includes("--force");
  repurgeEtReimport({ dryRun, forceRefresh })
    .then(() => {
      log("Fini.");
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[repurge-finess] Echec :", err instanceof Error ? err.stack : err);
      process.exit(1);
    });
}
