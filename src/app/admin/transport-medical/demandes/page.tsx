/**
 * Module admin — page liste des demandes de transport.
 * Verifie profiles.role = 'admin' cote serveur (redirect/refus sinon), puis
 * delegue l'UI interactive (filtres + tableau pagine) a DemandesAdminClient.
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import DemandesAdminClient from "./DemandesAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminDemandesTransportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?next=/admin/transport-medical/demandes");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-2xl p-8">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-4">Cette page est réservée aux administrateurs.</p>
          <Link href="/" className="text-[#0066CC] hover:underline text-sm">
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#0066CC]" />
            Demandes de transport médical
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Suivi des demandes, des pros notifiés et des acceptations. Coordonnées client visibles en clair.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <DemandesAdminClient />
      </section>
    </main>
  );
}
