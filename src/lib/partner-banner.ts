export type PartnerBannerAudience = "public" | "pro";
export type PartnerBannerId = "giva" | "allopoints" | "notre-livre";

export type PartnerBannerItem = {
  id: PartnerBannerId;
  name: string;
  headline: string;
  badge?: string;
  href: string;
  external?: boolean;
};

const PARTNERS_BY_ID: Record<PartnerBannerId, PartnerBannerItem> = {
  "notre-livre": {
    id: "notre-livre",
    name: "Notre Livre",
    headline: "Offrez leurs mémoires en vrai livre",
    badge: "-10 % code ROULLEPRO",
    href: "https://notrelivre.com?utm_source=roullepro&utm_medium=banniere",
    external: true,
  },
  giva: {
    id: "giva",
    name: "Giva",
    headline: "Assurance pro transport sanitaire - devis en ligne",
    href: "/partenaires/assurance-pro",
  },
  allopoints: {
    id: "allopoints",
    name: "Allopoints Protect",
    headline: "Protegez votre permis",
    badge: "-5 % avec RoullePro",
    href: "/partenaires/protection-permis",
  },
};

const AUDIENCE_ORDER = {
  public: ["notre-livre", "giva", "allopoints"],
  pro: ["giva", "allopoints", "notre-livre"],
} satisfies Record<PartnerBannerAudience, PartnerBannerId[]>;

const HIDDEN_EXACT_PATHS = new Set([
  "/partenaires",
  "/pricing",
  "/dashboard/paiements",
  "/depot-vente/estimer",
  "/transport-medical/tarifs",
]);

const HIDDEN_PREFIXES = [
  "/auth",
  "/garage/inscription",
  "/suivi-demande",
  "/transport-medical/inscription",
  "/transport-medical/pro/reclamer",
];

const PRO_AUDIENCE_PREFIXES = ["/dashboard", "/garage/dashboard"];
const PUBLIC_BANNER_PREFIXES = ["/blog", "/guides"];
const SANITAIRE_PRO_BASE = "/transport-medical/pro";

function hasPathPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function normalizePathname(pathname?: string | null): string {
  if (!pathname) return "";
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function getOrderedPartners(
  audience: PartnerBannerAudience,
): PartnerBannerItem[] {
  return AUDIENCE_ORDER[audience].map((id) => PARTNERS_BY_ID[id]);
}

function isSensitivePath(pathname: string): boolean {
  if (HIDDEN_EXACT_PATHS.has(pathname)) {
    return true;
  }

  if (HIDDEN_PREFIXES.some((prefix) => hasPathPrefix(pathname, prefix))) {
    return true;
  }

  if (/^\/depot-vente\/garages\/[^/]+\/(?:reserver|achat-confirme)$/.test(pathname)) {
    return true;
  }

  if (/^\/transport-medical\/vers\/[^/]+$/.test(pathname)) {
    return true;
  }

  return false;
}

function isProAudiencePath(pathname: string): boolean {
  if (PRO_AUDIENCE_PREFIXES.some((prefix) => hasPathPrefix(pathname, prefix))) {
    return true;
  }

  if (
    pathname !== SANITAIRE_PRO_BASE &&
    pathname !== `${SANITAIRE_PRO_BASE}/reclamer` &&
    hasPathPrefix(pathname, SANITAIRE_PRO_BASE)
  ) {
    return true;
  }

  return false;
}

function isPublicBannerPath(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }

  return PUBLIC_BANNER_PREFIXES.some((prefix) => hasPathPrefix(pathname, prefix));
}

export function getPartnerBannerContext(pathname?: string | null): {
  show: boolean;
  audience: PartnerBannerAudience;
} {
  const normalizedPathname = normalizePathname(pathname);

  if (!normalizedPathname || isSensitivePath(normalizedPathname)) {
    return { show: false, audience: "public" };
  }

  if (isProAudiencePath(normalizedPathname)) {
    return {
      show: true,
      audience: "pro",
    };
  }

  return {
    show: isPublicBannerPath(normalizedPathname),
    audience: "public",
  };
}
