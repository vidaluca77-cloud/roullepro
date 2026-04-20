/**
 * PlanBadge — Affiche le badge Pro/Premium d'un utilisateur.
 * Rien n'est rendu pour le plan Free.
 */

import { PLANS, type PlanId } from "@/lib/plans";

export default function PlanBadge({
  plan,
  size = "sm",
}: {
  plan: PlanId | string | null | undefined;
  size?: "xs" | "sm" | "md";
}) {
  if (plan !== "pro" && plan !== "premium") return null;
  const config = PLANS[plan as PlanId];
  if (!config.badge) return null;

  const sizeCls =
    size === "xs"
      ? "text-[10px] px-1.5 py-0.5"
      : size === "md"
      ? "text-sm px-2.5 py-1"
      : "text-xs px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${config.badge.className} ${sizeCls}`}
      title={`Abonné ${config.name}`}
    >
      {config.badge.label}
    </span>
  );
}
