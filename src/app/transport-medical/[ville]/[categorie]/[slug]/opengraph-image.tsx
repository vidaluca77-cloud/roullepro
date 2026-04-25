import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Fiche transport sanitaire RoullePro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = {
  params: { ville: string; categorie: string; slug: string };
};

const CAT_LABEL: Record<string, string> = {
  ambulance: "Ambulance",
  vsl: "VSL",
  taxi_conventionne: "Taxi conventionne CPAM",
};

export default async function OgImage({ params }: Params) {
  const { slug } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("pros_sanitaire")
    .select("nom_commercial, raison_sociale, ville, code_postal, departement, categorie, telephone_public")
    .eq("slug", slug)
    .maybeSingle();

  const nom = (data?.nom_commercial || data?.raison_sociale || "Transport sanitaire").toUpperCase();
  const ville = data?.ville || "";
  const cp = data?.code_postal || "";
  const dep = data?.departement || "";
  const cat = CAT_LABEL[data?.categorie || ""] || "Transport medical";
  const tel = data?.telephone_public || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0B1120 0%, #0f1d3a 50%, #0066CC 100%)",
          padding: "60px 70px",
          color: "white",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Logo / brand top-left */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 28,
            fontWeight: 700,
            color: "#93C5FD",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "white",
              color: "#0066CC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 24,
            }}
          >
            R
          </div>
          RoullePro
        </div>

        {/* Category badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 24,
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 999,
            padding: "8px 18px",
            fontSize: 22,
            fontWeight: 500,
            alignSelf: "flex-start",
          }}
        >
          {cat}
        </div>

        {/* Nom commercial */}
        <div
          style={{
            display: "flex",
            fontSize: nom.length > 28 ? 56 : 72,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 28,
            maxWidth: 1060,
            letterSpacing: "-0.02em",
          }}
        >
          {nom.length > 60 ? nom.slice(0, 58) + "..." : nom}
        </div>

        {/* Localisation */}
        {ville && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 36,
              fontWeight: 500,
              marginTop: 24,
              color: "#BFDBFE",
            }}
          >
            <span style={{ display: "flex", marginRight: 14, fontSize: 38 }}>📍</span>
            {ville}
            {cp ? `, ${cp}` : ""}
            {dep ? ` (${dep})` : ""}
          </div>
        )}

        {/* Footer bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "auto",
            paddingTop: 30,
            borderTop: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 22, color: "#BFDBFE" }}>Annuaire transport sanitaire</div>
            {tel && (
              <div style={{ fontSize: 30, fontWeight: 700, color: "white" }}>
                {tel}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#93C5FD",
              fontWeight: 600,
            }}
          >
            roullepro.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
