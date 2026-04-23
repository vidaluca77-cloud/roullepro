"use client";

import { useEffect } from "react";

export default function TrackVue({ proId }: { proId: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      fetch("/api/sanitaire/vue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pro_id: proId }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [proId]);
  return null;
}
