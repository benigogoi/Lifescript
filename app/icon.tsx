import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d12",
          borderRadius: 6,
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 20,
            color: "#c9a84c",
            fontWeight: 700,
          }}
        >
          M
        </span>
      </div>
    ),
    { ...size }
  );
}
