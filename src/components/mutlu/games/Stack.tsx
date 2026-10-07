"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { burst, chunky } from "~/components/mutlu/kit";
import { beep } from "~/lib/beep";
import { useBest } from "~/lib/highscore";
import { cn } from "~/lib/utils";

const W = 380;
const H = 560;
const BLOCK_H = 30;
const BASE_W = 220;
const COLORS = ["#FF5A36", "#FFC93C", "#2EC27E", "#4D9FFF", "#FF8AD8", "#B79CFF"];
const INK = "#1A1A1A";

interface Block {
  x: number;
  w: number;
  color: string;
}

interface Debris {
  x: number;
  y: number;
  w: number;
  vy: number;
  rot: number;
  vr: number;
  color: string;
}

type Status = "ready" | "playing" | "over";

export function Stack() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("ready");
  const [score, setScore] = useState(0);
  const [perfect, setPerfect] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const [record, setRecord] = useState(false);
  const { best, submit } = useBest("mutlu-kule");

  const game = useRef({
    stack: [] as Block[],
    current: { x: 0, w: BASE_W, dir: 1, speed: 180 },
    debris: [] as Debris[],
    camera: 0,
    status: "ready",
  });

  const reset = useCallback(() => {
    const g = game.current;
    g.stack = [{ x: (W - BASE_W) / 2, w: BASE_W, color: COLORS[0]! }];
    g.current = { x: -BASE_W, w: BASE_W, dir: 1, speed: 180 };
    g.debris = [];
    g.camera = 0;
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  // render + simulation loop runs always so debris keeps falling after a loss
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    let raf = 0;
    let last = performance.now();

    const drawBlock = (x: number, y: number, w: number, color: string) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x, y, w, BLOCK_H, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.fillRect(x + 6, y + 5, Math.max(0, w - 12), 4);
    };

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const g = game.current;

      if (g.status === "playing") {
        const c = g.current;
        c.x += c.dir * c.speed * dt;
        if (c.x + c.w > W + 40) c.dir = -1;
        if (c.x < -40) c.dir = 1;
      }

      const targetCam = Math.max(0, g.stack.length * BLOCK_H - H * 0.5);
      g.camera += (targetCam - g.camera) * Math.min(1, dt * 6);

      g.debris.forEach((d) => {
        d.vy += 1400 * dt;
        d.y += d.vy * dt;
        d.rot += d.vr * dt;
      });
      g.debris = g.debris.filter((d) => d.y < H + 200);

      // background
      ctx.fillStyle = "#FFF8EA";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(26,26,26,0.12)";
      for (let y = 13; y < H; y += 26) {
        for (let x = 13; x < W; x += 26) {
          ctx.beginPath();
          ctx.arc(x, (y + g.camera * 0.3) % H, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      const yOf = (i: number) => H - 40 - (i + 1) * BLOCK_H + g.camera;

      g.stack.forEach((b, i) => drawBlock(b.x, yOf(i), b.w, b.color));

      if (g.status === "playing") {
        const c = g.current;
        drawBlock(c.x, yOf(g.stack.length), c.w, COLORS[g.stack.length % COLORS.length]!);
      }

      g.debris.forEach((d) => {
        ctx.save();
        ctx.translate(d.x + d.w / 2, d.y + BLOCK_H / 2);
        ctx.rotate(d.rot);
        drawBlock(-d.w / 2, -BLOCK_H / 2, d.w, d.color);
        ctx.restore();
      });

      // ground
      ctx.fillStyle = INK;
      ctx.fillRect(0, H - 40 + g.camera, W, 4);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const drop = useCallback(() => {
    const g = game.current;
    if (g.status !== "playing") return;
    const c = g.current;
    const top = g.stack[g.stack.length - 1]!;
    const color = COLORS[g.stack.length % COLORS.length]!;
    const level = g.stack.length;
    const yScreen = H - 40 - (level + 1) * BLOCK_H + g.camera;

    if (Math.abs(c.x - top.x) < 6) {
      g.stack.push({ x: top.x, w: top.w, color });
      setPerfect((p) => p + 1);
      setFlash("Mükemmel!");
      beep(660 + Math.min(level, 20) * 30, 0.14);
    } else {
      const left = Math.max(c.x, top.x);
      const right = Math.min(c.x + c.w, top.x + top.w);
      const overlap = right - left;
      if (overlap <= 0) {
        g.debris.push({ x: c.x, y: yScreen, w: c.w, vy: 0, rot: 0, vr: c.dir * 2, color });
        g.status = "over";
        setStatus("over");
        beep(160, 0.35);
        const isRecord = submit(g.stack.length - 1);
        setRecord(isRecord);
        if (isRecord) burst({ x: 0.5, y: 0.5 });
        return;
      }
      const cutX = c.x < top.x ? c.x : right;
      g.debris.push({
        x: cutX,
        y: yScreen,
        w: c.w - overlap,
        vy: 0,
        rot: 0,
        vr: (c.x < top.x ? -1 : 1) * 3,
        color,
      });
      g.stack.push({ x: left, w: overlap, color });
      setFlash(null);
      beep(440 + Math.min(level, 20) * 20, 0.08);
    }

    setScore(g.stack.length - 1);
    const fromLeft = g.stack.length % 2 === 0;
    const w = g.stack[g.stack.length - 1]!.w;
    g.current = {
      x: fromLeft ? -w : W,
      w,
      dir: fromLeft ? 1 : -1,
      speed: Math.min(420, 180 + g.stack.length * 9),
    };
    setTimeout(() => setFlash(null), 600);
  }, [submit]);

  const start = useCallback(() => {
    reset();
    game.current.status = "playing";
    setStatus("playing");
    setScore(0);
    setPerfect(0);
    setRecord(false);
  }, [reset]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      e.preventDefault();
      if (game.current.status === "playing") drop();
      else start();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drop, start]);

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
      <div
        className="relative w-full max-w-[380px] touch-none overflow-hidden rounded-[28px] border-[3px] border-[#1A1A1A] shadow-[8px_8px_0_#1A1A1A] select-none"
        onPointerDown={() => (status === "playing" ? drop() : undefined)}
      >
        <canvas
          ref={canvasRef}
          className="block aspect-[380/560] w-full"
          aria-label="Kule oyun alanı"
        />
        <p className="pointer-events-none absolute inset-x-0 top-5 text-center font-pop text-6xl font-extrabold [-webkit-text-stroke:3px_#1A1A1A] [paint-order:stroke_fill] text-[#FFF1D6]">
          {score}
        </p>
        {flash && (
          <p className="pointer-events-none absolute inset-x-0 top-24 text-center font-hand text-4xl text-[#FF5A36]">
            {flash}
          </p>
        )}
        {status !== "playing" && (
          <div className="absolute inset-0 grid place-items-center bg-[#FFF1D6]/70 px-6 text-center">
            <div>
              <p className="font-pop text-3xl font-extrabold">
                {status === "over" ? (record ? "YENİ REKOR!" : "Devrildi!") : "Ne kadar yükseğe?"}
              </p>
              {status === "over" && (
                <p className="mt-1 font-pop font-bold">
                  {score} kat · {perfect} mükemmel
                </p>
              )}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={start}
                className={cn(
                  chunky,
                  "mt-5 rounded-2xl bg-[#FF5A36] px-8 py-3 font-pop text-2xl font-extrabold text-[#FFF1D6]",
                )}
              >
                {status === "over" ? "Tekrar!" : "Başla!"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-row flex-wrap gap-3 font-pop font-extrabold lg:w-48 lg:flex-col">
        <span className="rounded-2xl border-[3px] border-[#1A1A1A] bg-[#FFC93C] px-4 py-2">
          Kat: {score}
        </span>
        <span className="rounded-2xl border-[3px] border-[#1A1A1A] bg-[#FF8AD8] px-4 py-2">
          Mükemmel: {perfect}
        </span>
        <span className="rounded-2xl border-[3px] border-[#1A1A1A] bg-[#FFF8EA] px-4 py-2">
          Rekor: {best ?? "-"}
        </span>
        <span className="font-hand text-2xl font-normal">boşluk tuşu da olur</span>
      </div>
    </div>
  );
}
