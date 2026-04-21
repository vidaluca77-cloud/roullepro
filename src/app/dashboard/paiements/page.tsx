import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PushSubscribeButton from "@/components/push/PushSubscribeButton";
import StripeConnectSellerButton from "./StripeConnectSellerButton";

export const dynamic = "force-dynamic";

export default async function PaiementsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/dashboard/paiements");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_account_id, stripe_connect_ready")
    .eq("id", user.id)
    .single();

  const ready = profile?.stripe_connect_ready === true;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">&larr; Retour</Link>
      <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-6">Paiements et notifications</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-lg mb-2">Paiement sécurisé Stripe Connect</h2>
        <p className="text-sm text-gray-600 mb-4">
          Pour recevoir des paiements sécurisés des acheteurs (fonds séquestrés puis libérés), activez votre compte Stripe Connect.
          Frais : 3 % (min 20 €) prélevés par RoullePro sur chaque vente.
        </p>
        {ready ? (
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg">
            Compte Stripe activé et prêt à recevoir des paiements
          </div>
        ) : profile?.stripe_account_id ? (
          <div className="space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm">
              Onboarding en cours ou informations manquantes.
            </div>
            <StripeConnectSellerButton label="Continuer l'onboarding Stripe" />
          </div>
        ) : (
          <StripeConnectSellerButton label="Activer le paiement sécurisé" />
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-lg mb-2">Notifications push</h2>
        <p className="text-sm text-gray-600 mb-4">
          Recevez instantanément une notification sur votre appareil pour les nouveaux messages, offres reçues et paiements.
        </p>
        <PushSubscribeButton />
      </div>
    </div>
  );
}
