"use client";

/**
 * Module admin — liste des demandes de transport.
 * Filtres (statut multi, departement, categorie multi, recherche texte
 * debouncee 300ms, tri date) + tableau pagine "Charger plus" (50/page).
 * Lecture via GET /api/admin/demandes-transport (vue overview, auth admin).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, RefreshCw } from "lucide-react";
import { LIBELLE_TYPE_TRANSPORT, type TypeTransport } from "@/lib/transport-types";

type StatutDemande = "envoyee" | "acceptee" | "traitee" | "annulee" | "sans_suite";

const STATUTS: { value: StatutDemande; label: string }[] = [
  { value: "envoyee", label: "Envoyée" },
  { value: "acceptee", label: "Acceptée" },
  { value: "traitee", label: "Terminée" },
  { value: "annulee", label: "Annulée" },
  { value: "sans_suite", label: "Sans suite" },
];

const CATEGORIES: { value: TypeTransport; label: string }[] = [
  { value: "taxi", label: "Taxi" },
  { value: "vsl", label: "VSL" },
  { value: "ambulance", label: "Ambulance" },
];

const PAGE_SIZE = 50;

type DemandeRow = {
  id: string;
  created_at: string;
  type_transport: TypeTransport;
  nom: string | null;
  telephone: string | null;
  email: string | null;
  departement_cible: string | null;
  ville_cible: string | null;
  lieu_depart: string | null;
  lieu_arrivee: string | null;
  statut: StatutDemande;
  total_pros_notifies: number;
  pros_acceptees: number;
  pros_declinees: number;
  pros_pending: number;
  pro_accepteur_nom_commercial: string | null;
  pro_accepteur_raison_sociale: string | null;
};

function statutBadgeClass(statut: string): string {
  switch (statut) {
    case "acceptee":
      return "bg-green-100 text-green-800";
    case "envoyee":
      return "bg-blue-100 text-blue-800";
    case "annulee":
      return "bg-red-100 text-red-800";
    case "sans_suite":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function statutLabel(statut: string): string {
  return STATUTS.find((s) => s.value === statut)?.label || statut;
}

function prosResume(r: DemandeRow): string {
  const total = r.total_pros_notifies || 0;
  if (total === 0) return "Aucun pro";
  if (r.pros_acceptees > 0) return `${r.pros_acceptees}/${total} acceptée`;
  if (r.pros_pending > 0) return `${r.pros_pending}/${total} en attente`;
  if (r.pros_declinees > 0) return `${r.pros_declinees}/${total} déclinée`;
  return `${total} notifié(s)`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function DemandesAdminClient() {
  const [statuts, setStatuts] = useState<StatutDemande[]>(
    STATUTS.filter((s) => s.value !== "sans_suite").map((s) => s.value)
  );
  const [categories, setCategories] = useState<TypeTransport[]>([]);
  const [dpt, setDpt] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sort, setSort] = useState<"desc" | "asc">("desc");

  const [departements, setDepartements] = useState<string[]>([]);
  const [rows, setRows] = useState<DemandeRow[]>([]);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce 300ms sur la recherche texte.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    fetch("/api/admin/demandes-transport/facets")
      .then((r) => r.json())
      .then((d) => setDepartements(d.departements || []))
      .catch(() => undefined);
  }, []);

  const buildParams = useCallback(
    (nextOffset: number) => {
      const p = new URLSearchParams();
      statuts.forEach((s) => p.append("statut", s));
      categories.forEach((c) => p.append("categorie", c));
      if (dpt) p.set("dpt", dpt);
      if (debouncedQ) p.set("q", debouncedQ);
      p.set("sort", sort);
      p.set("limit", String(PAGE_SIZE));
      p.set("offset", String(nextOffset));
      return p.toString();
    },
    [statuts, categories, dpt, debouncedQ, sort]
  );

  const reqId = useRef(0);

  const load = useCallback(
    async (nextOffset: number, append: boolean) => {
      const myId = ++reqId.current;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/demandes-transport?${buildParams(nextOffset)}`);
        const data = await res.json();
        if (myId !== reqId.current) return;
        if (!res.ok) {
          setError(data.error || "Erreur de chargement");
          return;
        }
        const incoming = (data.demandes || []) as DemandeRow[];
        setRows((prev) => (append ? [...prev, ...incoming] : incoming));
        setCount(data.count ?? 0);
        setOffset(nextOffset);
      } catch {
        if (myId === reqId.current) setError("Erreur réseau");
      } finally {
        if (myId === reqId.current) setLoading(false);
      }
    },
    [buildParams]
  );

  // Recharge depuis le debut a chaque changement de filtre.
  useEffect(() => {
    load(0, false);
  }, [load]);

  const toggleStatut = (s: StatutDemande) =>
    setStatuts((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  const toggleCategorie = (c: TypeTransport) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const hasMore = rows.length < count;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Statut</p>
          <div className="flex flex-wrap gap-2">
            {STATUTS.map((s) => {
              const active = statuts.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => toggleStatut(s.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                    active
                      ? "bg-[#0066CC] text-white border-[#0066CC]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Catégorie</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = categories.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => toggleCategorie(c.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                    active
                      ? "bg-[#0066CC] text-white border-[#0066CC]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Recherche
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nom, téléphone ou email"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Département
            </label>
            <select
              value={dpt}
              onChange={(e) => setDpt(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30"
            >
              <option value="">Tous</option>
              {departements.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
              Tri
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value === "asc" ? "asc" : "desc")}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30"
            >
              <option value="desc">Date décroissante</option>
              <option value="asc">Date croissante</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {count} demande{count > 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => load(0, false)}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-800"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-3 py-3 font-semibold">Date</th>
                <th className="px-3 py-3 font-semibold">Type</th>
                <th className="px-3 py-3 font-semibold">Patient</th>
                <th className="px-3 py-3 font-semibold">Tél</th>
                <th className="px-3 py-3 font-semibold">Dpt / Ville</th>
                <th className="px-3 py-3 font-semibold">Trajet</th>
                <th className="px-3 py-3 font-semibold">Statut</th>
                <th className="px-3 py-3 font-semibold">Pros notifiés</th>
                <th className="px-3 py-3 font-semibold">Accepté par</th>
                <th className="px-3 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 align-top">
                  <td className="px-3 py-3 whitespace-nowrap text-gray-600">{formatDate(r.created_at)}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {LIBELLE_TYPE_TRANSPORT[r.type_transport] || r.type_transport}
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-900">{r.nom || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    {r.telephone ? (
                      <a href={`tel:${r.telephone}`} className="text-[#0066CC] hover:underline">
                        {r.telephone}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-gray-600">
                    {[r.departement_cible, r.ville_cible].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="px-3 py-3 max-w-[200px] truncate text-gray-600" title={`${r.lieu_depart || ""} → ${r.lieu_arrivee || ""}`}>
                    {[r.lieu_depart, r.lieu_arrivee].filter(Boolean).join(" → ") || "—"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statutBadgeClass(r.statut)}`}>
                      {statutLabel(r.statut)}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-gray-600">{prosResume(r)}</td>
                  <td className="px-3 py-3 text-gray-600">
                    {r.pro_accepteur_nom_commercial || r.pro_accepteur_raison_sociale || "—"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <Link
                      href={`/admin/transport-medical/demandes/${r.id}`}
                      className="text-[#0066CC] hover:underline font-medium"
                    >
                      Détails
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="px-3 py-12 text-center text-gray-500">
                    Aucune demande pour ces filtres.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => load(offset + PAGE_SIZE, true)}
            disabled={loading}
            className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 disabled:opacity-50"
          >
            {loading ? "Chargement…" : "Charger plus"}
          </button>
        </div>
      )}
    </div>
  );
}
