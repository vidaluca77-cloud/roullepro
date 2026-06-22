/**
 * Wrapper d'execution de la purge + reimport FINESS a travers le proxy interne.
 *
 * Contexte : dans le sandbox, l'ecriture Supabase se fait via un proxy HTTPS
 * interne qui reecrit l'en-tete Authorization (la cle anon transmise est elevee
 * en service_role par le proxy). On installe donc un dispatcher undici
 * (ProxyAgent) base sur HTTPS_PROXY, puis on lance le reimport.
 *
 * Variables d'env :
 *   HTTPS_PROXY               URL du proxy interne (ex http://127.0.0.1:8080).
 *   NEXT_PUBLIC_SUPABASE_URL  URL du projet Supabase.
 *   SUPABASE_SERVICE_ROLE_KEY cle envoyee (peut etre la cle anon : le proxy l'eleve
 *                             en service_role). A defaut, SUPABASE_ANON_KEY est utilisee.
 *
 * Usage :
 *   HTTPS_PROXY=... SUPABASE_SERVICE_ROLE_KEY=<anon|service> \
 *     npx tsx scripts/import-finess-via-proxy.ts [--dry-run] [--force]
 */

import { repurgeEtReimport } from "./repurge-and-reimport-finess";

function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log("[import-finess-via-proxy]", ...args);
}

// Installe le dispatcher proxy via undici (import dynamique : undici n'est pas
// une dependance directe, il est fourni par le runtime Node >= 18). Si le paquet
// n'est pas resoluble, on continue en connexion directe.
async function installerProxy(proxyUrl: string): Promise<boolean> {
  try {
    // Specifier non litteral : evite la resolution statique par tsc (undici
    // n'est pas une dependance directe, il est fourni par le runtime Node).
    const specifier = "undici";
    const undici = (await import(specifier)) as {
      setGlobalDispatcher: (d: unknown) => void;
      ProxyAgent: new (url: string) => unknown;
    };
    undici.setGlobalDispatcher(new undici.ProxyAgent(proxyUrl));
    return true;
  } catch {
    log("Paquet undici introuvable : impossible d'installer le ProxyAgent.");
    return false;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const forceRefresh = process.argv.includes("--force");

  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy;

  if (proxyUrl) {
    const ok = await installerProxy(proxyUrl);
    if (ok) log(`Proxy actif : ${proxyUrl}`);
  } else {
    log("Aucun HTTPS_PROXY defini : connexion directe a Supabase.");
  }

  // Le proxy interne eleve la cle anon en service_role. Si aucune cle service
  // n'est fournie explicitement, on retombe sur la cle anon publique.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    log("SUPABASE_SERVICE_ROLE_KEY absente : utilisation de la cle anon (elevation via proxy).");
  }

  await repurgeEtReimport({ dryRun, forceRefresh });
  log("Termine.");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[import-finess-via-proxy] Echec :", err instanceof Error ? err.stack : err);
  process.exit(1);
});
