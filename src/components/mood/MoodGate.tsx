"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { MOODS, readStoredMood, type Mood, type MoodId } from "~/lib/moods";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

const BASE = { bg: "#151412", fg: "#EDE9E1" };

/** Every option is already set in the typeface of the world it leads to. */
const LABEL_STYLE: Record<MoodId, string> = {
  mutlu: "font-pop font-extrabold tracking-[-0.04em]",
  ciddi: "font-editorial tracking-[-0.02em]",
  sakin: "font-soft font-light italic [font-variation-settings:'SOFT'_100]",
  merakli: "font-display font-bold tracking-[-0.03em]",
  nostaljik: "font-dos tracking-normal",
};

const FAREWELL: Record<MoodId, string> = {
  mutlu: "Yaşasın! Hadi gidelim!",
  ciddi: "Anlaşıldı.",
  sakin: "Derin bir nefes al…",
  merakli: "Işıkları kapatıyorum…",
  nostaljik: "C:\\> MERTOS.EXE",
};

function Glyph({ id }: { id: MoodId }) {
  switch (id) {
    case "mutlu":
      return (
        <span className="flex items-center gap-1.5">
          {["#FF5A36", "#FFC93C", "#4D9FFF"].map((c, i) => (
            <motion.span
              key={c}
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 12,
                delay: i * 0.06,
              }}
              className="block h-4 w-4 border-2 border-[#1A1A1A]"
              style={{
                background: c,
                borderRadius: i === 1 ? "999px" : i === 2 ? "4px" : "2px",
                transform: i === 2 ? "rotate(45deg)" : undefined,
              }}
            />
          ))}
        </span>
      );
    case "ciddi":
      return (
        <span className="flex items-center gap-2 font-plex text-[11px] tracking-wider uppercase">
          <span className="block h-3 w-3 bg-[#E5381F]" />
          §01–06
        </span>
      );
    case "sakin":
      return (
        <motion.span
          animate={{ scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="block h-5 w-5 rounded-full bg-[#8A9A7B]/70 blur-[1px]"
        />
      );
    case "merakli":
      return (
        <span className="block h-4 w-4 rounded-full bg-gradient-to-br from-magenta to-cyan shadow-[0_0_18px_4px_rgba(255,47,208,0.55)]" />
      );
    case "nostaljik":
      return (
        <span className="border-2 border-t-white border-r-[#404040] border-b-[#404040] border-l-white bg-[#C0C0C0] px-3 py-0.5 font-win text-[11px] text-black">
          Tamam
        </span>
      );
  }
}

