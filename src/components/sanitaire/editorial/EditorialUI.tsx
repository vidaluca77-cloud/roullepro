/**
 * Composants éditoriaux partagés pour les pages publiques de simulation tarifaire
 * (/simulateur-taxi-conventionne, /tarif-ambulance, /tarif-vsl,
 * /simulateur-transport-sanitaire).
 *
 * Purement présentationnels : ils restylent le contenu existant sans en modifier
 * le texte, les H2, ni la structure sémantique (h2, p, table, details…). La
 * palette reste celle du site : marine #0B1120 / #0f1d3a, accent #0066CC, slate.
 */

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, ChevronDown, Info } from "lucide-react";

/** Conteneur d'article éditorial centré, sections aérées. */
export function ArticleContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 sm:py-16 space-y-12 sm:space-y-16 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Titre de section H2 avec marqueur visuel (pastille d'icône accent + barre).
 * Le texte du H2 est transmis via `children` et n'est jamais reformulé.
 */
export function SectionHeading({
  id,
  icon: Icon,
  children,
}: {
  id?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 flex items-start gap-3 text-2xl sm:text-3xl font-bold text-[#0B1120] tracking-tight"
    >
      {Icon ? (
        <span className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0066CC] ring-1 ring-blue-100">
          <Icon className="h-5 w-5" />
        </span>
      ) : (
        <span className="mt-1 h-7 w-1.5 flex-shrink-0 rounded-full bg-[#0066CC]" aria-hidden />
      )}
      <span>{children}</span>
    </h2>
  );
}

/** Paragraphe éditorial (slate lisible, interligne détendu). */
export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-600 leading-relaxed sm:text-[17px]">{children}</p>;
}

/** Carte de « feature » : pastille d'icône, titre fort, description. */
export function FeatureCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#0066CC]/40 hover:shadow-md">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0066CC] ring-1 ring-blue-100">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold text-[#0B1120]">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}

export function FeatureGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

/** Carte statistique : chiffre mis en évidence + libellé. */
export function StatCard({
  value,
  label,
  accent = false,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 text-center shadow-sm ${
        accent
          ? "border-transparent bg-gradient-to-br from-[#0f1d3a] to-[#0066CC] text-white"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className={`text-3xl font-bold ${accent ? "text-white" : "text-[#0066CC]"}`}>{value}</div>
      <div className={`mt-1 text-sm ${accent ? "text-blue-100" : "text-slate-600"}`}>{label}</div>
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{children}</div>;
}

/** Encadré « Bon à savoir / À retenir » : fond bleu clair, bordure gauche accent. */
export function Callout({
  title,
  icon: Icon = Info,
  children,
}: {
  title?: React.ReactNode;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-r-xl border-l-4 border-[#0066CC] bg-blue-50/70 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-[#0066CC] ring-1 ring-blue-100">
          <Icon className="h-4 w-4" />
        </span>
        <div className="text-sm leading-relaxed text-slate-700">
          {title ? <div className="mb-1 font-semibold text-[#0B1120]">{title}</div> : null}
          {children}
        </div>
      </div>
    </div>
  );
}

/** Enveloppe de tableau stylé : arrondis, ombre, scroll horizontal mobile. */
export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
      <table className="w-full min-w-[520px] text-sm">{children}</table>
    </div>
  );
}

/**
 * FAQ en accordéon natif (<details>/<summary>), sans JS.
 * Le contenu affiché doit rester identique au tableau `items` utilisé pour le
 * JSON-LD FAQPage afin de garder les deux strictement synchronisés.
 */
export function FaqAccordion({
  items,
  defaultOpenFirst = true,
}: {
  items: { question: string; answer: string }[];
  defaultOpenFirst?: boolean;
}) {
  return (
    <div className="space-y-3">
      {items.map((q, i) => (
        <details
          key={i}
          open={defaultOpenFirst && i === 0}
          className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-[#0066CC]/40 open:border-[#0066CC]/40 open:shadow-md"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-[#0B1120] [&::-webkit-details-marker]:hidden">
            <span>{q.question}</span>
            <ChevronDown className="h-5 w-5 flex-shrink-0 text-[#0066CC] transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{q.answer}</div>
        </details>
      ))}
    </div>
  );
}

/** Bande CTA marine dégradée avec bouton accent. */
export function CtaBand({
  title,
  description,
  href,
  cta,
}: {
  title: React.ReactNode;
  description: React.ReactNode;
  href: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-blue-100">{description}</p>
        </div>
        <Link
          href={href}
          className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0066CC] px-6 py-3.5 font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-white hover:text-[#0B1120]"
        >
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
