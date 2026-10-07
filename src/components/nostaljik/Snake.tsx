"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { MenuBar, StatusCell } from "~/components/nostaljik/Window";
import { beep } from "~/lib/beep";
import { useBest } from "~/lib/highscore";

/** canvas can't read CSS variables, so resolve the next/font family once */
function dosFont(px: number) {
  const family =
    getComputedStyle(document.documentElement).getPropertyValue("--font-vt323").trim() ||
    "monospace";
  return `${px}px ${family}`;
}

const SIZE = 18;
const CELL = 16;
const LCD = "#a8c64e";
const PIXEL = "#2b3a12";

type P = { x: number; y: number };
type Status = "ready" | "playing" | "paused" | "over";

const DIRS: Record<string, P> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function food(snake: P[]): P {
  for (;;) {
    const p = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}

export function Snake({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [score, setScore] = useState(0);
  const { best, submit } = useBest("w98-yilan");
  const g = useRef({
    snake: [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }] as P[],
    dir: { x: 1, y: 0 },
    queue: [] as P[],
    food: { x: 13, y: 9 },
    status: "ready",
  });

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const s = g.current;
    ctx.fillStyle = LCD;
    ctx.fillRect(0, 0, SIZE * CELL, SIZE * CELL);
    // faint LCD grid
    ctx.fillStyle = "rgba(43,58,18,0.06)";
    for (let x = 0; x < SIZE; x++)
      for (let y = 0; y < SIZE; y++) ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);

    ctx.fillStyle = PIXEL;
    s.snake.forEach((p, i) => {
      ctx.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
      if (i === 0) {
        ctx.fillStyle = LCD;
        ctx.fillRect(p.x * CELL + 5 + s.dir.x * 3, p.y * CELL + 5 + s.dir.y * 3, 3, 3);
        ctx.fillStyle = PIXEL;
      }
    });
    const f = s.food;
    ctx.fillRect(f.x * CELL + 5, f.y * CELL + 2, 6, 12);
    ctx.fillRect(f.x * CELL + 2, f.y * CELL + 5, 12, 6);

    if (s.status !== "playing") {
      ctx.fillStyle = "rgba(168,198,78,0.85)";
      ctx.fillRect(0, SIZE * CELL * 0.36, SIZE * CELL, SIZE * CELL * 0.28);
      ctx.fillStyle = PIXEL;
      ctx.textAlign = "center";
      ctx.font = dosFont(26);
      const title =
        s.status === "over" ? "OYUN BİTTİ" : s.status === "paused" ? "DURAKLATILDI" : "YILAN";
      ctx.fillText(title, (SIZE * CELL) / 2, SIZE * CELL * 0.49);
      ctx.font = dosFont(18);
      ctx.fillText("BAŞLAMAK İÇİN ENTER / BOŞLUK", (SIZE * CELL) / 2, SIZE * CELL * 0.58);
    }
  }, []);

  const start = useCallback(() => {
    const s = g.current;
    s.snake = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }];
    s.dir = { x: 1, y: 0 };
    s.queue = [];
    s.food = food(s.snake);
    s.status = "playing";
    setStatus("playing");
    setScore(0);
  }, []);

  const turn = useCallback((d: P) => {
    const s = g.current;
    const lastDir = s.queue[s.queue.length - 1] ?? s.dir;
    if (d.x === -lastDir.x && d.y === -lastDir.y) return;
    if (d.x === lastDir.x && d.y === lastDir.y) return;
    if (s.queue.length < 3) s.queue.push(d);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    if (status !== "playing") {
      draw();
      return;
    }
    const s = g.current;
    const speed = Math.max(70, 150 - Math.floor(score / 5) * 8);
    const id = setInterval(() => {
      s.dir = s.queue.shift() ?? s.dir;
      const head = s.snake[0]!;
      const next = { x: head.x + s.dir.x, y: head.y + s.dir.y };
      const hitWall = next.x < 0 || next.y < 0 || next.x >= SIZE || next.y >= SIZE;
      const hitSelf = s.snake.some((p) => p.x === next.x && p.y === next.y);
      if (hitWall || hitSelf) {
        s.status = "over";
        setStatus("over");
        submit(s.snake.length - 3);
        beep(150, 0.4);
        draw();
        return;
      }
      s.snake.unshift(next);
      if (next.x === s.food.x && next.y === s.food.y) {
        s.food = food(s.snake);
        setScore(s.snake.length - 3);
        beep(880, 0.05);
      } else {
        s.snake.pop();
      }
      draw();
    }, speed);
    return () => clearInterval(id);
  }, [status, score, draw, submit]);

  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      const s = g.current;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (s.status === "playing") {
          s.status = "paused";
          setStatus("paused");
        } else if (s.status === "paused") {
          s.status = "playing";
          setStatus("playing");
        } else start();
        return;
      }
      const d = DIRS[e.key];
      if (d && s.status === "playing") {
        e.preventDefault();
        turn(d);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, start, turn]);

  const pad = (label: string, d: P, cls: string) => (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        if (g.current.status !== "playing") start();
        else turn(d);
      }}
      className={`w98-btn grid h-9 !min-w-0 w-9 place-items-center !p-0 ${cls}`}
      aria-label={label}
    >
      {label === "Yukarı" ? "▲" : label === "Aşağı" ? "▼" : label === "Sol" ? "◀" : "▶"}
    </button>
  );

  return (
    <div className="flex flex-col">
      <MenuBar items={["Oyun", "Seçenekler", "Yardım"]} />
      <div className="flex flex-col items-center gap-3 p-2">
        <div className="w98-sunken p-[3px]">
          <canvas
            ref={canvasRef}
            width={SIZE * CELL}
            height={SIZE * CELL}
            className="block"
            onPointerDown={() => g.current.status !== "playing" && start()}
            aria-label="Yılan oyun alanı"
          />
        </div>
        <div className="grid grid-cols-3 gap-1 sm:hidden">
          <span />
          {pad("Yukarı", { x: 0, y: -1 }, "")}
          <span />
          {pad("Sol", { x: -1, y: 0 }, "")}
          {pad("Aşağı", { x: 0, y: 1 }, "")}
          {pad("Sağ", { x: 1, y: 0 }, "")}
        </div>
      </div>
      <div className="flex gap-[2px] text-[12px]">
        <StatusCell className="flex-1">Puan: {score}</StatusCell>
        <StatusCell className="flex-1">Rekor: {best ?? 0}</StatusCell>
        <StatusCell className="hidden flex-1 sm:block">Yön tuşları · Enter</StatusCell>
      </div>
    </div>
  );
}
