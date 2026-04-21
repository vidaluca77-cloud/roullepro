import type { Metadata } from "next";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowRight, Star, ShieldCheck, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
  searchParams: { estimation?: string };
}

async function getGarage(id: string) {
  const sb = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await sb
    .from("garages_partenaires")
    .select("id, ville, code_postal, specialites, note_moyenne, nb_ventes_total, nb_places_parking, statut")
    .eq("id", id)
    .eq("statut", "actif")
    .single();
  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const g = await getGarage(params.id);
  if (!g) return { title: "Garage introuvable — RoullePro" };
  const ville = g.ville ?? "France";
  return {
    title: `Dépôt-vente utilitaire ${ville} — Partenaire vérifié | RoullePro`,
    description: `Confiez votre véhicule à un garage partenaire RoullePro vérifié à ${ville}. Photos HD, visibilité premium, paiement sécurisé. Récupération à domicile possible.`,
    alternates: { canonical: `https://roullepro.com/depot-vente/garages/${params.id}` },
  };
}

export default async function GarageFichePage({ params, searchParams }: PageProps) {
  const g = await getGarage(params.id);
  if (!g) notFound();

  const estimationId = searchParams.estimation ?? null;
  const ville = g.ville ?? "France";
  const titre = `Partenaire RoullePro — ${ville}`;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link href="/depot-vente" className="hover:text-blue-600 transition">Dépôt-vente</Link>
          <span>/</span>
          <Link href="/depot-vente/garages" className="hover:text-blue-600 transition">Garages</Link>
          <span>/</span>
          <span className="text-slate-600">{ville}</span>
        </nav>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 border border-white/20 rounded-full px-2.5 py-0.5 mb-3">
                  <ShieldCheck size={12} /> Garage vérifié par RoullePro
                </div>
                <h1 className="text-3xl font-extrabold mb-2">{titre}</h1>
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <MapPin size={14} />
                  <span>{[g.code_postal, g.ville].filter(Boolean).join(" ")}</span>
                </div>
              </div>
              {g.note_moyenne && (
                <div className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2">
                  <Star size={16} className="text-amber-300 fill-amber-300" />
                  <span className="font-bold text-xl">{Number(g.note_moyenne).toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Infos */}
          <div className="p-8">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-sm text-blue-900">
              <p className="font-semibold mb-1">Confidentialité de nos partenaires</p>
              <p className="text-blue-800">
                L&apos;identité complète du garage, son adresse précise et ses coordonnées directes vous sont communiquées après validation de votre demande de dépôt. Cette démarche protège à la fois nos partenaires et la qualité du service.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              {/* Zone d'intervention */}
              <div>
                <h2 className="font-bold text-slate-900 mb-4">Zone d&apos;intervention</h2>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Secteur de {ville}{g.code_postal ? ` (${g.code_postal})` : ""}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Récupération à domicile possible dans un rayon de 50 km</span>
                  </div>
                  {g.nb_places_parking && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{g.nb_places_parking} places de parking sécurisées</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Spécialités */}
              <div>
                <h2 className="font-bold text-slate-900 mb-4">Spécialités</h2>
                {g.specialites && g.specialites.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(g.specialites as string[]).map((s: string) => (
                      <span
                        key={s}
                        className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-xl border border-blue-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Toutes catégories de véhicules</p>
                )}

                {g.nb_ventes_total !== null && g.nb_ventes_total !== undefined && g.nb_ventes_total > 0 && (
                  <div className="mt-4 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="text-2xl font-extrabold text-emerald-600">{g.nb_ventes_total}</div>
                    <div className="text-sm text-emerald-700">vente{g.nb_ventes_total > 1 ? "s" : ""} réalisée{g.nb_ventes_total > 1 ? "s" : ""} via RoullePro</div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
              {estimationId ? (
                <Link
                  href={`/depot-vente/garages/${g.id}/reserver?estimation=${estimationId}`}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-xl transition"
                >
                  Déposer mon véhicule ici
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    href={`/depot-vente/estimer`}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-4 rounded-xl transition"
                  >
                    Déposer mon véhicule ici
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/depot-vente/garages"
                    className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium px-8 py-4 rounded-xl transition"
                  >
                    Voir tous les garages
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
