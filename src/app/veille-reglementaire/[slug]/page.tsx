import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  ListChecks,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import {
  getAlertBySlug,
  getAlertBySlugForAdmin,
  listAllPublishedSlugs,
  metierLabel,
  formatFrDate,
  formatApplicableFrom,
  URGENCY_CLASSES,
  URGENCY_LABEL,
} from "@/lib/reg-alerts";
import { createClient as createServerClient } from "@/lib/supabase/server";

const ADMIN_EMAIL = "lucas.horville@lvlia.net";

async function isAdminViewer(): Promise<boolean> {
  try {
    const sb = await createServerClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return false;
    if (user.email === ADMIN_EMAIL) return true;
    const { data: profile } = await sb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    return !!profile && (profile as { role?: string }).role === "admin";
  } catch {
    return false;
  }
}

export const revalidate = 3600;
export const dynamicParams = true;

type RouteParams = { slug: string };

export async function generateStaticParams(): Promise<RouteParams[]> {
  const slugs = await listAllPublishedSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams?: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  let alert = await getAlertBySlug(slug);
  if (!alert && sp.preview && (await isAdminViewer())) {
    alert = await getAlertBySlugForAdmin(slug);
  }
  if (!alert) {
    return {
      title: "Alerte introuvable — Veille RoullePro",
      robots: { index: false },
    };
  }
  const canonical = `/veille-reglementaire/${alert.slug}`;
  const isPreview = !!sp.preview;
  return {
    title: `${alert.title_short} — Veille RoullePro${isPreview ? " (prévisualisation)" : ""}`,
    description: alert.summary_oneliner,
    alternates: { canonical },
    robots: isPreview ? { index: false, follow: false } : undefined,
    openGraph: {
      title: alert.title_short,
      description: alert.summary_oneliner,
      type: "article",
      publishedTime: alert.published_at ?? undefined,
      modifiedTime: alert.last_content_update ?? alert.updated_at ?? undefined,
    },
  };
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://roullepro.com";

export default async function VeilleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams?: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const previewRequested = !!sp.preview;

  let alert = await getAlertBySlug(slug);
  let isPreview = false;
  if (!alert && previewRequested && (await isAdminViewer())) {
    alert = await getAlertBySlugForAdmin(slug);
    isPreview = !!alert;
  } else if (alert && previewRequested && (await isAdminViewer())) {
    // L'alerte est publiee mais on est en preview admin : on garde le bandeau
    // si le status n'est pas published (cas peu probable mais defensive).
    isPreview = alert.status !== "published";
  }
  if (!alert) notFound();

  const canonicalUrl = `${BASE_URL}/veille-reglementaire/${alert.slug}`;
  const articleBody = `${alert.summary_oneliner}\n\n${alert.what_changes}`.slice(0, 5000);

  const newsArticleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: alert.title_long || alert.title_short,
    description: alert.summary_oneliner,
    datePublished: alert.published_at ?? undefined,
    dateModified: alert.last_content_update ?? alert.updated_at ?? alert.published_at ?? undefined,
    author: {
      "@type": "Organization",
      name: "RoullePro",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "RoullePro",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo-roullepro-circle.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    articleBody,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Veille réglementaire",
        item: `${BASE_URL}/veille-reglementaire`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: alert.title_short,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <main className="bg-slate-50 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {isPreview && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-start gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wide text-xs mb-0.5">
                Mode prévisualisation
              </p>
              <p>
                Cette alerte n&apos;est pas encore publiée. Elle est visible uniquement pour vous en tant qu&apos;administrateur.
                Statut actuel : <strong>{alert.status}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-blue-700">
                Accueil
              </Link>
            </li>
            <li>
              <ChevronRight className="inline h-3.5 w-3.5 mx-0.5" />
            </li>
            <li>
              <Link href="/veille-reglementaire" className="hover:text-blue-700">
                Veille réglementaire
              </Link>
            </li>
            <li>
              <ChevronRight className="inline h-3.5 w-3.5 mx-0.5" />
            </li>
            <li className="text-slate-700">{alert.title_short}</li>
          </ol>
        </nav>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${URGENCY_CLASSES[alert.urgency]}`}
          >
            <AlertTriangle className="h-3 w-3" />
            {URGENCY_LABEL[alert.urgency]}
          </span>
          {alert.metiers.map((code) => (
            <span
              key={code}
              className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
            >
              {metierLabel(code)}
            </span>
          ))}
        </div>

        {/* Titre */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
          {alert.title_long}
        </h1>

        {/* Bandeau date + disclaimer */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-6">
          {alert.last_content_update && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Mise à jour le {formatFrDate(alert.last_content_update)}
            </span>
          )}
        </div>

        <div className="mb-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Synthèse informative, ne se substitue pas aux textes officiels. Consultez un juriste pour toute question d&apos;application.
          </p>
        </div>

        <article className="space-y-8">
          {/* L essentiel */}
          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-3">
              <Target className="h-5 w-5 text-blue-700" />
              L&apos;essentiel en une phrase
            </h2>
            <p className="text-lg font-semibold text-slate-900 bg-white border-l-4 border-blue-600 rounded-r-lg p-4">
              {alert.summary_oneliner}
            </p>
          </section>

          {/* Ce qui change */}
          {alert.what_changes && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-3">
                <FileText className="h-5 w-5 text-blue-700" />
                Ce qui change
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-slate-700 leading-relaxed">
                {alert.what_changes.split(/\n+/).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {/* Qui est concerné */}
          {alert.who_is_concerned && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-3">
                <Users className="h-5 w-5 text-blue-700" />
                Qui est concerné
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3 text-slate-700 leading-relaxed">
                {alert.who_is_concerned.split(/\n+/).map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {/* Actions concrètes */}
          {alert.concrete_actions.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-3">
                <ListChecks className="h-5 w-5 text-blue-700" />
                Actions concrètes
              </h2>
              <ul className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
                {alert.concrete_actions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Chiffres clés */}
          {alert.key_numbers.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Chiffres clés</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alert.key_numbers.map((kn, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-lg p-4"
                  >
                    <p className="text-2xl font-bold text-blue-700">{kn.value}</p>
                    <p className="text-sm text-slate-600 mt-1">{kn.label}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Calendrier */}
          {(alert.applicable_from || alert.deadline) && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-3">
                <Calendar className="h-5 w-5 text-blue-700" />
                Calendrier
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
                {alert.applicable_from && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-1 w-32 flex-shrink-0">
                      Entrée en vigueur
                    </span>
                    <span className="text-slate-700 font-medium">
                      {formatApplicableFrom(alert.applicable_from)}
                    </span>
                  </div>
                )}
                {alert.deadline && (
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 mt-1 w-32 flex-shrink-0">
                      Échéance
                    </span>
                    <span className="text-slate-700 font-medium">
                      {formatFrDate(alert.deadline)}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Sources */}
          {alert.sources.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Sources officielles</h2>
              <ul className="bg-white border border-slate-200 rounded-lg p-5 space-y-2">
                {alert.sources.map((src, idx) => (
                  <li key={idx}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                      {src.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Disclaimer final */}
          <section>
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600">
                {alert.disclaimer ||
                  "Cette synthèse a une vocation informative. Elle ne se substitue pas aux textes officiels et n'engage pas la responsabilité de RoullePro. Pour toute question d'application, consultez un juriste ou votre organisation professionnelle."}
              </p>
            </div>
          </section>
        </article>

        {/* Retour */}
        <div className="mt-10">
          <Link
            href="/veille-reglementaire"
            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Toutes les alertes
          </Link>
        </div>
      </div>
    </main>
  );
}
