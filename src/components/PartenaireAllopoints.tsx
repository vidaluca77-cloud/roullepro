/**
 * Encart partenaire Allopoints Protect (protection du permis de conduire).
 *
 * Purement présentationnel. Le lien sortant est un lien d'affiliation : il doit
 * toujours porter rel="sponsored noopener" et s'ouvrir dans un nouvel onglet.
 * Deux variantes : "complete" (par défaut) et "compacte".
 */

import { ShieldCheck, ArrowRight, BadgePercent } from "lucide-react";

const PARTNER_URL =
  "https://www.allopoints.fr/protect/?utm_source=https%3A%2F%2Froullepro.com%2F&utm_campaign=Roullepro5";

export default function PartenaireAllopoints({
  variant = "complete",
}: {
  variant?: "complete" | "compacte";
}) {
  const compacte = variant === "compacte";

  return (
    <aside
      aria-label="Partenaire RoullePro : Allopoints Protect"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className={compacte ? "p-5" : "p-6 sm:p-7"}>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#0066CC] ring-1 ring-blue-100">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Partenaire
          </span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <BadgePercent className="h-3.5 w-3.5" />
            −5 % avec RoullePro
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold text-[#0B1120] sm:text-xl">
          Protégez votre permis, c&apos;est votre outil de travail
        </h3>

        <p className={`mt-2 leading-relaxed text-slate-600 ${compacte ? "text-sm" : "text-sm sm:text-[15px]"}`}>
          Avec <strong className="text-[#0B1120]">Allopoints Protect</strong>, des avocats spécialisés
          en droit routier certifiés par le Conseil National des Barreaux (CNB) gèrent et contestent
          vos contraventions entraînant une perte de points (contraventions de la 2<sup>e</sup> à la
          4<sup>e</sup> classe).
        </p>
        {!compacte && (
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
            L&apos;objectif : éviter le retrait de points pour préserver un permis dont dépend votre
            activité de taxi conventionné, ambulancier ou VSL. Le cabinet partenaire affiche un taux
            de réussite de <strong className="text-[#0B1120]">95 %</strong>.
          </p>
        )}

        <a
          href={PARTNER_URL}
          target="_blank"
          rel="sponsored noopener"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0066CC] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0052a3]"
        >
          Découvrir Allopoints Protect
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </aside>
  );
}
