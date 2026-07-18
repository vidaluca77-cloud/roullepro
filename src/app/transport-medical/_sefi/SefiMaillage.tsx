import Link from "next/link";

type PageKey = "sefi-2027" | "logiciels-sefi" | "geolocalisation-taxi-conventionne";

const PAGES: Record<PageKey, { href: string; titre: string; desc: string }> = {
  "sefi-2027": {
    href: "/transport-medical/sefi-2027",
    titre: "L'obligation SEFi 2027",
    desc: "Le texte de loi, le calendrier, les sanctions et ce qui change au quotidien.",
  },
  "logiciels-sefi": {
    href: "/transport-medical/logiciels-sefi",
    titre: "Comparatif des logiciels SEFi",
    desc: "Une vingtaine de solutions, statut CNDA, fonctions, prix et cible.",
  },
  "geolocalisation-taxi-conventionne": {
    href: "/transport-medical/geolocalisation-taxi-conventionne",
    titre: "Géolocalisation du taxi conventionné",
    desc: "L'obligation de géolocalisation, les solutions et les repères de coûts.",
  },
};

/**
 * Maillage interne du dossier SEFi : renvoie vers les deux autres pages du dossier
 * ainsi que vers les outils tarifs / simulateur et l'annuaire.
 */
export default function SefiMaillage({ current }: { current: PageKey }) {
  const others = (Object.keys(PAGES) as PageKey[]).filter((k) => k !== current);

  return (
    <nav
      aria-label="Dossier SEFi & géolocalisation 2027"
      className="not-prose my-12 rounded-2xl border border-slate-200 bg-slate-50 p-6"
    >
      <h2 className="text-xl font-semibold mb-4">
        Poursuivre le dossier SEFi &amp; géolocalisation 2027
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {others.map((k) => (
          <Link
            key={k}
            href={PAGES[k].href}
            className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition no-underline"
          >
            <h3 className="text-base font-bold text-slate-900 mb-1.5">
              {PAGES[k].titre}
            </h3>
            <p className="text-sm text-slate-600">{PAGES[k].desc}</p>
          </Link>
        ))}
      </div>
      <p className="text-sm text-slate-600 mt-4">
        Voir aussi :{" "}
        <Link href="/simulateur-taxi-conventionne" className="text-blue-700 hover:underline">
          simulateur taxi conventionné
        </Link>
        ,{" "}
        <Link href="/transport-medical/tarifs" className="text-blue-700 hover:underline">
          nos tarifs
        </Link>{" "}
        et l&apos;{" "}
        <Link href="/transport-medical" className="text-blue-700 hover:underline">
          annuaire du transport médical
        </Link>
        .
      </p>
    </nav>
  );
}
