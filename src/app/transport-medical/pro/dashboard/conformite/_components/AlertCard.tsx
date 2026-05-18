import Link from "next/link";
import { AlertTriangle, ArrowRight, Calendar, Target } from "lucide-react";
import { URGENCY_CLASSES, URGENCY_LABEL, formatApplicableFrom } from "@/lib/reg-alerts";
import type { MatchedAlert } from "@/lib/compliance";
import { describeMatch, metierLabel } from "@/lib/compliance";

export default function AlertCard({ alert }: { alert: MatchedAlert }) {
  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${URGENCY_CLASSES[alert.urgency]}`}
        >
          <AlertTriangle className="h-3 w-3" />
          {URGENCY_LABEL[alert.urgency]}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Target className="h-3 w-3" />
          Concerne votre activité
        </span>
        {alert.metiers.map((code) => (
          <span
            key={code}
            className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
          >
            {metierLabel(code)}
          </span>
        ))}
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2">
        <Link
          href={`/veille-reglementaire/${alert.slug}`}
          className="hover:text-blue-700 transition"
        >
          {alert.title_short}
        </Link>
      </h3>

      <p className="text-slate-700 mb-3 line-clamp-3">{alert.summary_oneliner}</p>

      <p className="text-xs text-slate-500 mb-3">{describeMatch(alert.match)}</p>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {alert.applicable_from ? (
          <p className="inline-flex items-center gap-1.5 text-sm text-slate-600">
            <Calendar className="h-4 w-4" />
            {formatApplicableFrom(alert.applicable_from)}
          </p>
        ) : (
          <span />
        )}
        <Link
          href={`/veille-reglementaire/${alert.slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Lire l&apos;analyse complète
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
