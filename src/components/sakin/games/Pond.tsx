"use client";

import { useEffect, useRef } from "react";

/* C major pentatonic across two octaves, left (low) to right (high) */
const NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];

interface Ripple {
  x: number;
  y: number;
  t: number;
  strength: number;
}

interface Pad {
  x: number;
  y: number;
  r: number;
  rot: number;
  vx: number;
  vy: number;
  vr: number;
  flower: boolean;
}

let audio: AudioContext | null = null;

function chime(freq: number) {
  try {
    audio ??= new AudioContext();
    const ctx = audio;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 2200;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 2.6);
    [1, 2.01].forEach((mult, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      const g = ctx.createGain();
      g.gain.value = i ? 0.18 : 1;
      osc.connect(g).connect(filter);
      osc.start(now);
      osc.stop(now + 2.8);
    });
    filter.connect(gain).connect(ctx.destination);
  } catch {
    // silent pond is fine too
  }
}

export function Pond() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<Ripple[]>([]);
  const pads = useRef<Pad[]>([]);
  const size = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const fit = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      size.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!pads.current.length) {
        pads.current = Array.from({ length: 6 }, (_, i) => ({
          x: ((i * 0.37 + 0.1) % 1) * rect.width,
          y: ((i * 0.53 + 0.2) % 1) * rect.height,
          r: 26 + (i % 3) * 10,
          rot: i,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 4,
          vr: (Math.random() - 0.5) * 0.08,
          flower: i % 3 === 0,
        }));
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    let last = performance.now();
    let dropIn = 2;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { w, h } = size.current;

      // occasional silent raindrop keeps the pond alive
      dropIn -= dt;
      if (dropIn <= 0) {
        ripples.current.push({ x: Math.random() * w, y: Math.random() * h, t: 0, strength: 0.45 });
        dropIn = 2.5 + Math.random() * 4;
      }

      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, "#4E6B63");
      bg.addColorStop(1, "#2F4842");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // soft light patches
      ctx.fillStyle = "rgba(255,255,240,0.035)";
      for (let i = 0; i < 5; i++) {
        const px = ((now / 18000 + i * 0.21) % 1) * w;
        const py = ((i * 0.33) % 1) * h;
        ctx.beginPath();
        ctx.ellipse(px, py, 160, 60, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ripples.current = ripples.current.filter((r) => r.t < 4);
      ripples.current.forEach((r) => {
        r.t += dt;
        for (let k = 0; k < 3; k++) {
          const tt = r.t - k * 0.35;
          if (tt <= 0) continue;
          const radius = tt * 70;
          const alpha = Math.max(0, (1 - tt / 3.4) * 0.5 * r.strength);
          ctx.strokeStyle = `rgba(236,229,216,${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, radius, radius * 0.62, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      pads.current.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (p.x < -p.r) p.x = w + p.r;
        if (p.x > w + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = h + p.r;
        if (p.y > h + p.r) p.y = -p.r;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = "rgba(20,30,25,0.25)";
        ctx.beginPath();
        ctx.ellipse(4, 6, p.r, p.r * 0.8, 0, 0.25, Math.PI * 2 - 0.25);
        ctx.lineTo(4, 6);
        ctx.fill();
        ctx.fillStyle = "#8A9A7B";
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.8, 0, 0.25, Math.PI * 2 - 0.25);
        ctx.lineTo(0, 0);
        ctx.fill();
        ctx.strokeStyle = "rgba(47,58,47,0.35)";
        ctx.lineWidth = 1;
        for (let a = 0.6; a < Math.PI * 2 - 0.4; a += 0.7) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * p.r * 0.85, Math.sin(a) * p.r * 0.68);
          ctx.stroke();
        }
        if (p.flower) {
          ctx.fillStyle = "#EFD9D2";
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * 6 - 6, Math.sin(a) * 6 - 4, 7, 3.5, a, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = "#E8C77A";
          ctx.beginPath();
          ctx.arc(-6, -4, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative h-[440px] touch-none overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-30px_rgba(47,58,47,0.6)] sm:h-[540px]"
    >
      <canvas
        ref={canvasRef}
        aria-label="Göl"
        className="block h-full w-full cursor-pointer"
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          ripples.current.push({ x, y, t: 0, strength: 1 });
          const idx = Math.min(NOTES.length - 1, Math.floor((x / rect.width) * NOTES.length));
          chime(NOTES[idx]!);
        }}
      />
    </div>
  );
}
