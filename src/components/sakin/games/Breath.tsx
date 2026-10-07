"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { soft } from "~/components/sakin/SakinExperience";
import { cn } from "~/lib/utils";

type Kind = "in" | "hold" | "out" | "rest";

const PATTERNS: { name: string; note: string; phases: { kind: Kind; s: number }[] }[] = [
  {
    name: "Kutu nefesi",
    note: "4 · 4 · 4 · 4 — odaklanmak için",
    phases: [
      { kind: "in", s: 4 },
      { kind: "hold", s: 4 },
      { kind: "out", s: 4 },
      { kind: "rest", s: 4 },
    ],
  },
  {
    name: "4-7-8",
    note: "4 · 7 · 8 — gevşemek için",
    phases: [
      { kind: "in", s: 4 },
      { kind: "hold", s: 7 },
      { kind: "out", s: 8 },
    ],
  },
  {
    name: "Uzun veriş",
    note: "4 · 6 — sakinleşmek için",
    phases: [
      { kind: "in", s: 4 },
      { kind: "out", s: 6 },
    ],
  },
];

const LABEL: Record<Kind, string> = {
  in: "nefes al",
  hold: "tut",
  out: "nefes ver",
  rest: "bekle",
};

let audio: AudioContext | null = null;
function tone(freq: number) {
  try {
    audio ??= new AudioContext();
    const now = audio.currentTime;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 2);
    osc.connect(gain).connect(audio.destination);
    osc.start(now);
    osc.stop(now + 2.1);
  } catch {
    // ignore
  }
}

export function Breath() {
  const [pattern, setPattern] = useState(0);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [sound, setSound] = useState(true);

  const phases = PATTERNS[pattern]!.phases;
  const current = phases[phase]!;

  useEffect(() => {
    if (!running) return;
    setLeft(current.s);
    if (sound) tone(current.kind === "in" ? 392 : current.kind === "out" ? 293.66 : 329.63);
    const tick = setInterval(() => setLeft((l) => Math.max(1, l - 1)), 1000);
    const next = setTimeout(() => {
      const n = (phase + 1) % phases.length;
      if (n === 0) setCycles((c) => c + 1);
      setPhase(n);
    }, current.s * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(next);
    };
    // phase change drives the cycle; sound toggling mid-phase shouldn't restart it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, pattern]);

  const scale = !running
    ? 0.62
    : current.kind === "in" || current.kind === "hold"
      ? 1
      : 0.62;
  const duration = running && (current.kind === "in" || current.kind === "out") ? current.s : 0.8;

  function choose(i: number) {
    setPattern(i);
    setPhase(0);
    setCycles(0);
    setRunning(false);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-2">
        {PATTERNS.map((p, i) => (
          <button
            key={p.name}
            type="button"
            onClick={() => choose(i)}
            className={cn(
              "rounded-full px-5 py-2 font-soft text-[15px] transition-colors duration-500",
              soft,
              i === pattern ? "bg-[#2F3A2F] text-[#ECE5D8]" : "bg-[#2F3A2F]/[0.06] hover:bg-[#2F3A2F]/10",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className={cn("mt-3 font-soft text-[15px] italic opacity-60", soft)}>
        {PATTERNS[pattern]!.note}
      </p>

      <div className="relative mt-10 grid aspect-square w-[min(80vw,420px)] place-items-center">
        <motion.div
          animate={{ scale }}
          transition={{ duration, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,#C9D2BC_0%,#B7C4A8_40%,rgba(183,196,168,0)_70%)]"
        />
        <motion.div
          animate={{ scale: scale * 0.78, opacity: current.kind === "hold" && running ? 0.6 : 0.3 }}
          transition={{ duration, ease: "easeInOut" }}
          className="absolute inset-[11%] rounded-full border border-[#2F3A2F]/30"
        />
        <div className="relative text-center">
          <motion.p
            key={running ? `${phase}-${cycles}` : "idle"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className={cn("font-soft text-3xl font-light italic", soft)}
          >
            {running ? LABEL[current.kind] : "hazır olduğunda"}
          </motion.p>
          {running && (
            <p className={cn("mt-2 font-soft text-5xl font-light tabular-nums opacity-70", soft)}>{left}</p>
          )}
        </div>
      </div>

      <div className="mt-10 flex items-center gap-8 font-soft text-[15px]">
        <button
          type="button"
          onClick={() => {
            if (running) {
              setRunning(false);
              setPhase(0);
            } else {
              setCycles(0);
              setPhase(0);
              setRunning(true);
            }
          }}
          className={cn(
            "rounded-full border border-[#2F3A2F]/30 px-7 py-2.5 text-lg italic transition-colors hover:border-[#2F3A2F]",
            soft,
          )}
        >
          {running ? "bitir" : "başla"}
        </button>
        <label className="flex items-center gap-2 italic opacity-70">
          <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="accent-[#6E8060]" />
          yumuşak ses
        </label>
      </div>
      <p className={cn("mt-6 font-soft text-[15px] italic opacity-50", soft)}>
        {cycles > 0 ? `${cycles} tur tamamlandı. İyi gidiyorsun.` : "Birkaç tur yeterli. Zorlamadan."}
      </p>
    </div>
  );
}
