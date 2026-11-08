"use client";

import {
  ArrowLeft,
  FileText,
  Loader2,
  MousePointerClick,
  MoveDown,
  Trash2,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  duration,
  fmtClock,
  fmtDateTime,
  pageName,
  place,
  referrerHost,
  seconds,
} from "~/components/admin/analytics/format";
import { Badge, Button, Card } from "~/components/admin/ui";
import { cn } from "~/lib/utils";
import { api, type RouterOutputs } from "~/trpc/react";

type Event = NonNullable<
  RouterOutputs["analytics"]["session"]
>["session"]["events"][number];

function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium tracking-wide text-[#a8a29e] uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-[14px] break-words">{children ?? "—"}</dd>
    </div>
  );
}

function EventRow({
  e,
  start,
  stay,
}: {
  e: Event;
  start: Date;
  stay?: number;
}) {
  const Icon =
    e.type === "pageview"
      ? FileText
      : e.type === "click"
        ? MousePointerClick
        : MoveDown;
  return (
    <li className="group relative flex gap-3 pb-5 last:pb-0">
      {/* the thread joining the steps */}
      <span
        aria-hidden
        className="absolute top-8 bottom-0 left-[15px] w-px bg-[#e7e5e4] group-last:hidden"
      />
      <span
        className={cn(
          "relative grid h-8 w-8 shrink-0 place-items-center rounded-full border",
          e.type === "pageview" && "border-[#1c1917] bg-[#1c1917] text-white",
          e.type === "click" && "border-[#e7e5e4] bg-white text-[#1c1917]",
          e.type === "scroll" && "border-[#e7e5e4] bg-[#fafaf9] text-[#a8a29e]",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        <p className="text-[14px]">
          {e.type === "pageview" && (
            <>
              <span className="font-medium">Sayfayı açtı:</span>{" "}
              <span className="font-plex text-[13px]">{pageName(e.path)}</span>
            </>
          )}
          {e.type === "click" && (
            <>
              <span className="font-medium">Tıkladı:</span> “
              {e.label ?? "adsız öğe"}”
              {e.target && (
                <span className="font-plex text-[12px] text-[#78716c]">
                  {" "}
                  → {e.target}
                </span>
              )}
            </>
          )}
          {e.type === "scroll" && (
            <span className="text-[#78716c]">
              Sayfanın %{e.value ?? 0} kadarına indi
            </span>
          )}
        </p>
        <p className="mt-0.5 text-[12px] text-[#a8a29e] tabular-nums">
          {fmtClock(e.at)} · +{duration(seconds(start, e.at))}
          {e.type === "pageview" && e.label && <> · {e.label}</>}
          {stay !== undefined && <> · bu sayfada {duration(stay)}</>}
        </p>
      </div>
    </li>
  );
}

export function VisitDetail({ id }: { id: string }) {
  const router = useRouter();
  const utils = api.useUtils();
  const { data, isLoading } = api.analytics.session.useQuery({ id });
  const [confirm, setConfirm] = useState<"session" | "visitor" | null>(null);
  const done = () => {
    void utils.analytics.invalidate();
    router.push("/admin/ziyaretciler");
  };
  const delSession = api.analytics.deleteSession.useMutation({
    onSuccess: done,
  });
  const delVisitor = api.analytics.deleteVisitor.useMutation({
    onSuccess: done,
  });

  if (isLoading)
    return (
      <div className="grid h-60 place-items-center text-[#a8a29e]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!data)
    return (
      <div className="space-y-4">
        <Link
          href="/admin/ziyaretciler"
          className="text-[13px] text-[#78716c] hover:text-[#1c1917]"
        >
          ← Ziyaretçiler
        </Link>
        <p className="text-[14px]">
          Bu ziyaret bulunamadı (silinmiş olabilir).
        </p>
      </div>
    );

  const { session: s, history } = data;
  const events = s.events;
  // time on each page = until the next page opened (or the visit's last sign of life)
  const pageviews = events.filter((e) => e.type === "pageview");
  const stays = new Map(
    pageviews.map((p, i) => [
      p.id,
      seconds(p.at, pageviews[i + 1]?.at ?? s.lastSeenAt),
    ]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/ziyaretciler"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#78716c] hover:text-[#1c1917]"
          >
            <ArrowLeft className="h-4 w-4" /> Ziyaretçiler
          </Link>
          <h1 className="mt-2 text-[22px] font-semibold tracking-tight">
            {place(s)}
          </h1>
          <p className="mt-1 text-[14px] text-[#78716c]">
            {fmtDateTime(s.startedAt)} ·{" "}
            {duration(seconds(s.startedAt, s.lastSeenAt))} kaldı · {s.pageviews}{" "}
            sayfa · {s.clicks} tıklama
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {confirm ? (
            <>
              <Button
                size="sm"
                variant="danger"
                loading={delSession.isPending || delVisitor.isPending}
                onClick={() =>
                  confirm === "session"
                    ? delSession.mutate({ id: s.id })
                    : delVisitor.mutate({ visitorId: s.visitorId })
                }
              >
                {confirm === "session"
                  ? "Bu ziyareti sil"
                  : `${history.length} ziyaretin hepsini sil`}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirm(null)}
              >
                Vazgeç
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirm("session")}
              >
                <Trash2 className="h-3.5 w-3.5" /> Ziyareti sil
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirm("visitor")}
              >
                <UserX className="h-3.5 w-3.5" /> Bu ziyaretçiyi unut
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="min-w-0 p-5">
          <h2 className="mb-5 text-[14px] font-semibold">Ne yaptı?</h2>
          {events.length === 0 ? (
            <p className="text-[13px] text-[#a8a29e]">Kayıtlı hareket yok.</p>
          ) : (
            <ol>
              {events.map((e) => (
                <EventRow
                  key={e.id}
                  e={e}
                  start={events[0]?.at ?? s.startedAt}
                  stay={stays.get(e.id)}
                />
              ))}
            </ol>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-4 text-[14px] font-semibold">Kim?</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <Fact label="IP adresi">
                <span className="font-plex text-[13px]">{s.ip}</span>
              </Fact>
              <Fact label="Konum">
                {[s.city, s.region, s.country].filter(Boolean).join(", ")}
              </Fact>
              <Fact label="İnternet sağlayıcı">{s.isp}</Fact>
              <Fact label="Cihaz">{s.device}</Fact>
              <Fact label="Tarayıcı">{s.browser}</Fact>
              <Fact label="İşletim sistemi">{s.os}</Fact>
              <Fact label="Ekran">{s.screen}</Fact>
              <Fact label="Dil">{s.language}</Fact>
              <Fact label="Geldiği yer">
                {s.referrer ? (
                  <a
                    href={s.referrer}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2"
                  >
                    {referrerHost(s.referrer)}
                  </a>
                ) : (
                  "Doğrudan"
                )}
                {s.utmSource && <Badge>{s.utmSource}</Badge>}
              </Fact>
              <Fact label="İlk sayfa">
                <span className="font-plex text-[13px]">{s.landingPath}</span>
              </Fact>
            </dl>
            {s.userAgent && (
              <details className="mt-4 text-[12px] text-[#a8a29e]">
                <summary className="cursor-pointer">
                  Tarayıcı kimliği (user agent)
                </summary>
                <p className="font-plex mt-1 break-all">{s.userAgent}</p>
              </details>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-[14px] font-semibold">
              Bu ziyaretçinin geçmişi
            </h2>
            <p className="mt-0.5 text-[12px] text-[#a8a29e]">
              Aynı tarayıcıdan {history.length} ziyaret
            </p>
            <ul className="mt-3 space-y-1">
              {history.map((h) => (
                <li key={h.id}>
                  <Link
                    href={`/admin/ziyaretciler/${h.id}`}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-[13px] hover:bg-[#f5f5f4]",
                      h.id === s.id && "bg-[#f5f5f4] font-medium",
                    )}
                  >
                    <span className="tabular-nums">
                      {fmtDateTime(h.startedAt)}
                    </span>
                    <span className="text-[12px] text-[#78716c]">
                      {h.pageviews} sayfa ·{" "}
                      {duration(seconds(h.startedAt, h.lastSeenAt))}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
