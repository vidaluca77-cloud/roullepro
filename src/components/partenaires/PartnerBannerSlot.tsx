"use client";

import { usePathname } from "next/navigation";
import PartnerBanner from "@/components/partenaires/PartnerBanner";
import { getPartnerBannerContext } from "@/lib/partner-banner";

export default function PartnerBannerSlot() {
  const pathname = usePathname();
  const { show, audience } = getPartnerBannerContext(pathname);

  if (!show) {
    return null;
  }

  return <PartnerBanner audience={audience} />;
}
