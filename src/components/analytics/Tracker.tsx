"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Records what a visitor does — pages opened, things clicked, how far they
 * scrolled — and sends it to /api/t in small batches. No cookies: a random
 * visitor id lives in localStorage and a visit id in sessionStorage.
 */

type TrackEvent = {
  type: "pageview" | "click" | "scroll";
  path: string;
  label?: string;
  target?: string;
  value?: number;
  t: number;
};

const ENDPOINT = "/api/t";
const VISIT_IDLE_MS = 30 * 60 * 1000;

function randomId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function store(kind: "local" | "session") {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function visitorId() {
  const s = store("local");
  let id = s?.getItem("mert:vid");
  if (!id) {
    id = randomId();
    s?.setItem("mert:vid", id);
  }
  return id;
}

/** a visit ends after 30 quiet minutes; the next action starts a new one */
function visitId() {
  const s = store("session");
  const last = Number(s?.getItem("mert:sid-at") ?? 0);
  let id = s?.getItem("mert:sid");
  if (!id || Date.now() - last > VISIT_IDLE_MS) {
    id = randomId();
    s?.setItem("mert:sid", id);
  }
  s?.setItem("mert:sid-at", String(Date.now()));
  return id;
}

const queue: TrackEvent[] = [];
let meta: Record<string, string> | null = null;

/**
 * Where the visitor came from, read once when the site first loads — by the
 * time the first batch goes out they may already be on another page.
 */
function landingMeta() {
  if (meta) return meta;
  const params = new URLSearchParams(window.location.search);
  let referrer = "";
  try {
    // only outside referrers are interesting
    if (
      document.referrer &&
      new URL(document.referrer).host !== window.location.host
    )
      referrer = document.referrer;
  } catch {
    // an unparsable referrer is simply left out
  }
  meta = {
    referrer,
    language: navigator.language,
    screen: `${window.screen.width}x${window.screen.height}`,
    utm: params.get("utm_source") ?? params.get("ref") ?? "",
  };
  return meta;
}

function flush(useBeacon = false) {
  if (!queue.length) return;
  const now = Date.now();
  const events = queue
    .splice(0, 60)
    .map(({ t, ...e }) => ({ ...e, ago: Math.max(0, now - t) }));
  // meta rides along every time; the server only uses it when a visit starts
  const payload = {
    sid: visitId(),
    vid: visitorId(),
    events,
    meta: landingMeta(),
  };
  const json = JSON.stringify(payload);
  if (useBeacon && navigator.sendBeacon) {
    navigator.sendBeacon(ENDPOINT, json);
  } else {
    void fetch(ENDPOINT, {
      method: "POST",
      body: json,
      keepalive: true,
      headers: { "content-type": "application/json" },
    }).catch(() => undefined);
  }
}

function push(e: Omit<TrackEvent, "t">) {
  if (window.location.pathname.startsWith("/admin")) return;
  queue.push({ ...e, t: Date.now() });
  if (queue.length >= 40) flush();
}

/** a short human name for what was clicked */
function describe(el: Element) {
  const explicit =
    el.getAttribute("data-track") ??
    el.getAttribute("aria-label") ??
    el.getAttribute("title");
  if (explicit) return explicit.slice(0, 160);
  // a card: its heading says it best
  const heading = el.querySelector("h1, h2, h3, h4, strong");
  const source = heading ?? el;
  // innerText keeps the gaps between blocks that textContent glues together
  const text = ((source as HTMLElement).innerText || source.textContent || "")
    .replace(/\s+/g, " ")
    .trim();
  if (text) return text.slice(0, 160);
  const img = el.querySelector("img")?.getAttribute("alt");
  return (img ?? el.tagName.toLowerCase()).slice(0, 160);
}

export function Tracker() {
  const pathname = usePathname();

  // page views, and the deepest scroll on the page we're leaving
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    landingMeta();
    let maxDepth = 0;
    const measure = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const depth =
        scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
      if (depth > maxDepth) maxDepth = Math.min(100, depth);
    };
    // wait a tick so the new page's title is in place
    const t = window.setTimeout(() => {
      push({ type: "pageview", path: pathname, label: document.title });
      measure();
    }, 50);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", measure);
      push({ type: "scroll", path: pathname, value: maxDepth });
    };
  }, [pathname]);

  // clicks on anything interactive
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest(
        "a, button, [role=button], [data-track], input[type=submit], summary, label",
      );
      if (!el) return;
      const href = el instanceof HTMLAnchorElement ? el.href : undefined;
      push({
        type: "click",
        path: window.location.pathname,
        label: describe(el),
        target: href ? href.replace(window.location.origin, "") : undefined,
      });
      // leaving the site: send right away
      if (href && !href.startsWith(window.location.origin)) flush(true);
    };
    document.addEventListener("click", onClick, { capture: true });

    const timer = window.setInterval(() => flush(), 5000);
    const onHide = () => {
      if (document.visibilityState === "hidden") flush(true);
    };
    const onPageHide = () => flush(true);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
