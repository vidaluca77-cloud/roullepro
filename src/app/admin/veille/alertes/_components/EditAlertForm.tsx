"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

type Props = {
  alertId: string;
  defaults: {
    title_short: string;
    title_long: string;
    slug: string;
    summary_oneliner: string;
    urgency: string;
    metiers: string[];
    activites: string[];
    regions: string[];
    applicable_from: string | null;
    deadline: string | null;
    what_changes: string;
    who_is_concerned: string;
    concrete_actions: string[];
    sources: { label: string; url: string }[];
    key_numbers: { label: string; value: string }[];
  };
  metiersOptions: { code: string; label: string }[];
  activitesOptions: { code: string; label: string }[];
  action: (
    formData: FormData
  ) => Promise<{ ok: boolean; error?: string; slug?: string }>;
};

const URGENCY_CHOICES: { code: string; label: string }[] = [
  { code: "critical", label: "Critique" },
  { code: "high", label: "Élevée" },
  { code: "medium", label: "Moyenne" },
  { code: "low", label: "Faible" },
  { code: "info", label: "Information" },
];

export default function EditAlertForm(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  const [titleShort, setTitleShort] = useState(props.defaults.title_short);
  const [titleLong, setTitleLong] = useState(props.defaults.title_long);
  const [slug, setSlug] = useState(props.defaults.slug);
  const [summary, setSummary] = useState(props.defaults.summary_oneliner);
  const [urgency, setUrgency] = useState(props.defaults.urgency || "medium");
  const [metiers, setMetiers] = useState<string[]>(props.defaults.metiers);
  const [activites, setActivites] = useState<string[]>(props.defaults.activites);
  const [regions, setRegions] = useState(props.defaults.regions.join(", "));
  const [applicableFrom, setApplicableFrom] = useState(
    props.defaults.applicable_from || ""
  );
  const [deadline, setDeadline] = useState(props.defaults.deadline || "");
  const [whatChanges, setWhatChanges] = useState(props.defaults.what_changes);
  const [whoConcerned, setWhoConcerned] = useState(
    props.defaults.who_is_concerned
  );
  const [actionsText, setActionsText] = useState(
    props.defaults.concrete_actions.join("\n")
  );
  const [sourcesText, setSourcesText] = useState(
    props.defaults.sources.map((s) => `${s.label}|${s.url}`).join("\n")
  );
  const [keyNumbersText, setKeyNumbersText] = useState(
    props.defaults.key_numbers.map((k) => `${k.label}|${k.value}`).join("\n")
  );

  const toggle = (
    code: string,
    list: string[],
    setter: (n: string[]) => void
  ) => {
    setter(list.includes(code) ? list.filter((x) => x !== code) : [...list, code]);
  };

  const submit = (publish: boolean) => {
    if (!titleShort.trim() || !slug.trim()) {
      setStatus("err");
      setMessage("Titre court et slug requis.");
      return;
    }
    setStatus("idle");
    setMessage("");

    const fd = new FormData();
    fd.set("id", props.alertId);
    fd.set("title_short", titleShort.trim());
    fd.set("title_long", titleLong.trim() || titleShort.trim());
    fd.set("slug", slug.trim());
    fd.set("summary_oneliner", summary.trim());
    fd.set("urgency", urgency);
    fd.set("metiers", JSON.stringify(metiers));
    fd.set("activites", JSON.stringify(activites));
    fd.set("regions", regions);
    fd.set("applicable_from", applicableFrom);
    fd.set("deadline", deadline);
    fd.set("what_changes", whatChanges);
    fd.set("who_is_concerned", whoConcerned);
    fd.set("concrete_actions", actionsText);
    fd.set("sources_text", sourcesText);
    fd.set("key_numbers_text", keyNumbersText);
    if (publish) fd.set("publish", "1");

    startTransition(async () => {
      const res = await props.action(fd);
      if (!res.ok) {
        setStatus("err");
        setMessage(res.error || "Échec de l'enregistrement.");
        return;
      }
      setStatus("ok");
      setMessage(
        publish ? "Enregistré et publié." : "Enregistré."
      );
      router.push("/admin/veille/alertes");
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
      className="space-y-6"
    >
      <Field label="Titre court (≤ 200 car.)" required>
        <input
          type="text"
          value={titleShort}
          maxLength={200}
          onChange={(e) => setTitleShort(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </Field>

      <Field label="Titre long">
        <input
          type="text"
          value={titleLong}
          onChange={(e) => setTitleLong(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </Field>

      <Field
        label="Slug (URL)"
        required
        helper="Attention : changer le slug casse les liens externes."
      >
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
        />
      </Field>

      <Field label="Résumé (1 phrase)">
        <textarea
          rows={2}
          value={summary}
          maxLength={400}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </Field>

      <Field label="Urgence">
        <select
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        >
          {URGENCY_CHOICES.map((u) => (
            <option key={u.code} value={u.code}>
              {u.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Métiers concernés">
        <div className="flex flex-wrap gap-2">
          {props.metiersOptions.map((m) => {
            const active = metiers.includes(m.code);
            return (
              <label
                key={m.code}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-sm cursor-pointer ${
                  active
                    ? "bg-blue-50 border-blue-300 text-blue-800"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(m.code, metiers, setMetiers)}
                  className="h-3.5 w-3.5"
                />
                {m.label}
              </label>
            );
          })}
        </div>
      </Field>

      <Field label="Activités concernées">
        <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto p-1 border border-slate-100 rounded-lg">
          {props.activitesOptions.map((a) => {
            const active = activites.includes(a.code);
            return (
              <label
                key={a.code}
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs cursor-pointer ${
                  active
                    ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(a.code, activites, setActivites)}
                  className="h-3.5 w-3.5"
                />
                {a.label}
              </label>
            );
          })}
        </div>
      </Field>

      <Field label="Régions (codes séparés par virgules, vide = toutes)">
        <input
          type="text"
          value={regions}
          onChange={(e) => setRegions(e.target.value)}
          placeholder="ex : IDF, ARA"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Applicable à partir du">
          <input
            type="date"
            value={applicableFrom}
            onChange={(e) => setApplicableFrom(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </Field>
        <Field label="Date butoir (optionnel)">
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </Field>
      </div>

      <Field label="Ce qui change">
        <textarea
          rows={5}
          value={whatChanges}
          onChange={(e) => setWhatChanges(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </Field>

      <Field label="Qui est concerné">
        <textarea
          rows={3}
          value={whoConcerned}
          onChange={(e) => setWhoConcerned(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </Field>

      <Field label="Actions concrètes (1 par ligne)">
        <textarea
          rows={5}
          value={actionsText}
          onChange={(e) => setActionsText(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
      </Field>

      <Field label="Sources (1 par ligne, format : libellé|url)">
        <textarea
          rows={4}
          value={sourcesText}
          onChange={(e) => setSourcesText(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
        />
      </Field>

      <Field label="Chiffres clés (1 par ligne, format : libellé|valeur)">
        <textarea
          rows={4}
          value={keyNumbersText}
          onChange={(e) => setKeyNumbersText(e.target.value)}
          placeholder="ex : Économies visées|300 M€"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
        />
      </Field>

      {status === "err" && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
      {status === "ok" && (
        <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.push("/admin/veille/alertes")}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg transition hover:border-slate-300 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Enregistrer
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition disabled:bg-emerald-300"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Enregistrer et publier
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-600">*</span>}
      </span>
      {children}
      {helper && (
        <span className="block text-[11px] text-slate-500 mt-1">{helper}</span>
      )}
    </label>
  );
}
