"use client";

import { useCallback, useEffect, useRef } from "react";

import { soft } from "~/components/sakin/SakinExperience";
import { cn } from "~/lib/utils";

const SAND = "#E6DCC8";
const TINES = [-18, -6, 6, 18];

export function ZenGarden() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    down: false,
    moved: false,
    last: null as { x: number; y: number } | null,
    start: null as { x: number; y: number } | null,
    w: 0,
    h: 0,
  });

  const paintSand = useCallback((alpha = 1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const { w, h } = state.current;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = SAND;
    ctx.fillRect(0, 0, w, h);
    // grain
    for (let i = 0; i < (w * h) / 90; i++) {
      const v = Math.random();
      ctx.fillStyle = v > 0.5 ? "rgba(255,255,255,0.35)" : "rgba(120,100,70,0.12)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    ctx.globalAlpha = 1;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const fit = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      state.current.w = rect.width;
      state.current.h = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintSand();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [paintSand]);

  function rake(a: { x: number; y: number }, b: { x: number; y: number }) {
    const ctx = canvasRef.current!.getContext("2d")!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    ctx.lineCap = "round";
    for (const off of TINES) {
      const ax = a.x + nx * off;
      const ay = a.y + ny * off;
      const bx = b.x + nx * off;
      const by = b.y + ny * off;
      ctx.strokeStyle = "rgba(110,90,60,0.28)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ax + nx * 3, ay + ny * 3);
      ctx.lineTo(bx + nx * 3, by + ny * 3);
      ctx.stroke();
    }
  }

  function stone(x: number, y: number) {
    const ctx = canvasRef.current!.getContext("2d")!;
    const r = 18 + Math.random() * 16;
    // raked rings around the stone
    for (let i = 1; i <= 4; i++) {
      const rr = r + 10 + i * 11;
      ctx.strokeStyle = "rgba(110,90,60,0.22)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(x, y, rr * 1.15, rr, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, y, rr * 1.15 + 3, rr + 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // shadow
    ctx.fillStyle = "rgba(60,50,35,0.25)";
    ctx.beginPath();
    ctx.ellipse(x + 5, y + 7, r * 1.15, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    // body
    const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r * 1.2);
    g.addColorStop(0, "#9A9A92");
    g.addColorStop(0.6, "#6E6E68");
    g.addColorStop(1, "#4C4C47");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.15, r * 0.85, Math.random() * 0.6 - 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function point(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function smooth() {
    let step = 0;
    const id = setInterval(() => {
      paintSand(0.18);
      if (++step > 12) {
        clearInterval(id);
        paintSand();
      }
    }, 90);
  }

  function save() {
    const url = canvasRef.current!.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "zen-bahcem.png";
    a.click();
  }

  return (
    <div>
      <div
        ref={wrapRef}
        className="relative h-[440px] touch-none overflow-hidden rounded-[2rem] shadow-[inset_0_2px_12px_rgba(60,50,35,0.25)] sm:h-[540px]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full cursor-crosshair"
          aria-label="Zen bahçesi kumu"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            const p = point(e);
            state.current.down = true;
            state.current.moved = false;
            state.current.last = p;
            state.current.start = p;
          }}
          onPointerMove={(e) => {
            const s = state.current;
            if (!s.down || !s.last) return;
            const p = point(e);
            if (!s.moved && s.start && Math.hypot(p.x - s.start.x, p.y - s.start.y) < 6) return;
            s.moved = true;
            rake(s.last, p);
            s.last = p;
          }}
          onPointerUp={(e) => {
            const s = state.current;
            if (s.down && !s.moved) {
              const p = point(e);
              stone(p.x, p.y);
            }
            s.down = false;
            s.last = null;
          }}
          onPointerCancel={() => (state.current.down = false)}
        />
      </div>
      <div className="mt-6 flex justify-center gap-8 font-soft text-[15px] italic">
        <button
          type="button"
          onClick={smooth}
          className={cn("border-b border-current/30 pb-0.5 transition-colors hover:border-current", soft)}
        >
          kumu yavaşça düzle
        </button>
        <button
          type="button"
          onClick={save}
          className={cn("border-b border-current/30 pb-0.5 transition-colors hover:border-current", soft)}
        >
          bahçeni kaydet
        </button>
      </div>
    </div>
  );
}
