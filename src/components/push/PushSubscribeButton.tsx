"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

export default function PushSubscribeButton() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setSupported(ok);
    if (!ok) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setEnabled(Boolean(sub));
    });
  }, []);

  async function subscribe() {
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        alert("Permission refusée. Vous pouvez l'activer dans les paramètres de votre navigateur.");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const pubKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!pubKey) {
        alert("Configuration notifications manquante.");
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(pubKey) as unknown as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur enregistrement abonnement");
      }
      setEnabled(true);
    } catch (e: any) {
      alert("Erreur activation notifications : " + (e?.message || "inconnue"));
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEnabled(false);
    } catch (e: any) {
      alert("Erreur désactivation : " + (e?.message || "inconnue"));
    } finally {
      setLoading(false);
    }
  }

  if (!supported) {
    return (
      <div className="text-sm text-gray-500 flex items-center gap-2">
        <BellOff className="w-4 h-4" />
        Notifications non supportées sur ce navigateur
      </div>
    );
  }

  return (
    <button
      onClick={enabled ? unsubscribe : subscribe}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border transition ${
        enabled ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
      } disabled:opacity-50`}
    >
      {enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      {loading ? "..." : enabled ? "Notifications activées" : "Activer les notifications"}
    </button>
  );
}
