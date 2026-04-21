"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User, Phone, MapPin, Building, AlertCircle, Shield, Settings, CreditCard } from "lucide-react";
import VerificationSection from "./VerificationSection";
import PasswordSection from "@/components/profil/PasswordSection";
import PushSubscribeButton from "@/components/push/PushSubscribeButton";
import StripeConnectSellerButton from "@/app/dashboard/paiements/StripeConnectSellerButton";

type TabId = "infos" | "securite" | "reglages";

function ProfilContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    city: "",
    company_name: "",
    siret: "",
    is_verified: false,
    statut_verification: "non_verifie" as string,
    stripe_account_id: null as string | null,
    stripe_connect_ready: false,
  });

  const initialTab = (searchParams.get("tab") as TabId) || "infos";
  const [tab, setTab] = useState<TabId>(initialTab);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, [tab]);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setUser(user);
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setProfile({
        full_name: data.full_name || "",
        phone: data.phone || "",
        city: data.city || "",
        company_name: data.company_name || "",
        siret: data.siret || "",
        is_verified: data.is_verified || false,
        statut_verification: data.statut_verification || "non_verifie",
        stripe_account_id: data.stripe_account_id || null,
        stripe_connect_ready: data.stripe_connect_ready === true,
      });
    }
    setLoading(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setUpdating(true);
    const { stripe_account_id, stripe_connect_ready, ...toUpdate } = profile;
    const { error: err } = await supabase.from("profiles").update(toUpdate).eq("id", user.id);
    if (err) setError(err.message);
    else {
      setSuccess("Profil mis à jour avec succès");
      setTimeout(() => setSuccess(""), 3000);
    }
    setUpdating(false);
  };

  const set = (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  const tabBtn = (id: TabId, label: string, Icon: any) => (
    <button
      onClick={() => setTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
        tab === id
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 md:p-8 pb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Mon profil</h1>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>

          <div className="px-6 md:px-8 border-b border-gray-200 mt-6 flex gap-1 overflow-x-auto">
            {tabBtn("infos", "Informations", User)}
            {tabBtn("securite", "Sécurité", Shield)}
            {tabBtn("reglages", "Réglages", Settings)}
          </div>

          <div className="p-6 md:p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex gap-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                {success}
              </div>
            )}

            {tab === "infos" && (
              <>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User size={16} /> Nom complet
                    </label>
                    <input type="text" name="full_name" value={profile.full_name} onChange={set}
                      placeholder="Votre nom et prénom"
                      className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} /> Téléphone
                    </label>
                    <input type="tel" name="phone" value={profile.phone} onChange={set}
                      placeholder="06 12 34 56 78"
                      className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} /> Ville
                    </label>
                    <input type="text" name="city" value={profile.city} onChange={set}
                      placeholder="Paris"
                      className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Building size={16} /> Entreprise
                    </label>
                    <input type="text" name="company_name" value={profile.company_name} onChange={set}
                      placeholder="Nom de votre entreprise"
                      className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Building size={16} /> SIRET
                    </label>
                    <input type="text" name="siret" value={profile.siret} onChange={set}
                      placeholder="123 456 789 00012"
                      className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={updating}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition disabled:opacity-50">
                      {updating ? "Enregistrement..." : "Enregistrer les modifications"}
                    </button>
                    <button type="button" onClick={() => router.push("/dashboard")}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                      Annuler
                    </button>
                  </div>
                </form>

                <div className="mt-8">
                  <VerificationSection
                    userId={user?.id || ""}
                    isVerified={profile.is_verified}
                    statut={profile.statut_verification}
                    siret={profile.siret}
                    companyName={profile.company_name}
                    onStatusChange={loadProfile}
                  />
                </div>
              </>
            )}

            {tab === "securite" && (
              <div className="space-y-4">
                <PasswordSection />
              </div>
            )}

            {tab === "reglages" && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CreditCard size={18} className="text-blue-600" />
                    Paiement sécurisé Stripe Connect
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Activez votre compte Stripe Connect pour recevoir des paiements sécurisés des acheteurs (fonds
                    séquestrés puis libérés après la livraison). Frais RoullePro : 3 % (min 20 €) par vente.
                  </p>
                  {profile.stripe_connect_ready ? (
                    <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm">
                      Compte Stripe activé et prêt à recevoir des paiements
                    </div>
                  ) : profile.stripe_account_id ? (
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

                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-900 mb-2">Notifications push</h2>
                  <p className="text-sm text-gray-600 mb-4">
                    Recevez instantanément une notification sur votre appareil pour les nouveaux messages,
                    offres reçues, paiements et alertes de nouvelles annonces.
                  </p>
                  <PushSubscribeButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Chargement...</div>}>
      <ProfilContent />
    </Suspense>
  );
}
