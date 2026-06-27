import { NextResponse } from "next/server";
import {
  BASE_URL,
  countSanitaireFichesChunks,
  countEtablissementsChunks,
} from "@/lib/sitemap-builders";

export const revalidate = 3600;

export async function GET() {
  // Comptes dynamiques : on ne declare que les shards qui contiennent reellement
  // des URLs, pour ne jamais exposer de sitemap vide a Google.
  const [fichesChunks, etabChunks] = await Promise.all([
    countSanitaireFichesChunks(),
    countEtablissementsChunks(),
  ]);

  const lastmod = new Date().toISOString();
  const locs: string[] = [];

  // 0 : pages statiques / 1 : villes sanitaire
  locs.push(`${BASE_URL}/sitemaps/0.xml`);
  locs.push(`${BASE_URL}/sitemaps/1.xml`);

  // 2..N : fiches pros sanitaire paginees (nombre reel de chunks)
  for (let i = 0; i < fichesChunks; i += 1) {
    locs.push(`${BASE_URL}/sitemaps/${2 + i}.xml`);
  }

  // Etablissements FINESS et pages "transport vers".
  // IMPORTANT : on declare les chunks DIRECTEMENT ici. Un sitemapindex ne peut pas
  // pointer vers un autre sitemapindex (protocole sitemaps.org) : Google ignore les
  // index imbriques. Les anciennes routes /sitemaps/etablissements.xml renvoyaient un
  // index imbrique, d'ou des pages jamais decouvertes.
  for (let i = 0; i < etabChunks; i += 1) {
    locs.push(`${BASE_URL}/sitemaps/etablissements-${i}.xml`);
  }
  for (let i = 0; i < etabChunks; i += 1) {
    locs.push(`${BASE_URL}/sitemaps/transport-vers-${i}.xml`);
  }

  // Sitemaps nommes (contenu editorial : plats, pas d'index imbrique).
  locs.push(`${BASE_URL}/sitemaps/reg-alerts.xml`);
  locs.push(`${BASE_URL}/sitemaps/guides.xml`);

  const items = locs
    .map(
      (loc) => `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>
`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
