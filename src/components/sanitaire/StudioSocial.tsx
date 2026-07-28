"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Trash2,
  CalendarClock,
  Save,
  AlertTriangle,
  Share2,
  Link2,
  ImagePlus,
  X,
} from "lucide-react";
import StudioConnexions from "@/components/sanitaire/StudioConnexions";

const PROVIDERS: { key: string; label: string }[] = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "google_business", label: "Google Business" },
];

const STATUT_LABEL: Record<string, string> = {
  brouillon: "Brouillon",
  planifie: "Planifié",
  publie: "Publié",
  echec: "Échec",
  annule: "Annulé",
};

const STATUT_CLASSE: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-600",
  planifie: "bg-blue-100 text-blue-700",
  publie: "bg-emerald-100 text-emerald-700",
  echec: "bg-red-100 text-red-700",
  annule: "bg-gray-100 text-gray-400 line-through",
};

type Post = {
  id: string;
  sujet: string | null;
  contenu: string;
  hashtags: string[];
  image_url: string | null;
  providers_cibles: string[];
  statut: string;
  scheduled_at: string | null;
  published_at: string | null;
  resultats: Record<string, unknown>;
  genere_par_ia: boolean;
  created_at: string;
};

type Quota = {
  postsGeneres: number;
  postsRestants: number;
  publicationsUtilisees: number;
  publicationsRestantes: number;
};

export default function StudioSocial({
  nomAffiche,
  configured,
}: {
  nomAffiche: string;
  configured: boolean;
}) {
  const [onglet, setOnglet] = useState<"posts" | "connexions">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [chargement, setChargement] = useState(true);
  const [generation, setGeneration] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // Messages de retour du flux OAuth (?connecte=… / ?erreur=…).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connecte = params.get("connecte");
    const err = params.get("erreur");
    if (connecte) {
      setOnglet("connexions");
      setFlash(`Compte ${connecte === "meta" ? "Facebook / Instagram" : "Google Business"} connecté.`);
    } else if (err) {
      setOnglet("connexions");
      const libelle: Record<string, string> = {
        annule: "Connexion annulée : aucune autorisation n'a été accordée.",
        indisponible: "Cette connexion n'est pas encore disponible.",
        plan: "Réservé aux abonnés Pro.",
        state: "Session de connexion expirée, réessayez.",
        chiffrement: "Connexion momentanément indisponible, réessayez plus tard.",
        no_account: "Aucun compte Google Business n'est associé à ce compte Google.",
        no_location:
          "Aucun établissement Google Business trouvé : créez d'abord une fiche établissement.",
        no_page: "Aucune Page Facebook trouvée sur ce compte.",
      };
      setFlash(libelle[err] || "La connexion a échoué, réessayez.");
    }
    if (connecte || err) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const res = await fetch("/api/studio-social/posts");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur de chargement");
      setPosts(data.posts || []);
      setQuota(data.quota || null);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  async function generer(nombre: 4 | 8) {
    setGeneration(true);
    setErreur(null);
    try {
      const res = await fetch("/api/studio-social/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Échec de la génération");
      await charger();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Échec de la génération");
    } finally {
      setGeneration(false);
    }
  }

  const quotaEpuise = quota ? quota.postsRestants <= 0 : false;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="flex items-center gap-2 text-[#0066CC] mb-1">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wide">Studio réseaux sociaux IA</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Vos posts du mois</h1>
        <p className="text-sm text-gray-500 mt-1">
          Posts localisés pour {nomAffiche} — Facebook, Instagram et Google Business Profile.
        </p>
      </header>

      {/* Onglets */}
      <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setOnglet("posts")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            onglet === "posts" ? "bg-[#0066CC] text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Share2 className="w-4 h-4" /> Mes posts
        </button>
        <button
          type="button"
          onClick={() => setOnglet("connexions")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
            onglet === "connexions" ? "bg-[#0066CC] text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Link2 className="w-4 h-4" /> Connexions
        </button>
      </div>

      {flash && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          {flash}
        </div>
      )}

      {onglet === "connexions" ? (
        <StudioConnexions />
      ) : (
        <>
      {!configured && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>
            La génération IA n&apos;est pas encore configurée sur ce compte. Vous pouvez toutefois
            rédiger vos posts manuellement.
          </span>
        </div>
      )}

      {/* Quota + génération */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="text-sm">
          <p className="font-semibold text-gray-900">Quota mensuel</p>
          {quota ? (
            <p className="text-gray-500">
              {quota.postsRestants} post{quota.postsRestants > 1 ? "s" : ""} à générer ·{" "}
              {quota.publicationsRestantes} publication{quota.publicationsRestantes > 1 ? "s" : ""}{" "}
              restantes
            </p>
          ) : (
            <p className="text-gray-400">—</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={generation || quotaEpuise || !configured}
            onClick={() => generer(4)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0066CC] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0052a3] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Générer 4 posts
          </button>
          <button
            type="button"
            disabled={generation || quotaEpuise || !configured}
            onClick={() => generer(8)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#0066CC] px-4 py-2.5 text-sm font-semibold text-[#0066CC] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Générer 8 posts
          </button>
        </div>
      </div>

      {quotaEpuise && (
        <p className="mb-4 text-sm text-amber-700">
          Quota de génération atteint pour ce mois. Il se réinitialise le 1er du mois prochain.
        </p>
      )}
      {erreur && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {erreur}
        </div>
      )}

      {chargement ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          Aucun post pour l&apos;instant. Cliquez sur « Générer 4 posts » pour démarrer votre
          calendrier éditorial.
        </div>
      ) : (
        <ul className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onChange={charger} />
          ))}
        </ul>
      )}
        </>
      )}
    </div>
  );
}

