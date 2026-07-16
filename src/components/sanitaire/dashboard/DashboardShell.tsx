"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isPaidPlan } from "@/lib/sanitaire-plans";
import DashboardNav from "./DashboardNav";

const BASE = "/transport-medical/pro";

// Routes de l'espace pro connecté qui reçoivent la navigation partagée.
// On exclut la landing publique (/pro) et le formulaire de réclamation public
// (/pro/reclamer) qui n'ont pas leur place dans le tableau de bord.
function isDashboardRoute(pathname: string): boolean {
  if (pathname === BASE) return false;
  if (pathname === `${BASE}/reclamer` || pathname.startsWith(`${BASE}/reclamer/`)) {
    return false;
  }
  return pathname.startsWith(`${BASE}/`);
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const onDashboard = isDashboardRoute(pathname);

  const [isPaid, setIsPaid] = useState(false);
  const [planKnown, setPlanKnown] = useState(false);

  useEffect(() => {
    if (!onDashboard || planKnown) return;
    let active = true;
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        if (active) {
          setIsPaid(false);
          setPlanKnown(true);
        }
        return;
      }
      const { data } = await supabase
        .from("pros_sanitaire")
        .select("plan")
        .eq("claimed_by", user.id);
      if (active) {
        setIsPaid((data || []).some((p) => isPaidPlan(p.plan)));
        setPlanKnown(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [onDashboard, planKnown]);

  if (!onDashboard) {
    return <>{children}</>;
  }

  return (
    <div className="lg:pl-64">
      <DashboardNav isPaid={isPaid} planKnown={planKnown} />
      <div className="min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </div>
    </div>
  );
}
