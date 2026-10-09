"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";

import {
  burst,
  C,
  CARD_COLORS,
  chunky,
  ClickBurst,
  Nav,
} from "~/components/mutlu/kit";
import { MutluPostTeasers } from "~/components/mutlu/MutluBlog";
import { MutluGameTeasers } from "~/components/mutlu/MutluGames";
import {
  ArrowDoodle,
  Flower,
  Smiley,
  Squiggle,
  Star,
} from "~/components/mutlu/shapes";
import type { PostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type Project = RouterOutputs["project"]["all"][number];

/* ------------------------------------------------------------------ */

const HELLO = ["S", "E", "L", "A", "M", "!"];
const HELLO_COLORS = [C.tomato, C.sky, C.grass, C.pink, C.sun, C.lilac];

function Sticker({
  children,
  className,
  rotate,
  constraints,
  delay,
}: {
  children: React.ReactNode;
  className: string;
  rotate: number;
  constraints: React.RefObject<HTMLElement | null>;
  delay: number;
}) {
  return (
    <motion.div
      drag
      dragConstraints={constraints}
      dragElastic={0.25}
      initial={{ scale: 0, rotate: rotate - 30 }}
      animate={{ scale: 1, rotate }}
      transition={{ type: "spring", stiffness: 260, damping: 13, delay }}
      whileHover={{ scale: 1.06, rotate: rotate + 6 }}
      whileDrag={{ scale: 1.15, rotate: rotate - 8, zIndex: 30 }}
      className={cn(
        "absolute z-10 cursor-grab touch-none select-none active:cursor-grabbing",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pt-28 pb-16 sm:px-10"
    >
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex w-max items-center gap-2 rounded-full border-[3px] border-[#1A1A1A] bg-[#2EC27E] px-4 py-1 font-pop text-sm font-bold"
      >
        <span className="block h-2.5 w-2.5 animate-pulse rounded-full bg-[#1A1A1A]" />
        şu an aşırı mutlu moddasın
      </motion.p>

      <h1
        className="mt-6 font-pop text-[clamp(5rem,17vw,14rem)] leading-[0.82] font-extrabold tracking-[-0.015em] [font-variation-settings:'wdth'_92]"
        aria-label="Selam!"
      >
        {HELLO.map((letter, i) => (
          <motion.span
            key={i}
            aria-hidden
            initial={{ y: 140, rotate: 20, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 14,
              delay: 0.1 + i * 0.07,
            }}
            whileHover={{
              y: -22,
              rotate: i % 2 ? 8 : -8,
              transition: { type: "spring", stiffness: 600, damping: 9 },
            }}
            className="inline-block cursor-default [paint-order:stroke_fill] [-webkit-text-stroke:4px_#1A1A1A]"
            style={{
              color: HELLO_COLORS[i],
              textShadow: "6px 6px 0 #1A1A1A",
            }}
          >
            {letter}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 max-w-2xl font-pop text-2xl leading-snug font-semibold sm:text-3xl"
      >
        Ben{" "}
        <span className="inline-block -rotate-2 rounded-lg border-[3px] border-[#1A1A1A] bg-[#FF5A36] px-2 text-[#FFF1D6]">
          Mert
        </span>
        . Yazılım mühendisiyim ve bugün seninle aynı moddayım:{" "}
        <span className="relative inline-block whitespace-nowrap">
          aşırı mutlu
          <Squiggle
            stroke={C.tomato}
            className="absolute -bottom-3 left-0 h-4 w-full"
          />
        </span>
        .
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="relative z-20 mt-10 flex flex-wrap gap-4"
      >
        <button
          type="button"
          onClick={(e) =>
            burst({
              x: e.clientX / window.innerWidth,
              y: e.clientY / window.innerHeight,
            })
          }
          className={cn(
            chunky,
            "rounded-2xl bg-[#FF5A36] px-6 py-3 font-pop text-lg font-extrabold text-[#FFF1D6]",
          )}
        >
          Konfeti patlat!
        </button>
        <a
          href="#isler"
          className={cn(
            chunky,
            "rounded-2xl bg-[#FFF1D6] px-6 py-3 font-pop text-lg font-bold",
          )}
        >
          İşlerime bak ↓
        </a>
      </motion.div>

      {/* draggable stickers */}
      <Sticker
        constraints={ref}
        rotate={-12}
        delay={0.9}
        className="top-[15%] right-[6%] hidden w-40 sm:block"
      >
        <div className="relative">
          <Star fill={C.sun} className="w-full drop-shadow-[5px_5px_0_#1A1A1A]" />
          <span className="absolute inset-0 grid place-items-center pt-2 font-pop text-xl font-extrabold">
            5+ yıl
          </span>
        </div>
      </Sticker>
      <Sticker
        constraints={ref}
        rotate={8}
        delay={1.05}
        className="top-[48%] right-[22%] hidden lg:block"
      >
        <div className="grid h-32 w-32 place-items-center rounded-full border-[3px] border-[#1A1A1A] bg-[#4D9FFF] text-center font-pop leading-none font-extrabold shadow-[5px_5px_0_#1A1A1A]">
          <span>
            <span className="block text-4xl">40+</span>
            <span className="text-sm">proje</span>
          </span>
        </div>
      </Sticker>
      <Sticker
        constraints={ref}
        rotate={6}
        delay={1.2}
        className="top-[34%] right-[34%] hidden xl:block"
      >
        <div className="rounded-xl border-[3px] border-[#1A1A1A] bg-[#FF8AD8] px-4 py-2 font-hand text-3xl shadow-[5px_5px_0_#1A1A1A]">
          kahve: kritik
        </div>
      </Sticker>
      <Sticker
        constraints={ref}
        rotate={-6}
        delay={1.35}
        className="right-[6%] bottom-[12%] w-24 sm:w-32"
      >
        <Smiley className="w-full drop-shadow-[5px_5px_0_#1A1A1A]" />
      </Sticker>
      <Sticker
        constraints={ref}
        rotate={14}
        delay={1.5}
        className="right-[34%] bottom-[16%] hidden w-28 lg:block"
      >
        <div className="relative">
          <Flower fill={C.grass} className="w-full drop-shadow-[5px_5px_0_#1A1A1A]" />
          <span className="absolute inset-0 grid place-items-center font-pop text-lg font-extrabold">
            TS ♥
          </span>
        </div>
      </Sticker>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="pointer-events-none absolute top-[9%] right-[19%] hidden items-start gap-1 lg:flex"
      >
        <span className="-rotate-6 font-hand text-2xl">
          psst! bunları sürükleyebilirsin
        </span>
        <ArrowDoodle className="mt-3 w-16" />
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Band({
  bg,
  color,
  className,
  reverse,
}: {
  bg: string;
  color: string;
  className: string;
  reverse?: boolean;
}) {
  const items = [...SITE.skills, ...SITE.skills];
  return (
    <div
      className={cn(
        "relative -mx-[5%] w-[110%] overflow-hidden border-y-[3px] border-[#1A1A1A] py-3",
        className,
      )}
      style={{ background: bg, color }}
    >
      <div
        lang="en"
        className={cn(
          "animate-marquee flex w-max items-center gap-6 font-pop text-3xl font-extrabold tracking-tight uppercase sm:text-5xl",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {items.map((skill, i) => (
          <span key={i} className="flex items-center gap-6">
            {skill}
            <Star fill={i % 2 ? C.sun : C.pink} className="h-8 w-8 sm:h-10 sm:w-10" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [name, subtitle] = project.title.split("—").map((s) => s.trim());
  const tags = project.tags.split(",").map((t) => t.trim());
  const tilt = index % 2 ? 1.6 : -1.6;

  return (
    <motion.article
      initial={{ opacity: 0, y: 70, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      whileHover={{ rotate: 0, y: -8 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 160, damping: 16 }}
      className="relative rounded-[28px] border-[3px] border-[#1A1A1A] p-6 shadow-[8px_8px_0_#1A1A1A] sm:p-8"
      style={{ background: CARD_COLORS[index % CARD_COLORS.length] }}
    >
      <div className="flex items-center justify-between">
        <span className="grid h-14 w-14 place-items-center rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF1D6] font-pop text-xl font-extrabold">
          0{index + 1}
        </span>
        <span className="rotate-6 rounded-lg border-[3px] border-[#1A1A1A] bg-[#FFF1D6] px-3 font-hand text-2xl">
          {project.year}
        </span>
      </div>

      <h3 className="mt-6 font-pop text-4xl leading-none font-extrabold tracking-tight sm:text-5xl">
        {name}
      </h3>
      {subtitle && (
        <p className="mt-2 font-pop text-lg font-bold opacity-80">{subtitle}</p>
      )}
      <p className="mt-4 text-[17px] leading-relaxed font-medium">
        {project.summary}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border-2 border-[#1A1A1A] bg-[#FFF1D6] px-3 py-0.5 text-sm font-bold"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/mutlu/projeler/${project.slug}`}
            className={cn(chunky, "rounded-xl bg-[#FF5A36] px-4 py-2 font-pop font-bold text-[#FFF1D6]")}
          >
            hikayesi →
          </Link>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                chunky,
                "rounded-xl bg-[#1A1A1A] px-4 py-2 font-pop font-bold text-[#FFF1D6] shadow-[4px_4px_0_#FFF1D6]",
              )}
            >
              canlı gör ↗
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                chunky,
                "rounded-xl bg-[#FFF1D6] px-4 py-2 font-pop font-bold",
              )}
            >
              kodu
            </a>
          )}
        </div>
    </motion.article>
  );
}

function Projects({ projects }: { projects: Project[] }) {
  return (
    <section id="isler" className="relative px-5 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end gap-x-5">
          <h2 className="font-pop text-6xl leading-none font-extrabold tracking-tight sm:text-8xl">
            Yaptığım şeyler
          </h2>
          <span className="-rotate-3 pb-2 font-hand text-3xl text-[#FF5A36]">
            (hepsi çok sevgiyle)
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-6">
          <Squiggle stroke={C.sky} className="h-6 w-56" />
          <Link href="/mutlu/projeler" className={cn(chunky, "rounded-xl bg-[#FFF1D6] px-4 py-1.5 font-pop font-bold")}>
            hepsini gör →
          </Link>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-14">
          {projects.map((p, i) => (
            <div key={p.id} className={cn(i % 2 === 1 && "md:mt-20")}>
              <ProjectCard project={p} index={i} />
            </div>
          ))}
          {projects.length % 2 === 1 && (
            <motion.a
              href="#selam"
              initial={{ opacity: 0, y: 70 }}
              whileInView={{ opacity: 1, y: 0, rotate: 1.6 }}
              whileHover={{ rotate: 0, y: -8 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 160, damping: 16 }}
              className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-[28px] border-[3px] border-dashed border-[#1A1A1A] p-8 text-center md:mt-20"
            >
              <Smiley className="w-20" />
              <p className="font-pop text-4xl leading-none font-extrabold tracking-tight">
                Sıradaki proje senin olabilir!
              </p>
              <p className="font-hand text-2xl text-[#FF5A36]">
                tıkla, konuşalım →
              </p>
            </motion.a>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const NOTE_COLORS = ["#FFE27A", "#FFC2EC", "#BFE0FF", "#C4F0D6", "#E0D4FF", "#FFD1C2"];

function About() {
  return (
    <section id="ben" className="relative px-5 py-28 sm:px-10">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="flex items-center gap-4">
            <h2 className="font-pop text-6xl leading-none font-extrabold tracking-tight sm:text-7xl">
              Kısaca ben
            </h2>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="w-16 shrink-0"
            >
              <Flower fill={C.pink} className="w-full" />
            </motion.div>
          </div>
          <p className="mt-8 font-pop text-xl leading-relaxed font-medium sm:text-2xl">
            {SITE.bio}
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {SITE.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 14,
                  delay: i * 0.08,
                }}
                className="rounded-2xl border-[3px] border-[#1A1A1A] p-4 text-center shadow-[5px_5px_0_#1A1A1A]"
                style={{
                  background: CARD_COLORS[i % CARD_COLORS.length],
                  rotate: i % 2 ? 2 : -2,
                }}
              >
                <p className="font-pop text-3xl font-extrabold">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="mt-1 text-sm font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 self-start sm:gap-6">
          {SITE.funFacts.map((fact, i) => (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 3 : -3 }}
              whileHover={{ rotate: 0, scale: 1.04 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: i * 0.06 }}
              className="relative min-h-36 border-[3px] border-[#1A1A1A] p-4 pt-6 shadow-[5px_5px_0_#1A1A1A]"
              style={{ background: NOTE_COLORS[i % NOTE_COLORS.length] }}
            >
              <span className="absolute -top-3 left-1/2 block h-6 w-16 -translate-x-1/2 -rotate-3 border-2 border-[#1A1A1A]/30 bg-white/70" />
              <p className="font-pop text-xs font-bold tracking-wide uppercase opacity-70">
                {fact.label}
              </p>
              <p className="mt-2 font-hand text-3xl leading-none">{fact.value}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Workflow() {
  return (
    <section className="px-5 py-20 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-pop text-5xl font-extrabold tracking-tight sm:text-6xl">
          Nasıl çalışıyorum?
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {SITE.workflow.map((w, i) => {
            const coffee = w.step === "03";
            return (
              <motion.div
                key={w.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl border-[3px] border-[#1A1A1A] bg-[#FFF8EA] p-5 shadow-[5px_5px_0_#1A1A1A]"
              >
                <motion.span
                  animate={coffee ? { rotate: [-8, 8, -8] } : undefined}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="grid h-12 w-12 place-items-center rounded-full border-[3px] border-[#1A1A1A] font-pop font-extrabold"
                  style={{ background: CARD_COLORS[i % CARD_COLORS.length] }}
                >
                  {w.step}
                </motion.span>
                <h3 className="mt-4 font-pop text-2xl font-extrabold">{w.title}</h3>
                <p className="mt-2 font-medium opacity-80">{w.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Contact() {
  return (
    <section id="selam" className="px-3 pt-16 pb-6 sm:px-6">
      <div className="relative overflow-hidden rounded-[36px] border-[3px] border-[#1A1A1A] bg-[#4D9FFF] px-6 py-20 text-center shadow-[8px_8px_0_#1A1A1A] sm:py-28">
        <Star fill={C.sun} className="absolute -top-6 -left-6 w-32 rotate-12 sm:w-44" />
        <Flower fill={C.pink} className="absolute -right-8 -bottom-8 w-36 sm:w-52" />

        <h2 className="relative mx-auto max-w-4xl font-pop text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-8xl">
          Hadi birlikte bir şey yapalım!
        </h2>
        <p className="relative mt-6 font-hand text-3xl">
          söz veriyorum, cevap yazarım
        </p>

        <a
          href={`mailto:${SITE.email}`}
          onClick={() => burst({ x: 0.5, y: 0.7 })}
          className={cn(
            chunky,
            "relative mt-10 inline-block rounded-2xl bg-[#FFC93C] px-8 py-4 font-pop text-2xl font-extrabold sm:text-3xl",
          )}
        >
          BANA YAZ →
        </a>
        <p className="relative mt-4 font-pop font-bold">{SITE.email}</p>

        <div className="relative mt-10 flex flex-wrap justify-center gap-3">
          {SITE.socials.map((s, i) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className={cn(chunky, "rounded-full px-5 py-2 font-pop font-bold")}
              style={{ background: [C.cream, C.pink, C.grass][i % 3] }}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <footer className="flex flex-col items-center justify-between gap-2 px-3 py-6 font-pop text-sm font-semibold sm:flex-row">
        <p>
          © {new Date().getFullYear()} {SITE.name} · %100 mutlulukla yapıldı
        </p>
        <Link href="/" className="underline decoration-2 underline-offset-4">
          bugün başka bir moddayım →
        </Link>
      </footer>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function MutluExperience({
  projects,
  posts,
}: {
  projects: Project[];
  posts: PostView[];
}) {
  useEffect(() => {
    const t = setTimeout(() => {
      burst({ x: 0.1, y: 0.9 });
      burst({ x: 0.9, y: 0.9 });
    }, 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative overflow-x-clip bg-[#FFF1D6] text-[#1A1A1A]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.35] [background-image:radial-gradient(#1A1A1A22_1.5px,transparent_1.5px)] [background-size:26px_26px]"
      />
      <ClickBurst />
      <Nav />
      <Hero />
      <section className="py-16">
        <Band bg={C.tomato} color={C.cream} className="-rotate-3" />
        <Band bg={C.sun} color={C.ink} className="-mt-4 rotate-2" reverse />
      </section>
      <Projects projects={projects} />
      <About />
      <Workflow />
      <MutluPostTeasers posts={posts} />
      <MutluGameTeasers />
      <Contact />
    </main>
  );
}
