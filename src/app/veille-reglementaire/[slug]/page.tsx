import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Link2,
  ListChecks,
  ShieldCheck,
  Target,
  Truck,
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
import { AUTHORS } from "@/lib/authors";
import SourcesBlock from "@/components/SourcesBlock";

const ADMIN_EMAIL = "lucas.horville@lvlia.net";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.roullepro.com";

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
      title: "Alerte introuvable — Veille",
      robots: { index: false },
    };
  }
  const canonical = `/veille-reglementaire/${alert.slug}`;
  const isPreview = !!sp.preview;

  const keywords = [
    ...alert.metiers.map(metierLabel),
    ...alert.activites,
    "réglementation",
    "transport sanitaire",
    "France",
  ].filter(Boolean);

  return {
    title: `${alert.title_short} — Veille${isPreview ? " (prévisualisation)" : ""}`,
    description: alert.summary_oneliner,
    alternates: { canonical },
    keywords,
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

/** Liens guides maillage par métier */
const GUIDE_LINKS: Record<string, { href: string; label: string }> = {
  ambulance: {
    href: "/guides/ambulance-reglementation-conformite-2026",
    label: "Guide réglementation ambulance 2026",
  },
  vsl: {
    href: "/guides/vsl-reglementation-transport-partage",
    label: "Guide réglementation VSL",
  },
  taxi_conventionne: {
    href: "/guides/taxi-conventionne-convention-cpam-2025",
    label: "Guide convention CPAM taxi conventionné",
  },
};

/** Format citation APA simplifié */
function buildApaCitation(
  title: string,
  slug: string,
  publishedAt: string | null
): string {
  const year = publishedAt ? new Date(publishedAt).getFullYear() : new Date().getFullYear();
  const dateAccess = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
  const url = `${BASE_URL}/veille-reglementaire/${slug}`;
  return `RoullePro. (${year}). ${title}. Veille réglementaire transport sanitaire. Consulté le ${dateAccess}, sur ${url}`;
}

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
    isPreview = alert.status !== "published";
  }
  if (!alert) notFound();

  const canonicalUrl = `${BASE_URL}/veille-reglementaire/${alert.slug}`;
  const articleBody = `${alert.summary_oneliner}\n\n${alert.what_changes}`.slice(0, 5000);

  const author = AUTHORS["lucas-horville"];

  const keywords = [
    ...alert.metiers.map(metierLabel),
    ...alert.activites,
    "réglementation",
    "transport sanitaire",
    "France",
    "JORF",
    "Légifrance",
  ].filter(Boolean);

  // JSON-LD NewsArticle (Google News + LLM)
  const newsArticleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: alert.title_long || alert.title_short,
    description: alert.summary_oneliner,
    datePublished: alert.published_at ?? undefined,
    dateModified:
      alert.last_content_update ??
      alert.updated_at ??
      alert.published_at ??
      undefined,
    author,
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
    articleSection: "Veille réglementaire",
    keywords: keywords.join(", "),
    articleBody,
    // SpeakableSpecification sur H1 + chapô (résumé)
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".article-chapo"],
    },
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

  // Sources officielles pour le bloc lien légal
  const officialSources = alert.sources.filter(
    (s) =>
      /legifrance|jorf|journal.officiel|ameli|ars|atih|piste\.gouv/i.test(s.url)
  );

  // Liens guides maillage
  const guideLinks = alert.metiers
    .map((code) => GUIDE_LINKS[code])
    .filter((g): g is NonNullable<typeof g> => !!g);

  const apaCitation = buildApaCitation(
    alert.title_long || alert.title_short,
    alert.slug,
    alert.published_at
  );

  // Sources additionnelles pour SourcesBlock
  const extraSources = alert.sources.map((s) => ({
    label: s.label,
    description: "Source officielle",
    href: s.url,
  }));

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

        {/* Titre H1 (speakable) */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
          {alert.title_long}
        </h1>

        {/* Chapo (speakable) */}
        <p className="article-chapo text-lg text-slate-700 font-medium mb-6 leading-relaxed">
          {alert.summary_oneliner}
        </p>

        {/* Bandeau date + disclaimer */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-6">
          {alert.last_content_update && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Mise à jour le {formatFrDate(alert.last_content_update)}
            </span>
          )}
          {alert.published_at && !alert.last_content_update && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Publié le {formatFrDate(alert.published_at)}
            </span>
          )}
        </div>

        <div className="mb-8 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Synthèse informative, ne se substitue pas aux textes officiels. Consultez un juriste pour toute question d&apos;application.
          </p>
        </div>

        {/* Bloc texte légal source (officialSources en premier) */}
        {officialSources.length > 0 && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-amber-700 flex-shrink-0" />
              <h2 className="font-bold text-amber-900 text-base">Texte légal source — Source officielle</h2>
            </div>
            <p className="text-sm text-amber-800 mb-3">
              Cette analyse est fondée sur les textes officiels suivants. Consultez-les directement pour les dispositions exactes.
            </p>
            <ul className="space-y-2">
              {officialSources.map((src, idx) => (
                <li key={idx}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-amber-800 hover:text-amber-900 font-semibold hover:underline text-sm"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    {src.label}
                    <span className="text-amber-600 font-normal text-xs">(source officielle)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

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

          {/* Impact pratique pour les transporteurs */}
          {alert.concrete_actions.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-3">
                <Truck className="h-5 w-5 text-blue-700" />
                Impact pratique pour les transporteurs
              </h2>
              <div className="bg-white border border-slate-200 rounded-lg p-5">
                <p className="text-sm text-slate-600 mb-4">
                  Ce que cela change concrètement dans votre activité quotidienne :
                </p>
                <ul className="space-y-3">
                  {alert.concrete_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Actions concrètes (alias pour compatibilite) */}
          {alert.concrete_actions.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-3">
                <ListChecks className="h-5 w-5 text-blue-700" />
                Actions concrètes à mener
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

          {/* Sources officielles */}
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

          {/* Bloc SourcesBlock */}
          <SourcesBlock
            variant="guide"
            extraSources={extraSources.length > 0 ? extraSources : undefined}
          />

          {/* Maillage : guides RoullePro pertinents */}
          {guideLinks.length > 0 && (
            <section className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="h-5 w-5 text-blue-700" />
                <h2 className="font-bold text-blue-900 text-base">Guides RoullePro associés</h2>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                Pour approfondir la réglementation applicable à votre métier :
              </p>
              <ul className="space-y-2">
                {guideLinks.map((g) => (
                  <li key={g.href}>
                    <Link
                      href={g.href}
                      className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 font-semibold text-sm hover:underline"
                    >
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      {g.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Citation APA */}
          <section className="bg-slate-100 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-slate-600" />
              <h2 className="font-bold text-slate-900 text-base">
                Cet article peut être cité — Format APA
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Copier et coller la référence ci-dessous pour citer cette analyse.
            </p>
            <div
              className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-700 leading-relaxed select-all cursor-text"
              role="textbox"
              aria-label="Citation APA copiable"
              aria-readonly="true"
            >
              {apaCitation}
            </div>
          </section>

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
