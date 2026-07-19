import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, ArrowLeft } from "lucide-react";
import PlanningCourses from "@/components/sanitaire/PlanningCourses";
import { type CoursePlanning } from "@/lib/planning-course";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Planning des courses",
  description:
    "Organisez vos courses acceptées : agenda de la semaine, courses à venir, historique et export agenda (.ics) / CSV.",
  robots: { index: false, follow: false },
};

export default async function PlanningPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/transport-medical/pro/planning");
  }

  // Aucune restriction par plan : la consultation du planning est ouverte à tout
  // pro connecté (le verrou d'abonnement ne concerne que l'ACCEPTATION).
  // La RPC scope déjà les lignes sur auth.uid() et révèle les coordonnées patient
  // uniquement pour les courses acceptées.
  const { data: raw } = await supabase.rpc("demandes_pro_dashboard");
  const courses = (raw || []) as CoursePlanning[];

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-br from-[#0B1120] via-[#0f1d3a] to-[#0066CC] text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href="/transport-medical/pro/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-blue-100 hover:text-white mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au tableau de bord
          </Link>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6" />
            <h1 className="text-2xl sm:text-3xl font-bold">Planning des courses</h1>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            Vos courses acceptées, organisées par date. Exportez-les vers votre
            agenda (Google, Apple) ou en CSV.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-8">
        <PlanningCourses courses={courses} />
      </section>
    </main>
  );
}
