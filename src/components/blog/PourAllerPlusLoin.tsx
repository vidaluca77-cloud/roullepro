/**
 * Encart « Pour aller plus loin » injecte en fin d'article de blog.
 * Pousse 3 a 6 liens internes contextuels vers les piliers, simulateurs et
 * pages villes qui doivent capter le jus SEO du blog (chantier D du maillage).
 *
 * La selection est deterministe et delegue entierement a la fonction pure
 * selectionnerLiensInternes : ce composant ne fait que l'affichage.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  selectionnerLiensInternes,
  type ArticleContexte,
} from "@/lib/blog-liens-internes";

export function PourAllerPlusLoin({ article }: { article: ArticleContexte }) {
  const liens = selectionnerLiensInternes(article);
  if (liens.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-gray-100">
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
        Pour aller plus loin
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {liens.map((lien) => (
          <li key={lien.href}>
            <Link
              href={lien.href}
              className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <span className="leading-snug">{lien.label}</span>
              <ArrowRight
                size={16}
                className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
