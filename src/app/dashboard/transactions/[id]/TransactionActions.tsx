"use client";

import { useState } from "react";

export default function TransactionActions({
  tx,
  isBuyer,
  isSeller,
}: {
  tx: any;
  isBuyer: boolean;
  isSeller: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function release() {
    if (!confirm("Confirmer la livraison ? Les fonds seront transférés au vendeur et cette action est irréversible.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/escrow/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx_id: tx.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erreur");
        return;
      }
      window.location.reload();
    } catch (e: any) {
      alert(e?.message);
    } finally {
      setLoading(false);
    }
  }

  async function dispute() {
    if (!reason.trim()) {
      alert("Veuillez indiquer la raison du litige");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/escrow/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx_id: tx.id, reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Erreur");
        return;
      }
      window.location.reload();
    } catch (e: any) {
      alert(e?.message);
    } finally {
      setLoading(false);
    }
  }

  if (tx.status === "held" && isBuyer) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
        <h3 className="font-semibold">Actions disponibles</h3>
        <p className="text-sm text-gray-600">Avez-vous bien reçu le véhicule en l'état ?</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={release}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50"
          >
            Oui — Libérer les fonds au vendeur
          </button>
          <button
            onClick={() => setDisputeOpen((o) => !o)}
            disabled={loading}
            className="flex-1 border border-red-300 text-red-600 hover:bg-red-50 py-3 px-6 rounded-lg font-semibold"
          >
            Non — Signaler un litige
          </button>
        </div>
        {disputeOpen && (
          <div className="space-y-2 pt-3 border-t">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrivez le problème rencontré..."
              rows={4}
              className="w-full border rounded-lg p-3 text-sm"
            />
            <button
              onClick={dispute}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Envoyer le litige
            </button>
          </div>
        )}
      </div>
    );
  }

  if (tx.status === "held" && isSeller) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold mb-2">En attente de confirmation acheteur</h3>
        <p className="text-sm text-gray-600">
          Les fonds sont sécurisés. Dès que l'acheteur confirme la livraison, ils seront transférés sur votre compte Stripe Connect.
        </p>
        <button
          onClick={() => setDisputeOpen((o) => !o)}
          className="mt-3 text-sm text-red-600 hover:underline"
        >
          Signaler un problème
        </button>
        {disputeOpen && (
          <div className="space-y-2 pt-3 mt-3 border-t">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Décrivez le problème..."
              rows={3}
              className="w-full border rounded-lg p-3 text-sm"
            />
            <button
              onClick={dispute}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              Envoyer
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
