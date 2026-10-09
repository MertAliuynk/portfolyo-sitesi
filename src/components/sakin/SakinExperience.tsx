"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useRainSound } from "~/components/sakin/useRainSound";
import type { PostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type Project = RouterOutputs["project"]["all"][number];

export const SLOW = [0.25, 0.1, 0.25, 1] as const;
export const soft = "[font-variation-settings:'SOFT'_100]";

const LETTER = [
  "Bugün sakin hissettiğini söyledin. O yüzden sana bağırmayacağım, yanıp sönen hiçbir şey göstermeyeceğim. Bu sayfa yavaş okunmak için yazıldı.",
  "Ben Mert. Yazılım mühendisiyim. Beş yılı aşkın süredir insanların her gün kullandığı şeyleri yapıyorum: bazen bir ödeme akışı, bazen bir panel, bazen kimsenin fark etmeyeceği ama olması gereken küçük bir detay.",
  "İşimde en çok sevdiğim şey sessizlik. İyi yazılmış kod sessizdir, kendini anlatmak için çabalamaz. İyi bir arayüz de öyle: ne yapacağını düşünmeden bilirsin.",
  "Acelem olmadığında daha iyi çalışıyorum. Önce dinliyorum, sonra soruyorum, en son yazıyorum.",
];

const SLOW_FACTS = [
  { k: "En sevdiğim an", v: "Bir hatanın nedenini bulduğum o sessiz saniye." },
  { k: "Çalışırken", v: "Pencere aralık, yanımda demli bir çay." },
  { k: "En verimli saatim", v: "23.00 ile 02.00 arası, şehir uyurken." },
  { k: "Şu an öğrendiğim", v: "Daha az kodla daha çok şey anlatmak." },
  { k: "Bilmeni isterim ki", v: "Her mesaja cevap veririm. Bazen biraz yavaş, ama mutlaka." },
];

function greetingFor(hour: number) {
  if (hour < 5) return "İyi geceler.";
  if (hour < 11) return "Günaydın.";
  if (hour < 17) return "İyi günler.";
  if (hour < 22) return "İyi akşamlar.";
  return "İyi geceler.";
}

/* ------------------------------------------------------------------ */

export function TopBar({ fg }: { fg?: MotionValue<string> }) {
  const { playing, toggle } = useRainSound();

  return (
    <motion.header
      style={{ color: fg }}
      className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 font-soft text-[15px] sm:px-10"
    >
      <Link href="/sakin" className={cn("italic", soft)}>
        mert
      </Link>
      <div className="flex items-center gap-3.5 sm:gap-6">
        <button
          type="button"
          onClick={toggle}
          className="group flex items-center gap-2 opacity-70 transition-opacity hover:opacity-100"
        >
          <span className="flex h-3 items-end gap-[2px]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={
                  playing ? { height: ["30%", "100%", "50%", "30%"] } : { height: "30%" }
                }
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}
                className="block w-[2px] rounded-full bg-current"
              />
            ))}
          </span>
          <span className="hidden sm:inline">
            yağmur sesi {playing ? "açık" : "kapalı"}
          </span>
        </button>
        <Link
          href="/sakin/blog"
          className="opacity-70 transition-opacity hover:opacity-100"
        >
          yazılar
        </Link>
        <Link
          href="/sakin/oyunlar"
          className="opacity-70 transition-opacity hover:opacity-100"
        >
          molalar
        </Link>
        <Link
          href="/"
          className="opacity-70 transition-opacity hover:opacity-100"
        >
          mod değiştir
        </Link>
      </div>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */

function Breath() {
  const [inhale, setInhale] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setInhale((v) => !v), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative grid aspect-square w-[min(68vw,380px)] place-items-center">
      <motion.div
        animate={{ scale: inhale ? 1.08 : 0.82 }}
        transition={{ duration: 5, ease: "easeInOut" }}
        initial={{ scale: 0.82 }}
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,#C9D2BC_0%,#B7C4A8_38%,rgba(183,196,168,0)_70%)]"
      />
      <motion.div
        animate={{ scale: inhale ? 1.02 : 0.9, opacity: inhale ? 0.5 : 0.25 }}
        transition={{ duration: 5, ease: "easeInOut" }}
        className="absolute inset-[18%] rounded-full border border-[#2F3A2F]/20"
      />
      <motion.span
        key={inhale ? "in" : "out"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 1.6 }}
        className={cn("relative font-soft text-xl italic", soft)}
      >
        {inhale ? "nefes al" : "nefes ver"}
      </motion.span>
    </div>
  );
}

