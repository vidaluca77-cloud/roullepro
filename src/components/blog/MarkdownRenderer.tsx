/**
 * Renderer markdown custom pour les articles de blog RoullePro.
 * Support : H2, H3, paragraphes, listes à puces, gras inline **texte**.
 * Styles riches compatibles avec @tailwindcss/typography + overrides.
 */

import React from "react";

type Block =
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string; id: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseMarkdown(raw: string): Block[] {
  const lines = raw.split("\n");
  const blocks: Block[] = [];
  let currentList: string[] | null = null;

  const pushList = () => {
    if (currentList) {
      blocks.push({ type: "ul", items: currentList });
      currentList = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      pushList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      pushList();
      const text = trimmed.slice(4);
      blocks.push({ type: "h3", text, id: slugify(text) });
    } else if (trimmed.startsWith("## ")) {
      pushList();
      const text = trimmed.slice(3);
      blocks.push({ type: "h2", text, id: slugify(text) });
    } else if (trimmed.startsWith("- ")) {
      if (!currentList) currentList = [];
      currentList.push(trimmed.slice(2));
    } else {
      pushList();
      blocks.push({ type: "p", text: trimmed });
    }
  }
  pushList();
  return blocks;
}

/** Rend le gras inline **texte** */
function renderInline(s: string): React.ReactNode {
  const parts = s.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-gray-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  const blocks = parseMarkdown(content);

  return (
    <div className="blog-content">
      {blocks.map((b, i) => {
        if (b.type === "h2") {
          return (
            <h2
              key={i}
              id={b.id}
              className="scroll-mt-24 text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-4 tracking-tight border-l-4 border-blue-600 pl-4"
            >
              {b.text}
            </h2>
          );
        }
        if (b.type === "h3") {
          return (
            <h3
              key={i}
              id={b.id}
              className="scroll-mt-24 text-xl font-semibold text-gray-900 mt-8 mb-3 tracking-tight"
            >
              {b.text}
            </h3>
          );
        }
        if (b.type === "ul") {
          return (
            <ul
              key={i}
              className="my-5 space-y-2 text-gray-700 leading-relaxed"
            >
              {b.items.map((it, j) => (
                <li
                  key={j}
                  className="relative pl-6 before:content-[''] before:absolute before:left-1 before:top-[0.7em] before:w-2 before:h-2 before:rounded-full before:bg-blue-600"
                >
                  {renderInline(it)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={i}
            className="text-base md:text-lg text-gray-700 leading-[1.75] mb-5"
          >
            {renderInline(b.text)}
          </p>
        );
      })}
    </div>
  );
}

/** Extrait la table des matières (H2 uniquement) pour sommaire latéral */
export function extractHeadings(content: string): Array<{ id: string; text: string }> {
  const blocks = parseMarkdown(content);
  return blocks
    .filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")
    .map((b) => ({ id: b.id, text: b.text }));
}
