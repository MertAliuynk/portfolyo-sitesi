"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Game2048 } from "~/components/ciddi/games/Game2048";
import { Reaction } from "~/components/ciddi/games/Reaction";
import { Typing } from "~/components/ciddi/games/Typing";
import { EASE, Header, Reveal, Rule } from "~/components/ciddi/kit";
import { CIDDI_GAMES } from "~/lib/games";
import { readBest } from "~/lib/highscore";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

const label = "font-plex text-[11px] tracking-[0.08em] uppercase";

const DETAILS: Record<
  string,
  { Game: () => React.ReactElement; metric: string; unit: string; lower: boolean; skill: string }
> = {
  "2048": { Game: Game2048, metric: "Skor", unit: "puan", lower: false, skill: "Planlama, örüntü tanıma" },
  reaksiyon: { Game: Reaction, metric: "Ortalama süre", unit: "ms", lower: true, skill: "Dikkat, tepki hızı" },
  yazma: { Game: Typing, metric: "Hız", unit: "kelime/dk", lower: false, skill: "Odak, motor beceri" },
};

const BEST_KEY: Record<string, string> = {
  "2048": "ciddi-2048",
  reaksiyon: "ciddi-reaksiyon",
  yazma: "ciddi-yazma",
};

function Footer() {
  return (
    <footer className="mt-32 flex flex-col justify-between gap-2 border-t border-[#111]/20 pt-4 pb-10 font-plex text-[11px] tracking-[0.06em] text-[#6B6B6B] uppercase sm:flex-row">
      <span>
        © {new Date().getFullYear()} {SITE.name}
      </span>
      <Link href="/ciddi" className="hover:text-[#111]">
        Ana sayfa
      </Link>
      <Link href="/" className="hover:text-[#111]">
        Modu değiştir
      </Link>
    </footer>
  );
}

function useRecords() {
  const [records, setRecords] = useState<Record<string, number | null>>({});
  useEffect(() => {
    setRecords(
      Object.fromEntries(CIDDI_GAMES.map((g) => [g.slug, readBest(BEST_KEY[g.slug]!)])),
    );
  }, []);
  return records;
}

