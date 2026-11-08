import { Prisma } from "../../../../generated/prisma";
import { z } from "zod";

import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

const range = z.object({ days: z.number().int().min(1).max(365) });
const since = (days: number) => new Date(Date.now() - days * 86_400_000);
const num = (v: bigint | number | null | undefined) => Number(v ?? 0);

type Row = { key: string | null; n: bigint };
const top = (rows: Row[]) =>
  rows.map((r) => ({ key: r.key ?? "Bilinmiyor", n: num(r.n) }));

export const analyticsRouter = createTRPCRouter({
  overview: adminProcedure.input(range).query(async ({ ctx, input }) => {
    const from = since(input.days);
    const db = ctx.db;
    const hourly = input.days <= 2;
    const bucket = Prisma.raw(hourly ? "'hour'" : "'day'");

    const [
      totals,
      series,
      pages,
      clicks,
      countries,
      cities,
      devices,
      browsers,
      systems,
      referrers,
      moods,
    ] = await Promise.all([
      db.$queryRaw<
        {
          sessions: bigint;
          visitors: bigint;
          pageviews: bigint;
          bounces: bigint;
          returning: bigint;
          avg_sec: number | null;
        }[]
      >`
          SELECT count(*)                                         AS sessions,
                 count(DISTINCT "visitorId")                      AS visitors,
                 coalesce(sum("pageviews"), 0)                    AS pageviews,
                 count(*) FILTER (WHERE "pageviews" <= 1)         AS bounces,
                 (SELECT count(*) FROM (
                    SELECT "visitorId" FROM "VisitSession" WHERE "startedAt" >= ${from}
                    GROUP BY "visitorId" HAVING count(*) > 1) r)  AS returning,
                 avg(extract(epoch FROM ("lastSeenAt" - "startedAt"))) AS avg_sec
          FROM "VisitSession" WHERE "startedAt" >= ${from}`,
      db.$queryRaw<{ t: Date; sessions: bigint; visitors: bigint }[]>`
          SELECT date_trunc(${bucket}, "startedAt" AT TIME ZONE 'Europe/Istanbul') AS t,
                 count(*) AS sessions, count(DISTINCT "visitorId") AS visitors
          FROM "VisitSession" WHERE "startedAt" >= ${from}
          GROUP BY 1 ORDER BY 1`,
      db.$queryRaw<Row[]>`
          SELECT "path" AS key, count(*) AS n FROM "VisitEvent"
          WHERE "type" = 'pageview' AND "at" >= ${from} GROUP BY 1 ORDER BY 2 DESC LIMIT 12`,
      db.$queryRaw<(Row & { target: string | null })[]>`
          SELECT "label" AS key, max("target") AS target, count(*) AS n FROM "VisitEvent"
          WHERE "type" = 'click' AND "at" >= ${from} GROUP BY 1 ORDER BY 3 DESC LIMIT 12`,
      db.$queryRaw<Row[]>`
          SELECT "country" AS key, count(*) AS n FROM "VisitSession"
          WHERE "startedAt" >= ${from} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
      db.$queryRaw<Row[]>`
          SELECT concat_ws(', ', "city", "country") AS key, count(*) AS n FROM "VisitSession"
          WHERE "startedAt" >= ${from} AND "city" IS NOT NULL GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
      db.$queryRaw<Row[]>`
          SELECT split_part("device", ' · ', 1) AS key, count(*) AS n FROM "VisitSession"
          WHERE "startedAt" >= ${from} GROUP BY 1 ORDER BY 2 DESC`,
      db.$queryRaw<Row[]>`
          SELECT "browser" AS key, count(*) AS n FROM "VisitSession"
          WHERE "startedAt" >= ${from} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
      db.$queryRaw<Row[]>`
          SELECT "os" AS key, count(*) AS n FROM "VisitSession"
          WHERE "startedAt" >= ${from} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
      db.$queryRaw<Row[]>`
          SELECT coalesce(nullif("utmSource", ''), substring("referrer" from '://(?:www\\.)?([^/:]+)'), 'Doğrudan') AS key, count(*) AS n
          FROM "VisitSession" WHERE "startedAt" >= ${from} GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
      // which mood people picked on the gate: the first mood page of each visit
      db.$queryRaw<Row[]>`
          SELECT split_part("path", '/', 2) AS key, count(DISTINCT "sessionId") AS n FROM "VisitEvent"
          WHERE "type" = 'pageview' AND "at" >= ${from}
            AND split_part("path", '/', 2) IN ('mutlu', 'ciddi', 'sakin', 'merakli', 'nostaljik')
          GROUP BY 1 ORDER BY 2 DESC`,
    ]);

    const t = totals[0]!;
    const sessions = num(t.sessions);
    return {
      hourly,
      sessions,
      visitors: num(t.visitors),
      pageviews: num(t.pageviews),
      returning: num(t.returning),
      bounceRate: sessions ? Math.round((num(t.bounces) / sessions) * 100) : 0,
      avgSeconds: Math.round(t.avg_sec ?? 0),
      series: series.map((s) => ({
        t: s.t,
        sessions: num(s.sessions),
        visitors: num(s.visitors),
      })),
      pages: top(pages),
      clicks: clicks.map((c) => ({
        key: c.key ?? "(adsız)",
        target: c.target,
        n: num(c.n),
      })),
      countries: top(countries),
      cities: top(cities),
      devices: top(devices),
      browsers: top(browsers),
      systems: top(systems),
      referrers: top(referrers),
      moods: top(moods),
    };
  }),

  /** who is on the site right now (active in the last 5 minutes) */
  live: adminProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.visitSession.findMany({
      where: { lastSeenAt: { gte: new Date(Date.now() - 5 * 60_000) } },
      orderBy: { lastSeenAt: "desc" },
      take: 20,
      select: {
        id: true,
        city: true,
        country: true,
        device: true,
        lastSeenAt: true,
        events: {
          where: { type: "pageview" },
          orderBy: { at: "desc" },
          take: 1,
          select: { path: true },
        },
      },
    });
    return rows.map(({ events, ...r }) => ({
      ...r,
      path: events[0]?.path ?? "/",
    }));
  }),

  sessions: adminProcedure
    .input(
      range.extend({
        q: z.string().trim().max(100).optional(),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const q = input.q;
      const where: Prisma.VisitSessionWhereInput = {
        startedAt: { gte: since(input.days) },
        ...(q
          ? {
              OR: [
                { ip: { contains: q } },
                { city: { contains: q, mode: "insensitive" } },
                { country: { contains: q, mode: "insensitive" } },
                { device: { contains: q, mode: "insensitive" } },
                { browser: { contains: q, mode: "insensitive" } },
                { referrer: { contains: q, mode: "insensitive" } },
                { landingPath: { contains: q, mode: "insensitive" } },
                { visitorId: q },
              ],
            }
          : {}),
      };
      const take = 30;
      const rows = await ctx.db.visitSession.findMany({
        where,
        orderBy: [{ startedAt: "desc" }, { id: "desc" }],
        take: take + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        omit: { userAgent: true },
      });
      // visitors seen in more than one visit
      const ids = [...new Set(rows.map((r) => r.visitorId))];
      const counts = await ctx.db.visitSession.groupBy({
        by: ["visitorId"],
        where: { visitorId: { in: ids } },
        _count: true,
      });
      const visits = new Map(counts.map((c) => [c.visitorId, c._count]));
      const page = rows
        .slice(0, take)
        .map((r) => ({ ...r, visits: visits.get(r.visitorId) ?? 1 }));
      return { rows: page, next: rows.length > take ? rows[take]!.id : null };
    }),

  session: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.visitSession.findUnique({
        where: { id: input.id },
        include: { events: { orderBy: { at: "asc" } } },
      });
      if (!session) return null;
      const history = await ctx.db.visitSession.findMany({
        where: { visitorId: session.visitorId },
        orderBy: { startedAt: "desc" },
        take: 50,
        select: {
          id: true,
          startedAt: true,
          pageviews: true,
          clicks: true,
          landingPath: true,
          lastSeenAt: true,
        },
      });
      return { session, history };
    }),

  deleteSession: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.visitSession.delete({
        where: { id: input.id },
        select: { id: true },
      }),
    ),

  /** forget everything about one visitor (e.g. your own phone) */
  deleteVisitor: adminProcedure
    .input(z.object({ visitorId: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.visitSession.deleteMany({ where: { visitorId: input.visitorId } }),
    ),
});
