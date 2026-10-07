"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import type { Components } from "react-markdown";

import { MarkdownContent } from "~/components/markdown/MarkdownContent";
import {
  burst,
  CARD_COLORS,
  chunky,
  ClickBurst,
  Nav,
} from "~/components/mutlu/kit";
import { Smiley, Squiggle, Star } from "~/components/mutlu/shapes";
import { neighbours, type PostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

/* ------------------------------------------------------------------ */

function PostCard({ post, index }: { post: PostView; index: number }) {
  const tilt = index % 2 ? 1.4 : -1.4;
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotate: 0 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      whileHover={{ rotate: 0, y: -8 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 170, damping: 16 }}
    >
      <Link
        href={`/mutlu/blog/${post.slug}`}
        className="flex h-full flex-col rounded-[28px] border-[3px] border-[#1A1A1A] p-6 shadow-[8px_8px_0_#1A1A1A] transition-shadow hover:shadow-[12px_12px_0_#1A1A1A] sm:p-7"
        style={{ background: CARD_COLORS[index % CARD_COLORS.length] }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="-rotate-3 rounded-lg border-[3px] border-[#1A1A1A] bg-[#FFF1D6] px-3 py-0.5 font-pop text-sm font-extrabold">
            {post.tag}
          </span>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF1D6] text-center font-pop leading-none font-extrabold">
            <span>
              {post.readingTime}
              <span className="block text-[10px]">dk</span>
            </span>
          </span>
        </div>
        <h3 className="mt-6 font-pop text-3xl leading-[1.05] font-extrabold tracking-tight">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 font-medium opacity-80">{post.excerpt}</p>
        <span className="mt-auto pt-6 font-hand text-2xl">oku bakalım →</span>
      </Link>
    </motion.div>
  );
}

