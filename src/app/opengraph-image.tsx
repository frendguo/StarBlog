import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

// Default site-wide OG image, compiled to a static PNG at build time
// (no params here means Next renders once, no Worker runtime cost).
export const alt = `${siteConfig.author.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #FBF9F4 0%, #FFE6DC 60%, #FFD9C4 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            letterSpacing: 2,
            color: "#3F3640",
            textTransform: "uppercase",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              background: "#FF6F3C",
              display: "flex",
            }}
          />
          {siteConfig.url.replace(/^https?:\/\//, "")}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.05,
              fontWeight: 700,
              color: "#1F1A24",
              letterSpacing: -1.5,
            }}
          >
            {siteConfig.author.name}
          </div>
          <div
            style={{
              fontSize: 36,
              lineHeight: 1.35,
              color: "#5A4F5C",
              maxWidth: 920,
            }}
          >
            {siteConfig.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 20,
            color: "#5A4F5C",
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
          }}
        >
          <span>writing · projects · now · about</span>
          <span style={{ color: "#A855F7" }}>shipping</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
