/**
 * FaqAccordion — Accordion FAQ stylise base sur l'element natif details/summary
 * (Server Component compatible, aucun JS cote client).
 *
 * Prend FaqItem[] extrait par extractFaq() et rend chaque question dans un
 * accordion accessible avec ancres #faq-N pour partage et linking interne.
 *
 * Le JSON-LD FAQPage est deja injecte separement dans page.tsx via
 * buildFaqJsonLd, ce composant gere uniquement le rendu visuel.
 */

import { ChevronDown, HelpCircle } from "lucide-react";
import type { FaqItem } from "@/lib/blog-seo";

interface FaqAccordionProps {
  items: FaqItem[];
  /** Titre de la section, par defaut "Questions frequentes". */
  title?: string;
}

/**
 * Rend une reponse FAQ avec gestion basique du markdown (gras, liens).
 * Strict equivalent au nettoyage applique dans extractFaq cote backend, mais
 * en preservant les balises HTML safe.
 */
function renderAnswer(answer: string): JSX.Element {
  // Decomposition simple : on remplace **bold** et [text](url) par du HTML
  // safe sans dangerouslySetInnerHTML. On split sur les markers connus.
  const parts: (string | JSX.Element)[] = [];
  let remaining = answer;
  let key = 0;

  while (remaining.length > 0) {
    // Recherche le prochain marker
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    let nextIdx = -1;
    let nextType: "bold" | "link" | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      nextIdx = boldMatch.index;
      nextType = "bold";
    }
    if (
      linkMatch &&
      linkMatch.index !== undefined &&
      (nextIdx === -1 || linkMatch.index < nextIdx)
    ) {
      nextIdx = linkMatch.index;
      nextType = "link";
    }

    if (nextType === null) {
      parts.push(remaining);
      break;
    }

    if (nextIdx > 0) {
      parts.push(remaining.slice(0, nextIdx));
    }

    if (nextType === "bold" && boldMatch) {
      parts.push(
        <strong key={`b-${key++}`} className="font-semibold text-gray-900">
          {boldMatch[1]}
        </strong>,
      );
      remaining = remaining.slice(nextIdx + boldMatch[0].length);
    } else if (nextType === "link" && linkMatch) {
      const url = linkMatch[2];
      const isExternal = url.startsWith("http");
      parts.push(
        <a
          key={`l-${key++}`}
          href={url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-blue-700 hover:text-blue-900 hover:underline font-medium"
        >
          {linkMatch[1]}
        </a>,
      );
      remaining = remaining.slice(nextIdx + linkMatch[0].length);
    }
  }

  return <>{parts}</>;
}

export function FaqAccordion({
  items,
  title = "Questions frequentes",
}: FaqAccordionProps) {
  if (items.length === 0) return null;

  return (
    <section
      id="faq"
      className="not-prose mt-12 mb-10"
      aria-labelledby="faq-heading"
    >
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle
          size={22}
          className="text-blue-600 flex-shrink-0"
          aria-hidden
        />
        <h2
          id="faq-heading"
          className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight"
        >
          {title}
        </h2>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Les reponses aux questions que se posent les patients et les
        professionnels du transport sanitaire conventionne.
      </p>

      <div className="space-y-3">
        {items.map((item, idx) => {
          const anchorId = `faq-${idx + 1}`;
          return (
            <details
              key={anchorId}
              id={anchorId}
              className="group rounded-xl border border-gray-200 bg-white hover:border-blue-200 transition open:border-blue-300 open:shadow-sm"
            >
              <summary className="flex items-start justify-between gap-4 cursor-pointer list-none px-5 py-4 select-none">
                {/* Question en <h3> (et non <span>) pour un parsing AEO / AI Overviews
                    optimal et une coherence avec le JSON-LD FAQPage. */}
                <h3 className="m-0 flex-1 text-base md:text-lg font-semibold text-gray-900 leading-snug group-open:text-blue-700">
                  {item.question}
                </h3>
                <ChevronDown
                  size={20}
                  className="flex-shrink-0 text-gray-400 mt-1 transition-transform duration-200 group-open:rotate-180 group-open:text-blue-600"
                  aria-hidden
                />
              </summary>
              <div className="px-5 pb-5 pt-1">
                <div className="text-gray-700 leading-relaxed text-[15px] border-l-2 border-blue-100 pl-4">
                  {renderAnswer(item.answer)}
                </div>
                <a
                  href={`#${anchorId}`}
                  className="inline-block mt-3 text-xs text-gray-400 hover:text-blue-600 transition"
                  aria-label={`Lien direct vers la question ${idx + 1}`}
                >
                  # Lien direct
                </a>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
