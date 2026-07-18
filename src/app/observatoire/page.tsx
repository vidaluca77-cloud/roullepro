import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { BASE_URL, jsonLdHtml, buildBreadcrumbJsonLd } from "@/lib/seo-schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title:
    "Observatoire du transport sanitaire en France — Données 2026 | RoullePro",
  description:
    "Données chiffrées sur le transport sanitaire en France : nombre d'ambulances, VSL, taxis conventionnés par région, évolution conventionnement CPAM, dépenses Assurance maladie. Source ouverte, mise à jour trimestrielle.",
  alternates: { canonical: "/observatoire" },
  openGraph: {
    title:
      "Observatoire du transport sanitaire en France — Données 2026 | RoullePro",
    description:
      "Statistiques nationales sur les ambulances, VSL et taxis conventionnés. Données agrégées par département et région, exports CSV/JSON libres.",
    type: "website",
  },
};

type StatsParCategorie = {
  ambulance: number;
  vsl: number;
  taxi_conventionne: number;
  total: number;
};

type StatRow = {
  categorie: string;
  departement: string | null;
  region: string | null;
};

type DeptRow = {
  code: string;
  nom: string;
  region: string;
  ambulance: number;
  vsl: number;
  taxi_conventionne: number;
  total: number;
  densite: number;
};

// Populations départementales INSEE 2024 (en milliers d'habitants)
const DEPT_POPULATIONS: Record<string, number> = {
  "01": 655, "02": 535, "03": 352, "04": 166, "05": 141,
  "06": 1092, "07": 333, "08": 275, "09": 155, "10": 311,
  "11": 366, "12": 277, "13": 2064, "14": 697, "15": 147,
  "16": 353, "17": 650, "18": 308, "19": 241, "2A": 163,
  "2B": 184, "21": 534, "22": 602, "23": 118, "24": 415,
  "25": 541, "26": 513, "27": 601, "28": 436, "29": 906,
  "30": 738, "31": 1379, "32": 192, "33": 1598, "34": 1172,
  "35": 1059, "36": 224, "37": 604, "38": 1266, "39": 259,
  "40": 423, "41": 330, "42": 757, "43": 226, "44": 1395,
  "45": 676, "46": 174, "47": 332, "48": 78, "49": 807,
  "50": 508, "51": 575, "52": 175, "53": 304, "54": 733,
  "55": 192, "56": 750, "57": 1044, "58": 210, "59": 2608,
  "60": 841, "61": 283, "62": 1468, "63": 651, "64": 678,
  "65": 228, "66": 482, "67": 1125, "68": 764, "69": 1857,
  "70": 241, "71": 556, "72": 569, "73": 432, "74": 805,
  "75": 2102, "76": 1285, "77": 1403, "78": 1435, "79": 378,
  "80": 575, "81": 393, "82": 253, "83": 1077, "84": 559,
  "85": 680, "86": 437, "87": 374, "88": 371, "89": 343,
  "90": 162, "91": 1293, "92": 1587, "93": 1626, "94": 1356,
  "95": 1244, "971": 378, "972": 360, "973": 294, "974": 876, "976": 321,
};

// Noms officiels des départements
const DEPT_NOMS: Record<string, string> = {
  "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence",
  "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes",
  "09": "Ariège", "10": "Aube", "11": "Aude", "12": "Aveyron",
  "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal", "16": "Charente",
  "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "2A": "Corse-du-Sud",
  "2B": "Haute-Corse", "21": "Côte-d'Or", "22": "Côtes-d'Armor", "23": "Creuse",
  "24": "Dordogne", "25": "Doubs", "26": "Drôme", "27": "Eure",
  "28": "Eure-et-Loir", "29": "Finistère", "30": "Gard", "31": "Haute-Garonne",
  "32": "Gers", "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine",
  "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura",
  "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire",
  "44": "Loire-Atlantique", "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne",
  "48": "Lozère", "49": "Maine-et-Loire", "50": "Manche", "51": "Marne",
  "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle", "55": "Meuse",
  "56": "Morbihan", "57": "Moselle", "58": "Nièvre", "59": "Nord",
  "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme",
  "64": "Pyrénées-Atlantiques", "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales",
  "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhône", "70": "Haute-Saône",
  "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie",
  "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne",
  "78": "Yvelines", "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn",
  "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse", "85": "Vendée",
  "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne",
  "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine",
  "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise",
  "971": "Guadeloupe", "972": "Martinique", "973": "Guyane",
  "974": "La Réunion", "976": "Mayotte",
};