export function CiddiGamesList() {
  const records = useRecords();

  return (
    <div className="min-h-screen bg-[#F4F2EE] text-[#111] antialiased">
      <Header />
      <main className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <div className="flex justify-between pt-10 sm:pt-14">
          <span className={label}>Laboratuvar</span>
          <span className={cn(label, "text-[#6B6B6B]")}>{CIDDI_GAMES.length} egzersiz</span>
        </div>

        <h1 className="mt-8 overflow-hidden pt-[0.1em] font-editorial text-[clamp(3.6rem,12vw,12rem)] leading-[0.85] tracking-[-0.03em]">
          <motion.span
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="block"
          >
            Laboratuvar<span className="text-[#E5381F]">.</span>
          </motion.span>
        </h1>

        <div className="mt-10 grid grid-cols-12 gap-4">
          <Reveal delay={0.3} className="col-span-12 font-swiss text-lg leading-[1.55] sm:col-span-6 lg:col-span-5">
            Zihni keskin tutmak için üç kısa egzersiz. Her biri tek bir şeyi
            ölçer; sonuçların yalnızca bu tarayıcıda saklanır.
          </Reveal>
        </div>

        <div className="mt-16">
          <Rule />
        </div>
        <div className={cn(label, "hidden grid-cols-12 gap-4 border-b border-[#111] py-3 text-[#6B6B6B] sm:grid")}>
          <span className="col-span-1">No.</span>
          <span className="col-span-6">Egzersiz</span>
          <span className="col-span-2">Ölçülen</span>
          <span className="col-span-2">Kişisel rekor</span>
        </div>

        <ul>
          {CIDDI_GAMES.map((g, i) => {
            const d = DETAILS[g.slug]!;
            const r = records[g.slug];
            return (
              <li key={g.slug} className="border-b border-[#111]/20">
                <Link
                  href={`/ciddi/oyunlar/${g.slug}`}
                  className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-2 py-7 transition-colors hover:bg-[#111] hover:text-[#F4F2EE] sm:px-0"
                >
                  <span className="col-span-2 pl-1 font-plex text-[12px] sm:col-span-1 sm:pl-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="col-span-10 sm:col-span-6">
                    <span className="block font-editorial text-4xl leading-none sm:text-5xl">{g.title}</span>
                    <span className="mt-2 block max-w-lg font-swiss text-[14px] opacity-70">{g.desc}</span>
                  </span>
                  <span className="col-span-6 font-swiss text-[13px] sm:col-span-2">{d.skill}</span>
                  <span className="col-span-5 font-plex text-[13px] sm:col-span-2">
                    {r != null ? `${r} ${d.unit}` : "—"}
                  </span>
                  <span className="col-span-1 pr-1 text-right font-swiss text-xl transition-transform group-hover:translate-x-1 sm:pr-3">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Footer />
      </main>
    </div>
  );
}

export function CiddiGamePage({ slug }: { slug: string }) {
  const meta = CIDDI_GAMES.find((g) => g.slug === slug)!;
  const d = DETAILS[slug]!;
  const no = CIDDI_GAMES.findIndex((g) => g.slug === slug) + 1;
  const others = CIDDI_GAMES.filter((g) => g.slug !== slug);

  return (
    <div className="min-h-screen bg-[#F4F2EE] text-[#111] antialiased">
      <Header />
      <main className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <div className="flex justify-between pt-10 sm:pt-14">
          <Link href="/ciddi/oyunlar" className={cn(label, "hover:text-[#E5381F]")}>
            ← Laboratuvar
          </Link>
          <span className={cn(label, "text-[#6B6B6B]")}>
            Egzersiz {String(no).padStart(2, "0")} / {String(CIDDI_GAMES.length).padStart(2, "0")}
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="mt-10 font-editorial text-[clamp(3rem,8vw,7rem)] leading-[0.95] tracking-[-0.02em]"
        >
          {meta.title}
          <span className="text-[#E5381F]">.</span>
        </motion.h1>

        <div className="mt-10">
          <Rule />
        </div>

        <div className="grid grid-cols-12 gap-x-4 gap-y-10 pt-8">
          <aside className="col-span-12 lg:col-span-3">
            <dl className="grid grid-cols-2 gap-y-5 font-swiss text-[14px] lg:grid-cols-1">
              <div className="col-span-2 lg:col-span-1">
                <dt className={cn(label, "text-[#6B6B6B]")}>Nasıl</dt>
                <dd className="mt-1 leading-relaxed">{meta.how}</dd>
              </div>
              <div>
                <dt className={cn(label, "text-[#6B6B6B]")}>Ölçülen</dt>
                <dd className="mt-1">{d.metric}</dd>
              </div>
              <div>
                <dt className={cn(label, "text-[#6B6B6B]")}>Beceri</dt>
                <dd className="mt-1">{d.skill}</dd>
              </div>
            </dl>
          </aside>
          <div className="col-span-12 lg:col-span-8 lg:col-start-5">
            <d.Game />
          </div>
        </div>

        <nav className="mt-24 grid border-t border-[#111] sm:grid-cols-2">
          {others.map((g, i) => (
            <Link
              key={g.slug}
              href={`/ciddi/oyunlar/${g.slug}`}
              className={cn(
                "group py-6",
                i === 1 && "border-t border-[#111]/20 sm:border-t-0 sm:border-l sm:pl-6",
              )}
            >
              <span className={cn(label, "text-[#6B6B6B]")}>Diğer egzersiz</span>
              <span className="mt-2 block font-editorial text-3xl leading-tight transition-colors group-hover:text-[#E5381F]">
                {g.title} →
              </span>
            </Link>
          ))}
        </nav>

        <Footer />
      </main>
    </div>
  );
}
