import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #05050a 0%, #14141c 60%, #0d0d12 100%)",
          color: "#f4f1e8",
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 96,
            color: "#e6c766",
            letterSpacing: 2,
          }}
        >
          LifeScript
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "#bdb8ad",
          }}
        >
          Your personalised Indian Vedic numerology report
        </div>
      </div>
    ),
    { ...size }
  );
}
