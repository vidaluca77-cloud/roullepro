import { NextResponse } from "next/server";
import {
  buildXml,
  buildStaticEntries,
  buildSanitaireVillesEntries,
  buildSanitaireFichesEntries,
  SANITAIRE_FICHES_CHUNKS,
} from "@/lib/sitemap-builders";

export const revalidate = 3600;
export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateStaticParams() {
  const ids = ["0", "1"];
  for (let i = 0; i < SANITAIRE_FICHES_CHUNKS; i += 1) {
    ids.push(String(2 + i));
  }
  return ids.map((id) => ({ id }));
}

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id: rawId } = await params;
  // Accepte "0", "0.xml", "10.xml"
  const cleaned = rawId.replace(/\.xml$/i, "");
  const id = Number.parseInt(cleaned, 10);

  if (!Number.isFinite(id) || id < 0) {
    return new NextResponse("Invalid sitemap id", { status: 404 });
  }

  let entries;
  if (id === 0) {
    entries = await buildStaticEntries();
  } else if (id === 1) {
    entries = await buildSanitaireVillesEntries();
  } else if (id >= 2 && id < 2 + SANITAIRE_FICHES_CHUNKS) {
    entries = await buildSanitaireFichesEntries(id - 2);
  } else {
    return new NextResponse("Sitemap not found", { status: 404 });
  }

  const xml = buildXml(entries);
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