/** Used on the happy home page, above the contact block. */
export function MutluPostTeasers({ posts }: { posts: PostView[] }) {
  if (!posts.length) return null;
  return (
    <section className="px-5 py-24 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-pop text-5xl leading-none font-extrabold tracking-tight sm:text-7xl">
              Bir de yazıyorum!
            </h2>
            <span className="mt-2 block -rotate-2 font-hand text-3xl text-[#FF5A36]">
              (bazen uzun, hep samimi)
            </span>
          </div>
          <Link
            href="/mutlu/blog"
            className={cn(chunky, "rounded-2xl bg-[#FFF1D6] px-6 py-3 font-pop text-lg font-bold")}
          >
            Hepsini gör →
          </Link>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <PostCard key={p.slug} post={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

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
          © {new Date().getFullYear()} {SITE.name} · %100 mutlulukla yazıldı
        </p>
        <Link href="/" className="underline decoration-2 underline-offset-4">
          bugün başka bir moddayım →
        </Link>
      </footer>
    </main>
  );
}

export function MutluBlogList({ posts }: { posts: PostView[] }) {
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-5 pt-36 pb-16 sm:px-10">
        <motion.h1
          initial={{ opacity: 0, y: 40, rotate: -3 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="font-pop text-[clamp(4rem,12vw,10rem)] leading-[0.85] font-extrabold tracking-tight"
        >
          Yazılarım
          <span className="text-[#FF5A36]">!</span>
        </motion.h1>
        <Squiggle stroke="#4D9FFF" className="mt-4 h-6 w-64" />
        <p className="mt-8 max-w-xl font-pop text-xl font-medium sm:text-2xl">
          Kod, tasarım ve kariyer üzerine notlar. Kahve al, en renklisini seç,
          gerisini sonra okursun.
        </p>

        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <PostCard key={p.slug} post={p} index={i} />
          ))}
        </div>
      </section>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */

const md: Components = {
  h2: ({ children }) => (
    <h2 className="mt-12 mb-5 font-pop text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
      <span className="bg-[linear-gradient(transparent_58%,#FFC93C_58%)] box-decoration-clone px-1">
        {children}
      </span>
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 font-pop text-2xl font-extrabold">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-5 text-[18px] leading-[1.75] font-medium">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="rounded bg-[#FF8AD8]/45 px-1 font-extrabold">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="mb-6 space-y-2.5 text-[18px] font-medium [&>li]:relative [&>li]:pl-8 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:font-pop [&>li]:before:text-[#FF5A36] [&>li]:before:content-['★']">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-6 space-y-3 text-[18px] font-medium [counter-reset:n] [&>li]:relative [&>li]:pl-11 [&>li]:[counter-increment:n] [&>li]:before:absolute [&>li]:before:top-0 [&>li]:before:left-0 [&>li]:before:grid [&>li]:before:h-8 [&>li]:before:w-8 [&>li]:before:place-items-center [&>li]:before:rounded-full [&>li]:before:border-[3px] [&>li]:before:border-[#1A1A1A] [&>li]:before:bg-[#4D9FFF] [&>li]:before:font-pop [&>li]:before:text-sm [&>li]:before:font-extrabold [&>li]:before:content-[counter(n)]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  code: ({ children }) => (
    <code className="rounded-md border-2 border-[#1A1A1A] bg-[#FFC2EC] px-1.5 py-0.5 font-mono text-[0.85em] font-bold">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-8 overflow-x-auto rounded-2xl border-[3px] border-[#1A1A1A] bg-[#1A1A1A] p-5 font-mono text-sm leading-relaxed text-[#FFF1D6] shadow-[6px_6px_0_#FF5A36] [&_code]:border-0 [&_code]:bg-transparent [&_code]:p-0 [&_code]:font-normal">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-bold underline decoration-[#FF5A36] decoration-wavy decoration-2 underline-offset-4"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 -rotate-1 border-[3px] border-[#1A1A1A] bg-[#FFE27A] p-5 font-hand text-3xl leading-tight shadow-[5px_5px_0_#1A1A1A] [&_p]:mb-0 [&_p]:font-hand [&_p]:text-3xl [&_p]:leading-tight">
      {children}
    </blockquote>
  ),
};

function Clap() {
  const [claps, setClaps] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <motion.button
        type="button"
        whileTap={{ scale: 0.85, rotate: -8 }}
        onClick={(e) => {
          setClaps((c) => c + 1);
          burst({
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
          });
        }}
        className={cn(
          chunky,
          "flex items-center gap-3 rounded-full bg-[#FF5A36] px-7 py-4 font-pop text-2xl font-extrabold text-[#FFF1D6]",
        )}
      >
        <Smiley className="h-9 w-9" />
        Alkışla!
      </motion.button>
      <p className="font-hand text-2xl">
        {claps === 0
          ? "beğendiysen bir alkış yeter"
          : claps < 10
            ? `${claps} kere alkışladın, sağ ol!`
            : `${claps}?! ellerin acımadı mı?`}
      </p>
    </div>
  );
}

export function MutluPost({
  post,
  posts,
}: {
  post: PostView;
  posts: PostView[];
}) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const { prev, next } = neighbours(posts, post.slug);
  const color = CARD_COLORS[Math.max(0, posts.findIndex((p) => p.slug === post.slug)) % CARD_COLORS.length];

  return (
    <Shell>
      <motion.div
        style={{ scaleX: progress, transformOrigin: "0 50%" }}
        className="fixed inset-x-0 top-0 z-[70] h-2.5 border-b-[3px] border-[#1A1A1A] bg-[#FF5A36]"
      />

      <article className="mx-auto max-w-3xl px-5 pt-32 pb-10 sm:px-6">
        <Link
          href="/mutlu/blog"
          className={cn(chunky, "inline-block rounded-xl bg-[#FFF1D6] px-4 py-1.5 font-pop text-sm font-bold")}
        >
          ← tüm yazılar
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mt-10 rounded-[32px] border-[3px] border-[#1A1A1A] p-7 shadow-[8px_8px_0_#1A1A1A] sm:p-10"
          style={{ background: color }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rotate-2 rounded-lg border-[3px] border-[#1A1A1A] bg-[#FFF1D6] px-3 py-0.5 font-pop text-sm font-extrabold">
              {post.tag}
            </span>
            <span className="rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF1D6] px-3 py-0.5 font-pop text-sm font-bold">
              {post.readingTime} dk okuma
            </span>
            <span className="font-hand text-2xl">{post.dateLong}</span>
          </div>
          <h1 className="mt-6 font-pop text-[clamp(2.4rem,6vw,4.25rem)] leading-[1] font-extrabold tracking-tight">
            {post.title}
          </h1>
          <p className="mt-5 text-lg font-semibold opacity-80">{post.excerpt}</p>
        </motion.header>

        <div className="relative mt-12 rounded-[32px] border-[3px] border-[#1A1A1A] bg-[#FFF8EA] p-6 shadow-[8px_8px_0_#1A1A1A] sm:p-12">
          <Star fill="#FFC93C" className="absolute -top-8 -right-6 w-16 rotate-12" />
          <MarkdownContent content={post.content} components={md} />
        </div>

        <div className="mt-16">
          <Clap />
        </div>

        {(prev ?? next) && (
          <nav className="mt-16 grid gap-6 sm:grid-cols-2">
            {[
              { p: prev, label: "← daha yeni" },
              { p: next, label: "daha eski →" },
            ].map(({ p, label }, i) =>
              p ? (
                <Link
                  key={p.slug}
                  href={`/mutlu/blog/${p.slug}`}
                  className={cn(
                    chunky,
                    "rounded-2xl p-5",
                    i === 1 && "sm:text-right",
                  )}
                  style={{ background: i ? "#BFE0FF" : "#C4F0D6" }}
                >
                  <span className="font-hand text-xl">{label}</span>
                  <span className="mt-1 block font-pop text-xl leading-tight font-extrabold">
                    {p.title}
                  </span>
                </Link>
              ) : (
                <span key={label} className="hidden sm:block" />
              ),
            )}
          </nav>
        )}
      </article>
    </Shell>
  );
}

