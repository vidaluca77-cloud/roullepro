"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Clock } from "lucide-react";
import type { ProSanitaire } from "@/lib/sanitaire-data";

const JOURS = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
] as const;

type HorairesState = Record<string, string>;

export default function EditFicheForm({ fiche }: { fiche: ProSanitaire }) {
  const router = useRouter();
  const [nomCommercial, setNomCommercial] = useState(fiche.nom_commercial || "");
  const [telephone, setTelephone] = useState(fiche.telephone_public || "");
  const [emailPublic, setEmailPublic] = useState(fiche.email_public || "");
  const [siteWeb, setSiteWeb] = useState(fiche.site_web || "");
  const [adresse, setAdresse] = useState(fiche.adresse || "");
  const [description, setDescription] = useState(fiche.description || "");
  const [services, setServices] = useState((fiche.services || []).join(", "));
  const [horaires, setHoraires] = useState<HorairesState>(() => {
    const initial: HorairesState = {};
    const src = (fiche.horaires || {}) as Record<string, string>;
    for (const j of JOURS) initial[j.key] = src[j.key] || "";
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const isPremium = fiche.plan === "premium" || fiche.plan === "pro_plus";

  const setHoraire = (jour: string, value: string) =>
    setHoraires((h) => ({ ...h, [jour]: value }));
  const toggleFerme = (jour: string) =>
    setHoraires((h) => ({
      ...h,
      [jour]: h[jour]?.toLowerCase() === "fermé" ? "" : "Fermé",
    }));
  const appliquerATous = () => {
    const ref = horaires.lundi?.trim();
    if (!ref) return;
    setHoraires((h) => {
      const next = { ...h };
      for (const j of JOURS) next[j.key] = ref;
      return next;
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/sanitaire/fiche", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pro_id: fiche.id,
          nom_commercial: nomCommercial.trim() || null,
          telephone_public: telephone.trim() || null,
          email_public: emailPublic.trim() || null,
          site_web: siteWeb.trim() || null,
          adresse: adresse.trim() || null,
          description: description.trim() || null,
          services: services
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          horaires: (() => {
            const out: Record<string, string> = {};
            for (const j of JOURS) {
              const v = (horaires[j.key] || "").trim();
              if (v) out[j.key] = v;
            }
            return Object.keys(out).length > 0 ? out : null;
          })(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erreur");
      }
      setMsg("Modifications enregistrées");
      router.refresh();
    } catch (err) {
      setMsg(`Erreur : ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nom commercial (optionnel)">
          <input
            type="text"
            value={nomCommercial}
            onChange={(e) => setNomCommercial(e.target.value)}
            placeholder={fiche.raison_sociale}
            className={inputCls}
          />
        </Field>
        <Field label="Téléphone public">
          <input
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="02 31 00 00 00"
            className={inputCls}
          />
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Email public">
          <input
            type="email"
            value={emailPublic}
            onChange={(e) => setEmailPublic(e.target.value)}
            placeholder="contact@entreprise.fr"
            className={inputCls}
          />
        </Field>
        <Field
          label="Site web"
          helper={!isPremium ? "Cliquable uniquement pour les plans Essential et plus." : undefined}
        >
          <input
            type="url"
            value={siteWeb}
            onChange={(e) => setSiteWeb(e.target.value)}
            placeholder="https://..."
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Adresse">
        <input type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)} className={inputCls} />
      </Field>

      <Field
        label="Description"
        helper={!isPremium ? "Les visiteurs voient la description uniquement si votre plan est Essential ou plus." : "Jusqu'à 1000 caractères."}
      >
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
          rows={5}
          className={`${inputCls} resize-none`}
          placeholder="Présentez votre entreprise, votre zone d'intervention, vos spécialités..."
        />
        <div className="text-xs text-gray-400 mt-1 text-right">{description.length}/1000</div>
      </Field>

      <Field label="Services proposés (séparés par des virgules)" helper="Exemple : Transport allongé, Dialyse, Longue distance, Nuit, Intervention CPAM">
        <input
          type="text"
          value={services}
          onChange={(e) => setServices(e.target.value)}
          className={inputCls}
        />
      </Field>

      <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0066CC]" />
            <span className="text-sm font-semibold text-gray-800">
              Horaires d&apos;ouverture
            </span>
            <span className="text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
              Inclus dans le plan gratuit
            </span>
          </div>
          <button
            type="button"
            onClick={appliquerATous}
            disabled={!horaires.lundi?.trim()}
            className="text-xs font-medium text-[#0066CC] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            Appliquer lundi à tous les jours
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Format libre, ex : « 08:00–12:00, 14:00–19:00 ». Laissez vide pour ne pas afficher
          le jour, ou cliquez sur « Fermé ».
        </p>
        <div className="space-y-2">
          {JOURS.map((jour) => {
            const v = horaires[jour.key] || "";
            const ferme = v.toLowerCase() === "fermé" || v.toLowerCase() === "ferme";
            return (
              <div key={jour.key} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <span className="text-sm font-medium text-gray-700 w-20 shrink-0">
                  {jour.label}
                </span>
                <input
                  type="text"
                  value={ferme ? "" : v}
                  onChange={(e) => setHoraire(jour.key, e.target.value)}
                  disabled={ferme}
                  placeholder="08:00–12:00, 14:00–19:00"
                  className={`flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition disabled:bg-gray-100 disabled:text-gray-400`}
                />
                <button
                  type="button"
                  onClick={() => toggleFerme(jour.key)}
                  className={`text-xs font-semibold px-3 py-2 rounded-lg transition shrink-0 ${
                    ferme
                      ? "bg-gray-700 text-white hover:bg-gray-800"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {ferme ? "Fermé" : "Marquer fermé"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {msg && (
        <div className={`text-sm rounded-lg px-3 py-2 ${msg.startsWith("Erreur") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {msg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl transition"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Enregistrer
      </button>
    </form>
  );
}

const inputCls =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#0066CC] focus:ring-2 focus:ring-blue-100 outline-none transition";

function Field({ label, children, helper }: { label: string; children: React.ReactNode; helper?: string }) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-700 mb-1.5">{label}</div>
      {children}
      {helper && <div className="text-xs text-gray-500 mt-1">{helper}</div>}
    </label>
  );
}
