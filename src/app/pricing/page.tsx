/**
 * /pricing — Page publique des 3 plans d'abonnement.
 * Affiche les cartes Free / Pro / Premium et gère le checkout Stripe.
 */

'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Sparkles, Zap, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PLANS, type PlanId } from '@/lib/plans';

function PricingInner() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<PlanId | null>(null);
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const cancelled = searchParams.get("checkout") === "cancelled";

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        const { data: p } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
        if (p?.plan === "pro" || p?.plan === "premium") setCurrentPlan(p.plan);
      }
    })();
  }, [supabase]);

  const handleSubscribe = async (plan: PlanId) => {
    if (plan === "free") {
      if (!isLoggedIn) router.push("/auth/signup");
      else router.push("/dashboard");
      return;
    }
    if (!isLoggedIn) {
      router.push(`/auth/login?next=/pricing`);
      return;
    }
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Erreur checkout");
    } catch (err) {
      alert("Erreur. Réessayez.");
    } finally {
      setLoading(null);
    }
  };

  const planIcons: Record<PlanId, any> = {
    free: Sparkles,
    pro: Zap,
    premium: Star,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Publiez vos annonces de véhicules utilitaires et professionnels.
            Sans engagement, résiliable à tout moment.
          </p>
        </div>

        {cancelled && (
          <div className="max-w-2xl mx-auto mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            Paiement annulé — aucun montant n&apos;a été prélevé.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {(Object.values(PLANS)).map((plan) => {
            const Icon = planIcons[plan.id];
            const isCurrent = currentPlan === plan.id;
            const isFeatured = plan.highlight;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border p-8 flex flex-col ${
                  isFeatured
                    ? "border-blue-500 shadow-xl md:scale-105"
                    : "border-gray-200 shadow-sm"
                }`}
              >
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Le plus populaire
                  </div>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    plan.id === "free" ? "bg-gray-100 text-gray-600" :
                    plan.id === "pro" ? "bg-blue-100 text-blue-600" :
                    "bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600"
                  }`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.priceMonthly}€
                  </span>
                  <span className="text-gray-500 text-sm"> /mois</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <Check size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl font-semibold bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    Plan actuel
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading !== null}
                    className={`w-full py-3 rounded-xl font-semibold transition disabled:opacity-60 ${
                      isFeatured
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : plan.id === "premium"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {loading === plan.id
                      ? "Redirection..."
                      : plan.id === "free"
                      ? "Commencer gratuitement"
                      : `Souscrire à ${plan.name}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Paiement sécurisé par Stripe · TVA incluse · Facture envoyée automatiquement</p>
          <p className="mt-2">
            Des questions ?{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PricingInner />
    </Suspense>
  );
}
