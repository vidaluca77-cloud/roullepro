import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Shield, AlertCircle } from "lucide-react";
import ReclamerForm from "@/components/sanitaire/ReclamerForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ pro?: string }>;
};

export default async function ReclamerPage({ searchParams }: Props) {
  const { pro: proId } = await searchParams;
  if (!proId) notFound();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: pro } = await supabase
    .from("pros_sanitaire")
    .select("id, raison_sociale, nom_commercial, ville, code_postal, siret, telephone_public, email_public, claimed")
    .eq("id", proId)
    .maybeSingle();

  if (!pro) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50/40">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/transport-medical/pro" className="inline-flex items-center gap-1 text-sm text-[#0066CC] hover:underline mb-6">
          ← Retour
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Réclamer cette fiche</h1>
        <p className="text-gray-600 mb-8">Prouvez que vous êtes le gérant de l'entreprise en 2 minutes.</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-[#0066CC]" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{pro.nom_commercial || pro.raison_sociale}</div>
              <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {pro.code_postal} {pro.ville}
              </div>
              <div className="text-xs text-gray-400 mt-1">SIRET {pro.siret}</div>
            </div>
          </div>

          {pro.claimed && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                Cette fiche a déjà été réclamée. Si c'est une erreur,{" "}
                <a href="mailto:contact@roullepro.com" className="underline font-medium">contactez-nous</a>.
              </div>
            </div>
          )}
        </div>

        {!pro.claimed && (
          <ReclamerForm
            proId={pro.id}
            proNom={pro.nom_commercial || pro.raison_sociale}
            telephonePublic={pro.telephone_public}
            emailPublic={pro.email_public}
          />
        )}
      </div>
    </main>
  );
}
