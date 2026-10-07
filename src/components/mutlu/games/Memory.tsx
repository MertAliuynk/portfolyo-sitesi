"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { burst, chunky } from "~/components/mutlu/kit";
import { Flower, Smiley, Star } from "~/components/mutlu/shapes";
import { beep } from "~/lib/beep";
import { useBest } from "~/lib/highscore";
import { cn } from "~/lib/utils";

const INK = "#1A1A1A";

function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 100 100" className="h-[70%] w-[70%]" aria-hidden>
      {children}
    </svg>
  );
}

const FACES: { key: string; bg: string; node: React.ReactNode }[] = [
  { key: "star", bg: "#BFE0FF", node: <Star fill="#FFC93C" className="h-[72%] w-[72%]" /> },
  { key: "flower", bg: "#FFE27A", node: <Flower fill="#FF8AD8" className="h-[72%] w-[72%]" /> },
  { key: "smile", bg: "#FFC2EC", node: <Smiley className="h-[72%] w-[72%]" /> },
  {
    key: "heart",
    bg: "#C4F0D6",
    node: (
      <Svg>
        <path
          d="M50 86 C 20 64, 8 46, 14 30 C 20 14, 42 12, 50 30 C 58 12, 80 14, 86 30 C 92 46, 80 64, 50 86 Z"
          fill="#FF5A36"
          stroke={INK}
          strokeWidth="6"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    key: "tri",
    bg: "#E0D4FF",
    node: (
      <Svg>
        <path d="M50 10 L92 86 L8 86 Z" fill="#2EC27E" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    key: "moon",
    bg: "#FFD1C2",
    node: (
      <Svg>
        <path
          d="M64 10 A 42 42 0 1 0 90 66 A 34 34 0 1 1 64 10 Z"
          fill="#B79CFF"
          stroke={INK}
          strokeWidth="6"
          strokeLinejoin="round"
        />
      </Svg>
    ),
  },
  {
    key: "bolt",
    bg: "#BFE0FF",
    node: (
      <Svg>
        <path d="M58 6 L18 56 L46 56 L38 94 L82 40 L54 40 Z" fill="#FFC93C" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      </Svg>
    ),
  },
  {
    key: "drop",
    bg: "#FFE27A",
    node: (
      <Svg>
        <path d="M50 8 C 50 8, 16 48, 16 64 A 34 34 0 0 0 84 64 C 84 48, 50 8, 50 8 Z" fill="#4D9FFF" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      </Svg>
    ),
  },
];

interface Card {
  id: number;
  face: number;
  open: boolean;
  done: boolean;
}

function deal(shuffle = true): Card[] {
  const faces = [...FACES.keys(), ...FACES.keys()];
  if (shuffle) for (let i = faces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [faces[i], faces[j]] = [faces[j]!, faces[i]!];
  }
  return faces.map((face, id) => ({ id, face, open: false, done: false }));
}

export function Memory() {
  // dealt unshuffled for the server render, shuffled once mounted
  const [cards, setCards] = useState<Card[]>(() => deal(false));
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [won, setWon] = useState(false);
  const [record, setRecord] = useState(false);
  const { best, submit } = useBest("mutlu-hafiza", true);

  useEffect(() => {
    setCards(deal());
  }, []);

  useEffect(() => {
    if (!started || won) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [started, won]);

  function flip(index: number) {
    const card = cards[index]!;
    if (card.open || card.done || picked.length === 2 || won) return;
    setStarted(true);
    beep(520, 0.06);

    const next = cards.map((c, i) => (i === index ? { ...c, open: true } : c));
    const nowPicked = [...picked, index];
    setCards(next);
    setPicked(nowPicked);

    if (nowPicked.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nowPicked as [number, number];
      if (next[a]!.face === next[b]!.face) {
        setTimeout(() => {
          beep(880, 0.12);
          const matched = next.map((c, i) => (i === a || i === b ? { ...c, done: true } : c));
          setCards(matched);
          setPicked([]);
          if (matched.every((c) => c.done)) {
            setWon(true);
            const isRecord = submit(moves + 1);
            setRecord(isRecord);
            burst({ x: 0.3, y: 0.5 });
            burst({ x: 0.7, y: 0.5 });
          }
        }, 350);
      } else {
        setTimeout(() => {
          setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, open: false } : c)));
          setPicked([]);
        }, 850);
      }
    }
  }

  function reset() {
    setCards(deal());
    setPicked([]);
    setMoves(0);
    setSeconds(0);
    setStarted(false);
    setWon(false);
    setRecord(false);
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3 font-pop font-extrabold">
        <span className="rounded-full border-[3px] border-[#1A1A1A] bg-[#FFC93C] px-4 py-1">
          Hamle: {moves}
        </span>
        <span className="rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF8EA] px-4 py-1">
          Süre: {seconds} sn
        </span>
        <span className="rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF8EA] px-4 py-1">
          Rekor: {best ?? "-"} hamle
        </span>
        <button
          type="button"
          onClick={reset}
          className={cn(chunky, "ml-auto rounded-xl bg-[#FF8AD8] px-4 py-1")}
        >
          Karıştır
        </button>
      </div>

      <div className="relative mx-auto grid max-w-[560px] grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card, i) => {
          const face = FACES[card.face]!;
          const shown = card.open || card.done;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(i)}
              aria-label={shown ? face.key : "Kapalı kart"}
              className="aspect-square [perspective:800px]"
            >
              <motion.span
                animate={{ rotateY: shown ? 180 : 0, scale: card.done ? [1, 1.08, 1] : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="relative block h-full w-full [transform-style:preserve-3d]"
              >
                <span
                  className="absolute inset-0 grid place-items-center rounded-2xl border-[3px] border-[#1A1A1A] bg-[#FF5A36] shadow-[4px_4px_0_#1A1A1A] [backface-visibility:hidden] [background-image:radial-gradient(#FFF1D655_3px,transparent_3px)] [background-size:16px_16px]"
                >
                  <span className="font-pop text-3xl font-extrabold text-[#FFF1D6] sm:text-4xl">?</span>
                </span>
                <span
                  className={cn(
                    "absolute inset-0 grid [transform:rotateY(180deg)] place-items-center rounded-2xl border-[3px] border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A] [backface-visibility:hidden]",
                    card.done && "opacity-90",
                  )}
                  style={{ background: face.bg }}
                >
                  {face.node}
                </span>
              </motion.span>
            </button>
          );
        })}

        {won && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
            animate={{ scale: 1, opacity: 1, rotate: -3 }}
            transition={{ type: "spring", stiffness: 260, damping: 14 }}
            className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-[28px] border-[3px] border-[#1A1A1A] bg-[#FFC93C] p-6 text-center shadow-[8px_8px_0_#1A1A1A]"
          >
            <p className="font-pop text-4xl font-extrabold">Hepsini buldun!</p>
            <p className="mt-2 font-pop text-lg font-bold">
              {moves} hamle, {seconds} saniye
              {record && " · YENİ REKOR!"}
            </p>
            <button
              type="button"
              onClick={reset}
              className={cn(chunky, "mt-5 rounded-2xl bg-[#FFF1D6] px-6 py-2 font-pop text-xl font-extrabold")}
            >
              Bir daha!
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
