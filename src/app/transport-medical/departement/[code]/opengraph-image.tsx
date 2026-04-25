import { ImageResponse } from "next/og";
import { getDepartementByCode } from "@/lib/departements-fr";

export const runtime = "edge";
export const alt = "Annuaire transport sanitaire par departement RoullePro";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Params = {
  params: { code: string };
};

export default async function OgImage({ params }: Params) {
  const dep = getDepartementByCode(params.code);
  const nom = dep?.nom || "Departement";
  const code = dep?.code || params.code;
  const region = dep?.region || "";

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
        }}
      >
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

        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#BFDBFE",
            marginTop: 60,
            fontWeight: 500,
          }}
        >
          Annuaire transport sanitaire
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            marginTop: 12,
            letterSpacing: "-0.02em",
          }}
        >
          <span style={{ fontSize: 96, fontWeight: 800, color: "white" }}>{nom}</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 700,
            color: "#93C5FD",
            marginTop: 4,
          }}
        >
          Departement {code}
        </div>

        {region && (
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#BFDBFE",
              marginTop: 12,
            }}
          >
            Region {region}
          </div>
        )}

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
          <div style={{ fontSize: 24, color: "#BFDBFE" }}>
            Ambulances · VSL · Taxis conventionnes
          </div>
          <div style={{ fontSize: 22, color: "#93C5FD", fontWeight: 600 }}>
            roullepro.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
