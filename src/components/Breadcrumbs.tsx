import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buildBreadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo-schema";

/**
 * Fil d'Ariane partagé : nav HTML visible + BreadcrumbList JSON-LD.
 * Le dernier élément n'est pas cliquable (page courante).
 */
export default function Breadcrumbs({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  const jsonLd = buildBreadcrumbJsonLd(items);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Fil d'Ariane"
        className={`flex items-center flex-wrap gap-1.5 text-sm text-gray-500 ${className}`}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={item.href} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" aria-hidden="true" />}
              {isLast ? (
                <span className="text-gray-700 font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-blue-600">
                  {item.label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
