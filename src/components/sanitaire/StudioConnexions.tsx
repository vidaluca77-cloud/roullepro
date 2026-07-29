"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Facebook, Instagram, MapPin, Check, Clock, AlertTriangle, ListChecks } from "lucide-react";

type Connexion = {
  provider: "facebook" | "instagram" | "google_business";
  connecte: boolean;
  disponible: boolean;
  account_name: string | null;
  statut: string | null;
};

type EtablissementCandidat = { name: string; title: string | null; compte: string };

const META = {
  facebook: { label: "Facebook", Icon: Facebook, start: "/api/studio-social/connect/meta" },
  instagram: { label: "Instagram", Icon: Instagram, start: "/api/studio-social/connect/meta" },
  google_business: {
    label: "Google Business Profile",
    Icon: MapPin,
    start: "/api/studio-social/connect/google",
  },
} as const;

export default function StudioConnexions() {
  const [connexions, setConnexions] = useState<Connexion[]>([]);
  const [chargement, setChargement] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  // Établissements Google en attente de choix (statut 'en_attente_choix').
  const [etablissements, setEtablissements] = useState<EtablissementCandidat[]>([]);
  const [chargementChoix, setChargementChoix] = useState(false);
  const [erreurChoix, setErreurChoix] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setChargement(true);
    try {
      const res = await fetch("/api/studio-social/connections");
      const data = await res.json();
      if (res.ok) setConnexions(data.connexions || []);
    } finally {
      setChargement(false);
    }
  }, []);

  const chargerChoix = useCallback(async () => {
    try {
      const res = await fetch("/api/studio-social/connect/google/choix");
      const data = await res.json();
      if (res.ok) setEtablissements(data.enAttente ? data.etablissements || [] : []);
    } catch {
      // Non bloquant : l'utilisateur peut recharger la page.
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // La liste des établissements candidats n'a besoin d'être chargée que si Google
  // Business est justement en attente de choix.
  useEffect(() => {
    const google = connexions.find((c) => c.provider === "google_business");
    if (google?.statut === "en_attente_choix") {
      chargerChoix();
    } else {
      setEtablissements([]);
    }
  }, [connexions, chargerChoix]);

  async function deconnecter(provider: string) {
    setBusy(provider);
    try {
      await fetch(`/api/studio-social/connections/${provider}`, { method: "DELETE" });
      await charger();
    } finally {
      setBusy(null);
    }
  }

  async function choisirEtablissement(name: string) {
    setChargementChoix(true);
    setErreurChoix(null);
    try {
      const res = await fetch("/api/studio-social/connect/google/choix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Erreur lors de la sélection");
      setEtablissements([]);
      await charger();
    } catch (e) {
      setErreurChoix(e instanceof Error ? e.message : "Erreur lors de la sélection");
    } finally {
      setChargementChoix(false);
    }
  }

  if (chargement) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">
        Connectez vos réseaux pour publier automatiquement. Vos accès sont stockés de façon
        sécurisée côté serveur et ne sont jamais partagés.
      </p>
      <ul className="space-y-3">
        {connexions.map((c) => {
          const meta = META[c.provider];
          const Icon = meta.Icon;
          // Token révoqué/expiré côté plateforme : le cron a marqué la connexion en
          // erreur, seule une nouvelle autorisation la rétablit.
          const aReconnecter = !c.connecte && c.statut === "error";
          const enAttenteChoix = c.provider === "google_business" && c.statut === "en_attente_choix";
          return (
            <li key={c.provider}>
              <div
                className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{meta.label}</p>
                    {c.connecte ? (
                      <p className="flex items-center gap-1 text-xs text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                        Connecté{c.account_name ? ` · ${c.account_name}` : ""}
                      </p>
                    ) : enAttenteChoix ? (
                      <p className="flex items-center gap-1 text-xs text-blue-600">
                        <ListChecks className="w-3.5 h-3.5" />
                        Plusieurs établissements trouvés — choisissez le vôtre ci-dessous
                      </p>
                    ) : aReconnecter ? (
                      <p className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Accès expiré ou révoqué — reconnectez le compte
                      </p>
                    ) : c.disponible ? (
                      <p className="text-xs text-gray-400">Non connecté</p>
                    ) : (
                      <p className="flex items-center gap-1 text-xs text-amber-600">
                        <Clock className="w-3.5 h-3.5" /> Bientôt disponible
                      </p>
                    )}
                  </div>
                </div>

                {c.connecte ? (
                  <button
                    type="button"
                    disabled={busy === c.provider}
                    onClick={() => deconnecter(c.provider)}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Déconnecter
                  </button>
                ) : enAttenteChoix ? (
                  <button
                    type="button"
                    disabled={busy === c.provider}
                    onClick={() => deconnecter(c.provider)}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Annuler
                  </button>
                ) : c.disponible ? (
                  <a
                    href={meta.start}
                    className="rounded-xl bg-[#0066CC] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0052a3]"
                  >
                    {aReconnecter ? "Reconnecter" : "Connecter"}
                  </a>
                ) : (
                  <span className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400">
                    Bientôt
                  </span>
                )}
              </div>

              {enAttenteChoix && (
                <div className="mt-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="mb-3 text-sm font-medium text-gray-800">
                    Votre compte Google gère plusieurs établissements. Sélectionnez celui à
                    connecter à RoullePro :
                  </p>
                  {erreurChoix && (
                    <p className="mb-3 flex items-center gap-1 text-xs text-red-600">
                      <AlertTriangle className="w-3.5 h-3.5" /> {erreurChoix}
                    </p>
                  )}
                  {etablissements.length === 0 ? (
                    <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" /> Chargement des établissements…
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {etablissements.map((e) => (
                        <li
                          key={e.name}
                          className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="w-4 h-4 flex-shrink-0 text-gray-400" />
                            <span className="truncate text-sm text-gray-800">
                              {e.title || e.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={chargementChoix}
                            onClick={() => choisirEtablissement(e.name)}
                            className="flex-shrink-0 rounded-lg bg-[#0066CC] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0052a3] disabled:opacity-50"
                          >
                            Choisir
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
