/** small display helpers shared by the visitor pages */

export function duration(seconds: number) {
  if (seconds < 1) return "0 sn";
  if (seconds < 60) return `${Math.round(seconds)} sn`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return s ? `${m} dk ${s} sn` : `${m} dk`;
  return `${Math.floor(m / 60)} sa ${m % 60} dk`;
}

export function seconds(from: Date, to: Date) {
  return Math.max(0, (to.getTime() - from.getTime()) / 1000);
}

const dateTime = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});
const clock = new Intl.DateTimeFormat("tr-TR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Europe/Istanbul",
});

export const fmtDateTime = (d: Date) => dateTime.format(d);
export const fmtClock = (d: Date) => clock.format(d);

export function place(s: { city: string | null; country: string | null }) {
  return [s.city, s.country].filter(Boolean).join(", ") || "Bilinmiyor";
}

export function referrerHost(r: string | null) {
  if (!r) return "Doğrudan";
  try {
    return new URL(r).host.replace(/^www\./, "");
  } catch {
    return r;
  }
}

/** "/mutlu/blog/x" → a friendlier page name for lists */
export function pageName(path: string) {
  if (path === "/") return "Giriş (duygu seçimi)";
  return path;
}

export const MOOD_NAMES: Record<string, string> = {
  mutlu: "Aşırı mutlu",
  ciddi: "Ciddi",
  sakin: "Sakin",
  merakli: "Meraklı",
  nostaljik: "Nostaljik",
};
