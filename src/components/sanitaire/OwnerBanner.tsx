"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  proId: string;
  claimedBy: string | null;
};

export default function OwnerBanner({ proId, claimedBy }: Props) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!claimedBy) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && user.id === claimedBy) setIsOwner(true);
    });
  }, [claimedBy, proId]);

  if (!isOwner) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-amber-900">
          <strong>C&apos;est votre fiche.</strong> Vous pouvez modifier les informations depuis votre espace pro.
        </div>
        <Link
          href="/transport-medical/pro/dashboard"
          className="inline-flex items-center gap-1.5 bg-[#0066CC] hover:bg-[#0052a3] text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition"
        >
          <Pencil className="w-3.5 h-3.5" />
          Modifier ma fiche
        </Link>
      </div>
    </div>
  );
}
