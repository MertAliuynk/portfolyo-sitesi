"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { burst, chunky } from "~/components/mutlu/kit";
import { beep } from "~/lib/beep";
import { useBest } from "~/lib/highscore";
import { cn } from "~/lib/utils";

const COLORS = ["#FF5A36", "#4D9FFF", "#2EC27E", "#FF8AD8", "#B79CFF", "#FFC93C"];
const ROUND = 30;
const AREA_H = 520;

interface Balloon {
  id: number;
  x: number; // % of width
  y: number; // px from the bottom
  speed: number;
  color: string;
  gold: boolean;
  phase: number;
  size: number;
}

interface Popup {
  id: number;
  x: number;
  y: number;
  text: string;
}

type Status = "ready" | "playing" | "over";

function BalloonShape({ color, gold, size }: { color: string; gold: boolean; size: number }) {
  return (
    <svg viewBox="0 0 60 100" style={{ width: size, height: size * 1.66 }} aria-hidden>
      <path
        d="M30 62 C 34 72, 24 80, 30 98"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="2"
      />
      <ellipse cx="30" cy="32" rx="26" ry="30" fill={color} stroke="#1A1A1A" strokeWidth="3.5" />
      <path d="M25 61 L35 61 L30 67 Z" fill={color} stroke="#1A1A1A" strokeWidth="2.5" strokeLinejoin="round" />
      <ellipse cx="20" cy="20" rx="5" ry="9" fill="#fff" opacity="0.55" transform="rotate(-20 20 20)" />
      {gold && (
        <path
          d="M30 18 L34 28 L45 28 L36 35 L39 46 L30 39 L21 46 L24 35 L15 28 L26 28 Z"
          fill="#fff"
          stroke="#1A1A1A"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function Balloons() {
  const [status, setStatus] = useState<Status>("ready");
  const [, setFrame] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND);
  const [missed, setMissed] = useState(0);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [record, setRecord] = useState(false);
  const { best, submit } = useBest("mutlu-balon");

  const balloons = useRef<Balloon[]>([]);
  const nextId = useRef(0);
  const lastPop = useRef(0);
  const comboRef = useRef(0);
  const scoreRef = useRef(0);

  const finish = useCallback(() => {
    setStatus("over");
    const isRecord = submit(scoreRef.current);
    setRecord(isRecord);
    if (isRecord) {
      burst({ x: 0.3, y: 0.6 });
      burst({ x: 0.7, y: 0.6 });
    }
  }, [submit]);

  useEffect(() => {
    if (status !== "playing") return;
    const start = performance.now();
    let last = start;
    let spawnIn = 0;
    let raf = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = (now - start) / 1000;
      const left = Math.max(0, ROUND - elapsed);
      setTimeLeft(Math.ceil(left));

      spawnIn -= dt;
      if (spawnIn <= 0) {
        const gold = Math.random() < 0.08;
        balloons.current.push({
          id: nextId.current++,
          x: 8 + Math.random() * 84,
          y: -170,
          speed: 90 + Math.random() * 70 + elapsed * 5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
          gold,
          phase: Math.random() * Math.PI * 2,
          size: gold ? 58 : 62 + Math.random() * 22,
        });
        spawnIn = Math.max(0.28, 0.7 - elapsed * 0.014);
      }

      let lost = 0;
      balloons.current = balloons.current.filter((b) => {
        b.y += b.speed * dt;
        b.phase += dt * 2;
        if (b.y > AREA_H + 20) {
          lost++;
          return false;
        }
        return true;
      });
      if (lost) setMissed((m) => m + lost);
      setFrame((f) => f + 1);

      if (left <= 0) {
        balloons.current = [];
        finish();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [status, finish]);

  function start() {
    balloons.current = [];
    scoreRef.current = 0;
    comboRef.current = 0;
    setScore(0);
    setCombo(0);
    setMissed(0);
    setTimeLeft(ROUND);
    setRecord(false);
    setStatus("playing");
  }

  function pop(b: Balloon, e: React.PointerEvent) {
    e.stopPropagation();
    balloons.current = balloons.current.filter((x) => x.id !== b.id);
    const now = performance.now();
    comboRef.current = now - lastPop.current < 650 ? comboRef.current + 1 : 1;
    lastPop.current = now;
    const points = (b.gold ? 5 : 1) * Math.min(comboRef.current, 5);
    scoreRef.current += points;
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    beep(420 + Math.random() * 380 + comboRef.current * 40, 0.09);

    const rect = (e.currentTarget.parentElement!).getBoundingClientRect();
    const id = now;
    setPopups((p) => [
      ...p,
      {
        id,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        text: comboRef.current > 1 ? `+${points} x${Math.min(comboRef.current, 5)}` : `+${points}`,
      },
    ]);
    setTimeout(() => setPopups((p) => p.filter((x) => x.id !== id)), 700);
    if (b.gold) burst({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-3 font-pop font-extrabold">
        <span className="rounded-full border-[3px] border-[#1A1A1A] bg-[#FFC93C] px-4 py-1">
          Puan: {score}
        </span>
        <span className="rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF8EA] px-4 py-1">
          Süre: {timeLeft}
        </span>
        <span className="rounded-full border-[3px] border-[#1A1A1A] bg-[#FF8AD8] px-4 py-1">
          Seri: x{Math.min(Math.max(combo, 1), 5)}
        </span>
        <span className="rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF8EA] px-4 py-1">
          Rekor: {best ?? "-"}
        </span>
      </div>

      <div
        className="relative touch-none overflow-hidden rounded-[28px] border-[3px] border-[#1A1A1A] bg-[linear-gradient(180deg,#BFE0FF_0%,#E6F2FF_60%,#FFF1D6_100%)] shadow-[8px_8px_0_#1A1A1A] select-none"
        style={{ height: AREA_H }}
      >
        {/* clouds */}
        {[
          [8, 14, 120],
          [62, 8, 160],
          [36, 40, 100],
          [78, 52, 130],
        ].map(([x, y, w], i) => (
          <span
            key={i}
            aria-hidden
            className="absolute rounded-full border-[3px] border-[#1A1A1A] bg-white"
            style={{ left: `${x}%`, top: `${y}%`, width: w, height: (w ?? 100) * 0.38 }}
          />
        ))}

        {balloons.current.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-label="Balon"
            onPointerDown={(e) => pop(b, e)}
            className="absolute cursor-pointer"
            style={{
              left: `${b.x}%`,
              bottom: b.y,
              transform: `translateX(-50%) rotate(${Math.sin(b.phase) * 7}deg)`,
            }}
          >
            <BalloonShape color={b.color} gold={b.gold} size={b.size} />
          </button>
        ))}

        <AnimatePresence>
          {popups.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -50, scale: 1.2 }}
              transition={{ duration: 0.7 }}
              className="pointer-events-none absolute -translate-x-1/2 font-pop text-2xl font-extrabold text-[#1A1A1A] [text-shadow:2px_2px_0_#fff]"
              style={{ left: p.x, top: p.y }}
            >
              {p.text}
            </motion.span>
          ))}
        </AnimatePresence>

        {status !== "playing" && (
          <div className="absolute inset-0 grid place-items-center bg-[#FFF1D6]/70 px-6 text-center backdrop-blur-[2px]">
            <div>
              {status === "over" ? (
                <>
                  <p className="font-hand text-3xl">süre bitti!</p>
                  <p className="font-pop text-7xl font-extrabold">{score}</p>
                  <p className="mt-1 font-pop font-bold">
                    {record ? "YENİ REKOR!" : `${missed} balon kaçtı`}
                  </p>
                </>
              ) : (
                <p className="max-w-sm font-pop text-2xl font-extrabold">
                  Balonlar yükseliyor, hepsini patlat!
                </p>
              )}
              <button
                type="button"
                onClick={start}
                className={cn(
                  chunky,
                  "mt-6 rounded-2xl bg-[#FF5A36] px-8 py-3 font-pop text-2xl font-extrabold text-[#FFF1D6]",
                )}
              >
                {status === "over" ? "Tekrar!" : "Başla!"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
