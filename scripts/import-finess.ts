/**
 * Script d'import manuel du referentiel FINESS (etablissements de sante).
 *
 * Usage :
 *   npx tsx scripts/import-finess.ts            # import normal (cache CSV 7 jours)
 *   npx tsx scripts/import-finess.ts --force    # force le re-telechargement du CSV
 *
 * Variables d'env requises :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 * Variable d'env facultative :
 *   FINESS_CSV_URL  (surcharge l'URL de la ressource data.gouv.fr)
 *
 * Ce script ne fait qu'appeler runFinessImport() : toute la logique vit dans
 * src/lib/finess-import.ts (partagee avec la fonction planifiee Netlify).
 */

import { runFinessImport } from "@/lib/finess-import";

async function main() {
  const forceRefresh = process.argv.includes("--force");
  // eslint-disable-next-line no-console
  console.log(
    `[import-finess] Demarrage de l'import FINESS${forceRefresh ? " (--force)" : ""}`
  );

  const result = await runFinessImport({ forceRefresh });

  // eslint-disable-next-line no-console
  console.log("[import-finess] Termine.");
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(result, null, 2));

  if (result.erreurs > 0) {
    // eslint-disable-next-line no-console
    console.error(`[import-finess] ${result.erreurs} ligne(s) en erreur.`);
    process.exit(1);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[import-finess] Echec :", err instanceof Error ? err.stack : err);
  process.exit(1);
});
