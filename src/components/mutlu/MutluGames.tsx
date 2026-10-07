"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Balloons } from "~/components/mutlu/games/Balloons";
import { Memory } from "~/components/mutlu/games/Memory";
import { Stack } from "~/components/mutlu/games/Stack";
import { chunky, ClickBurst, Nav } from "~/components/mutlu/kit";
import { Squiggle, Star } from "~/components/mutlu/shapes";
import { MUTLU_GAMES } from "~/lib/games";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

const CARD_BG: Record<string, string> = {
  balon: "#4D9FFF",
  hafiza: "#FF8AD8",
  kule: "#FFC93C",
};

const GAMES: Record<string, () => React.ReactElement> = {
  balon: Balloons,
  hafiza: Memory,
  kule: Stack,
};

function Illustration({ slug }: { slug: string }) {
  if (slug === "balon") {
    return (
      <div className="relative h-28">
        {[
          ["#FF5A36", "left-[10%] top-2 -rotate-6"],
          ["#FFC93C", "left-[38%] top-0 rotate-3"],
          ["#2EC27E", "left-[64%] top-4 rotate-12"],
        ].map(([c, pos]) => (
          <span key={c} className={cn("absolute", pos)}>
            <span
              className="block h-16 w-12 rounded-[50%] border-[3px] border-[#1A1A1A]"
              style={{ background: c }}
            />
            <span className="mx-auto block h-8 w-[2px] bg-[#1A1A1A]" />
          </span>
        ))}
      </div>
    );
  }
  if (slug === "hafiza") {
    return (
      <div className="relative h-28">
        <span className="absolute top-2 left-[18%] grid h-24 w-20 -rotate-12 place-items-center rounded-xl border-[3px] border-[#1A1A1A] bg-[#FF5A36] font-pop text-3xl font-extrabold text-[#FFF1D6] shadow-[4px_4px_0_#1A1A1A]">
          ?
        </span>
        <span className="absolute top-1 left-[46%] grid h-24 w-20 rotate-6 place-items-center rounded-xl border-[3px] border-[#1A1A1A] bg-[#FFE27A] shadow-[4px_4px_0_#1A1A1A]">
          <Star fill="#4D9FFF" className="h-12 w-12" />
        </span>
      </div>
    );
  }
  return (
    <div className="flex h-28 flex-col-reverse items-center">
      {[
        ["#FF5A36", "w-32"],
        ["#2EC27E", "w-32"],
        ["#4D9FFF", "w-28 translate-x-2"],
        ["#FF8AD8", "w-24 translate-x-3"],
      ].map(([c, w], i) => (
        <span
          key={i}
          className={cn("block h-6 rounded-md border-[3px] border-[#1A1A1A]", w)}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

function GameCard({ slug, index }: { slug: string; index: number }) {
  const g = MUTLU_GAMES.find((x) => x.slug === slug)!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: index % 2 ? 2 : -2 }}
      whileHover={{ rotate: 0, y: -8 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 180, damping: 15 }}
    >
      <Link
        href={`/mutlu/oyunlar/${slug}`}
        className="flex h-full flex-col rounded-[28px] border-[3px] border-[#1A1A1A] p-6 shadow-[8px_8px_0_#1A1A1A] transition-shadow hover:shadow-[12px_12px_0_#1A1A1A]"
        style={{ background: CARD_BG[slug] }}
      >
        <Illustration slug={slug} />
        <h3 className="mt-5 font-pop text-4xl leading-none font-extrabold tracking-tight">
          {g.title}
        </h3>
        <p className="mt-3 font-medium">{g.desc}</p>
        <span className="mt-auto pt-6">
          <span className="inline-block rounded-xl border-[3px] border-[#1A1A1A] bg-[#FFF1D6] px-5 py-1.5 font-pop text-lg font-extrabold shadow-[4px_4px_0_#1A1A1A]">
            OYNA!
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

/** Small block for the happy home page. */
export function MutluGameTeasers() {
  return (
    <section className="px-5 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-pop text-5xl leading-none font-extrabold tracking-tight sm:text-7xl">
              Sıkıldın mı?
            </h2>
            <span className="mt-2 block -rotate-2 font-hand text-3xl text-[#FF5A36]">
              (üç minik oyun yaptım)
            </span>
          </div>
          <Link
            href="/mutlu/oyunlar"
            className={cn(chunky, "rounded-2xl bg-[#FFF1D6] px-6 py-3 font-pop text-lg font-bold")}
          >
            Oyun odası →
          </Link>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {MUTLU_GAMES.map((g, i) => (
            <GameCard key={g.slug} slug={g.slug} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#FFF1D6] text-[#1A1A1A]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.35] [background-image:radial-gradient(#1A1A1A22_1.5px,transparent_1.5px)] [background-size:26px_26px]"
      />
      <ClickBurst />
      <Nav />
      <div className="relative">{children}</div>
      <footer className="relative flex flex-col items-center justify-between gap-2 px-6 py-8 font-pop text-sm font-semibold sm:flex-row sm:px-10">
        <p>
          © {new Date().getFullYear()} {SITE.name} · oyun odası
        </p>
        <Link href="/" className="underline decoration-2 underline-offset-4">
          bugün başka bir moddayım →
        </Link>
      </footer>
    </main>
  );
}

export function MutluGamesList() {
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-5 pt-36 pb-16 sm:px-10">
        <motion.h1
          initial={{ opacity: 0, y: 40, rotate: 3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="font-pop text-[clamp(3.6rem,11vw,9rem)] leading-[0.85] font-extrabold tracking-tight"
        >
          Oyun zamanı<span className="text-[#FF5A36]">!</span>
        </motion.h1>
        <Squiggle stroke="#2EC27E" className="mt-4 h-6 w-64" />
        <p className="mt-8 max-w-xl font-pop text-xl font-medium sm:text-2xl">
          Üç küçük oyun, hepsi bu sayfanın neşesiyle yapıldı. Rekorların bu
          tarayıcıda saklanıyor.
        </p>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {MUTLU_GAMES.map((g, i) => (
            <GameCard key={g.slug} slug={g.slug} index={i} />
          ))}
        </div>
      </section>
    </Shell>
  );
}

export function MutluGamePage({ slug }: { slug: string }) {
  const meta = MUTLU_GAMES.find((g) => g.slug === slug)!;
  const Game = GAMES[slug]!;
  const others = MUTLU_GAMES.filter((g) => g.slug !== slug);

  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-5 pt-32 pb-16 sm:px-10">
        <Link
          href="/mutlu/oyunlar"
          className={cn(chunky, "inline-block rounded-xl bg-[#FFF1D6] px-4 py-1.5 font-pop text-sm font-bold")}
        >
          ← oyun odası
        </Link>
        <div className="mt-8 flex flex-wrap items-end gap-x-5 gap-y-2">
          <h1 className="font-pop text-[clamp(3rem,8vw,6rem)] leading-[0.9] font-extrabold tracking-tight">
            {meta.title}
          </h1>
          <Star fill="#FFC93C" className="mb-2 h-12 w-12 rotate-12" />
        </div>
        <p className="mt-3 -rotate-1 font-hand text-2xl text-[#FF5A36] sm:text-3xl">{meta.how}</p>

        <div className="mt-10">
          <Game />
        </div>

        <div className="mt-20">
          <p className="font-pop text-2xl font-extrabold">Bir de bunları dene:</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {others.map((g) => (
              <Link
                key={g.slug}
                href={`/mutlu/oyunlar/${g.slug}`}
                className={cn(chunky, "rounded-2xl p-5")}
                style={{ background: CARD_BG[g.slug] }}
              >
                <span className="block font-pop text-2xl font-extrabold">{g.title} →</span>
                <span className="mt-1 block font-medium">{g.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
