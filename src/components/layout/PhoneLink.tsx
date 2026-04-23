"use client";

import { trackClickToCall } from "@/lib/google-ads-conversions";

interface Props {
  displayNumber: string;
  telNumber: string;
  className?: string;
}

/**
 * Lien telephone qui declenche la conversion Google Ads "Appel telephonique site"
 * au moment du clic.
 */
export default function PhoneLink({ displayNumber, telNumber, className }: Props) {
  const handleClick = () => {
    trackClickToCall();
  };

  return (
    <a href={`tel:${telNumber}`} onClick={handleClick} className={className}>
      {displayNumber}
    </a>
  );
}