// Régions par code département
const DEPT_REGIONS: Record<string, string> = {
  "01": "Auvergne-Rhône-Alpes", "03": "Auvergne-Rhône-Alpes",
  "07": "Auvergne-Rhône-Alpes", "15": "Auvergne-Rhône-Alpes",
  "26": "Auvergne-Rhône-Alpes", "38": "Auvergne-Rhône-Alpes",
  "42": "Auvergne-Rhône-Alpes", "43": "Auvergne-Rhône-Alpes",
  "63": "Auvergne-Rhône-Alpes", "69": "Auvergne-Rhône-Alpes",
  "73": "Auvergne-Rhône-Alpes", "74": "Auvergne-Rhône-Alpes",
  "21": "Bourgogne-Franche-Comté", "25": "Bourgogne-Franche-Comté",
  "39": "Bourgogne-Franche-Comté", "58": "Bourgogne-Franche-Comté",
  "70": "Bourgogne-Franche-Comté", "71": "Bourgogne-Franche-Comté",
  "89": "Bourgogne-Franche-Comté", "90": "Bourgogne-Franche-Comté",
  "22": "Bretagne", "29": "Bretagne", "35": "Bretagne", "56": "Bretagne",
  "18": "Centre-Val de Loire", "28": "Centre-Val de Loire",
  "36": "Centre-Val de Loire", "37": "Centre-Val de Loire",
  "41": "Centre-Val de Loire", "45": "Centre-Val de Loire",
  "2A": "Corse", "2B": "Corse",
  "67": "Grand Est", "68": "Grand Est", "54": "Grand Est", "55": "Grand Est",
  "57": "Grand Est", "88": "Grand Est",
  "08": "Grand Est", "10": "Grand Est", "51": "Grand Est", "52": "Grand Est",
  "971": "Guadeloupe", "973": "Guyane", "976": "Mayotte",
  "59": "Hauts-de-France", "02": "Hauts-de-France",
  "60": "Hauts-de-France", "62": "Hauts-de-France", "80": "Hauts-de-France",
  "75": "Île-de-France", "77": "Île-de-France", "78": "Île-de-France",
  "91": "Île-de-France", "92": "Île-de-France", "93": "Île-de-France",
  "94": "Île-de-France", "95": "Île-de-France",
  "14": "Normandie", "27": "Normandie", "50": "Normandie",
  "61": "Normandie", "76": "Normandie",
  "44": "Pays de la Loire", "49": "Pays de la Loire",
  "53": "Pays de la Loire", "72": "Pays de la Loire", "85": "Pays de la Loire",
  "09": "Occitanie", "11": "Occitanie", "12": "Occitanie",
  "30": "Occitanie", "31": "Occitanie", "32": "Occitanie",
  "34": "Occitanie", "46": "Occitanie", "48": "Occitanie",
  "65": "Occitanie", "66": "Occitanie", "81": "Occitanie", "82": "Occitanie",
  "16": "Nouvelle-Aquitaine", "17": "Nouvelle-Aquitaine",
  "19": "Nouvelle-Aquitaine", "23": "Nouvelle-Aquitaine",
  "24": "Nouvelle-Aquitaine", "33": "Nouvelle-Aquitaine",
  "40": "Nouvelle-Aquitaine", "47": "Nouvelle-Aquitaine",
  "64": "Nouvelle-Aquitaine", "79": "Nouvelle-Aquitaine",
  "86": "Nouvelle-Aquitaine", "87": "Nouvelle-Aquitaine",
  "04": "Provence-Alpes-Côte d'Azur", "05": "Provence-Alpes-Côte d'Azur",
  "06": "Provence-Alpes-Côte d'Azur", "13": "Provence-Alpes-Côte d'Azur",
  "83": "Provence-Alpes-Côte d'Azur", "84": "Provence-Alpes-Côte d'Azur",
  "972": "Martinique", "974": "La Réunion",
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getStats(): Promise<StatsParCategorie> {
  const supabase = getSupabase();
  if (!supabase) {
    return { ambulance: 0, vsl: 0, taxi_conventionne: 0, total: 0 };
  }
  const rows: StatRow[] = [];
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
    rows.push(...(data as StatRow[]));
    if (data.length < size) break;
    from += size;
  }
  const counts = { ambulance: 0, vsl: 0, taxi_conventionne: 0, total: rows.length };
  for (const r of rows) {
    if (r.categorie === "ambulance") counts.ambulance += 1;
    else if (r.categorie === "vsl") counts.vsl += 1;
    else if (r.categorie === "taxi_conventionne") counts.taxi_conventionne += 1;
  }
  return counts;
}

