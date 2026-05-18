"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";

type Props = {
  proId: string;
  alertId: string;
  itemKey: string;
  label: string;
  description: string | null;
  recommended: boolean;
  initialChecked: boolean;
  toggle: (
    proId: string,
    alertId: string,
    itemKey: string,
    checked: boolean
  ) => Promise<{ ok: boolean; error?: string }>;
};

export default function ChecklistItem(props: Props) {
  const [checked, setChecked] = useState(props.initialChecked);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onToggle = () => {
    const next = !checked;
    setChecked(next);
    setError(null);
    startTransition(async () => {
      const res = await props.toggle(
        props.proId,
        props.alertId,
        props.itemKey,
        next
      );
      if (!res.ok) {
        setChecked(!next);
        setError(res.error || "Échec de l'enregistrement.");
      }
    });
  };

  return (
    <li
      className={`flex items-start gap-3 p-3 rounded-lg border transition ${
        checked
          ? "bg-emerald-50 border-emerald-200"
          : "bg-white border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-pressed={checked}
        aria-label={
          checked ? `Décocher : ${props.label}` : `Cocher : ${props.label}`
        }
        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center transition ${
          checked
            ? "bg-emerald-600 border-emerald-600 text-white"
            : "bg-white border-slate-300 hover:border-emerald-500"
        } ${pending ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
      >
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : checked ? (
          <Check className="w-3.5 h-3.5" />
        ) : null}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-sm font-semibold ${
              checked ? "text-emerald-900 line-through" : "text-slate-900"
            }`}
          >
            {props.label}
          </span>
          {props.recommended && (
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Recommandé
            </span>
          )}
        </div>
        {props.description && (
          <p
            className={`text-sm mt-1 ${
              checked ? "text-emerald-800" : "text-slate-600"
            }`}
          >
            {props.description}
          </p>
        )}
        {error && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    </li>
  );
}
