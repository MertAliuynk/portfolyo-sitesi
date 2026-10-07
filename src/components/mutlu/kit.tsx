"use client";

import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "~/lib/utils";

export const C = {
  cream: "#FFF1D6",
  ink: "#1A1A1A",
  tomato: "#FF5A36",
  sun: "#FFC93C",
  grass: "#2EC27E",
  sky: "#4D9FFF",
  pink: "#FF8AD8",
  lilac: "#B79CFF",
};
export const CARD_COLORS = [C.sun, C.sky, C.pink, C.grass, C.lilac];
const CONFETTI_COLORS = [C.tomato, C.sun, C.sky, C.pink, C.grass];

/** thick outline + hard offset shadow, pressed flat on click */
export const chunky =
  "border-[3px] border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A] transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[9px_9px_0_#1A1A1A] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none";

export function burst(origin?: { x: number; y: number }) {
  void confetti({
    particleCount: 110,
    spread: 80,
    startVelocity: 42,
    origin,
    colors: CONFETTI_COLORS,
    disableForReducedMotion: true,
  });
}

/* ------------------------------------------------------------------ */

export function ClickBurst() {
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );

  useEffect(() => {
    function onDown(e: PointerEvent) {
      const id = performance.now();
      setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 700);
    }
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      {bursts.map((b) => (
        <div key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const angle = (i / 7) * Math.PI * 2 + 0.3;
            const dist = 42 + (i % 3) * 14;
            return (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * dist,
                  y: Math.sin(angle) * dist,
                  scale: 0,
                  opacity: 0.9,
                }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.3, 1] }}
                className="absolute -mt-1.5 -ml-1.5 block h-3 w-3 border-2 border-[#1A1A1A]"
                style={{
                  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                  borderRadius: i % 2 ? "999px" : "2px",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Nav() {
  return (
    <nav className="fixed inset-x-3 top-3 z-50 flex items-center justify-between gap-3 sm:inset-x-6 sm:top-5">
      <Link
        href="/mutlu"
        className={cn(
          chunky,
          "-rotate-3 rounded-2xl bg-[#FFC93C] px-4 py-1.5 font-pop text-xl font-extrabold tracking-tight",
        )}
      >
        mert!
      </Link>
      <div
        className={cn(
          "hidden items-center gap-1 rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF1D6] p-1 font-pop font-bold md:flex",
        )}
      >
        {[
          ["işler", "/mutlu#isler"],
          ["ben", "/mutlu#ben"],
          ["yazılar", "/mutlu/blog"],
          ["oyunlar", "/mutlu/oyunlar"],
          ["selam ver", "/mutlu#selam"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href!}
            className="rounded-full px-4 py-1.5 transition hover:bg-[#1A1A1A] hover:text-[#FFF1D6]"
          >
            {label}
          </Link>
        ))}
      </div>
      <Link
        href="/"
        className={cn(
          chunky,
          "rotate-2 rounded-2xl bg-[#FF8AD8] px-4 py-1.5 font-pop text-sm font-bold",
        )}
      >
        ↺ mod değiştir
      </Link>
    </nav>
  );
}
