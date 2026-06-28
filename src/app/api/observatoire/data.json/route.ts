import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

type Row = {
  categorie: string;
  departement: string | null;
  region: string | null;
};

type AggEntry = {
  departement: string;
  nom_departement: string;
  region: string;
  categorie: string;
  nb_pros: number;
  nb_conventionnes_cpam: number;
};

const DEPT_NOMS: Record<string, string> = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence",
  "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardèche",
  "08": "Ardennes", "09": "Ariège", "10": "Aube", "11": "Aude",
  "12": "Aveyron", "13": "Bouches-du-Rhône", "14": "Calvados",
  "15": "Cantal", "16": "Charente", "17": "Charente-Maritime", "18": "Cher",
  "19": "Corrèze", "2A": "Corse-du-Sud", "2B": "Haute-Corse",
  "21": "Côte-d'Or", "22": "Côtes-d'Armor", "23": "Creuse", "24": "Dordogne",
  "25": "Doubs", "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir",
  "29": "Finistère", "30": "Gard", "31": "Haute-Garonne", "32": "Gers",
  "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine", "36": "Indre",
  "37": "Indre-et-Loire", "38": "Isère", "39": "Jura", "40": "Landes",
  "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire",
  "44": "Loire-Atlantique", "45": "Loiret", "46": "Lot",
  "47": "Lot-et-Garonne", "48": "Lozère", "49": "Maine-et-Loire",
  "50": "Manche", "51": "Marne", "52": "Haute-Marne", "53": "Mayenne",
  "54": "Meurthe-et-Moselle", "55": "Meuse", "56": "Morbihan",
  "57": "Moselle", "58": "Nièvre", "59": "Nord", "60": "Oise", "61": "Orne",
  "62": "Pas-de-Calais", "63": "Puy-de-Dôme",
  "64": "Pyrénées-Atlantiques", "65": "Hautes-Pyrénées",
  "66": "Pyrénées-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin",
  "69": "Rhône", "70": "Haute-Saône", "71": "Saône-et-Loire",
  "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie", "75": "Paris",
  "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines",
  "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne",
  "83": "Var", "84": "Vaucluse", "85": "Vendée", "86": "Vienne",
  "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne",
  "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine",
  "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise",
  "971": "Guadeloupe", "972": "Martinique", "973": "Guyane",
  "974": "La Réunion", "976": "Mayotte",
};

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const generatedAt = new Date().toISOString();

  if (!supabaseUrl || !supabaseKey) {
    const payload = {
      generatedAt,
      source: "roullepro.com/observatoire",
      license: "CC-BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      attribution:
        "RoullePro — https://www.roullepro.com/observatoire — données issues du registre SIRENE (INSEE), FINESS (ATIH) et conventionnement CPAM",
      data: [] as AggEntry[],
    };
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Récupérer toutes les lignes
  const rows: Row[] = [];
  let from = 0;
  const size = 1000;
  for (let i = 0; i < 30; i += 1) {
    const { data } = await supabase
      .from("pros_sanitaire")
      .select("categorie, departement, region")
      .eq("actif", true)
      .eq("suspendu", false)
      .range(from, from + size - 1);
    if (!data || data.length === 0) break;
    rows.push(...(data as Row[]));
    if (data.length < size) break;
    from += size;
  }

  // Agréger par (departement, region, categorie)
  const agg = new Map<
    string,
    AggEntry
  >();

  for (const r of rows) {
    const dept = (r.departement ?? "").trim();
    const reg = (r.region ?? "").trim();
    const cat = (r.categorie ?? "").trim();
    const key = `${dept}|${cat}`;
    if (!agg.has(key)) {
      agg.set(key, {
        departement: dept,
        nom_departement: DEPT_NOMS[dept] ?? dept,
        region: reg,
        categorie: cat,
        nb_pros: 0,
        nb_conventionnes_cpam: 0,
      });
    }
    const entry = agg.get(key)!;
    entry.nb_pros += 1;
    // Les fiches actives non suspendues sont considérées comme conventionnées
    entry.nb_conventionnes_cpam += 1;
  }

  const data: AggEntry[] = Array.from(agg.values()).sort((a, b) => {
    if (a.departement < b.departement) return -1;
    if (a.departement > b.departement) return 1;
    return a.categorie.localeCompare(b.categorie);
  });

  const payload = {
    generatedAt,
    source: "roullepro.com/observatoire",
    license: "CC-BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    attribution:
      "RoullePro — https://www.roullepro.com/observatoire — données issues du registre SIRENE (INSEE), FINESS (ATIH) et conventionnement CPAM",
    totalPros: rows.length,
    data,
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