async function getDepartementStats(): Promise<DeptRow[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const rows: StatRow[] = [];
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
    rows.push(...(data as StatRow[]));
    if (data.length < size) break;
    from += size;
  }
  const map = new Map<string, { ambulance: number; vsl: number; taxi_conventionne: number }>();
  for (const r of rows) {
    if (!r.departement) continue;
    const code = r.departement.trim();
    if (!map.has(code)) map.set(code, { ambulance: 0, vsl: 0, taxi_conventionne: 0 });
    const entry = map.get(code)!;
    if (r.categorie === "ambulance") entry.ambulance += 1;
    else if (r.categorie === "vsl") entry.vsl += 1;
    else if (r.categorie === "taxi_conventionne") entry.taxi_conventionne += 1;
  }
  const result: DeptRow[] = [];
  map.forEach((counts, code) => {
    const total = counts.ambulance + counts.vsl + counts.taxi_conventionne;
    const pop = DEPT_POPULATIONS[code] ?? 500;
    const densite = Math.round((total / pop) * 100) / 100;
    result.push({
      code,
      nom: DEPT_NOMS[code] ?? code,
      region: DEPT_REGIONS[code] ?? "Autre",
      ...counts,
      total,
      densite,
    });
  });
  return result.sort((a, b) => b.total - a.total);
}

