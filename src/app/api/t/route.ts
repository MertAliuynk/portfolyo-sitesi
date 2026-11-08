import { z } from "zod";

import { db } from "~/server/db";
import { SESSION_COOKIE, verifySessionToken } from "~/server/session";
import {
  clientIp,
  isBot,
  lookupGeo,
  parseUserAgent,
  rateLimited,
  RETENTION_DAYS,
} from "~/server/visits";

/**
 * Visit beacon. The tracker posts small batches here (also via sendBeacon,
 * so the body may arrive as text/plain).
 */
const str = (max: number) =>
  z
    .string()
    .max(2000)
    .transform((s) => s.slice(0, max));

const body = z.object({
  sid: z.string().min(8).max(64),
  vid: z.string().min(8).max(64),
  meta: z
    .object({
      referrer: str(500).optional(),
      language: str(20).optional(),
      screen: str(20).optional(),
      utm: str(100).optional(),
    })
    .optional(),
  events: z
    .array(
      z.object({
        type: z.enum(["pageview", "click", "scroll"]),
        path: str(300),
        label: str(160).optional(),
        target: str(500).optional(),
        value: z.number().int().min(0).max(100).optional(),
        /** how many ms ago it happened (batches are sent a few seconds late) */
        ago: z.number().int().min(0).max(600_000).optional(),
      }),
    )
    .min(1)
    .max(60),
});

/** empty strings are stored as "no value" */
const orNull = (v: string | undefined) =>
  v === undefined || v === "" ? null : v;

const nothing = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent");
  if (isBot(ua)) return nothing();

  // the site owner browsing their own site isn't a visitor
  const cookie = req.headers.get("cookie") ?? "";
  const token = new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]+)`).exec(
    cookie,
  )?.[1];
  if (token && (await verifySessionToken(decodeURIComponent(token))))
    return nothing();

  const ip = clientIp(req.headers);
  if (rateLimited(ip ?? "unknown")) return new Response(null, { status: 429 });

  let parsed;
  try {
    parsed = body.safeParse(JSON.parse(await req.text()));
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!parsed.success) return new Response(null, { status: 400 });
  const { sid, vid, meta, events } = parsed.data;
  const now = Date.now();

  const pageviews = events.filter((e) => e.type === "pageview").length;
  const clicks = events.filter((e) => e.type === "click").length;

  const existing = await db.visitSession.findUnique({
    where: { id: sid },
    select: { id: true },
  });
  if (!existing) {
    const geo = await lookupGeo(ip, req.headers);
    const agent = parseUserAgent(ua ?? "");
    const firstPage =
      events.find((e) => e.type === "pageview")?.path ?? events[0]!.path;
    // a second tab racing us may have just created it: upsert settles that
    await db.visitSession.upsert({
      where: { id: sid },
      update: {},
      create: {
        id: sid,
        visitorId: vid,
        ip,
        userAgent: ua?.slice(0, 400),
        ...agent,
        ...geo,
        referrer: orNull(meta?.referrer),
        utmSource: orNull(meta?.utm),
        language: meta?.language,
        screen: meta?.screen,
        landingPath: firstPage,
        // the visit began with its first action, not when this batch arrived
        startedAt: new Date(now - Math.max(...events.map((e) => e.ago ?? 0))),
      },
    });
  }

  await db.$transaction([
    db.visitEvent.createMany({
      data: events.map((e) => ({
        sessionId: sid,
        type: e.type,
        path: e.path,
        label: orNull(e.label),
        target: orNull(e.target),
        value: e.value ?? null,
        at: new Date(now - (e.ago ?? 0)),
      })),
    }),
    db.visitSession.update({
      where: { id: sid },
      data: {
        lastSeenAt: new Date(now),
        pageviews: { increment: pageviews },
        clicks: { increment: clicks },
      },
    }),
  ]);

  // now and then, trim history past the retention window
  if (Math.random() < 0.005) {
    const cutoff = new Date(now - RETENTION_DAYS * 86_400_000);
    await db.visitSession.deleteMany({ where: { lastSeenAt: { lt: cutoff } } });
  }

  return nothing();
}
