import "server-only";

import { env } from "~/env";

/** keep a year of history; older visits are trimmed now and then */
export const RETENTION_DAYS = 365;

/* ------------------------------------------------------------------ */
/* who is this                                                          */
/* ------------------------------------------------------------------ */

const BOT =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link|whatsapp|telegrambot|discordbot|preview|headless|lighthouse|pagespeed|gtmetrix|curl|wget|python|axios|node-fetch|go-http|java\//i;

export function isBot(ua: string | null) {
  return !ua || BOT.test(ua);
}

/** the visitor's address, as seen through the proxies in front of the app */
export function clientIp(h: Headers) {
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip =
    h.get("cf-connecting-ip") ?? forwarded ?? h.get("x-real-ip") ?? null;
  return ip?.replace(/^::ffff:/, "") ?? null;
}

/** browser, OS and device class from the user agent — enough for a dashboard */
export function parseUserAgent(ua: string) {
  const browser = ua.includes("Edg/")
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : ua.includes("SamsungBrowser")
        ? "Samsung Internet"
        : ua.includes("YaBrowser")
          ? "Yandex"
          : /Firefox|FxiOS/.test(ua)
            ? "Firefox"
            : /Chrome|CriOS/.test(ua)
              ? "Chrome"
              : ua.includes("Safari")
                ? "Safari"
                : "Diğer";

  const ipad =
    ua.includes("iPad") || (ua.includes("Macintosh") && ua.includes("Mobile/"));
  const os = ua.includes("Windows NT")
    ? "Windows"
    : ipad
      ? "iPadOS"
      : /iPhone|iPod/.test(ua)
        ? "iOS"
        : ua.includes("Android")
          ? "Android"
          : ua.includes("CrOS")
            ? "ChromeOS"
            : /Mac OS X|Macintosh/.test(ua)
              ? "macOS"
              : ua.includes("Linux")
                ? "Linux"
                : "Diğer";

  const tablet =
    ipad ||
    ua.includes("Tablet") ||
    (ua.includes("Android") && !ua.includes("Mobile"));
  const mobile = !tablet && /Mobi|iPhone|iPod|Android/.test(ua);
  const device = tablet ? "Tablet" : mobile ? "Mobil" : "Masaüstü";

  // Android phones often still name their model: "Android 14; SM-S918B"
  const model = /Android [\d.]+; ([^;)]+)\)/.exec(ua)?.[1]?.trim();
  return {
    browser,
    os,
    device:
      model && model !== "K" && model.length < 30
        ? `${device} · ${model}`
        : device,
  };
}

/* ------------------------------------------------------------------ */
/* where are they                                                       */
/* ------------------------------------------------------------------ */

export interface Geo {
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
}

function isPrivate(ip: string) {
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^f[cd]/i.test(ip)
  );
}

const geoCache = new Map<string, Geo>();

/**
 * City-level location for an IP via ip-api.com (free, no key). Only called
 * once per new visit, cached in memory, and capped at 1.5 s so a slow lookup
 * never holds anything up. Behind Cloudflare the country header is used too.
 */
export async function lookupGeo(ip: string | null, h: Headers): Promise<Geo> {
  const cfCountry = h.get("cf-ipcountry") ?? undefined;
  if (!ip) return { country: cfCountry };
  if (isPrivate(ip)) return { country: "Yerel ağ" };
  if (env.GEO_LOOKUP === "off") return { country: cfCountry };
  const cached = geoCache.get(ip);
  if (cached) return cached;
  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp&lang=tr`,
      { signal: AbortSignal.timeout(1500), cache: "no-store" },
    );
    const data = (await res.json()) as {
      status: string;
      country?: string;
      regionName?: string;
      city?: string;
      isp?: string;
    };
    if (data.status !== "success") return { country: cfCountry };
    const geo = {
      country: data.country,
      region: data.regionName,
      city: data.city,
      isp: data.isp,
    };
    if (geoCache.size > 5000) geoCache.clear();
    geoCache.set(ip, geo);
    return geo;
  } catch {
    return { country: cfCountry };
  }
}

/* ------------------------------------------------------------------ */
/* a light brake against floods                                         */
/* ------------------------------------------------------------------ */

const hits = new Map<string, { n: number; reset: number }>();

/** at most 90 batches a minute from one address */
export function rateLimited(key: string) {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    if (hits.size > 10000) hits.clear();
    hits.set(key, { n: 1, reset: now + 60_000 });
    return false;
  }
  h.n++;
  return h.n > 90;
}
