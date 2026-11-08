import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** "M" on a warm orange tile */
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
          background: "#FF5A36",
          color: "#151412",
          borderRadius: 14,
          fontSize: 44,
          fontWeight: 800,
        }}
      >
        M
      </div>
    ),
    size,
  );
}
