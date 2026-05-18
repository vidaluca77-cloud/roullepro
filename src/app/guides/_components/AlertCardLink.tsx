import Link from "next/link";
import { AlertTriangle, ArrowRight, Calendar } from "lucide-react";
import {
  URGENCY_CLASSES,
  URGENCY_LABEL,
  formatApplicableFrom,
  type RegUrgency,
} from "@/lib/reg-alerts";

export type AlertLinkData = {
  slug: string;
  title_short: string;
  summary_oneliner: string;
  urgency: RegUrgency;
  applicable_from: string | null;
};

export default function AlertCardLink({ alert }: { alert: AlertLinkData }) {
  return (
    <Link
      href={`/veille-reglementaire/${alert.slug}`}
      className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition no-underline"
    >
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${URGENCY_CLASSES[alert.urgency]}`}
        >
          <AlertTriangle className="h-3 w-3" />
          {URGENCY_LABEL[alert.urgency]}
        </span>
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1.5">
        {alert.title_short}
      </h3>
      <p className="text-sm text-slate-600 mb-3 line-clamp-3">
        {alert.summary_oneliner}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        {alert.applicable_from ? (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            {formatApplicableFrom(alert.applicable_from)}
          </span>
        ) : (
          <span />
        )}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700">
          Lire l&apos;analyse
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
