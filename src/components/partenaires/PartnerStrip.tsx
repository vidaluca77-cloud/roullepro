import Link from "next/link";
import {
  ArrowRight,
  BookHeart,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  getPartnerStripPartners,
  type PartnerStripAudience,
  type PartnerStripPartnerKey,
} from "@/lib/partner-strip";

type PartnerStripProps = {
  audience: PartnerStripAudience;
};

const ICONS: Record<PartnerStripPartnerKey, LucideIcon> = {
  "notre-livre": BookHeart,
  giva: ShieldCheck,
  allopoints: Scale,
};

const ICON_STYLES: Record<PartnerStripPartnerKey, string> = {
  "notre-livre": "bg-rose-50 text-rose-700",
  giva: "bg-emerald-50 text-emerald-700",
  allopoints: "bg-amber-50 text-amber-700",
};

const BADGE_STYLES: Record<PartnerStripPartnerKey, string> = {
  "notre-livre": "bg-rose-100 text-rose-700",
  giva: "bg-slate-100 text-slate-600",
  allopoints: "bg-amber-100 text-amber-700",
};

function PartnerCard({
  partnerKey,
  name,
  description,
  href,
  badge,
  external,
}: {
  partnerKey: PartnerStripPartnerKey;
  name: string;
  description: string;
  href: string;
  badge?: string;
  external?: boolean;
}) {
  const Icon = ICONS[partnerKey];

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${ICON_STYLES[partnerKey]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        {badge ? (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${BADGE_STYLES[partnerKey]}`}
          >
            {badge}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
        <p className="mt-1.5 text-sm leading-6 text-gray-600">{description}</p>
      </div>

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0066CC] transition hover:text-[#0052a3]">
        Découvrir
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </>
  );

  const className =
    "flex min-w-[272px] snap-start flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-slate-200/60 md:min-w-0";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export default function PartnerStrip({ audience }: PartnerStripProps) {
  const partners = getPartnerStripPartners(audience);

  return (
    <section
      aria-labelledby="partner-strip-title"
      data-testid="partner-strip"
      className="border-t border-gray-200 bg-gradient-to-b from-white to-slate-50/80"
    >
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0066CC]">
              Nos partenaires
            </p>
            <h2
              id="partner-strip-title"
              className="mt-1 text-xl font-semibold text-gray-900"
            >
              Trois offres utiles sélectionnées par RoullePro
            </h2>
          </div>

          <Link
            href="/partenaires"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            Tous nos partenaires
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {partners.map((partner) => (
            <PartnerCard
              key={partner.key}
              partnerKey={partner.key}
              name={partner.name}
              description={partner.description}
              href={partner.href}
              badge={partner.badge}
              external={partner.external}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
