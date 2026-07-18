import type { Source } from "@/lib/sefi-data";
import { DATE_VERIFICATION } from "@/lib/sefi-data";

/**
 * Bloc « Sources » propre au dossier SEFi : liste les URLs officielles réellement
 * citées dans la page (Légifrance/AFG, Sénat, service-public, CNDA, SESAM-Vitale…).
 */
export default function SefiSources({ sources }: { sources: Source[] }) {
  // Dédoublonnage par URL (une même source peut être citée plusieurs fois inline).
  const uniques = Array.from(new Map(sources.map((s) => [s.url, s])).values());

  return (
    <aside
      aria-label="Sources officielles"
      className="not-prose bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-10"
    >
      <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">
        Sources
      </h2>
      <ul className="space-y-2">
        {uniques.map((src) => (
          <li key={src.url} className="flex items-start gap-2 text-sm">
            <span className="text-slate-400 mt-0.5" aria-hidden="true">
              —
            </span>
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-700 hover:underline break-words"
            >
              {src.nom}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
        Informations vérifiées le {DATE_VERIFICATION} auprès des sources citées,
        susceptibles d&apos;évoluer. Vérifiez auprès de l&apos;éditeur et de votre CPAM.
      </p>
    </aside>
  );
}