function Hero() {
  const [greeting, setGreeting] = useState("Merhaba.");

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2.2, ease: SLOW }}
        className={cn(
          "font-soft text-[clamp(3rem,8vw,6.5rem)] leading-none font-light tracking-[-0.02em] italic",
          soft,
        )}
      >
        {greeting}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, delay: 0.8 }}
        className="mt-10"
      >
        <Breath />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 2.5, delay: 1.8 }}
        className={cn("mt-10 max-w-sm font-soft text-lg leading-relaxed", soft)}
      >
        Acele yok. Birkaç nefes al, sonra kendi hızında aşağı in.
      </motion.p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FadeParagraph({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 50%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0.12, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [18, 0]);

  return (
    <motion.p
      ref={ref}
      style={{ opacity, y }}
      className={cn(
        "font-soft text-[1.3rem] leading-[1.8] font-[350] sm:text-[1.45rem]",
        soft,
      )}
    >
      {children}
    </motion.p>
  );
}

function Letter() {
  return (
    <section className="mx-auto max-w-[36rem] px-6 py-32">
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 2 }}
        className={cn("font-soft text-3xl italic", soft)}
      >
        Sevgili ziyaretçi,
      </motion.p>
      <div className="mt-10 space-y-8">
        {LETTER.map((p) => (
          <FadeParagraph key={p}>{p}</FadeParagraph>
        ))}
      </div>
      <div className="mt-14 flex justify-end">
        <div className="relative">
          <p className={cn("font-soft text-4xl font-light italic", soft)}>
            Mert
          </p>
          <svg
            viewBox="0 0 160 30"
            className="absolute -bottom-4 -left-6 w-40"
            aria-hidden
          >
            <motion.path
              d="M4 18 C 30 8, 60 26, 90 14 S 140 6, 156 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.4, ease: SLOW, delay: 0.4 }}
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Works({ projects }: { projects: Project[] }) {
  return (
    <section className="mx-auto max-w-[44rem] px-6 py-32">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
        className={cn("text-center font-soft text-[2.4rem] leading-tight font-light", soft)}
      >
        Üzerinde çalıştığım
        <br />
        <em>bazı şeyler</em>
      </motion.h2>

      <div className="mt-20 space-y-20">
        {projects.map((p, i) => {
          const [name, subtitle] = p.title.split("—").map((s) => s.trim());
          return (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.6, ease: SLOW }}
              className="group text-center"
            >
              <p className="font-soft text-[13px] tracking-[0.25em] uppercase opacity-50">
                {p.year} · {String(i + 1).padStart(2, "0")}
              </p>
              <h3
                className={cn(
                  "mt-3 font-soft text-4xl font-light italic transition-colors duration-700 group-hover:text-[#6E8060]",
                  soft,
                )}
              >
                {name}
              </h3>
              {subtitle && (
                <p className={cn("mt-1 font-soft text-lg opacity-60", soft)}>
                  {subtitle}
                </p>
              )}
              <p
                className={cn(
                  "mx-auto mt-5 max-w-md font-soft text-[1.1rem] leading-[1.75] opacity-80",
                  soft,
                )}
              >
                {p.summary}
              </p>
              <p className="mt-4 font-soft text-sm opacity-45">
                {p.tags.split(",").map((t) => t.trim()).join("  ·  ")}
              </p>
              <div className="mt-5 flex justify-center gap-6 font-soft text-[15px] italic">
                  <Link
                    href={`/sakin/projeler/${p.slug}`}
                    className="border-b border-current/30 pb-0.5 transition-colors hover:border-current"
                  >
                    hikayesini oku
                  </Link>
                  {p.liveUrl && (
                    <a
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border-b border-current/30 pb-0.5 transition-colors hover:border-current"
                    >
                      yakından bak
                    </a>
                  )}
                  {p.repoUrl && (
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border-b border-current/30 pb-0.5 transition-colors hover:border-current"
                    >
                      koduna göz at
                    </a>
                  )}
                </div>
              {i < projects.length - 1 && (
                <p className="mt-20 tracking-[1em] opacity-30" aria-hidden>
                  · · ·
                </p>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function SlowFacts() {
  return (
    <section className="mx-auto max-w-[40rem] px-6 py-32">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
        className={cn("font-soft text-[2.4rem] font-light italic", soft)}
      >
        Yavaş gerçekler
      </motion.h2>
      <dl className="mt-12">
        {SLOW_FACTS.map((f, i) => (
          <motion.div
            key={f.k}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.8, delay: i * 0.15 }}
            className="grid gap-1 border-t border-current/15 py-6 sm:grid-cols-[11rem_1fr] sm:gap-8"
          >
            <dt className="font-soft text-[13px] tracking-[0.2em] uppercase opacity-50 sm:pt-1.5">
              {f.k}
            </dt>
            <dd className={cn("font-soft text-xl leading-relaxed", soft)}>
              {f.v}
            </dd>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Notes({ posts }: { posts: PostView[] }) {
  if (!posts.length) return null;
  return (
    <section className="mx-auto max-w-[40rem] px-6 py-32">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
        className={cn("font-soft text-[2.4rem] font-light italic", soft)}
      >
        Bazen yazıyorum
      </motion.h2>
      <ul className="mt-10">
        {posts.slice(0, 3).map((p, i) => (
          <motion.li
            key={p.slug}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.8, delay: i * 0.15 }}
            className="border-t border-current/15"
          >
            <Link href={`/sakin/blog/${p.slug}`} className="group block py-6">
              <span className="font-soft text-[13px] tracking-[0.2em] uppercase opacity-50">
                {p.readingTime} dakikalık bir okuma
              </span>
              <span
                className={cn(
                  "mt-2 block font-soft text-2xl leading-snug italic transition-transform duration-700 group-hover:translate-x-1.5",
                  soft,
                )}
              >
                {p.title}
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
      <Link
        href="/sakin/blog"
        className={cn(
          "mt-6 inline-block border-b border-current/30 pb-0.5 font-soft text-lg italic transition-colors hover:border-current",
          soft,
        )}
      >
        bütün yazılar
      </Link>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const STARS = [
  [8, 12], [18, 40], [27, 8], [36, 30], [48, 14], [57, 42], [66, 6],
  [74, 28], [83, 16], [92, 36], [12, 64], [88, 58], [44, 56], [62, 70],
];

function Dusk() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 py-32 text-center">
      {STARS.map(([x, y], i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 0.9, 0.3, 0.9] }}
          transition={{
            duration: 6,
            delay: 0.5 + (i % 5) * 0.6,
            repeat: Infinity,
            repeatType: "mirror",
          }}
          className="absolute block h-[3px] w-[3px] rounded-full bg-[#EDE6D6]"
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 2 }}
        className={cn("font-soft text-lg italic", soft)}
      >
        Gün yavaşça bitiyor.
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 2.2, ease: SLOW }}
        className={cn(
          "mt-6 max-w-2xl font-soft text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.1] font-light",
          soft,
        )}
      >
        Bir çay demleyip yazmak istersen, <em>buradayım.</em>
      </motion.h2>
      <motion.a
        href={`mailto:${SITE.email}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 2, delay: 0.8 }}
        className={cn(
          "mt-12 border-b border-current/30 pb-1 font-soft text-2xl italic transition-colors hover:border-current sm:text-3xl",
          soft,
        )}
      >
        {SITE.email}
      </motion.a>
      <div className="mt-10 flex gap-6 font-soft text-[15px] opacity-60">
        {SITE.socials.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="transition-opacity hover:opacity-100"
          >
            {s.label}
          </a>
        ))}
      </div>

      <footer className="absolute inset-x-0 bottom-6 flex justify-center gap-2 font-soft text-[13px] opacity-40">
        <span>
          © {new Date().getFullYear()} {SITE.shortName}
        </span>
        <span>·</span>
        <Link href="/" className="hover:underline">
          başka bir moddayım
        </Link>
      </footer>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const MOTES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  size: 2 + (i % 3),
  duration: 14 + (i % 5) * 4,
}));

export function SakinExperience({
  projects,
  posts,
}: {
  projects: Project[];
  posts: PostView[];
}) {
  const { scrollYProgress } = useScroll();
  // dawn → afternoon → dusk → night, as the visitor reads on
  const bg = useTransform(
    scrollYProgress,
    [0, 0.45, 0.78, 0.97],
    ["#ECE5D8", "#E5E3D3", "#CFC8D2", "#23272F"],
  );
  const fg = useTransform(
    scrollYProgress,
    [0, 0.82, 0.93],
    ["#2F3A2F", "#2F3A2F", "#EDE6D6"],
  );

  return (
    <motion.main
      style={{ backgroundColor: bg, color: fg }}
      className="relative overflow-x-clip"
    >
      <div
        aria-hidden
        className="noise-overlay pointer-events-none fixed inset-0 z-30 opacity-[0.08] mix-blend-multiply"
      />
      {MOTES.map((m, i) => (
        <motion.span
          key={i}
          aria-hidden
          animate={{ y: [0, -60, 0], x: [0, 14, 0], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: m.duration, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none fixed block rounded-full bg-current"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
          }}
        />
      ))}

      <TopBar fg={fg} />
      <Hero />
      <Letter />
      <Works projects={projects} />
      <Notes posts={posts} />
      <SlowFacts />
      <Dusk />
    </motion.main>
  );
}
