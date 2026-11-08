import { ImageResponse } from "next/og";

import { SITE } from "~/lib/site";

export const alt = `${SITE.name} — Yazılımcı & Yazılım Geliştirici`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MOOD_COLORS = ["#FF5A36", "#FFC93C", "#4D9FFF", "#8A9A7B", "#FF2FD0"];

/** the card shown when a link to the site is shared */
export default function OpengraphImage() {
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
          background: "#151412",
          color: "#EDE9E1",
        }}
      >
        <div style={{ display: "flex", gap: 14 }}>
          {MOOD_COLORS.map((c, i) => (
            <div
              key={c}
              style={{
                width: 34,
                height: 34,
                background: c,
                borderRadius: i % 2 ? 999 : 8,
              }}
            />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>{SITE.name}</div>
          <div style={{ marginTop: 22, fontSize: 44, color: "#FFC93C" }}>Yazılımcı · Yazılım Geliştirici</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, opacity: 0.6 }}>
          <span>Projeler · Blog · Deneyler</span>
          <span>Bugün nasıl hissediyorsun?</span>
        </div>
      </div>
    ),
    size,
  );
}
