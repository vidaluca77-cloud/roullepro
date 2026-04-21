import { createClient } from "@/lib/supabase/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import StripeConnectButton from "./StripeConnectButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
  searchParams: { stripe?: string; msg?: string };
}

export default async function AdminGarageDetailPage({ params, searchParams }: PageProps) {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/auth/login");

  const sbService = createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await sbService
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== "admin") redirect("/");

  const { data: garage } = await sbService
    .from("garages_partenaires")
    .select(
      "id, raison_sociale, contact_email, contact_nom, contact_telephone, ville, code_postal, adresse, siret, statut, created_at, nb_ventes_total, stripe_account_id, stripe_connect_ready, stripe_connect_details_submitted, stripe_connect_charges_enabled, stripe_connect_payouts_enabled, stripe_connect_updated_at"
    )
    .eq("id", params.id)
    .single();

  if (!garage) notFound();

  const g = garage as any;
  const stripeOk = g.stripe_connect_ready === true;
  const stripeStarted = !!g.stripe_account_id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link href="/admin/garages" className="text-sm text-slate-400 hover:text-slate-600">
          &larr; Retour aux garages
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">{g.raison_sociale}</h1>
      <p className="text-sm text-slate-500 mb-8">
        {[g.code_postal, g.ville].filter(Boolean).join(" ")}
      </p>

      {searchParams.stripe === "success" && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm">
          Stripe Connect : flow d&apos;onboarding termine. L&apos;etat sera synchronise sous quelques secondes.
        </div>
      )}
      {searchParams.stripe === "error" && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm">
          Stripe Connect : echec. {searchParams.msg || ""}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Identite</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">SIRET</dt>
              <dd className="font-mono text-slate-700">{g.siret}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Statut</dt>
              <dd className="font-medium text-slate-900">{g.statut}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Ventes</dt>
              <dd className="text-slate-700">{g.nb_ventes_total ?? 0}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Contact</h2>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Nom</dt>
              <dd className="text-slate-700">{g.contact_nom}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="text-slate-700">{g.contact_email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Telephone</dt>
              <dd className="text-slate-700">{g.contact_telephone || "-"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Adresse</dt>
              <dd className="text-slate-700 text-right">{g.adresse || "-"}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Stripe Connect</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compte connecte necessaire pour recevoir les parts garage (transfert 7 % + forfait prep).
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              stripeOk
                ? "bg-emerald-100 text-emerald-700"
                : stripeStarted
                  ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {stripeOk ? "Actif" : stripeStarted ? "En cours" : "Non configure"}
          </span>
        </div>

        {stripeStarted && (
          <dl className="text-xs grid grid-cols-2 gap-2 mb-4 font-mono">
            <div>
              <dt className="text-slate-400">Compte</dt>
              <dd className="text-slate-700 break-all">{g.stripe_account_id}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Details soumis</dt>
              <dd>{g.stripe_connect_details_submitted ? "oui" : "non"}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Charges</dt>
              <dd>{g.stripe_connect_charges_enabled ? "oui" : "non"}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Payouts</dt>
              <dd>{g.stripe_connect_payouts_enabled ? "oui" : "non"}</dd>
            </div>
          </dl>
        )}

        <StripeConnectButton garageId={g.id} started={stripeStarted} ready={stripeOk} />
      </div>
    </div>
  );
}
