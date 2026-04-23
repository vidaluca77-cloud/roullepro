import type { Metadata } from "next";
import Link from "next/link";
import { Star, CheckCircle2, Shield } from "lucide-react";
import CheckoutButton from "@/components/sanitaire/CheckoutButton";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tarifs — Annuaire Transport Sanitaire",
  description: "Abonnements pro pour ambulances, VSL et taxis conventionnés. Essential 19,90€, Premium 39€, Pro+ 79€.",
  alternates: { canonical: "/transport-medical/tarifs" },
};

export const dynamic = "force-dynamic";

export default async function TarifsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let ficheId: string | null = null;
  let currentPlan: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("pros_sanitaire")
      .select("id, plan")
      .eq("claimed_by", user.id)
      .maybeSingle();
    ficheId = data?.id ?? null;
    currentPlan = data?.plan ?? null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-5">
            <Shield className="w-3.5 h-3.5" />
            14 jours d'essai gratuit · Résiliable en 1 clic
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Choisissez votre abonnement pro</h1>
          <p className="text-blue-100 text-lg">Sans engagement, sans frais cachés. Vous arrêtez quand vous voulez.</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <PlanCol
            name="Essential"
            price="19,90 €"
            planKey="essential"
            features={[
              "Badge « Pro vérifié »",
              "Galerie de 5 photos",
              "Description étendue (1000 caractères)",
              "Statistiques de vues",
              "Site web cliquable",
              "Horaires détaillés",
              "Support email",
            ]}
            currentPlan={currentPlan}
            ficheId={ficheId}
            userConnected={!!user}
          />
          <PlanCol
            name="Premium"
            price="39 €"
            planKey="premium"
            popular
            features={[
              "Tout Essential",
              "Top 3 des résultats par ville",
              "Messagerie patients activée",
              "Badge « Recommandé »",
              "Galerie de 20 photos + vidéo",
              "Notifications temps réel",
              "Statistiques avancées",
              "Support prioritaire",
            ]}
            currentPlan={currentPlan}
            ficheId={ficheId}
            userConnected={!!user}
          />
          <PlanCol
            name="Pro+"
            price="79 €"
            planKey="pro_plus"
            features={[
              "Tout Premium",
              "Top 1 des résultats par ville",
              "Multi-utilisateurs (flotte)",
              "Alertes bons de transport",
              "API (sur demande)",
              "Account manager dédié",
            ]}
            currentPlan={currentPlan}
            ficheId={ficheId}
            userConnected={!!user}
          />
        </div>

        <div className="mt-10 text-center text-sm text-gray-500">
          Vous recherchez un devis pour une flotte de plus de 20 véhicules ?{" "}
          <Link href="/contact" className="text-[#0066CC] hover:underline">Contactez-nous</Link>.
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
        <div className="space-y-4">
          <Faq q="Comment fonctionne l'essai gratuit de 14 jours ?">
            Aucune carte bancaire requise pour démarrer. Vous pouvez tester toutes les fonctionnalités Premium pendant 14 jours. À la fin, vous choisissez de continuer ou non — sans engagement.
          </Faq>
          <Faq q="Puis-je résilier à tout moment ?">
            Oui. La résiliation se fait en 1 clic depuis votre espace pro. Aucune pénalité, aucun frais. Votre fiche reste visible en gratuit.
          </Faq>
          <Faq q="Est-ce que RoullePro prend une commission sur les transports ?">
            Non, zéro commission. L'abonnement mensuel est la seule contrepartie. Tous les paiements entre patients et professionnels se font hors plateforme.
          </Faq>
          <Faq q="Je suis ambulancier/VSL/taxi conventionné, est-ce pour moi ?">
            Oui, tous les professionnels du transport sanitaire inscrits au registre de l'INSEE (NAF 86.90A, 49.32Z, 49.39A) sont concernés.
          </Faq>
        </div>
      </section>
    </main>
  );
}

function PlanCol({
  name,
  price,
  planKey,
  features,
  popular,
  currentPlan,
  ficheId,
  userConnected,
}: {
  name: string;
  price: string;
  planKey: "essential" | "premium" | "pro_plus";
  features: string[];
  popular?: boolean;
  currentPlan: string | null;
  ficheId: string | null;
  userConnected: boolean;
}) {
  const isCurrent = currentPlan === planKey;
  return (
    <div className={`bg-white rounded-2xl p-6 border-2 ${popular ? "border-indigo-400 shadow-2xl relative" : "border-gray-200"}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-xs font-semibold bg-indigo-600 text-white px-3 py-1 rounded-full">
          <Star className="w-3 h-3" />
          Le plus populaire
        </div>
      )}
      <div className="text-lg font-bold text-gray-900 mb-1">{name}</div>
      <div className="flex items-baseline gap-1 mb-5">
        <div className="text-4xl font-bold text-[#0066CC]">{price}</div>
        <div className="text-sm text-gray-500">/mois HT</div>
      </div>
      <ul className="space-y-2.5 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      {isCurrent ? (
        <div className="block text-center bg-green-50 text-green-700 font-semibold px-4 py-2.5 rounded-xl border border-green-200">
          Votre plan actuel
        </div>
      ) : userConnected && ficheId ? (
        <CheckoutButton planKey={planKey} ficheId={ficheId} popular={popular} />
      ) : (
        <Link
          href={userConnected ? "/transport-medical/pro" : "/auth/signin?next=/transport-medical/tarifs"}
          className={`block text-center font-semibold px-4 py-2.5 rounded-xl transition ${popular ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-[#0066CC] hover:bg-[#0052a3] text-white"}`}
        >
          {userConnected ? "Réclamer ma fiche" : "Se connecter pour commencer"}
        </Link>
      )}
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="bg-white border border-gray-200 rounded-xl p-4 group">
      <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
        {q}
        <span className="text-[#0066CC] group-open:rotate-45 transition">+</span>
      </summary>
      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{children}</p>
    </details>
  );
}
