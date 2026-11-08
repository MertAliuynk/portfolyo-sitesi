"use client";

import { Loader2, Repeat, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  duration,
  fmtDateTime,
  MOOD_NAMES,
  pageName,
  place,
  referrerHost,
  seconds,
} from "~/components/admin/analytics/format";
import {
  Badge,
  Button,
  Card,
  inputClass,
  PageHeader,
} from "~/components/admin/ui";
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";

type Overview = RouterOutputs["analytics"]["overview"];

const RANGES = [
  { days: 1, label: "24 saat" },
  { days: 7, label: "7 gün" },
  { days: 30, label: "30 gün" },
  { days: 90, label: "90 gün" },
  { days: 365, label: "1 yıl" },
];

/* ------------------------------------------------------------------ */
/* pieces                                                               */
/* ------------------------------------------------------------------ */

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-[12px] font-medium text-[#78716c]">{label}</p>
      <p className="mt-2 text-[26px] leading-none font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[11px] text-[#a8a29e]">{hint}</p>}
    </Card>
  );
}

/** ranked list with a quiet magnitude bar behind each row */
function TopList({
  title,
  rows,
  empty = "Henüz veri yok.",
  render,
}: {
  title: string;
  rows: { key: string; n: number; target?: string | null }[];
  empty?: string;
  render?: (row: { key: string; target?: string | null }) => React.ReactNode;
}) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <Card className="min-w-0">
      <h3 className="border-b border-[#f5f5f4] px-4 py-3 text-[13px] font-semibold">
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="px-4 py-6 text-center text-[13px] text-[#a8a29e]">
          {empty}
        </p>
      ) : (
        <ul className="space-y-1 p-2">
          {rows.map((r) => (
            <li
              key={`${r.key}-${r.target ?? ""}`}
              className="relative flex items-center gap-3 rounded-md px-2 py-1.5"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-md bg-[#f0eeec]"
                style={{ width: `${(r.n / max) * 100}%` }}
              />
              <span className="relative min-w-0 flex-1 truncate text-[13px]">
                {render ? render(r) : r.key}
              </span>
              <span className="relative text-[12px] font-medium text-[#57534e] tabular-nums">
                {r.n}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** every hour/day in the range, with zero where nobody came */
function buckets(series: Overview["series"], days: number, hourly: boolean) {
  const key = (d: Date) => d.toISOString().slice(0, hourly ? 13 : 10);
  const byKey = new Map(series.map((s) => [key(new Date(s.t)), s]));
  // the series is in Istanbul wall-clock time (UTC+3, no DST)
  const nowTr = new Date(Date.now() + 3 * 3_600_000);
  const step = hourly ? 3_600_000 : 86_400_000;
  const count = hourly ? 24 * days : days;
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(nowTr.getTime() - (count - 1 - i) * step);
    const s = byKey.get(key(d));
    return { d, visitors: s?.visitors ?? 0, sessions: s?.sessions ?? 0 };
  });
}

function VisitorsChart({ data, days }: { data: Overview; days: number }) {
  const points = useMemo(
    () => buckets(data.series, days, data.hourly),
    [data, days],
  );
  const max = Math.max(1, ...points.map((p) => p.visitors));
  const label = (d: Date) =>
    data.hourly
      ? `${String(d.getUTCHours()).padStart(2, "0")}:00`
      : new Intl.DateTimeFormat("tr-TR", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        }).format(d);
  const tickEvery = Math.ceil(points.length / 6);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[13px] font-semibold">
          {data.hourly ? "Saat saat ziyaretçi" : "Gün gün ziyaretçi"}
        </h3>
        <span className="text-[12px] text-[#a8a29e]">en yüksek {max}</span>
      </div>
      <div className="relative mt-4 h-44">
        {/* recessive grid */}
        {[0, 0.5, 1].map((g) => (
          <div
            key={g}
            className="absolute inset-x-0 border-t border-[#f5f5f4]"
            style={{ bottom: `${g * 100}%` }}
          />
        ))}
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {points.map((p, i) => (
            <div
              key={i}
              className="group relative flex h-full min-w-0 flex-1 items-end"
            >
              <div
                className="w-full rounded-t-[4px] bg-[#57534e] transition-colors group-hover:bg-[#1c1917]"
                style={{
                  height: p.visitors
                    ? `${Math.max(2, (p.visitors / max) * 100)}%`
                    : "2px",
                  opacity: p.visitors ? 1 : 0.15,
                }}
              />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-lg bg-[#1c1917] px-2.5 py-1.5 text-[11px] whitespace-nowrap text-white shadow-lg group-hover:block">
                <p className="font-medium">{label(p.d)}</p>
                <p>
                  {p.visitors} ziyaretçi · {p.sessions} ziyaret
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex text-[11px] text-[#a8a29e]">
        {points.map((p, i) => (
          <span
            key={i}
            className="min-w-0 flex-1 overflow-visible text-center whitespace-nowrap"
          >
            {i % tickEvery === 0 ? label(p.d) : ""}
          </span>
        ))}
      </div>
    </Card>
  );
}

function Live() {
  const { data } = api.analytics.live.useQuery(undefined, {
    refetchInterval: 15_000,
  });
  return (
    <Card className="flex flex-wrap items-center gap-3 px-4 py-3">
      <span className="flex items-center gap-2 text-[13px] font-medium">
        <span className="relative flex h-2.5 w-2.5">
          {!!data?.length && (
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={cn(
              "relative h-2.5 w-2.5 rounded-full",
              data?.length ? "bg-emerald-500" : "bg-[#d6d3d1]",
            )}
          />
        </span>
        Şu an sitede: {data?.length ?? 0} kişi
      </span>
      {data?.map((s) => (
        <Link
          key={s.id}
          href={`/admin/ziyaretciler/${s.id}`}
          className="rounded-full border border-[#e7e5e4] px-2.5 py-1 text-[12px] text-[#57534e] hover:border-[#1c1917] hover:text-[#1c1917]"
        >
          {place(s)} · {s.device?.split(" · ")[0]} ·{" "}
          <span className="font-plex">{s.path}</span>
        </Link>
      ))}
    </Card>
  );
}

function Sessions({ days }: { days: number }) {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const query = api.analytics.sessions.useInfiniteQuery(
    { days, q: search || undefined },
    { getNextPageParam: (last) => last.next },
  );
  const rows = query.data?.pages.flatMap((p) => p.rows) ?? [];

  return (
    <Card className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f5f5f4] px-4 py-3">
        <h3 className="text-[13px] font-semibold">Ziyaretler</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(q.trim());
          }}
          className="relative w-full sm:w-72"
        >
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#a8a29e]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="IP, şehir, cihaz, sayfa ara"
            className={cn(inputClass, "h-9 pl-9")}
          />
        </form>
      </div>
      {query.isLoading ? (
        <div className="grid h-40 place-items-center text-[#a8a29e]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <p className="px-4 py-10 text-center text-[13px] text-[#a8a29e]">
          {search
            ? "Aramana uyan ziyaret yok."
            : "Bu aralıkta henüz ziyaret yok."}
        </p>
      ) : (
        <ul>
          {rows.map((s) => (
            <li
              key={s.id}
              className="border-b border-[#f5f5f4] last:border-b-0"
            >
              <Link
                href={`/admin/ziyaretciler/${s.id}`}
                className="grid gap-x-4 gap-y-1 px-4 py-3 transition hover:bg-[#fafaf9] sm:grid-cols-[9rem_1fr_auto]"
              >
                <span className="text-[12px] text-[#78716c] tabular-nums">
                  {fmtDateTime(s.startedAt)}
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-[14px] font-medium">
                    {place(s)}
                    {s.visits > 1 && (
                      <Badge tone="blue">
                        <Repeat className="h-3 w-3" /> {s.visits}. kez
                      </Badge>
                    )}
                  </span>
                  <span className="block truncate text-[12px] text-[#a8a29e]">
                    {[s.device, s.browser, s.os].filter(Boolean).join(" · ")} ·{" "}
                    <span className="font-plex">{s.ip ?? "IP yok"}</span>
                  </span>
                  <span className="block truncate text-[12px] text-[#a8a29e]">
                    {s.utmSource ?? referrerHost(s.referrer)} →{" "}
                    <span className="font-plex">{s.landingPath}</span>
                  </span>
                </span>
                <span className="flex gap-3 text-[12px] text-[#57534e] tabular-nums sm:flex-col sm:items-end sm:gap-0.5">
                  <span>{s.pageviews} sayfa</span>
                  <span>{s.clicks} tık</span>
                  <span>{duration(seconds(s.startedAt, s.lastSeenAt))}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {query.hasNextPage && (
        <div className="border-t border-[#f5f5f4] p-3 text-center">
          <Button
            size="sm"
            variant="ghost"
            loading={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            Daha fazla göster
          </Button>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */

export function VisitorsOverview() {
  const [days, setDays] = useState(7);
  const { data, isLoading } = api.analytics.overview.useQuery({ days });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ziyaretçiler"
        description="Siteye kim girdi, nereden geldi, ne yaptı. Senin kendi ziyaretlerin sayılmaz."
        actions={
          <div className="flex rounded-lg border border-[#e7e5e4] bg-white p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => setDays(r.days)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[12px] font-medium transition",
                  days === r.days
                    ? "bg-[#1c1917] text-white"
                    : "text-[#57534e] hover:text-[#1c1917]",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <Live />

      {isLoading || !data ? (
        <div className="grid h-60 place-items-center text-[#a8a29e]">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Stat
              label="Ziyaretçi"
              value={String(data.visitors)}
              hint="farklı kişi (tarayıcı)"
            />
            <Stat label="Ziyaret" value={String(data.sessions)} />
            <Stat label="Sayfa görüntüleme" value={String(data.pageviews)} />
            <Stat label="Ortalama süre" value={duration(data.avgSeconds)} />
            <Stat
              label="Hemen çıkma"
              value={`%${data.bounceRate}`}
              hint="tek sayfa bakıp gidenler"
            />
            <Stat
              label="Geri gelen"
              value={String(data.returning)}
              hint="bu aralıkta 2+ kez gelen"
            />
          </div>

          <VisitorsChart data={data} days={days} />

          <div className="grid gap-4 lg:grid-cols-2">
            <TopList
              title="En çok açılan sayfalar"
              rows={data.pages}
              render={(r) => (
                <span className="font-plex text-[12px]">{pageName(r.key)}</span>
              )}
            />
            <TopList
              title="En çok tıklananlar"
              rows={data.clicks}
              render={(r) => (
                <>
                  {r.key}
                  {r.target && (
                    <span className="font-plex text-[11px] text-[#a8a29e]">
                      {" "}
                      → {r.target}
                    </span>
                  )}
                </>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <TopList title="Şehirler" rows={data.cities} />
            <TopList title="Ülkeler" rows={data.countries} />
            <TopList title="Nereden geldiler" rows={data.referrers} />
            <TopList
              title="Seçilen modlar"
              rows={data.moods}
              render={(r) => MOOD_NAMES[r.key] ?? r.key}
            />
            <TopList title="Cihazlar" rows={data.devices} />
            <TopList title="Tarayıcılar" rows={data.browsers} />
            <TopList title="İşletim sistemleri" rows={data.systems} />
          </div>

          <Sessions days={days} />
        </>
      )}
    </div>
  );
}
