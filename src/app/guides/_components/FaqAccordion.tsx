import { Plus } from "lucide-react";

export type FaqItem = { q: string; a: string };

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((it, idx) => (
        <details
          key={idx}
          className="group border border-slate-200 rounded-xl bg-white open:border-blue-200 open:shadow-sm"
        >
          <summary className="flex items-start justify-between gap-3 cursor-pointer p-5 list-none">
            {/* Question rendue en <h3> (et non <span>) : ameliore le parsing AEO/AI
                Overviews et la coherence avec le JSON-LD FAQPage. */}
            <h3 className="text-base font-semibold text-slate-900 m-0">{it.q}</h3>
            <Plus className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5 transition group-open:rotate-45" />
          </summary>
          <div className="px-5 pb-5 -mt-1 text-slate-700 leading-relaxed text-sm whitespace-pre-line">
            {it.a}
          </div>
        </details>
      ))}
    </div>
  );
}
