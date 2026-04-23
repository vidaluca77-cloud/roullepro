"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import type { ProSanitaire } from "@/lib/sanitaire-data";

export default function EditFicheForm({ fiche }: { fiche: ProSanitaire }) {
  const router = useRouter();
  const [nomCommercial, setNomCommercial] = useState(fiche.nom_commercial || "");
  const [telephone, setTelephone] = useState(fiche.telephone_public || "");
  const [emailPublic, setEmailPublic] = useState(fiche.email_public || "");
  const [siteWeb, setSiteWeb] = useState(fiche.site_web || "");
  const [adresse, setAdresse] = useState(fiche.adresse || "");
  const [description, setDescription] = useState(fiche.description || "");
  const [services, setServices] = useState((fiche.services || []).join(", "));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const isPremium = fiche.plan === "premium" || fiche.plan === "pro_plus";

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
