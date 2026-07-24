export type PartnerStripAudience = "public" | "pro";

export type PartnerStripPartnerKey = "notre-livre" | "giva" | "allopoints";

export type PartnerStripPartner = {
  key: PartnerStripPartnerKey;
  name: string;
  description: string;
  badge?: string;
  href: string;
  external?: boolean;
};

const PARTNERS: Record<PartnerStripPartnerKey, PartnerStripPartner> = {
  "notre-livre": {
    key: "notre-livre",
    name: "Notre Livre",
    description:
      "Offrez leurs mémoires en vrai livre — -10 % avec le code ROULLEPRO",
    badge: "-10 %",
    href: "https://notrelivre.com?utm_source=roullepro&utm_medium=bandeau",
    external: true,
  },
  giva: {
    key: "giva",
    name: "Giva",
    description: "Assurance pro transport sanitaire — devis en ligne",
    href: "/partenaires/assurance-pro",
  },
  allopoints: {
    key: "allopoints",
    name: "Allopoints Protect",
    description: "Protégez votre permis — -5 % avec RoullePro",
    badge: "-5 %",
    href: "/partenaires/protection-permis",
  },
};

const PUBLIC_ORDER: PartnerStripPartnerKey[] = [
  "notre-livre",
  "giva",
  "allopoints",
];

const PRO_ORDER: PartnerStripPartnerKey[] = [
  "giva",
  "allopoints",
  "notre-livre",
];

const HIDDEN_DASHBOARD_PREFIXES = ["/dashboard/paiements", "/dashboard/transactions"];

function normalizePathname(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function startsWithSegment(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

function isBlogRoute(pathname: string): boolean {
  return startsWithSegment(pathname, "/blog");
}

function isDashboardRoute(pathname: string): boolean {
  return startsWithSegment(pathname, "/dashboard");
}

function isGarageDashboardRoute(pathname: string): boolean {
  return startsWithSegment(pathname, "/garage/dashboard");
}

function isSanitaireDashboardRoute(pathname: string): boolean {
  if (pathname === "/transport-medical/pro") return false;
  if (startsWithSegment(pathname, "/transport-medical/pro/reclamer")) return false;
  return startsWithSegment(pathname, "/transport-medical/pro");
}

function isExcludedDashboardRoute(pathname: string): boolean {
  return HIDDEN_DASHBOARD_PREFIXES.some((prefix) =>
    startsWithSegment(pathname, prefix)
  );
}

export function getPartnerStripAudience(
  pathname: string | null | undefined,
): PartnerStripAudience | null {
  const normalizedPathname = normalizePathname(pathname);

  if (!normalizedPathname) return null;
  if (normalizedPathname === "/") {
    return null;
  }
  if (isBlogRoute(normalizedPathname)) {
    return "public";
  }
  if (isExcludedDashboardRoute(normalizedPathname)) {
    return null;
  }
  if (
    isDashboardRoute(normalizedPathname) ||
    isGarageDashboardRoute(normalizedPathname) ||
    isSanitaireDashboardRoute(normalizedPathname)
  ) {
    return "pro";
  }
  return null;
}

export function getPartnerStripPartners(
  audience: PartnerStripAudience,
): PartnerStripPartner[] {
  const order = audience === "pro" ? PRO_ORDER : PUBLIC_ORDER;
  return order.map((key) => PARTNERS[key]);
}
