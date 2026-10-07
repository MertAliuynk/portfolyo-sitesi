"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Breath } from "~/components/sakin/games/Breath";
import { Pond } from "~/components/sakin/games/Pond";
import { ZenGarden } from "~/components/sakin/games/ZenGarden";
import { SLOW, soft, TopBar } from "~/components/sakin/SakinExperience";
import { SAKIN_GAMES } from "~/lib/games";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

const GAMES: Record<string, () => React.ReactElement> = {
  bahce: ZenGarden,
  gol: Pond,
  nefes: Breath,
};

function Preview({ slug }: { slug: string }) {
  if (slug === "bahce") {
    return (
      <svg viewBox="0 0 120 80" className="h-20 w-28" aria-hidden>
        <rect width="120" height="80" rx="14" fill="#E6DCC8" />
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx="70" cy="42" rx={18 + i * 9} ry={13 + i * 7} fill="none" stroke="rgba(110,90,60,0.3)" strokeWidth="1.5" />
        ))}
        {[14, 22, 30].map((y) => (
          <path key={y} d={`M6 ${y} Q 26 ${y - 6} 40 ${y + 2}`} fill="none" stroke="rgba(110,90,60,0.3)" strokeWidth="1.5" />
        ))}
        <ellipse cx="70" cy="42" rx="11" ry="8" fill="#6E6E68" />
      </svg>
    );
  }
  if (slug === "gol") {
    return (
      <div className="relative grid h-20 w-28 place-items-center overflow-hidden rounded-[14px] bg-[#3E5B55]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ scale: [0.2, 1.6], opacity: [0.7, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: i, ease: "easeOut" }}
            className="absolute h-10 w-16 rounded-[50%] border border-[#ECE5D8]"
          />
        ))}
      </div>
    );
  }
  return (
    <div className="grid h-20 w-28 place-items-center">
      <motion.span
        animate={{ scale: [0.6, 1, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="block h-16 w-16 rounded-full bg-[radial-gradient(circle,#C9D2BC,#B7C4A8_45%,transparent_72%)]"
      />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#ECE5D8] text-[#2F3A2F]">
      <div
        aria-hidden
        className="noise-overlay pointer-events-none fixed inset-0 z-30 opacity-[0.08] mix-blend-multiply"
      />
      <TopBar />
      {children}
      <footer className="flex justify-center gap-2 pb-10 font-soft text-[13px] opacity-45">
        <span>
          © {new Date().getFullYear()} {SITE.shortName}
        </span>
        <span>·</span>
        <Link href="/sakin" className="hover:underline">
          ana sayfa
        </Link>
        <span>·</span>
        <Link href="/" className="hover:underline">
          başka bir moddayım
        </Link>
      </footer>
    </main>
  );
}

export function SakinGamesList() {
  return (
    <Shell>
      <section className="mx-auto max-w-[42rem] px-6 pt-40 pb-32">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 2 }}
          className={cn("font-soft text-lg italic", soft)}
        >
          Kazanmak yok, kaybetmek yok.
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.2, ease: SLOW }}
          className={cn(
            "mt-3 font-soft text-[clamp(3rem,8vw,5.5rem)] leading-none font-light tracking-[-0.02em] italic",
            soft,
          )}
        >
          Küçük molalar
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ duration: 2, delay: 0.6 }}
          className={cn("mt-8 font-soft text-xl leading-relaxed", soft)}
        >
          Skor tutulmayan, süre işlemeyen üç küçük şey. Birini seç, birkaç
          dakika kal, sonra kaldığın yerden devam et.
        </motion.p>

        <ul className="mt-16">
          {SAKIN_GAMES.map((g, i) => (
            <motion.li
              key={g.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, delay: 0.8 + i * 0.2, ease: SLOW }}
              className="border-t border-current/15"
            >
              <Link href={`/sakin/oyunlar/${g.slug}`} className="group flex items-center gap-6 py-8">
                <Preview slug={g.slug} />
                <span className="flex-1">
                  <span
                    className={cn(
                      "block font-soft text-[2rem] leading-tight font-light italic transition-colors duration-700 group-hover:text-[#6E8060]",
                      soft,
                    )}
                  >
                    {g.title}
                  </span>
                  <span className={cn("mt-1 block font-soft text-[1.05rem] leading-relaxed opacity-70", soft)}>
                    {g.desc}
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}

export function SakinGamePage({ slug }: { slug: string }) {
  const meta = SAKIN_GAMES.find((g) => g.slug === slug)!;
  const Game = GAMES[slug]!;
  const others = SAKIN_GAMES.filter((g) => g.slug !== slug);

  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-6 pt-36 pb-24">
        <div className="flex items-center justify-between font-soft text-[14px]">
          <Link href="/sakin/oyunlar" className="italic opacity-60 transition-opacity hover:opacity-100">
            ← molalar
          </Link>
        </div>
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: SLOW }}
          className="mt-10 text-center"
        >
          <h1
            className={cn(
              "font-soft text-[clamp(2.6rem,7vw,4.5rem)] leading-none font-light italic",
              soft,
            )}
          >
            {meta.title}
          </h1>
          <p className={cn("mt-4 font-soft text-lg opacity-60", soft)}>{meta.how}</p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.4, delay: 0.5 }}
          className="mt-12"
        >
          <Game />
        </motion.div>

        <div className="mx-auto mt-24 max-w-[36rem] border-t border-current/15 pt-8 text-center">
          <p className="font-soft text-[12px] tracking-[0.22em] uppercase opacity-50">Başka bir mola</p>
          <div className="mt-4 flex flex-wrap justify-center gap-8">
            {others.map((g) => (
              <Link
                key={g.slug}
                href={`/sakin/oyunlar/${g.slug}`}
                className={cn(
                  "font-soft text-2xl font-light italic transition-colors duration-700 hover:text-[#6E8060]",
                  soft,
                )}
              >
                {g.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
