"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Components } from "react-markdown";

import { MarkdownContent } from "~/components/markdown/MarkdownContent";
import { SLOW, soft, TopBar } from "~/components/sakin/SakinExperience";
import { neighbours, type PostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

const SIZES = ["1.1rem", "1.25rem", "1.45rem"];
const SIZE_KEY = "mert:sakin-size";

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

function teaTime(minutes: number) {
  if (minutes <= 5) return "bir çay soğumadan biter";
  if (minutes <= 7) return "tam bir çay süresi";
  return "iki çay süresi, acele yok";
}

/* ------------------------------------------------------------------ */

export function SakinBlogList({ posts }: { posts: PostView[] }) {
  return (
    <Shell>
      <section className="mx-auto max-w-[40rem] px-6 pt-40 pb-32">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: 2 }}
          className={cn("font-soft text-lg italic", soft)}
        >
          Acele etme, birini seç.
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
          Yazılar
        </motion.h1>

        <ul className="mt-20">
          {posts.map((p, i) => (
            <motion.li
              key={p.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, delay: 0.6 + i * 0.18, ease: SLOW }}
              className="border-t border-current/15"
            >
              <Link href={`/sakin/blog/${p.slug}`} className="group block py-9">
                <span className="font-soft text-[12px] tracking-[0.22em] uppercase opacity-50">
                  {p.dateLong} · {p.tag}
                </span>
                <span
                  className={cn(
                    "mt-3 block font-soft text-[1.9rem] leading-[1.2] font-light italic transition-colors duration-700 group-hover:text-[#6E8060]",
                    soft,
                  )}
                >
                  {p.title}
                </span>
                <span
                  className={cn(
                    "mt-3 block font-soft text-[1.05rem] leading-[1.7] opacity-70",
                    soft,
                  )}
                >
                  {p.excerpt}
                </span>
                <span
                  className={cn(
                    "mt-4 inline-flex items-center gap-2 font-soft text-[15px] italic opacity-60",
                    soft,
                  )}
                >
                  <span className="block h-1.5 w-1.5 rounded-full bg-[#8A9A7B]" />
                  {p.readingTime} dakika, {teaTime(p.readingTime)}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}

/* ------------------------------------------------------------------ */

const body = cn("mb-7 font-soft leading-[1.85] font-[350]", soft);

const md: Components = {
  h2: ({ children }) => (
    <h2 className={cn("mt-16 mb-6 text-center font-soft text-[1.9rem] leading-tight font-light italic", soft)}>
      <span aria-hidden className="mb-6 block text-base tracking-[1em] not-italic opacity-30">
        · · ·
      </span>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className={cn("mt-10 mb-4 font-soft text-[1.35rem] italic", soft)}>{children}</h3>
  ),
  p: ({ children }) => <p className={body}>{children}</p>,
  strong: ({ children }) => <strong className="font-medium">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className={cn(body, "space-y-3 [&>li]:relative [&>li]:pl-7 [&>li]:before:absolute [&>li]:before:top-[0.85em] [&>li]:before:left-0 [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:bg-[#8A9A7B] [&>li]:before:content-['']")}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className={cn(body, "list-decimal space-y-4 pl-6 marker:font-light marker:italic marker:opacity-50")}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  code: ({ children }) => (
    <code className="rounded bg-[#2F3A2F]/[0.07] px-1.5 py-0.5 font-mono text-[0.8em]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-10 overflow-x-auto rounded-2xl bg-[#2F3A2F]/[0.06] p-6 font-mono text-[0.75em] leading-[1.65] [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="border-b border-current/30 transition-colors hover:border-current"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className={cn("my-12 text-center font-soft text-[1.6rem] leading-[1.45] font-light italic [&_p]:mb-0 [&_p]:text-[1.6rem] [&_p]:leading-[1.45]", soft)}>
      {children}
    </blockquote>
  ),
};

export function SakinPost({
  post,
  posts,
}: {
  post: PostView;
  posts: PostView[];
}) {
  const [size, setSize] = useState(1);
  const { next } = neighbours(posts, post.slug);
  const after = next ?? posts.find((p) => p.slug !== post.slug);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(SIZE_KEY));
      if (saved >= 0 && saved < SIZES.length) setSize(saved);
    } catch {
      // ignore
    }
  }, []);

  function changeSize(delta: number) {
    const value = Math.min(SIZES.length - 1, Math.max(0, size + delta));
    setSize(value);
    try {
      window.localStorage.setItem(SIZE_KEY, String(value));
    } catch {
      // ignore
    }
  }

  return (
    <Shell>
      <article className="mx-auto max-w-[37rem] px-6 pt-40 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="flex items-center justify-between font-soft text-[14px]"
        >
          <Link href="/sakin/blog" className="italic opacity-60 transition-opacity hover:opacity-100">
            ← yazılar
          </Link>
          <span className="flex items-center gap-1 opacity-60">
            <span className="mr-1">yazı boyutu</span>
            <button
              type="button"
              aria-label="Yazıyı küçült"
              onClick={() => changeSize(-1)}
              disabled={size === 0}
              className="grid h-7 w-7 place-items-center rounded-full text-[13px] transition hover:bg-current/10 disabled:opacity-30"
            >
              A
            </button>
            <button
              type="button"
              aria-label="Yazıyı büyüt"
              onClick={() => changeSize(1)}
              disabled={size === SIZES.length - 1}
              className="grid h-7 w-7 place-items-center rounded-full text-[18px] transition hover:bg-current/10 disabled:opacity-30"
            >
              A
            </button>
          </span>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.2, ease: SLOW, delay: 0.2 }}
          className="mt-20 text-center"
        >
          <p className="font-soft text-[12px] tracking-[0.25em] uppercase opacity-50">
            {post.dateLong} · {post.tag}
          </p>
          <h1
            className={cn(
              "mt-6 font-soft text-[clamp(2.4rem,6vw,3.6rem)] leading-[1.1] font-light italic",
              soft,
            )}
          >
            {post.title}
          </h1>
          <p className={cn("mt-6 font-soft text-[15px] italic opacity-60", soft)}>
            {post.readingTime} dakika · {teaTime(post.readingTime)}
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.4, delay: 0.9 }}
          style={{ fontSize: SIZES[size] }}
          className={cn(
            "mt-20 transition-[font-size] duration-500",
            // a quiet drop cap on the opening paragraph
            "[&>div>p:first-child]:first-letter:float-left [&>div>p:first-child]:first-letter:mt-[0.12em] [&>div>p:first-child]:first-letter:mr-3 [&>div>p:first-child]:first-letter:font-soft [&>div>p:first-child]:first-letter:text-[4.2em] [&>div>p:first-child]:first-letter:leading-[0.8] [&>div>p:first-child]:first-letter:font-light [&>div>p:first-child]:first-letter:italic [&>div>p:first-child]:first-letter:text-[#6E8060]",
          )}
        >
          <MarkdownContent content={post.content} components={md} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
          className="mt-24 flex flex-col items-center text-center"
        >
          <motion.span
            animate={{ scale: [0.8, 1.15, 0.8] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="block h-4 w-4 rounded-full bg-[#8A9A7B]/70"
          />
          <p className={cn("mt-6 font-soft text-2xl font-light italic", soft)}>
            Okuduğun için teşekkür ederim.
          </p>
          <p className={cn("mt-2 font-soft opacity-60", soft)}>
            Aklına bir şey takılırsa{" "}
            <a
              href={`mailto:${SITE.email}?subject=${encodeURIComponent(post.title)}`}
              className="border-b border-current/30 hover:border-current"
            >
              yazabilirsin
            </a>
            .
          </p>
        </motion.div>

        {after && (
          <Link
            href={`/sakin/blog/${after.slug}`}
            className="group mt-24 block border-t border-current/15 pt-8 text-center"
          >
            <span className="font-soft text-[12px] tracking-[0.22em] uppercase opacity-50">
              Sıradaki, acelesi yok
            </span>
            <span
              className={cn(
                "mt-3 block font-soft text-[1.7rem] leading-snug font-light italic transition-colors duration-700 group-hover:text-[#6E8060]",
                soft,
              )}
            >
              {after.title}
            </span>
          </Link>
        )}
      </article>
    </Shell>
  );
}
