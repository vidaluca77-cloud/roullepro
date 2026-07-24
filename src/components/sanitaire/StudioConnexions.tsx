"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Facebook, Instagram, MapPin, Check, Clock } from "lucide-react";

type Connexion = {
  provider: "facebook" | "instagram" | "google_business";
  connecte: boolean;
  disponible: boolean;
  account_name: string | null;
  statut: string | null;
};

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

  useEffect(() => {
    charger();
  }, [charger]);

  async function deconnecter(provider: string) {
    setBusy(provider);
    try {
      await fetch(`/api/studio-social/connections/${provider}`, { method: "DELETE" });
      await charger();
    } finally {
      setBusy(null);
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
          return (
            <li
              key={c.provider}
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
              ) : c.disponible ? (
                <a
                  href={meta.start}
                  className="rounded-xl bg-[#0066CC] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0052a3]"
                >
                  Connecter
                </a>
              ) : (
                <span className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400">
                  Bientôt
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
