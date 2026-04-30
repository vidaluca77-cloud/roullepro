"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  Loader2,
  Clock,
  Image as ImageIcon,
  Upload,
  X,
  Lock,
  Sparkles,
} from "lucide-react";
import type { ProSanitaire } from "@/lib/sanitaire-data";

const MAX_PHOTOS = 10;

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
  const [photos, setPhotos] = useState<string[]>(
    Array.isArray(fiche.photos) ? fiche.photos : []
  );
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg, setPhotoMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  // Plan unique « Pro » (19,90 €/mois) — toute valeur autre que 'gratuit' = pro
  const isPro =
    fiche.plan === "essential" || fiche.plan === "premium" || fiche.plan === "pro_plus";

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

  const onPhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isPro) {
      setPhotoMsg("Photos réservées au plan Pro");
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      setPhotoMsg(`Limite de ${MAX_PHOTOS} photos atteinte`);
      return;
    }
    setPhotoUploading(true);
    setPhotoMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("pro_id", fiche.id);
      const res = await fetch("/api/sanitaire/photos/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      if (Array.isArray(data.photos)) setPhotos(data.photos);
      else if (data.url) setPhotos((p) => [...p, data.url]);
      setPhotoMsg("Photo ajoutée");
      router.refresh();
    } catch (err) {
      setPhotoMsg(`Erreur : ${(err as Error).message}`);
    } finally {
      setPhotoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onPhotoDelete = async (url: string) => {
    if (!confirm("Supprimer cette photo ?")) return;
    try {
      const res = await fetch("/api/sanitaire/photos/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pro_id: fiche.id, url }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Erreur");
      setPhotos(Array.isArray(data.photos) ? data.photos : photos.filter((p) => p !== url));
      router.refresh();
    } catch (err) {
      setPhotoMsg(`Erreur : ${(err as Error).message}`);
    }
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
          helper={!isPro ? "Le lien devient cliquable sur votre fiche publique avec le plan Pro." : undefined}
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
        label="À propos / Présentation"
        helper="Visible par tous les visiteurs sur votre fiche publique. Jusqu'à 1000 caractères."
      >
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
          rows={5}
          className={`${inputCls} resize-none`}
          placeholder="Présentez votre entreprise, votre zone d'intervention, vos spécialités, votre flotte, votre expérience..."
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

      <div className="border border-gray-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#0066CC]" />
            <span className="text-sm font-semibold text-gray-800">Photos de votre activité</span>
            {isPro ? (
              <span className="text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                Plan Pro
              </span>
            ) : (
              <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Lock className="w-3 h-3" /> Plan Pro requis
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {photos.length}/{MAX_PHOTOS}
          </div>
        </div>

        {!isPro ? (
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium mb-1">
                  Donnez confiance grâce à vos photos
                </p>
                <p className="text-xs text-gray-600 mb-3">
                  Véhicules, locaux, équipe — jusqu&apos;à {MAX_PHOTOS} photos affichées sur
                  votre fiche publique. Inclus dans le plan Pro à 19,90 €/mois.
                </p>
                <Link
                  href="/transport-medical/tarifs"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Activer le plan Pro
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-3">
                {photos.map((url) => (
                  <div
                    key={url}
                    className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onPhotoDelete(url)}
                      className="absolute top-1 right-1 bg-white/90 hover:bg-red-600 hover:text-white text-gray-700 rounded-full w-6 h-6 flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                      aria-label="Supprimer la photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading || photos.length >= MAX_PHOTOS}
                className="inline-flex items-center gap-2 bg-[#0066CC] hover:bg-[#0052a3] disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                {photoUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {photoUploading ? "Envoi..." : "Ajouter une photo"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={onPhotoSelect}
                className="hidden"
              />
              <span className="text-xs text-gray-500">JPG, PNG ou WEBP, 5 Mo max.</span>
            </div>
            {photoMsg && (
              <div
                className={`mt-2 text-xs rounded-lg px-3 py-2 ${
                  photoMsg.startsWith("Erreur")
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {photoMsg}
              </div>
            )}
          </>
        )}
      </div>

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
