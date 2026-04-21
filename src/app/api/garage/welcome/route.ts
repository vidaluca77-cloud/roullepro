import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { apiError } from "@/lib/api-utils";
import { sendGarageWelcome } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/garage/welcome
 * Envoie l'email de bienvenue au garage connecte, une seule fois.
 * Appele cote client depuis la page /garage/dashboard (ou /garage/bienvenue)
 * apres une connexion reussie si welcome_email_sent_at est null.
 */
export async function POST() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentification requise" },
      { status: 401 }
    );
  }

  try {
    const sbService = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: garage, error: garageError } = await sbService
      .from("garages_partenaires")
      .select(
        "id, raison_sociale, contact_email, statut, welcome_email_sent_at"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (garageError) {
      return apiError(
        "POST /api/garage/welcome",
        garageError,
        500,
        "Erreur lecture garage"
      );
    }

    if (!garage) {
      return NextResponse.json(
        { error: "Aucun garage associe a ce compte" },
        { status: 404 }
      );
    }

    if (garage.statut !== "actif") {
      return NextResponse.json(
        { error: "Garage non actif" },
        { status: 400 }
      );
    }

    // Deja envoye => no-op idempotent
    if (garage.welcome_email_sent_at) {
      return NextResponse.json({ ok: true, already_sent: true });
    }

    // Envoie l'email (utilise l'email du user pour garantir la deliverabilite)
    const to = user.email || garage.contact_email;
    if (!to) {
      return NextResponse.json(
        { error: "Aucun email disponible" },
        { status: 400 }
      );
    }

    await sendGarageWelcome(to, garage.raison_sociale);

    // Marque l'envoi (idempotence)
    await sbService
      .from("garages_partenaires")
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq("id", garage.id);

    return NextResponse.json({ ok: true, sent: true });
  } catch (err) {
    return apiError("POST /api/garage/welcome", err);
  }
}
