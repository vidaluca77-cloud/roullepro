"use client";

import { useEffect, useRef } from "react";

/**
 * Declenche l'envoi de l'email de bienvenue une seule fois
 * apres la premiere connexion d'un garage (API idempotente).
 */
export default function WelcomeTrigger({ enabled }: { enabled: boolean }) {
  const done = useRef(false);

  useEffect(() => {
    if (!enabled || done.current) return;
    done.current = true;

    fetch("/api/garage/welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      // silencieux : l'envoi pourra etre retente a la prochaine visite
    });
  }, [enabled]);

  return null;
}
