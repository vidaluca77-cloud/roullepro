"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  ACTIVITES_GROUPS,
  METIERS_OPTIONS,
  REGIONS_FR,
} from "@/lib/compliance";

type Props = {
  proId: string;
  defaultMetiers: string[];
  defaultActivites: string[];
  defaultRegionCode: string | null;
  defaultFleetSize: number | null;
  defaultSefi: boolean;
  defaultTags: string[];
  action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
};

export default function ComplianceForm(props: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [metiers, setMetiers] = useState<string[]>(props.defaultMetiers);
  const [activites, setActivites] = useState<string[]>(props.defaultActivites);
  const [regionCode, setRegionCode] = useState<string>(
    props.defaultRegionCode || ""
  );
  const [fleetSize, setFleetSize] = useState<string>(
    props.defaultFleetSize !== null ? String(props.defaultFleetSize) : ""
  );
  const [sefiCertified, setSefiCertified] = useState<boolean>(props.defaultSefi);
  const [tagsText, setTagsText] = useState<string>(
    (props.defaultTags || []).join(", ")
  );
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const toggle = (
    code: string,
    list: string[],
    setter: (next: string[]) => void
  ) => {
    setter(list.includes(code) ? list.filter((x) => x !== code) : [...list, code]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (metiers.length === 0) {
      setStatus("error");
      setMessage("Sélectionnez au moins un métier.");
      return;
    }
    setStatus("idle");
    setMessage("");

    const fd = new FormData();
    fd.set("pro_id", props.proId);
    fd.set("metiers", JSON.stringify(metiers));
    fd.set("activites", JSON.stringify(activites));
    fd.set("region_code", regionCode);
    fd.set("fleet_size", fleetSize);
    fd.set("sefi_certified", sefiCertified ? "1" : "0");
    fd.set("custom_tags", tagsText);

    startTransition(async () => {
      const res = await props.action(fd);
      if (!res.ok) {
        setStatus("error");
        setMessage(res.error || "Échec de l'enregistrement.");
        return;
      }
      setStatus("success");
      setMessage("Profil enregistré.");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      {/* Metiers */}
      <fieldset>
        <legend className="block text-sm font-semibold text-slate-900 mb-2">
          Métiers exercés <span className="text-red-600">*</span>
        </legend>
        <p className="text-xs text-slate-500 mb-3">
          Au moins un métier requis. Cochez plusieurs si votre entreprise en cumule.
        </p>
        <div className="flex flex-wrap gap-2">
          {METIERS_OPTIONS.map((m) => {
            const active = metiers.includes(m.code);
            return (
              <label
                key={m.code}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                  active
                    ? "bg-blue-50 border-blue-300 text-blue-800"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(m.code, metiers, setMetiers)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">{m.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Activites */}
      <fieldset>
        <legend className="block text-sm font-semibold text-slate-900 mb-2">
          Activités et spécialités
        </legend>
        <p className="text-xs text-slate-500 mb-3">
          Plus c&apos;est précis, mieux on cible vos alertes.
        </p>
        <div className="space-y-4">
          {ACTIVITES_GROUPS.map((g) => (
            <div key={g.group}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                {g.group}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.items.map((a) => {
                  const active = activites.includes(a.code);
                  return (
                    <label
                      key={a.code}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition ${
                        active
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggle(a.code, activites, setActivites)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm">{a.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Region + flotte + sefi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="region_code"
            className="block text-sm font-semibold text-slate-900 mb-1"
          >
            Région principale
          </label>
          <select
            id="region_code"
            value={regionCode}
            onChange={(e) => setRegionCode(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Toutes régions</option>
            {REGIONS_FR.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="fleet_size"
            className="block text-sm font-semibold text-slate-900 mb-1"
          >
            Taille de flotte
          </label>
          <input
            id="fleet_size"
            type="number"
            min="0"
            value={fleetSize}
            onChange={(e) => setFleetSize(e.target.value)}
            placeholder="ex : 6"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <span className="block text-sm font-semibold text-slate-900 mb-1">
            Certification SEFi
          </span>
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white cursor-pointer">
            <input
              type="checkbox"
              checked={sefiCertified}
              onChange={(e) => setSefiCertified(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">
              {sefiCertified ? "Certifié" : "Non certifié"}
            </span>
          </label>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label
          htmlFor="custom_tags"
          className="block text-sm font-semibold text-slate-900 mb-1"
        >
          Tags personnalisés
        </label>
        <input
          id="custom_tags"
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="ex : conventionne_cpam, garde_blanche, materiel_bariatrique"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-slate-500 mt-1">
          Séparés par des virgules. Sert au matching avancé (Phase 4).
        </p>
      </div>

      {/* Message + submit */}
      {status === "error" && message && (
        <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
      {status === "success" && message && (
        <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Enregistrer mon profil
            </>
          )}
        </button>
      </div>
    </form>
  );
}