function PostCard({ post, onChange }: { post: Post; onChange: () => void }) {
  const [contenu, setContenu] = useState(post.contenu);
  const [hashtags, setHashtags] = useState(post.hashtags.join(" "));
  const [imageUrl, setImageUrl] = useState(post.image_url || "");
  const [cibles, setCibles] = useState<string[]>(post.providers_cibles || []);
  const [quand, setQuand] = useState(
    post.scheduled_at ? toLocalInput(post.scheduled_at) : ""
  );
  const [busy, setBusy] = useState(false);
  const [uploadEnCours, setUploadEnCours] = useState(false);
  const [copie, setCopie] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const modifiable = post.statut !== "publie";
  const igSansImage = cibles.includes("instagram") && !imageUrl.trim();

  function toggleCible(key: string) {
    setCibles((c) => (c.includes(key) ? c.filter((k) => k !== key) : [...c, key]));
  }

  async function envoyer(payload: Record<string, unknown>) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/studio-social/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur");
      onChange();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function enregistrer() {
    await envoyer({
      contenu,
      hashtags: hashtags.split(/\s+/).filter(Boolean),
      image_url: imageUrl.trim() || null,
      providers_cibles: cibles,
    });
  }

  async function planifier() {
    if (!quand) {
      setMsg("Choisissez une date et une heure.");
      return;
    }
    await envoyer({
      contenu,
      hashtags: hashtags.split(/\s+/).filter(Boolean),
      image_url: imageUrl.trim() || null,
      providers_cibles: cibles,
      action: "planifier",
      scheduled_at: new Date(quand).toISOString(),
    });
  }

  async function deplanifier() {
    await envoyer({ action: "deplanifier" });
  }

  async function supprimer() {
    setBusy(true);
    try {
      const res = await fetch(`/api/studio-social/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Erreur");
      }
      onChange();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur");
      setBusy(false);
    }
  }

  async function copier() {
    const texte = [contenu, hashtags].filter(Boolean).join("\n\n");
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 1500);
    } catch {
      /* copie manuelle */
    }
  }

  async function envoyerFichierImage(file: File) {
    setUploadEnCours(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/studio-social/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur lors de l'envoi");
      setImageUrl(data.url);
      await envoyer({
        contenu,
        hashtags: hashtags.split(/\s+/).filter(Boolean),
        image_url: data.url,
        providers_cibles: cibles,
      });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur lors de l'envoi de l'image");
    } finally {
      setUploadEnCours(false);
    }
  }

  async function retirerImage() {
    setImageUrl("");
    await envoyer({
      contenu,
      hashtags: hashtags.split(/\s+/).filter(Boolean),
      image_url: null,
      providers_cibles: cibles,
    });
  }

  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {post.sujet && <p className="truncate text-sm font-semibold text-gray-900">{post.sujet}</p>}
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                STATUT_CLASSE[post.statut] || "bg-gray-100 text-gray-600"
              }`}
            >
              {STATUT_LABEL[post.statut] || post.statut}
            </span>
            {post.genere_par_ia && (
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                <Sparkles className="w-3 h-3" /> IA
              </span>
            )}
            {post.scheduled_at && post.statut === "planifie" && (
              <span className="text-[11px] text-blue-600">
                {formatFr(post.scheduled_at)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={copier}
            title="Copier le texte"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            {copie ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={supprimer}
            disabled={busy}
            title="Supprimer"
            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <textarea
        value={contenu}
        onChange={(e) => setContenu(e.target.value)}
        disabled={!modifiable}
        rows={4}
        className="w-full resize-y rounded-xl border border-gray-200 p-3 text-sm text-gray-800 focus:border-[#0066CC] focus:outline-none disabled:bg-gray-50"
      />

      <input
        type="text"
        value={hashtags}
        onChange={(e) => setHashtags(e.target.value)}
        disabled={!modifiable}
        placeholder="#hashtags séparés par des espaces"
        className="mt-2 w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-600 focus:border-[#0066CC] focus:outline-none disabled:bg-gray-50"
      />

      <div className="mt-2">
        {imageUrl ? (
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Image du post"
              className="h-14 w-14 rounded-lg object-cover"
            />
            <span className="flex-1 truncate text-xs text-gray-500">Image ajoutée</span>
            {modifiable && (
              <button
                type="button"
                onClick={retirerImage}
                disabled={busy || uploadEnCours}
                title="Retirer l'image"
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <label
            className={`flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-2.5 text-sm text-gray-500 transition hover:border-[#0066CC] hover:text-[#0066CC] ${
              !modifiable || uploadEnCours ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          >
            {uploadEnCours ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ImagePlus className="w-4 h-4" />
            )}
            {uploadEnCours ? "Envoi en cours…" : "Ajouter une photo depuis votre appareil (obligatoire pour Instagram)"}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              disabled={!modifiable || uploadEnCours}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void envoyerFichierImage(file);
              }}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {PROVIDERS.map((pr) => {
          const on = cibles.includes(pr.key);
          return (
            <button
              key={pr.key}
              type="button"
              disabled={!modifiable}
              onClick={() => toggleCible(pr.key)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                on
                  ? "border-[#0066CC] bg-blue-50 text-[#0066CC]"
                  : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {pr.label}
            </button>
          );
        })}
      </div>

      {igSansImage && (
        <p className="mt-2 text-xs text-amber-700">
          Instagram nécessite une image pour la publication automatique.
        </p>
      )}

      {modifiable && (
        <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-2">
            <label className="text-xs text-gray-500">
              Planifier
              <input
                type="datetime-local"
                value={quand}
                onChange={(e) => setQuand(e.target.value)}
                className="mt-1 block rounded-xl border border-gray-200 p-2 text-sm focus:border-[#0066CC] focus:outline-none"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={enregistrer}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Enregistrer
            </button>
            {post.statut === "planifie" ? (
              <button
                type="button"
                onClick={deplanifier}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:opacity-50"
              >
                Déplanifier
              </button>
            ) : (
              <button
                type="button"
                onClick={planifier}
                disabled={busy || cibles.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0066CC] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0052a3] disabled:opacity-50"
              >
                <CalendarClock className="w-4 h-4" /> Planifier
              </button>
            )}
          </div>
        </div>
      )}

      {msg && <p className="mt-2 text-xs text-red-600">{msg}</p>}
    </li>
  );
}

/** ISO → valeur pour <input type="datetime-local"> dans le fuseau local du navigateur. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatFr(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}
