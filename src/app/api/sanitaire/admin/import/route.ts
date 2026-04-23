export const dynamic = "force-dynamic";
export const maxDuration = 300;
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const DEPARTEMENTS: Record<string, string[]> = {
  Normandie: ["14", "27", "50", "61", "76"],
  Bretagne: ["22", "29", "35", "56"],
};

const NAF_MAP: Record<string, string> = {
  "8690A": "ambulance",
  "86.90A": "ambulance",
  "4932Z": "taxi_conventionne",
  "49.32Z": "taxi_conventionne",
  "4939A": "vsl",
  "49.39A": "vsl",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type Etab = {
  siret: string;
  siren: string;
  nom_complet?: string;
  activite_principale?: string;
  libelle_commune?: string;
  code_postal?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
};

type ApiEntreprise = {
  siren: string;
  nom_complet?: string;
  nom_raison_sociale?: string;
  activite_principale?: string;
  matching_etablissements?: Etab[];
  siege?: Etab;
};

async function fetchPage(naf: string, departement: string, page: number) {
  const url = new URL("https://recherche-entreprises.api.gouv.fr/search");
  url.searchParams.set("activite_principale", naf);
  url.searchParams.set("departement", departement);
  url.searchParams.set("etat_administratif", "A");
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", "25");
  const res = await fetch(url.toString(), { headers: { "User-Agent": "RoullePro-Import/1.0" } });
  if (!res.ok) throw new Error(`SIRENE ${res.status}`);
  return res.json() as Promise<{
    results: ApiEntreprise[];
    total_pages: number;
  }>;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const secret = process.env.SANITAIRE_IMPORT_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const nafs = ["86.90A", "49.32Z", "49.39A"];
  const body = await req.json().catch(() => ({}));
  const regionsParam: string[] = body.regions || ["Normandie", "Bretagne"];
  const maxPages = body.max_pages || 30;

  const report: Array<{ naf: string; dep: string; region: string; inserted: number; error?: string }> = [];
  let grandTotal = 0;

  for (const region of regionsParam) {
    const deps = DEPARTEMENTS[region] || [];
    for (const dep of deps) {
      for (const naf of nafs) {
        let inserted = 0;
        try {
          let page = 1;
          let totalPages = 1;
          do {
            const data = await fetchPage(naf, dep, page);
            totalPages = Math.min(data.total_pages, maxPages);
            const rows = data.results.flatMap((ent) => {
              const etabs = ent.matching_etablissements?.length
                ? ent.matching_etablissements
                : ent.siege
                ? [ent.siege]
                : [];
              const raison = ent.nom_raison_sociale || ent.nom_complet || "Entreprise";
              return etabs.map((etab) => {
                const ville = etab.libelle_commune || "";
                const nafClean = (etab.activite_principale || ent.activite_principale || "").replace(".", "");
                const categorie = NAF_MAP[nafClean] || NAF_MAP[naf] || "vsl";
                return {
                  siret: etab.siret,
                  siren: etab.siren || ent.siren,
                  raison_sociale: raison,
                  nom_commercial: etab.nom_complet || null,
                  slug: slugify(`${raison}-${etab.siret}`),
                  categorie,
                  naf: etab.activite_principale || naf,
                  adresse: etab.adresse || null,
                  code_postal: etab.code_postal || "",
                  ville,
                  ville_slug: slugify(ville),
                  departement: dep,
                  region,
                  latitude: etab.latitude || null,
                  longitude: etab.longitude || null,
                };
              });
            });
            if (rows.length > 0) {
              const { error } = await supabaseAdmin
                .from("pros_sanitaire")
                .upsert(rows, { onConflict: "siret", ignoreDuplicates: true });
              if (!error) inserted += rows.length;
            }
            page += 1;
            await new Promise((r) => setTimeout(r, 150));
          } while (page <= totalPages);
        } catch (err) {
          report.push({ naf, dep, region, inserted, error: (err as Error).message });
          continue;
        }
        report.push({ naf, dep, region, inserted });
        grandTotal += inserted;
      }
    }
  }

  return NextResponse.json({ ok: true, grand_total: grandTotal, report });
}
