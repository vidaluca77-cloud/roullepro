"use client";

import { usePathname } from "next/navigation";
import PartnerStrip from "@/components/partenaires/PartnerStrip";
import { getPartnerStripAudience } from "@/lib/partner-strip";

export default function PartnerStripSlot() {
  const pathname = usePathname();
  const audience = getPartnerStripAudience(pathname);

  if (!audience) return null;

  return <PartnerStrip audience={audience} />;
}
