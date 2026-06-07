"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";

// Toggle "Conventionné CPAM uniquement" pour les pages liste (ville / catégorie).
// Reflete l'etat dans l'URL via ?ameli=1 pour preserver le filtre au reload et
// permettre le partage de lien. OFF par defaut (tous les pros).

export default function AmeliFilterToggle({ active }: { active: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onToggle = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) params.set("ameli", "1");
    else params.delete("ameli");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onToggle(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
      />
      <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
      <span className="text-sm font-medium text-emerald-800">Conventionné CPAM uniquement</span>
    </label>
  );
}
