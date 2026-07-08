import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Database,
  ExternalLink,
  Rss,
  ShieldCheck,
  Zap,
} from "lucide-react";
import NewsletterForm from "./_components/NewsletterForm";
import {
  listPublishedAlerts,
  METIER_OPTIONS,
  URGENCY_OPTIONS,
  URGENCY_CLASSES,
  URGENCY_LABEL,
  metierLabel,
  formatApplicableFrom,
  formatFrDate,
  type RegUrgency,
} from "@/lib/reg-alerts";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const BASE_URL = "https://www.roullepro.com";

export const metadata: Metadata = {
  title: "Veille réglementaire transport sanitaire",
  description:
    "Ce qui change pour les ambulances, VSL et taxis conventionnés. Sources officielles surveillées quotidiennement : DILA JORF, Légifrance, ARS, CPAM.",
  alternates: {
    canonical: "/veille-reglementaire",
    types: { "application/rss+xml": `${BASE_URL}/feed/veille.xml` },
  },
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

type VeilleStats = {
  total: number;
  thisYear: number;
  byCritical: number;
  byHigh: number;
  latestPublishedAt: string | null;
};

async function getVeilleStats(): Promise<VeilleStats> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { total: 0, thisYear: 0, byCritical: 0, byHigh: 0, latestPublishedAt: null };
  }
  const supabase = createClient(url, key);

  const currentYear = new Date().getFullYear();
  const yearStart = `${currentYear}-01-01`;

  const [totalRes, yearRes, critRes, highRes, latestRes] = await Promise.all([
    supabase
      .from("reg_alerts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("reg_alerts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("published_at", yearStart),
    supabase
      .from("reg_alerts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("urgency", "critical"),
    supabase
      .from("reg_alerts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("urgency", "high"),
    supabase
      .from("reg_alerts")
      .select("published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    total: totalRes.count ?? 0,
    thisYear: yearRes.count ?? 0,
    byCritical: critRes.count ?? 0,
    byHigh: highRes.count ?? 0,
    latestPublishedAt:
      (latestRes.data as { published_at?: string } | null)?.published_at ?? null,
  };
}

const SOURCES_SURVEILLEES = [
  {
    key: "dila_jorf",
    label: "DILA — Journal Officiel (JORF)",
    description:
      "Décrets, arrêtés et textes réglementaires publiés au Journal Officiel de la République Française.",
    href: "https://www.legifrance.gouv.fr/jorf/search/",
    badge: "Quotidien",
  },
  {
    key: "legifrance_piste",
    label: "Légifrance PISTE",
    description:
      "API officielle d'accès aux textes législatifs et réglementaires français en vigueur.",
    href: "https://piste.gouv.fr/",
    badge: "Quotidien",
  },
  {
    key: "legifrss",
    label: "Légifrance RSS",
    description:
      "Flux RSS des nouvelles publications Légifrance : lois, décrets, arrêtés relatifs au transport sanitaire.",
    href: "https://www.legifrance.gouv.fr/rss/",
    badge: "Quotidien",
  },
  {
    key: "ars",
    label: "Agences Régionales de Santé (ARS)",
    description:
      "Circulaires, instructions et arrêtés régionaux concernant les agréments et autorisations de transport sanitaire.",
    href: "https://www.ars.sante.fr/",
    badge: "Surveillance",
  },
  {
    key: "cpam",
    label: "Assurance Maladie — CPAM",
    description:
      "Conventions nationales, avenants tarifaires et circulaires CPAM pour taxis conventionnés, ambulances et VSL.",
    href: "https://www.ameli.fr/transporteur-sanitaire",
    badge: "Surveillance",
  },
];

export default async function VeilleReglementairePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const metier = isValidMetier(sp.metier) ? sp.metier : undefined;
  const urgency = isValidUrgency(sp.urgency) ? sp.urgency : undefined;

  const [alerts, stats] = await Promise.all([
    listPublishedAlerts({ metier, urgency }),
    getVeilleStats(),
  ]);

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

  // JSON-LD Dataset pour la collection reg_alerts
  const datasetLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${BASE_URL}/veille-reglementaire`,
    name: "Veille réglementaire transport sanitaire — RoullePro",
    description:
      "Collection d'alertes et d'analyses réglementaires relatives au transport sanitaire en France (ambulances, VSL, taxis conventionnés). Sources : DILA JORF, Légifrance PISTE, ARS, CPAM.",
    url: `${BASE_URL}/veille-reglementaire`,
    license: "https://creativecommons.org/licenses/by/4.0/",
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
    keywords: [
      "transport sanitaire",
      "réglementation ambulance",
      "convention CPAM",
      "taxi conventionné",
      "VSL",
      "JORF",
      "veille réglementaire",
    ],
    spatialCoverage: {
      "@type": "Place",
      name: "France",
    },
    temporalCoverage: `2024/..`,
    measurementTechnique: "Veille automatisée quotidienne des sources officielles",
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/rss+xml",
        contentUrl: `${BASE_URL}/feed/veille.xml`,
        name: "Flux RSS veille réglementaire",
      },
    ],
    size: stats.total > 0 ? `${stats.total} alertes publiées` : undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: BASE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Veille réglementaire",
        item: `${BASE_URL}/veille-reglementaire`,
      },
    ],
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-medium mb-4">
            <Bell className="h-3.5 w-3.5" />
            Analyse quotidienne J+1
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Veille réglementaire transport sanitaire
          </h1>
          <p className="text-lg text-blue-50 max-w-3xl">
            Ce qui change pour les ambulances, VSL et taxis conventionnés. Sources officielles, mises à jour datées, langage clair.
          </p>

          {/* Liens RSS + abonnement */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a
              href="/feed/veille.xml"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-sm font-medium transition"
            >
              <Rss className="h-4 w-4" />
              Flux RSS veille
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">

        {/* Bandeau veille en temps reel */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-blue-900 mb-0.5">Veille en temps réel</p>
                {stats.latestPublishedAt ? (
                  <p className="text-sm text-blue-800">
                    Dernière analyse publiée le{" "}
                    <strong>{formatFrDate(stats.latestPublishedAt)}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-blue-800">Analyses publiées régulièrement.</p>
                )}
                <p className="text-xs text-blue-700 mt-0.5">
                  Prochaine analyse automatique : J+1 ouvré
                </p>
              </div>
            </div>
            <a
              href="/feed/veille.xml"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
            >
              <Rss className="h-3.5 w-3.5" />
              S&apos;abonner au RSS
            </a>
          </div>
        </div>

        {/* Stats live */}
        {stats.total > 0 && (
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-xs text-slate-600 mt-1">Alertes publiées</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{stats.thisYear}</p>
              <p className="text-xs text-slate-600 mt-1">Cette année</p>
            </div>
            <div className="bg-white border border-red-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{stats.byCritical}</p>
              <p className="text-xs text-slate-600 mt-1">Critiques</p>
            </div>
            <div className="bg-white border border-orange-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-700">{stats.byHigh}</p>
              <p className="text-xs text-slate-600 mt-1">Urgence élevée</p>
            </div>
          </div>
        )}

        {/* Sources surveillees */}
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900">Sources surveillées</h2>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Notre robot d&apos;ingestion analyse quotidiennement ces sources officielles et détecte automatiquement les textes pertinents pour le transport sanitaire.
          </p>
          <ul className="space-y-3">
            {SOURCES_SURVEILLEES.map((src) => (
              <li key={src.key} className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <span className="text-slate-400 mt-0.5 flex-shrink-0" aria-hidden>—</span>
                  <div>
                    <a
                      href={src.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-700 hover:underline text-sm inline-flex items-center gap-1"
                    >
                      {src.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <p className="text-xs text-slate-600 mt-0.5">{src.description}</p>
                  </div>
                </div>
                <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100 flex-shrink-0">
                  {src.badge}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Encart guides */}
        <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Comprendre la réglementation : nos guides complets
              </h2>
              <p className="text-sm text-slate-600">
                Synthèses pédagogiques 2025-2027 par métier, avec calendrier consolidé et actions concrètes.
              </p>
            </div>
            <Link
              href="/guides/transport-sanitaire-conformite-2026-2027"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
            >
              Voir le hub
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <Link
              href="/guides/transport-sanitaire-conformite-2026-2027"
              className="text-sm text-blue-700 hover:text-blue-800 hover:underline"
            >
              Hub conformité 2026-2027
            </Link>
            <Link
              href="/guides/ambulance-reglementation-conformite-2026"
              className="text-sm text-blue-700 hover:text-blue-800 hover:underline"
            >
              Guide ambulance
            </Link>
            <Link
              href="/guides/taxi-conventionne-convention-cpam-2025"
              className="text-sm text-blue-700 hover:text-blue-800 hover:underline"
            >
              Guide taxi conventionné
            </Link>
            <Link
              href="/guides/vsl-reglementation-transport-partage"
              className="text-sm text-blue-700 hover:text-blue-800 hover:underline"
            >
              Guide VSL
            </Link>
          </div>
        </div>

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

        {/* Abonnement RSS */}
        <div className="mt-6 bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Rss className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Flux RSS disponible</p>
              <p className="text-xs text-slate-600">Recevez les nouvelles alertes dans votre agrégateur.</p>
            </div>
          </div>
          <a
            href="/feed/veille.xml"
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
          >
            <Rss className="h-3.5 w-3.5" />
            /feed/veille.xml
          </a>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Synthèses informatives, ne se substituent pas aux textes officiels. Consultez un juriste pour toute question d&apos;application.
          </p>
        </div>
      </section>
    </main>
  );
}
