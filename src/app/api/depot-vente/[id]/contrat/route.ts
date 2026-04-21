import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSbClient } from "@supabase/supabase-js";
import { apiError } from "@/lib/api-utils";
import { generateContratDepotPDF, type ContratDepotData } from "@/lib/pdf-contrat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // pdf-lib n'est pas compatible edge runtime

type RouteParams = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const depotId = params.id;
  if (!depotId) {
    return NextResponse.json({ error: "Identifiant depot manquant" }, { status: 400 });
  }

  try {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentification requise" }, { status: 401 });
    }

    // Verification role : vendeur proprietaire, garage concerne, ou admin
    const sbService = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: depot, error: depotErr } = await sbService
      .from("depots")
      .select("*")
      .eq("id", depotId)
      .single();

    if (depotErr || !depot) {
      return NextResponse.json({ error: "Depot introuvable" }, { status: 404 });
    }

    const { data: profile } = await sbService
      .from("profiles")
      .select("id, email, full_name, role, phone, city, siret, company_name")
      .eq("id", user.id)
      .single();

    const isOwner = depot.vendeur_id === user.id;
    const isAdmin = profile?.role === "admin";
    let isGarageContact = false;

    if (!isOwner && !isAdmin && depot.garage_id) {
      const { data: garage } = await sbService
        .from("garages_partenaires")
        .select("contact_email")
        .eq("id", depot.garage_id)
        .single();
      isGarageContact = garage?.contact_email?.toLowerCase() === profile?.email?.toLowerCase();
    }

    if (!isOwner && !isAdmin && !isGarageContact) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    // Recuperation garage
    const { data: garage, error: garageErr } = await sbService
      .from("garages_partenaires")
      .select("*")
      .eq("id", depot.garage_id)
      .single();

    if (garageErr || !garage) {
      return NextResponse.json({ error: "Garage introuvable" }, { status: 404 });
    }

    // Recuperation vendeur
    const { data: vendeur } = await sbService
      .from("profiles")
      .select("email, full_name, phone, city, siret, company_name")
      .eq("id", depot.vendeur_id)
      .single();

    const contratData: ContratDepotData = {
      numero_contrat: `RP-${depotId.substring(0, 8).toUpperCase()}`,
      date_signature: depot.created_at || new Date().toISOString(),
      vendeur_nom: vendeur?.company_name || vendeur?.full_name || vendeur?.email || "Vendeur",
      vendeur_email: vendeur?.email || "",
      vendeur_adresse: vendeur?.city ?? null,
      vendeur_telephone: vendeur?.phone ?? null,
      vendeur_siret: vendeur?.siret ?? null,
      garage_raison_sociale: garage.raison_sociale,
      garage_siret: garage.siret,
      garage_adresse: garage.adresse || "",
      garage_code_postal: garage.code_postal || "",
      garage_ville: garage.ville || "",
      garage_contact_nom: garage.contact_nom ?? null,
      vehicule_marque: depot.marque || "",
      vehicule_modele: depot.modele || "",
      vehicule_immatriculation: depot.immatriculation ?? null,
      vehicule_vin: null,
      vehicule_annee: depot.annee ?? null,
      vehicule_kilometrage: depot.kilometrage ?? null,
      vehicule_prix_demande: Number(depot.prix_affiche ?? depot.prix_vendeur_net ?? depot.estimation_max ?? 0),
      commission_roullepro_pct: Number(depot.commission_rp_pct ?? 4),
      commission_garage_pct: Number(depot.commission_garage_pct ?? 7),
      forfait_preparation: Number(depot.frais_preparation ?? 250),
      part_vendeur_pct: 100 - Number(depot.commission_rp_pct ?? 4) - Number(depot.commission_garage_pct ?? 7),
      recuperation_domicile: depot.recuperation_domicile === true,
      frais_recuperation: depot.frais_recuperation ?? 79,
      adresse_recuperation: depot.adresse_recuperation
        ? `${depot.adresse_recuperation}, ${depot.code_postal_recuperation ?? ""} ${depot.ville_recuperation ?? ""}`.trim()
        : null,
      duree_jours: 90,
    };

    const pdfBytes = await generateContratDepotPDF(contratData);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="contrat-depot-${contratData.numero_contrat}.pdf"`,
        "Cache-Control": "private, no-cache",
      },
    });
  } catch (err) {
    return apiError("GET /api/depot-vente/[id]/contrat", err);
  }
}
