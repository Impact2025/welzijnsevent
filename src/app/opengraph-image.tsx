import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bijeen — eventplatform voor de welzijnssector";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#12100E",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow blob */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,82,42,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,82,42,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
            width: "100%",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#C8522A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "white",
                fontWeight: 800,
              }}
            >
              B
            </div>
            <span style={{ color: "white", fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px" }}>
              Bijeen
            </span>
          </div>

          {/* Heading */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(200,82,42,0.15)",
                border: "1px solid rgba(200,82,42,0.3)",
                borderRadius: 100,
                padding: "6px 16px",
                width: "fit-content",
              }}
            >
              <span style={{ color: "#E8784A", fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Evenementenplatform voor de welzijnssector
              </span>
            </div>
            <div
              style={{
                fontSize: 68,
                fontWeight: 800,
                color: "white",
                lineHeight: 1.05,
                letterSpacing: "-2px",
              }}
            >
              Meer impact,{"\n"}
              <span style={{ color: "#C8522A" }}>minder werk.</span>
            </div>
            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.55)",
                fontWeight: 400,
                lineHeight: 1.4,
                maxWidth: 640,
              }}
            >
              Van aanmelding tot WMO-rapportage — alles in één tool.
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            {["QR Check-in", "AI-netwerkkoppeling", "WMO-rapportage", "AVG-proof"].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#C8522A",
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
