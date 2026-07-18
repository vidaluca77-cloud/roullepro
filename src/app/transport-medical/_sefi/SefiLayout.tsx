import Link from "next/link";
import { ChevronRight, ScrollText, ShieldCheck, ArrowRight } from "lucide-react";
import type { Source } from "@/lib/sefi-data";
import SefiSources from "./SefiSources";

export type SectionEntry = { id: string; label: string };

type Props = {
  title: string;
  intro: string;
  breadcrumbLabel: string;
  sections: SectionEntry[];
  publishedDate: string;
  updatedAt?: string;
  sources: Source[];
  children: React.ReactNode;
};

/**
 * Mise en page éditoriale du dossier SEFi 2027, alignée sur le design des guides
 * RoullePro (hero dégradé, sommaire sticky, article en prose), mais rattachée au
 * fil d'Ariane « Transport médical » et dotée d'un bloc « Sources » explicite.
 */
export default function SefiLayout(props: Props) {
  return (
    <main className="bg-slate-50 min-h-screen">
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <nav aria-label="Fil d'Ariane" className="text-sm text-blue-100 mb-5">
            <ol className="flex flex-wrap items-center gap-1">
              <li>
                <Link href="/" className="hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <ChevronRight className="inline h-3.5 w-3.5 mx-0.5" />
              </li>
              <li>
                <Link href="/transport-medical" className="hover:text-white">
                  Transport médical
                </Link>
              </li>
              <li>
                <ChevronRight className="inline h-3.5 w-3.5 mx-0.5" />
              </li>
              <li className="text-white">{props.breadcrumbLabel}</li>
            </ol>
          </nav>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <ScrollText className="h-3.5 w-3.5" />
            Dossier RoullePro · {props.publishedDate}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {props.title}
          </h1>
          <p className="text-lg text-blue-50 max-w-3xl">{props.intro}</p>
          {props.updatedAt && (
            <p className="mt-3 text-xs text-blue-200">
              Dernière mise à jour :{" "}
              {new Date(props.updatedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Europe/Paris",
              })}
            </p>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Sommaire
              </p>
              <ul className="space-y-2 border-l border-slate-200 pl-4">
                {props.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-slate-700 hover:text-blue-700 leading-snug block"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-white border border-slate-200 rounded-xl">
                <ShieldCheck className="h-5 w-5 text-blue-700 mb-2" />
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Suivre l&apos;actualité
                </p>
                <p className="text-xs text-slate-600 mb-3">
                  Toutes les alertes réglementaires actualisées par RoullePro.
                </p>
                <Link
                  href="/veille-reglementaire"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
                >
                  Voir la veille
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </aside>

          <article className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-li:my-0 prose-a:text-blue-700 hover:prose-a:text-blue-800 prose-strong:text-slate-900">
            <details className="lg:hidden mb-6 border border-slate-200 rounded-xl p-4 bg-slate-50">
              <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                Sommaire
              </summary>
              <ul className="mt-3 space-y-2 pl-1">
                {props.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-sm text-slate-700 hover:text-blue-700"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>

            {props.children}

            <div className="mt-12 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 leading-relaxed">
                Information à valeur indicative, ne se substitue pas à un avis
                juridique. Consultez les textes officiels et un conseil professionnel
                pour votre cas particulier.
              </p>
            </div>

            <SefiSources sources={props.sources} />
          </article>
        </div>
      </section>
    </main>
  );
}
