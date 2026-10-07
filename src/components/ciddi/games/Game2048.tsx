"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { useBest } from "~/lib/highscore";
import { cn } from "~/lib/utils";

const N = 4;

interface Tile {
  id: number;
  v: number;
  r: number;
  c: number;
  pop: number;
}

type Dir = "up" | "down" | "left" | "right";

const STYLE: Record<number, string> = {
  2: "bg-[#F4F2EE] text-[#111]",
  4: "bg-[#E6E2DA] text-[#111]",
  8: "bg-[#D3CEC4] text-[#111]",
  16: "bg-[#B8B2A6] text-[#111]",
  32: "bg-[#8F897E] text-[#F4F2EE]",
  64: "bg-[#5E5A53] text-[#F4F2EE]",
  128: "bg-[#3A3733] text-[#F4F2EE]",
  256: "bg-[#262422] text-[#F4F2EE]",
  512: "bg-[#161514] text-[#F4F2EE]",
  1024: "bg-[#111] text-[#F4F2EE] shadow-[inset_0_-4px_0_#E5381F]",
  2048: "bg-[#E5381F] text-[#F4F2EE]",
};

let uid = 1;

function spawn(tiles: Tile[]): Tile[] {
  const empty: [number, number][] = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      if (!tiles.some((t) => t.r === r && t.c === c)) empty.push([r, c]);
  if (!empty.length) return tiles;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)]!;
  return [...tiles, { id: uid++, v: Math.random() < 0.9 ? 2 : 4, r, c, pop: 0 }];
}

function slide(tiles: Tile[], dir: Dir) {
  const horizontal = dir === "left" || dir === "right";
  const forward = dir === "right" || dir === "down";
  let gained = 0;
  let moved = false;
  const out: Tile[] = [];

  for (let line = 0; line < N; line++) {
    const row = tiles
      .filter((t) => (horizontal ? t.r === line : t.c === line))
      .sort((a, b) => {
        const pa = horizontal ? a.c : a.r;
        const pb = horizontal ? b.c : b.r;
        return forward ? pb - pa : pa - pb;
      });

    let slot = 0;
    for (let i = 0; i < row.length; i++) {
      const t = row[i]!;
      const nextT = row[i + 1];
      let value = t.v;
      let pop = t.pop;
      if (nextT?.v === t.v) {
        value = t.v * 2;
        gained += value;
        pop = t.pop + 1;
        i++;
      }
      const pos = forward ? N - 1 - slot : slot;
      const r = horizontal ? line : pos;
      const c = horizontal ? pos : line;
      if (r !== t.r || c !== t.c || value !== t.v) moved = true;
      out.push({ id: t.id, v: value, r, c, pop });
      slot++;
    }
  }
  return { tiles: out, gained, moved };
}

function stuck(tiles: Tile[]) {
  if (tiles.length < N * N) return false;
  const at = (r: number, c: number) => tiles.find((t) => t.r === r && t.c === c)?.v;
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      const v = at(r, c);
      if (v === at(r + 1, c) || v === at(r, c + 1)) return false;
    }
  return true;
}

export function Game2048() {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepGoing, setKeepGoing] = useState(false);
  const { best, submit } = useBest("ciddi-2048");
  const touch = useRef<{ x: number; y: number } | null>(null);

  const reset = useCallback(() => {
    setTiles(spawn(spawn([])));
    setScore(0);
    setMoves(0);
    setOver(false);
    setWon(false);
    setKeepGoing(false);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const move = useCallback(
    (dir: Dir) => {
      if (over || (won && !keepGoing)) return;
      const result = slide(tiles, dir);
      if (!result.moved) return;
      const next = spawn(result.tiles);
      const total = score + result.gained;
      setTiles(next);
      setScore(total);
      setMoves((m) => m + 1);
      submit(total);
      if (!won && next.some((t) => t.v >= 2048)) setWon(true);
      if (stuck(next)) setOver(true);
    },
    [tiles, score, over, won, keepGoing, submit],
  );

  useEffect(() => {
    const map: Record<string, Dir> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    };
    function onKey(e: KeyboardEvent) {
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      move(dir);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  return (
    <div>
      <div className="mb-5 grid grid-cols-3 border-y border-[#111]">
        {[
          ["Skor", score],
          ["En iyi", best ?? 0],
          ["Hamle", moves],
        ].map(([k, v], i) => (
          <div key={k} className={cn("py-3", i > 0 && "border-l border-[#111]/20 pl-4")}>
            <p className="font-plex text-[11px] tracking-[0.08em] text-[#6B6B6B] uppercase">{k}</p>
            <p className="font-editorial text-4xl leading-none tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div
        className="relative aspect-square w-full max-w-[520px] touch-none border border-[#111] bg-[#E9E6E0] p-[6px] select-none"
        onPointerDown={(e) => (touch.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          if (!touch.current) return;
          const dx = e.clientX - touch.current.x;
          const dy = e.clientY - touch.current.y;
          touch.current = null;
          if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
          move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
        }}
      >
        <div className="grid h-full w-full grid-cols-4 grid-rows-4">
          {Array.from({ length: N * N }).map((_, i) => (
            <div key={i} className="m-[6px] border border-dashed border-[#111]/15" />
          ))}
        </div>
        <div className="absolute inset-[6px]">
          <AnimatePresence>
            {tiles.map((t) => (
              <motion.div
                key={t.id}
                initial={{ scale: 0, left: `${t.c * 25}%`, top: `${t.r * 25}%` }}
                animate={{ scale: 1, left: `${t.c * 25}%`, top: `${t.r * 25}%` }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="absolute h-1/4 w-1/4 p-[6px]"
              >
                <motion.div
                  key={t.pop}
                  initial={{ scale: t.pop ? 1.12 : 1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "grid h-full w-full place-items-center border border-[#111] font-editorial leading-none",
                    STYLE[t.v] ?? "bg-[#E5381F] text-[#F4F2EE]",
                    t.v < 100 ? "text-[clamp(2rem,9vw,3.5rem)]" : t.v < 1000 ? "text-[clamp(1.7rem,7.5vw,3rem)]" : "text-[clamp(1.3rem,6vw,2.4rem)]",
                  )}
                >
                  {t.v}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {(over || (won && !keepGoing)) && (
          <div className="absolute inset-0 grid place-items-center bg-[#F4F2EE]/85 text-center">
            <div>
              <p className="font-plex text-[11px] tracking-[0.08em] uppercase">
                {won ? "Hedefe ulaşıldı" : "Hamle kalmadı"}
              </p>
              <p className="mt-2 font-editorial text-6xl">{won ? "2048." : `${score}`}</p>
              <div className="mt-5 flex justify-center gap-2">
                {won && (
                  <button
                    type="button"
                    onClick={() => setKeepGoing(true)}
                    className="border border-[#111] px-4 py-2 font-plex text-[12px] uppercase hover:bg-[#111] hover:text-[#F4F2EE]"
                  >
                    Devam et
                  </button>
                )}
                <button
                  type="button"
                  onClick={reset}
                  className="border border-[#111] bg-[#111] px-4 py-2 font-plex text-[12px] text-[#F4F2EE] uppercase hover:bg-[#E5381F] hover:border-[#E5381F]"
                >
                  Yeni oyun
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex max-w-[520px] items-center justify-between font-plex text-[12px] text-[#6B6B6B]">
        <span>← ↑ → ↓ · WASD · kaydırma</span>
        <button type="button" onClick={reset} className="border-b border-[#111] text-[#111] uppercase hover:text-[#E5381F]">
          Yeni oyun
        </button>
      </div>
    </div>
  );
}