export function MoodGate() {
  const router = useRouter();
  const [hovered, setHovered] = useState<MoodId | null>(null);
  const [leaving, setLeaving] = useState<{
    mood: Mood;
    x: number;
    y: number;
  } | null>(null);
  const [lastMood, setLastMood] = useState<MoodId | null>(null);
  const [today, setToday] = useState("");

  const active = MOODS.find((m) => m.id === hovered);
  const colors = active ? { bg: active.bg, fg: active.fg } : BASE;

  useEffect(() => {
    setLastMood(readStoredMood());
    setToday(
      new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        weekday: "long",
      }).format(new Date()),
    );
    MOODS.forEach((m) => router.prefetch(`/${m.id}`));
  }, [router]);

  function choose(mood: Mood, x: number, y: number) {
    if (leaving) return;
    setLeaving({ mood, x, y });
    setTimeout(() => router.push(`/${mood.id}`), 950);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const index = Number(e.key) - 1;
      const mood = MOODS[index];
      if (!mood) return;
      choose(mood, window.innerWidth / 2, window.innerHeight / 2);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <motion.main
      animate={{ backgroundColor: colors.bg, color: colors.fg }}
      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      style={{ backgroundColor: BASE.bg, color: BASE.fg }}
      className="relative flex min-h-[100svh] flex-col overflow-hidden px-5 pt-6 pb-8 sm:px-10 sm:pt-8"
    >
      {/* neon glow only shows up while "Meraklı" is hovered */}
      <motion.div
        aria-hidden
        animate={{ opacity: hovered === "merakli" ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_30rem_at_85%_10%,rgba(255,47,208,0.22),transparent),radial-gradient(40rem_30rem_at_5%_100%,rgba(124,58,237,0.25),transparent)]"
      />
      {/* scanlines only for "Nostaljik" */}
      <motion.div
        aria-hidden
        animate={{ opacity: hovered === "nostaljik" ? 0.18 : 0 }}
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.5)_0px,rgba(0,0,0,0.5)_1px,transparent_1px,transparent_3px)]"
      />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" />

      <header className="relative flex items-baseline justify-between gap-4 font-swiss text-[13px]">
        <span className="font-medium">{SITE.name}</span>
        <span className="opacity-50 first-letter:uppercase">{today}</span>
      </header>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-[7vh] font-editorial text-[clamp(3.6rem,min(13vw,11vh),8rem)] leading-[0.88] tracking-[-0.03em] sm:mt-[6vh]"
      >
        Bugün nasıl
        <br />
        <em className="pl-[0.6em]">hissediyorsun?</em>
      </motion.h1>

      <ul className="relative mt-[6vh] border-b border-current/15 sm:mt-[5vh]">
        {MOODS.map((mood, i) => {
          const isHovered = hovered === mood.id;
          const dimmed = hovered !== null && !isHovered;

          return (
            <motion.li
              key={mood.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07, duration: 0.6 }}
              className="border-t border-current/15"
            >
              <button
                type="button"
                onMouseEnter={() => setHovered(mood.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(mood.id)}
                onBlur={() => setHovered(null)}
                onClick={(e) => choose(mood, e.clientX, e.clientY)}
                className={cn(
                  "group grid w-full grid-cols-[2.2rem_1fr_auto] items-center gap-3 py-4 text-left transition-opacity duration-300 outline-none sm:grid-cols-[3.5rem_1fr_auto_auto] sm:gap-6 sm:py-[1.2vh]",
                  dimmed && "opacity-30",
                )}
              >
                <span className="font-plex text-xs opacity-50">
                  0{i + 1}
                </span>

                <span className="flex items-baseline gap-3">
                  <motion.span
                    animate={{ x: isHovered ? 14 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className={cn(
                      "block text-[clamp(2.5rem,min(6vw,7.2vh),4.5rem)] leading-[1.05]",
                      LABEL_STYLE[mood.id],
                      mood.id === "merakli" && isHovered && "text-gradient",
                      mood.id === "nostaljik" &&
                        "text-[clamp(2.9rem,min(7vw,8.4vh),5.25rem)] leading-[0.95]",
                    )}
                  >
                    {mood.label}
                  </motion.span>
                  {lastMood === mood.id && (
                    <span className="hidden font-hand text-xl opacity-60 sm:inline">
                      ← geçen sefer
                    </span>
                  )}
                </span>

                <span className="hidden font-swiss text-sm opacity-60 sm:block">
                  {mood.hint}
                </span>

                <span className="flex w-16 justify-end sm:w-24">
                  {isHovered ? (
                    <Glyph id={mood.id} />
                  ) : (
                    <span className="font-swiss text-xl opacity-40 transition group-hover:opacity-100">
                      →
                    </span>
                  )}
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>

      <footer className="relative mt-auto flex flex-col gap-2 pt-10 font-swiss text-[13px] opacity-55 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-sm">
          Site, seçtiğin ruh haline göre baştan kurulur. Fikrini istediğin an
          değiştirebilirsin.
        </p>
        <p className="hidden sm:block">
          <span className="font-plex">1–5</span> tuşlarıyla da seçebilirsin
        </p>
      </footer>

      <AnimatePresence>
        {leaving && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{
              backgroundColor: leaving.mood.bg,
              color: leaving.mood.fg,
            }}
            initial={{
              clipPath: `circle(0% at ${leaving.x}px ${leaving.y}px)`,
            }}
            animate={{
              clipPath: `circle(150% at ${leaving.x}px ${leaving.y}px)`,
            }}
            transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className={cn(
                "text-center text-3xl sm:text-5xl",
                LABEL_STYLE[leaving.mood.id],
              )}
            >
              {FAREWELL[leaving.mood.id]}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
