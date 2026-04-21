import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TransactionActions from "./TransactionActions";

export const dynamic = "force-dynamic";

export default async function TransactionPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/dashboard/transactions/" + params.id);

  const { data: tx } = await supabase
    .from("escrow_transactions")
    .select("*, annonces(id, title, marque, modele, images)")
    .eq("id", params.id)
    .single();

  if (!tx) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Transaction introuvable</h1>
        <Link href="/dashboard" className="text-blue-600 underline">Retour au dashboard</Link>
      </div>
    );
  }

  const isBuyer = tx.buyer_id === user.id;
  const isSeller = tx.seller_id === user.id;
  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente de paiement", color: "bg-yellow-100 text-yellow-800" },
    held: { label: "Fonds séquestrés", color: "bg-blue-100 text-blue-800" },
    released: { label: "Fonds libérés", color: "bg-green-100 text-green-800" },
    refunded: { label: "Remboursé", color: "bg-gray-100 text-gray-800" },
    disputed: { label: "Litige en cours", color: "bg-red-100 text-red-800" },
    cancelled: { label: "Annulée", color: "bg-gray-100 text-gray-600" },
  };
  const st = statusLabels[tx.status] || { label: tx.status, color: "bg-gray-100 text-gray-700" };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">&larr; Retour</Link>
      <h1 className="text-2xl md:text-3xl font-bold mt-2 mb-6">Paiement sécurisé</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Véhicule</p>
            <h2 className="text-xl font-semibold">{tx.annonces?.title || "Véhicule"}</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${st.color}`}>{st.label}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Montant total</p>
            <p className="text-lg font-semibold">{(tx.amount_total / 100).toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Part vendeur</p>
            <p className="text-lg font-semibold">{(tx.amount_seller / 100).toFixed(2)} €</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Commission RoullePro</p>
            <p className="text-lg font-semibold">{(tx.amount_platform / 100).toFixed(2)} €</p>
          </div>
        </div>

        {tx.dispute_reason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-800 mb-1">Litige signalé</p>
            <p className="text-sm text-red-700">{tx.dispute_reason}</p>
          </div>
        )}
      </div>

      <TransactionActions tx={tx} isBuyer={isBuyer} isSeller={isSeller} />

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900">
        <p className="font-semibold mb-1">Comment ça marche ?</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>L'acheteur paie via Stripe — les fonds sont séquestrés sur le compte RoullePro.</li>
          <li>Le vendeur organise la livraison ou remise du véhicule.</li>
          <li>À réception, l'acheteur confirme — les fonds sont transférés au vendeur.</li>
          <li>En cas de problème, chacun peut signaler un litige.</li>
        </ol>
      </div>
    </div>
  );
}
