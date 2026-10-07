"use client";

import { useEffect, useRef, useState } from "react";

import { useBest } from "~/lib/highscore";
import { cn } from "~/lib/utils";

const TRIALS = 5;

type Phase = "idle" | "waiting" | "go" | "early" | "result" | "done";

export function Reaction() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<number[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const goAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { best, submit } = useBest("ciddi-reaksiyon", true);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function arm() {
    setPhase("waiting");
    timer.current = setTimeout(
      () => {
        goAt.current = performance.now();
        setPhase("go");
      },
      1200 + Math.random() * 2600,
    );
  }

  function press() {
    if (phase === "idle" || phase === "result" || phase === "early") {
      arm();
      return;
    }
    if (phase === "done") {
      setResults([]);
      setLast(null);
      arm();
      return;
    }
    if (phase === "waiting") {
      if (timer.current) clearTimeout(timer.current);
      setPhase("early");
      return;
    }
    if (phase === "go") {
      const ms = Math.round(performance.now() - goAt.current);
      const next = [...results, ms];
      setResults(next);
      setLast(ms);
      if (next.length >= TRIALS) {
        const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
        submit(avg);
        setPhase("done");
      } else {
        setPhase("result");
      }
    }
  }

  const avg = results.length
    ? Math.round(results.reduce((a, b) => a + b, 0) / results.length)
    : null;

  const panel: Record<Phase, { bg: string; title: string; sub: string }> = {
    idle: { bg: "bg-[#111] text-[#F4F2EE]", title: "Başlamak için tıkla", sub: `${TRIALS} deneme yapılacak` },
    waiting: { bg: "bg-[#D3CEC4] text-[#111]", title: "Bekle…", sub: "Alan kırmızıya dönünce tıkla" },
    go: { bg: "bg-[#E5381F] text-[#F4F2EE]", title: "Şimdi!", sub: "" },
    early: { bg: "bg-[#111] text-[#F4F2EE]", title: "Erken.", sub: "Bu deneme sayılmadı. Tekrar için tıkla." },
    result: { bg: "bg-[#111] text-[#F4F2EE]", title: `${last} ms`, sub: `Deneme ${results.length} / ${TRIALS} · devam için tıkla` },
    done: { bg: "bg-[#111] text-[#F4F2EE]", title: `${avg} ms`, sub: "Ortalama · yeniden başlamak için tıkla" },
  };
  const p = panel[phase];

  return (
    <div>
      <button
        type="button"
        onPointerDown={press}
        className={cn(
          "flex h-[360px] w-full flex-col items-center justify-center px-6 text-center transition-colors duration-75 select-none sm:h-[420px]",
          p.bg,
        )}
      >
        <span className="font-editorial text-[clamp(3.5rem,10vw,7rem)] leading-none">{p.title}</span>
        {p.sub && (
          <span className="mt-4 font-plex text-[12px] tracking-[0.08em] uppercase opacity-70">
            {p.sub}
          </span>
        )}
      </button>

      <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_14rem]">
        <div>
          <p className="font-plex text-[11px] tracking-[0.08em] text-[#6B6B6B] uppercase">Denemeler</p>
          <ol className="mt-3 border-t border-[#111]">
            {Array.from({ length: TRIALS }).map((_, i) => {
              const ms = results[i];
              return (
                <li key={i} className="grid grid-cols-[2.5rem_1fr_4.5rem] items-center gap-3 border-b border-[#111]/20 py-2.5">
                  <span className="font-plex text-[12px]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="relative h-[6px] bg-[#111]/10">
                    {ms !== undefined && (
                      <span
                        className={cn("absolute inset-y-0 left-0", ms < 250 ? "bg-[#E5381F]" : "bg-[#111]")}
                        style={{ width: `${Math.min(100, (ms / 600) * 100)}%` }}
                      />
                    )}
                  </span>
                  <span className="text-right font-plex text-[13px] tabular-nums">
                    {ms !== undefined ? `${ms} ms` : "—"}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <dl className="space-y-4 font-swiss text-[14px]">
          <div>
            <dt className="font-plex text-[11px] tracking-[0.08em] text-[#6B6B6B] uppercase">Ortalama</dt>
            <dd className="font-editorial text-4xl">{avg !== null ? `${avg} ms` : "—"}</dd>
          </div>
          <div>
            <dt className="font-plex text-[11px] tracking-[0.08em] text-[#6B6B6B] uppercase">En iyi ortalaman</dt>
            <dd className="font-editorial text-4xl">{best !== null ? `${best} ms` : "—"}</dd>
          </div>
          <p className="text-[13px] leading-relaxed text-[#4A4A4A]">
            Referans: görsel uyarana ortalama tepki süresi yaklaşık 250 ms.
            Kırmızı çubuklar bunun altını gösterir.
          </p>
        </dl>
      </div>
    </div>
  );
}
