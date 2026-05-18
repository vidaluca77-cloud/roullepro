import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Bell, Calendar, ShieldCheck } from "lucide-react";
import NewsletterForm from "./_components/NewsletterForm";
import {
  listPublishedAlerts,
  METIER_OPTIONS,
  URGENCY_OPTIONS,
  URGENCY_CLASSES,
  URGENCY_LABEL,
  metierLabel,
  formatApplicableFrom,
  type RegUrgency,
} from "@/lib/reg-alerts";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Veille réglementaire transport sanitaire — RoullePro",
  description:
    "Ce qui change pour les ambulances, VSL et taxis conventionnés. Sources officielles, mises à jour datées, langage clair.",
  alternates: { canonical: "/veille-reglementaire" },
  openGraph: {
    title: "Veille réglementaire transport sanitaire — RoullePro",
    description:
      "Toutes les évolutions réglementaires pour le transport sanitaire en France : décrets, conventions, arrêtés.",
    type: "website",
  },
};

type PageProps = {
  searchParams: Promise<{ metier?: string; urgency?: string }>;
};

function isValidUrgency(v: string | undefined): v is RegUrgency {
  return v === "critical" || v === "high" || v === "medium" || v === "info";
}

function isValidMetier(v: string | undefined): boolean {
  if (!v) return false;
  return METIER_OPTIONS.some((m) => m.code === v);
}

export default async function VeilleReglementairePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const metier = isValidMetier(sp.metier) ? sp.metier : undefined;
  const urgency = isValidUrgency(sp.urgency) ? sp.urgency : undefined;

  const alerts = await listPublishedAlerts({ metier, urgency });

  const baseUrl = "/veille-reglementaire";
  const buildHref = (next: { metier?: string | null; urgency?: string | null }) => {
    const params = new URLSearchParams();
    const nextMetier = next.metier === undefined ? metier : next.metier ?? undefined;
    const nextUrgency = next.urgency === undefined ? urgency : next.urgency ?? undefined;
    if (nextMetier) params.set("metier", nextMetier);
    if (nextUrgency) params.set("urgency", nextUrgency);
    const qs = params.toString();
    return qs ? `${baseUrl}?${qs}` : baseUrl;
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Bell className="h-3.5 w-3.5" />
            Mis à jour en continu
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Veille réglementaire transport sanitaire
          </h1>
          <p className="text-lg text-blue-50 max-w-3xl">
            Ce qui change pour les ambulances, VSL et taxis conventionnés. Sources officielles, mises à jour datées, langage clair.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        {/* Filtres metier */}
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Métier</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref({ metier: null })}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                !metier
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
              }`}
            >
              Tous
            </Link>
            {METIER_OPTIONS.map((m) => (
              <Link
                key={m.code}
                href={buildHref({ metier: m.code })}
                className={`text-sm px-3 py-1.5 rounded-full border transition ${
                  metier === m.code
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                }`}
              >
                {m.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Filtres urgence */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Niveau d&apos;urgence</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref({ urgency: null })}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                !urgency
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
              }`}
            >
              Tous niveaux
            </Link>
            {URGENCY_OPTIONS.map((u) => {
              const active = urgency === u.code;
              return (
                <Link
                  key={u.code}
                  href={buildHref({ urgency: u.code })}
                  className={`text-sm px-3 py-1.5 rounded-full border transition ${
                    active
                      ? `${URGENCY_CLASSES[u.code]} font-semibold`
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {u.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Liste des alertes */}
        {alerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-700 font-medium mb-1">Aucune alerte pour ces filtres</p>
            <p className="text-sm text-slate-500">
              Essayez de modifier le métier ou le niveau d&apos;urgence.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {alerts.map((a) => (
              <li key={a.id}>
                <article className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${URGENCY_CLASSES[a.urgency]}`}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {URGENCY_LABEL[a.urgency]}
                    </span>
                    {a.metiers.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {metierLabel(code)}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    <Link href={`/veille-reglementaire/${a.slug}`} className="hover:text-blue-700 transition">
                      {a.title_short}
                    </Link>
                  </h2>

                  <p className="text-slate-700 mb-4 line-clamp-3">{a.summary_oneliner}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    {a.applicable_from ? (
                      <p className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        {formatApplicableFrom(a.applicable_from)}
                      </p>
                    ) : (
                      <span />
                    )}
                    <Link
                      href={`/veille-reglementaire/${a.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
                    >
                      Lire l&apos;analyse complète
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {/* Newsletter inscription */}
        <div className="mt-12">
          <NewsletterForm />
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Synthèses informatives, ne se substituent pas aux textes officiels. Consultez un juriste pour toute question d&apos;application.
          </p>
        </div>
      </section>
    </main>
  );
}
