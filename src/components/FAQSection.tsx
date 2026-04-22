import { ChevronDown } from "lucide-react";

export type FAQItem = {
  question: string;
  answer: string;
};

type Props = {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
};

export default function FAQSection({ title, subtitle, items }: Props) {
  // Schema.org FAQPage — format attendu par Google et les moteurs IA
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.answer,
      },
    })),
  };

  return (
    <section className="bg-slate-50 border-y border-slate-200">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="mb-10 text-center">
          <div className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">
            Questions frequentes
          </div>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-slate-900">
            {title || "Tout ce qu'il faut savoir"}
          </h2>
          {subtitle && (
            <p className="mt-4 text-slate-600 text-[15px] max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200">
          {items.map((it, idx) => (
            <details key={idx} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                <h3 className="font-semibold text-slate-900 text-[15px] leading-snug">
                  {it.question}
                </h3>
                <ChevronDown
                  size={18}
                  className="text-slate-400 shrink-0 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-slate-600 text-[15px] leading-relaxed">
                {it.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