export default async function ObservatoirePage() {
  const [stats, depts] = await Promise.all([getStats(), getDepartementStats()]);

  const today = new Date();
  const dateStr = today.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });

  const pctConventionnes =
    stats.total > 0
      ? Math.round(
          ((stats.ambulance + stats.vsl + stats.taxi_conventionne) / stats.total) * 100
        )
      : 100;

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Observatoire du transport sanitaire en France — RoullePro",
    description:
      "Données agrégées par département et région sur les professionnels du transport sanitaire en France : ambulances, VSL et taxis conventionnés CPAM. Sources : SIRENE INSEE, FINESS ATIH, conventionnement CPAM.",
    url: `${BASE_URL}/observatoire`,
    identifier: `${BASE_URL}/observatoire`,
    creator: {
      "@type": "Organization",
      name: "RoullePro",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "RoullePro",
      url: BASE_URL,
    },
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    temporalCoverage: "2026/..",
    spatialCoverage: {
      "@type": "Place",
      name: "France",
      geo: {
        "@type": "GeoShape",
        addressCountry: "FR",
      },
    },
    variableMeasured: [
      "Nombre d'entreprises de transport sanitaire par département",
      "Répartition ambulance / VSL / taxi conventionné",
      "Densité pour 100 000 habitants",
    ],
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "text/csv",
        contentUrl: `${BASE_URL}/api/observatoire/data.csv`,
        name: "Export CSV — Observatoire transport sanitaire RoullePro",
      },
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${BASE_URL}/api/observatoire/data.json`,
        name: "Export JSON — Observatoire transport sanitaire RoullePro",
      },
    ],
    keywords: [
      "transport sanitaire",
      "ambulance",
      "VSL",
      "taxi conventionné",
      "CPAM",
      "France",
      "open data",
      "santé",
    ],
    inLanguage: "fr",
    dateModified: today.toISOString(),
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RoullePro",
    url: BASE_URL,
    description:
      "Annuaire national et observatoire du transport sanitaire en France.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@roullepro.com",
      contactType: "customer support",
    },
  };

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { label: "Accueil", href: "/" },
    { label: "Observatoire", href: "/observatoire" },
  ]);

  const speakableJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Observatoire du transport sanitaire — RoullePro",
    url: `${BASE_URL}/observatoire`,
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".chapeau", ".kpi-block", ".derniere-maj"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(datasetJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(speakableJsonLd) }}
      />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Fil d'ariane */}
        <nav aria-label="Fil d'ariane" className="text-sm text-gray-500 mb-6">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-blue-700 transition">
                Accueil
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-700 font-medium">Observatoire</li>
          </ol>
        </nav>

        {/* En-tête */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Observatoire du transport sanitaire
        </h1>

        <p className="chapeau text-lg text-gray-600 mb-4 max-w-3xl">
          RoullePro publie chaque trimestre des données chiffrées sur les
          professionnels du transport sanitaire conventionné en France :
          ambulances, VSL et taxis conventionnés CPAM. Les données sont issues
          des registres officiels SIRENE (INSEE) et FINESS (ATIH), enrichies
          des informations de conventionnement CPAM. Elles sont librement
          réutilisables sous licence CC-BY-SA 4.0.
        </p>

        <p className="derniere-maj text-sm text-gray-400 mb-10">
          Dernière mise à jour : {dateStr}. Fréquence : trimestrielle.
        </p>

        {/* 1. Chiffres clés */}
        <section className="mb-12" aria-labelledby="kpis-titre">
          <h2
            id="kpis-titre"
            className="text-2xl font-semibold text-gray-800 mb-6"
          >
            Chiffres clés
          </h2>
          <div
            className="kpi-block grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
              <p className="text-4xl font-bold text-blue-700">
                {stats.total > 0 ? stats.total.toLocaleString("fr-FR") : "—"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Total professionnels actifs
              </p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
              <p className="text-4xl font-bold text-red-700">
                {stats.ambulance > 0
                  ? stats.ambulance.toLocaleString("fr-FR")
                  : "—"}
              </p>
              <p className="text-sm text-gray-600 mt-1">Ambulances</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
              <p className="text-4xl font-bold text-green-700">
                {stats.vsl > 0 ? stats.vsl.toLocaleString("fr-FR") : "—"}
              </p>
              <p className="text-sm text-gray-600 mt-1">VSL</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 text-center">
              <p className="text-4xl font-bold text-yellow-700">
                {stats.taxi_conventionne > 0
                  ? stats.taxi_conventionne.toLocaleString("fr-FR")
                  : "—"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Taxis conventionnés
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-3xl font-bold text-gray-800">
                {pctConventionnes}&nbsp;%
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Conventionnés CPAM (sur les fiches renseignées)
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-3xl font-bold text-gray-800">6,74 Md€</p>
              <p className="text-sm text-gray-600 mt-1">
                Dépenses remboursées par l'Assurance maladie en 2024
                (source&nbsp;: CNAM Charges &amp; Produits 2026)
              </p>
            </div>
          </div>
        </section>

        {/* 2. Cartographie nationale */}
        <section className="mb-12" aria-labelledby="carto-titre">
          <h2
            id="carto-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            Répartition par département
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Tableau triable. La densité est exprimée en nombre de professionnels
            pour 100 000 habitants (population INSEE 2024).
          </p>
          {depts.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Dépt.</th>
                    <th className="px-4 py-3 text-left">Nom</th>
                    <th className="px-4 py-3 text-left">Région</th>
                    <th className="px-4 py-3 text-right">Ambulances</th>
                    <th className="px-4 py-3 text-right">VSL</th>
                    <th className="px-4 py-3 text-right">Taxis conv.</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">
                      Densité/100k hab.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {depts.slice(0, 50).map((d) => (
                    <tr
                      key={d.code}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-2 font-mono text-gray-500">
                        {d.code}
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-800">
                        {d.nom}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{d.region}</td>
                      <td className="px-4 py-2 text-right text-red-600">
                        {d.ambulance.toLocaleString("fr-FR")}
                      </td>
                      <td className="px-4 py-2 text-right text-green-600">
                        {d.vsl.toLocaleString("fr-FR")}
                      </td>
                      <td className="px-4 py-2 text-right text-yellow-700">
                        {d.taxi_conventionne.toLocaleString("fr-FR")}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-gray-800">
                        {d.total.toLocaleString("fr-FR")}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-600">
                        {d.densite.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">
              Données non disponibles (connexion Supabase requise).
            </p>
          )}
        </section>

        {/* 3. Méthodologie */}
        <section className="mb-12" aria-labelledby="methodologie-titre">
          <h2
            id="methodologie-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            Méthodologie
          </h2>
          <div className="prose prose-gray max-w-none text-sm text-gray-700 space-y-3">
            <p>
              Les données présentées sur cet observatoire sont issues de
              l'agrégation de quatre sources publiques officielles :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>SIRENE (INSEE)</strong> : registre national des
                entreprises, utilisé pour identifier les établissements actifs
                avec les codes NAF 8621Z (ambulances) et 4932Z (taxis).
              </li>
              <li>
                <strong>FINESS (ATIH)</strong> : référentiel des structures
                sanitaires et médico-sociales, utilisé pour les agréments ARS
                des transporteurs sanitaires.
              </li>
              <li>
                <strong>Conventionnement CPAM</strong> : informations issues
                des conventions départementales publiées par les caisses
                primaires d'assurance maladie.
              </li>
              <li>
                <strong>Base interne RoullePro</strong> : enrichissement
                manuel (téléphones, statuts, vérification SIRET) réalisé par
                nos équipes depuis 2024.
              </li>
            </ul>
            <p>
              <strong>Fréquence d'actualisation</strong> : les données sont
              mises à jour chaque trimestre (janvier, avril, juillet, octobre).
            </p>
            <p>
              <strong>Limites</strong> : le conventionnement CPAM n'est pas
              toujours publié de façon standardisée par chaque CPAM
              départementale. Certains taxis conventionnés peuvent ne pas
              figurer dans les bases publiques. Les données de densité
              utilisent les estimations de population départementale INSEE 2024.
            </p>
          </div>
        </section>

        {/* 4. Rapport trimestriel */}
        <section className="mb-12" aria-labelledby="rapport-titre">
          <h2
            id="rapport-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            Rapport trimestriel
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
              Dernier rapport disponible
            </p>
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              T2 2026 — Analyse du marché du transport sanitaire
            </h3>
            <p className="text-sm text-blue-700 mb-4">
              Impact des réformes 2025-2027 : transport partagé obligatoire,
              nouvelle convention-cadre taxi, protocole de maîtrise des dépenses
              CNAM. Régions sous-dotées, projections 2027.
            </p>
            <Link
              href="/observatoire/rapports/t2-2026"
              className="inline-block bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-800 transition"
            >
              Lire le rapport T2 2026
            </Link>
          </div>
        </section>

        {/* 5. Données ouvertes */}
        <section className="mb-12" aria-labelledby="opendata-titre">
          <h2
            id="opendata-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            Données ouvertes
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Ces données sont publiées sous licence{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              CC-BY-SA 4.0
            </a>
            . Vous pouvez les réutiliser librement, y compris à des fins
            commerciales, à condition de citer RoullePro comme source avec un
            lien vers{" "}
            <span className="font-mono text-xs">
              https://www.roullepro.com/observatoire
            </span>
            .
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/api/observatoire/data.csv"
              download
              className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-green-800 transition"
            >
              Télécharger CSV
            </a>
            <a
              href="/api/observatoire/data.json"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-700 text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Télécharger JSON
            </a>
          </div>
          <div className="mt-4 bg-gray-50 rounded-lg border border-gray-200 p-4 text-xs font-mono text-gray-700 overflow-x-auto">
            <p className="font-sans text-xs text-gray-500 mb-2">
              Exemple de structure JSON :
            </p>
            <pre>{`{
  "generatedAt": "2026-06-28T00:00:00Z",
  "source": "roullepro.com/observatoire",
  "license": "CC-BY-SA 4.0",
  "data": [
    {
      "departement": "13",
      "nom_departement": "Bouches-du-Rhône",
      "region": "Provence-Alpes-Côte d'Azur",
      "categorie": "ambulance",
      "nb_pros": 312,
      "nb_conventionnes_cpam": 312
    }
  ]
}`}</pre>
          </div>
        </section>

        {/* 6. Citez-nous */}
        <section className="mb-12" aria-labelledby="citer-titre">
          <h2
            id="citer-titre"
            className="text-2xl font-semibold text-gray-800 mb-4"
          >
            Comment citer ces données
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Pour les journalistes, chercheurs et contributeurs Wikipédia.{" "}
            <Link
              href="/citer-roullepro"
              className="text-blue-700 underline hover:text-blue-800"
            >
              Voir la page complète de citation
            </Link>
            .
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Format APA
              </p>
              <p className="text-sm font-mono text-gray-800 select-all">
                {`RoullePro. (${today.getFullYear()}). Observatoire du transport sanitaire en France [Ensemble de données]. Récupéré le ${dateStr} sur https://www.roullepro.com/observatoire`}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Format Chicago
              </p>
              <p className="text-sm font-mono text-gray-800 select-all">
                {`RoullePro. "Observatoire du transport sanitaire en France." Mis à jour ${dateStr}. https://www.roullepro.com/observatoire.`}
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Modèle Wikipédia
              </p>
              <p className="text-sm font-mono text-gray-800 select-all">
                {`{{cite web|url=https://www.roullepro.com/observatoire|title=Observatoire du transport sanitaire en France|website=RoullePro|access-date=${today.toISOString().slice(0, 10)}}}`}
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
