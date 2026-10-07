"use client";

import { useEffect, useRef, useState } from "react";

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

const W = 400;
const H = 320;
const COLS = 10;
const ROWS = 6;
const BRICK_W = W / COLS;
const BRICK_H = 14;
const TOP = 34;
const PADDLE_W = 64;
const ROW_COLORS = ["#f03c1e", "#ff9a1e", "#ffd21e", "#3cb43c", "#1e64f0", "#8c3cdc"];

interface Brick {
  x: number;
  y: number;
  alive: boolean;
  color: string;
}

function makeBricks(): Brick[] {
  const out: Brick[] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      out.push({ x: c * BRICK_W, y: TOP + r * BRICK_H, alive: true, color: ROW_COLORS[r]! });
  return out;
}

export function Breakout({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const { best, submit } = useBest("w98-tugla");
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const g = useRef({
    bricks: makeBricks(),
    paddle: W / 2 - PADDLE_W / 2,
    ball: { x: W / 2, y: H - 40, vx: 150, vy: -210, stuck: true },
    keys: { left: false, right: false },
    score: 0,
    lives: 3,
    level: 1,
    over: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let last = performance.now();

    const reset = (full: boolean) => {
      const s = g.current;
      if (full) {
        s.bricks = makeBricks();
        s.score = 0;
        s.lives = 3;
        s.level = 1;
        s.over = false;
        setScore(0);
        setLives(3);
        setLevel(1);
      }
      s.ball = { x: s.paddle + PADDLE_W / 2, y: H - 40, vx: 150, vy: -210 - (s.level - 1) * 30, stuck: true };
    };

    const launch = () => {
      const s = g.current;
      if (s.over) {
        reset(true);
        return;
      }
      if (s.ball.stuck) {
        s.ball.stuck = false;
        s.ball.vx = (Math.random() > 0.5 ? 1 : -1) * (130 + Math.random() * 60);
      }
    };

    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (!activeRef.current) return;
      const s = g.current;
      if (e.key === "ArrowLeft" || e.key === "a") {
        s.keys.left = down;
        e.preventDefault();
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        s.keys.right = down;
        e.preventDefault();
      }
      if (down && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        launch();
      }
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);

    const move = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * W;
      g.current.paddle = Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W / 2));
    };
    canvas.addEventListener("pointermove", move);
    const press = (e: PointerEvent) => {
      move(e);
      launch();
    };
    canvas.addEventListener("pointerdown", press);

    const loop = (now: number) => {
      const dt = Math.min(0.025, (now - last) / 1000);
      last = now;
      const s = g.current;
      const b = s.ball;

      if (s.keys.left) s.paddle = Math.max(0, s.paddle - 360 * dt);
      if (s.keys.right) s.paddle = Math.min(W - PADDLE_W, s.paddle + 360 * dt);

      if (b.stuck) {
        b.x = s.paddle + PADDLE_W / 2;
        b.y = H - 26;
      } else if (!s.over) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 3 || b.x > W - 3) {
          b.vx *= -1;
          b.x = Math.max(3, Math.min(W - 3, b.x));
          beep(300, 0.03);
        }
        if (b.y < 3) {
          b.vy = Math.abs(b.vy);
          beep(300, 0.03);
        }
        // paddle
        if (b.vy > 0 && b.y > H - 24 && b.y < H - 14 && b.x > s.paddle - 3 && b.x < s.paddle + PADDLE_W + 3) {
          const hit = (b.x - (s.paddle + PADDLE_W / 2)) / (PADDLE_W / 2);
          const speed = Math.hypot(b.vx, b.vy) * 1.01;
          const angle = hit * 1.05;
          b.vx = Math.sin(angle) * speed;
          b.vy = -Math.cos(angle) * speed;
          beep(520, 0.04);
        }
        // bricks
        for (const br of s.bricks) {
          if (!br.alive) continue;
          if (b.x > br.x && b.x < br.x + BRICK_W && b.y > br.y && b.y < br.y + BRICK_H) {
            br.alive = false;
            b.vy *= -1;
            s.score += 10 * s.level;
            setScore(s.score);
            beep(660 + (TOP + ROWS * BRICK_H - br.y) * 6, 0.05);
            break;
          }
        }
        if (s.bricks.every((br) => !br.alive)) {
          s.level += 1;
          setLevel(s.level);
          s.bricks = makeBricks();
          reset(false);
        }
        if (b.y > H + 10) {
          s.lives -= 1;
          setLives(s.lives);
          beep(140, 0.3);
          if (s.lives <= 0) {
            s.over = true;
            submit(s.score);
          } else reset(false);
        }
      }

      // draw
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      for (const br of s.bricks) {
        if (!br.alive) continue;
        ctx.fillStyle = br.color;
        ctx.fillRect(br.x + 1, br.y + 1, BRICK_W - 2, BRICK_H - 2);
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fillRect(br.x + 1, br.y + 1, BRICK_W - 2, 2);
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(br.x + 1, br.y + BRICK_H - 3, BRICK_W - 2, 2);
      }
      // paddle with Win98 bevel
      const py = H - 18;
      ctx.fillStyle = "#c0c0c0";
      ctx.fillRect(s.paddle, py, PADDLE_W, 8);
      ctx.fillStyle = "#fff";
      ctx.fillRect(s.paddle, py, PADDLE_W, 2);
      ctx.fillStyle = "#808080";
      ctx.fillRect(s.paddle, py + 6, PADDLE_W, 2);
      // ball
      ctx.fillStyle = "#fff";
      ctx.fillRect(b.x - 3, b.y - 3, 6, 6);

      ctx.font = dosFont(18);
      ctx.fillStyle = "#c0c0c0";
      ctx.textAlign = "left";
      ctx.fillText(`PUAN ${s.score}`, 8, 20);
      ctx.textAlign = "right";
      ctx.fillText(`CAN ${"■".repeat(Math.max(0, s.lives))}  SEVİYE ${s.level}`, W - 8, 20);

      if (s.over || b.stuck) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#ffd21e";
        ctx.font = dosFont(26);
        ctx.fillText(s.over ? "OYUN BİTTİ" : "TIKLA YA DA BOŞLUK", W / 2, H / 2 + 30);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerdown", press);
    };
  }, [submit]);

  return (
    <div className="flex flex-col">
      <MenuBar items={["Oyun", "Seçenekler", "Yardım"]} />
      <div className="flex justify-center p-2">
        <div className="w98-sunken w-full max-w-[406px] p-[3px]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block w-full touch-none"
            aria-label="Tuğla Kır oyun alanı"
          />
        </div>
      </div>
      <div className="flex gap-[2px] text-[12px]">
        <StatusCell className="flex-1">Puan: {score}</StatusCell>
        <StatusCell className="flex-1">Can: {lives} · Seviye: {level}</StatusCell>
        <StatusCell className="flex-1">Rekor: {best ?? 0}</StatusCell>
      </div>
    </div>
  );
}
