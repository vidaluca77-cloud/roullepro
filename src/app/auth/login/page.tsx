"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Truck, AlertCircle, CheckCircle2 } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitNext = searchParams.get("next");
  const prefillEmail = searchParams.get("email") || "";
  const justClaimed = searchParams.get("claimed") === "1";
  const supabase = createClient();
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    // Si une cible explicite est fournie (ex. ?next=/transport-medical/pro/dashboard
    // après réclamation de fiche), on la respecte. Sinon on demande au serveur la
    // destination idéale : pros sanitaire → leur dashboard fiches, autres → /dashboard.
    let target = explicitNext;
    if (!target) {
      try {
        const res = await fetch("/api/auth/post-login-redirect", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data?.target && typeof data.target === "string") target = data.target;
        }
      } catch {}
      if (!target) target = "/dashboard";
    }
    router.push(target);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-2 mb-2">
            <Truck className="text-blue-600" size={32} />
            <span className="text-2xl font-bold text-blue-600">RoullePro</span>
          </div>
          <h1 className="text-2xl font-bold">Connexion</h1>
        </div>
        {justClaimed && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex gap-2 items-start">
            <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-semibold">Votre fiche a bien ete reclamee</div>
              <div>Connectez-vous avec l&apos;email utilise ou cliquez sur &laquo;&nbsp;Mot de passe oublie&nbsp;&raquo; si c&apos;est votre premiere connexion.</div>
            </div>
          </div>
        )}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex gap-2 items-center"><AlertCircle size={18}/>{error}</div>}
        <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="votre@email.fr" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <Link href="/auth/mot-de-passe-oublie" className="text-xs text-blue-600 hover:underline font-medium">
                Mot de passe oublié ?
              </Link>
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">Pas de compte ? <Link href="/auth/register" className="text-blue-600 font-medium">S&apos;inscrire</Link></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <LoginContent />
    </Suspense>
  );
}
