"use client";

import { AnimatePresence, motion, useScroll } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Components } from "react-markdown";

import { EASE, Header, Reveal, Rule } from "~/components/ciddi/kit";
import { MarkdownContent } from "~/components/markdown/MarkdownContent";
import {
  headingsOf,
  neighbours,
  slugify,
  textOf,
  type PostView,
} from "~/lib/posts";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

const label = "font-plex text-[11px] tracking-[0.08em] uppercase";

function Footer() {
  return (
    <footer className="mt-32 flex flex-col justify-between gap-2 border-t border-[#111]/20 pt-4 pb-10 font-plex text-[11px] tracking-[0.06em] text-[#6B6B6B] uppercase sm:flex-row print:hidden">
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

/* ------------------------------------------------------------------ */

export function CiddiBlogList({ posts }: { posts: PostView[] }) {
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => counts.set(p.tag, (counts.get(p.tag) ?? 0) + 1));
    return [...counts.entries()];
  }, [posts]);
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? posts.filter((p) => p.tag === active) : posts;

  return (
    <div className="min-h-screen bg-[#F4F2EE] text-[#111] antialiased">
      <Header />
      <main className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <div className="flex justify-between pt-10 sm:pt-14">
          <span className={label}>Arşiv</span>
          <span className={cn(label, "text-[#6B6B6B]")}>
            {posts.length} makale
          </span>
        </div>

        <h1 className="mt-8 overflow-hidden pt-[0.1em] font-editorial text-[clamp(4rem,13vw,13rem)] leading-[0.85] tracking-[-0.03em]">
          <motion.span
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="block"
          >
            Yazılar<span className="text-[#E5381F]">.</span>
          </motion.span>
        </h1>

        <div className="mt-10 grid grid-cols-12 gap-4">
          <Reveal
            delay={0.3}
            className="col-span-12 font-swiss text-lg leading-[1.55] sm:col-span-6 lg:col-span-5"
          >
            Mühendislik, tasarım ve kariyer üzerine uzun biçimli notlar.
            Pratikte işe yarayanları, nedenleriyle birlikte yazıyorum.
          </Reveal>
        </div>

        <div className="mt-16">
          <Rule />
          <div className="flex flex-wrap gap-2 pt-4 print:hidden">
            {[[null, posts.length] as const, ...tags].map(([tag, count]) => (
              <button
                key={tag ?? "all"}
                type="button"
                onClick={() => setActive(tag)}
                className={cn(
                  label,
                  "border border-[#111] px-3 py-1.5 transition-colors",
                  active === tag
                    ? "bg-[#111] text-[#F4F2EE]"
                    : "hover:bg-[#111]/5",
                )}
              >
                {tag ?? "Tümü"} <span className="opacity-50">({count})</span>
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn(
            label,
            "mt-10 hidden grid-cols-12 gap-4 border-b border-[#111] pb-2 text-[#6B6B6B] sm:grid",
          )}
        >
          <span className="col-span-1">No.</span>
          <span className="col-span-2">Tarih</span>
          <span className="col-span-6">Başlık</span>
          <span className="col-span-2">Konu</span>
          <span className="col-span-1 text-right">Süre</span>
        </div>

        <ul className="mt-6 border-t border-[#111] sm:mt-0 sm:border-t-0">
          <AnimatePresence initial={false}>
            {visible.map((post) => {
              const no = posts.indexOf(post) + 1;
              return (
                <motion.li
                  key={post.slug}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-[#111]/20"
                >
                  <Link
                    href={`/ciddi/blog/${post.slug}`}
                    className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-2 py-6"
                  >
                    <span className="col-span-2 font-plex text-[12px] sm:col-span-1">
                      {String(no).padStart(2, "0")}
                    </span>
                    <span className="col-span-10 font-plex text-[12px] text-[#6B6B6B] sm:col-span-2">
                      {post.date}
                    </span>
                    <span className="col-span-12 sm:col-span-6">
                      <span className="block font-editorial text-3xl leading-[1.05] transition-colors group-hover:text-[#E5381F] sm:text-[2.4rem]">
                        {post.title}
                      </span>
                      <span className="mt-2 block max-w-xl font-swiss text-[14px] leading-relaxed text-[#4A4A4A]">
                        {post.excerpt}
                      </span>
                    </span>
                    <span className="col-span-8 font-swiss text-[13px] sm:col-span-2">
                      {post.tag}
                    </span>
                    <span className="col-span-4 text-right font-plex text-[12px] sm:col-span-1">
                      {post.readingTime} dk
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>

        <Footer />
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const md: Components = {
  h2: ({ children }) => (
    <h2
      id={slugify(textOf(children))}
      className="mt-16 mb-6 scroll-mt-24 border-t border-[#111] pt-4 font-editorial text-[2.4rem] leading-[1.05] [counter-increment:h2] before:mb-3 before:block before:font-plex before:text-[11px] before:tracking-[0.08em] before:text-[#6B6B6B] before:content-['§_'_counter(h2,decimal-leading-zero)]"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-10 mb-3 font-swiss text-[18px] font-semibold">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-6 font-swiss text-[18px] leading-[1.7] text-[#222]">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-[#111]">{children}</strong>,
  ul: ({ children }) => (
    <ul className="mb-6 space-y-2 font-swiss text-[18px] leading-[1.6] text-[#222] [&>li]:relative [&>li]:pl-7 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-[#E5381F] [&>li]:before:content-['—']">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-6 space-y-4 font-swiss text-[18px] leading-[1.6] text-[#222] [counter-reset:li] [&>li]:relative [&>li]:pl-10 [&>li]:[counter-increment:li] [&>li]:before:absolute [&>li]:before:top-[0.35em] [&>li]:before:left-0 [&>li]:before:font-plex [&>li]:before:text-[12px] [&>li]:before:text-[#6B6B6B] [&>li]:before:content-[counter(li,decimal-leading-zero)]">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  code: ({ children }) => (
    <code className="bg-[#E6E2DA] px-1 py-0.5 font-plex text-[0.82em]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-8 overflow-x-auto border-y border-[#111] bg-[#ECE9E3] px-5 py-5 font-plex text-[13px] leading-[1.65] [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="border-b border-[#111]/40 hover:border-[#E5381F] hover:text-[#E5381F]"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-10 border-l-2 border-[#E5381F] pl-6 font-editorial text-[1.75rem] leading-[1.25] italic [&_p]:mb-0 [&_p]:font-editorial [&_p]:text-[1.75rem] [&_p]:leading-[1.25] [&_p]:text-[#111]">
      {children}
    </blockquote>
  ),
};

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export function CiddiPost({
  post,
  posts,
}: {
  post: PostView;
  posts: PostView[];
}) {
  const { scrollYProgress } = useScroll();
  const headings = useMemo(() => headingsOf(post.content), [post.content]);
  const ids = useMemo(() => headings.map((h) => h.id), [headings]);
  const active = useActiveHeading(ids);
  const { prev, next } = neighbours(posts, post.slug);
  const no = posts.findIndex((p) => p.slug === post.slug) + 1;

  return (
    <div className="min-h-screen bg-[#F4F2EE] text-[#111] antialiased">
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: "0 50%" }}
        className="fixed inset-x-0 top-0 z-50 h-[2px] bg-[#E5381F] print:hidden"
      />
      <Header />
      <main className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <div className="flex justify-between pt-10 sm:pt-14">
          <Link href="/ciddi/blog" className={cn(label, "hover:text-[#E5381F]")}>
            ← Yazılar
          </Link>
          <span className={cn(label, "text-[#6B6B6B]")}>
            Makale {String(no).padStart(2, "0")} / {String(posts.length).padStart(2, "0")}
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="mt-10 max-w-[16ch] font-editorial text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.02em] sm:mt-16"
        >
          {post.title}
        </motion.h1>
        <Reveal delay={0.2} className="mt-8 max-w-3xl">
          <p className="font-editorial text-2xl leading-[1.3] text-[#2A2A2A] italic sm:text-[1.9rem]">
            {post.excerpt}
          </p>
        </Reveal>

        <div className="mt-14">
          <Rule />
        </div>

        <div className="grid grid-cols-12 gap-x-4 gap-y-10 pt-8">
          <aside className="col-span-12 lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <dl className="grid grid-cols-2 gap-y-4 font-swiss text-[14px] lg:grid-cols-1">
                {[
                  ["Yayın", post.dateLong],
                  ["Konu", post.tag],
                  ["Okuma süresi", `${post.readingTime} dakika`],
                  ["Yazar", SITE.name],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className={cn(label, "text-[#6B6B6B]")}>{k}</dt>
                    <dd className="mt-1">{v}</dd>
                  </div>
                ))}
              </dl>

              {headings.length > 0 && (
                <nav className="mt-10 hidden lg:block print:hidden">
                  <p className={cn(label, "text-[#6B6B6B]")}>Bu yazıda</p>
                  <ol className="mt-3 border-t border-[#111]/20">
                    {headings.map((h, i) => (
                      <li key={h.id} className="border-b border-[#111]/20">
                        <a
                          href={`#${h.id}`}
                          className={cn(
                            "flex gap-3 py-2 font-swiss text-[13px] transition-colors",
                            active === h.id ? "text-[#111]" : "text-[#6B6B6B] hover:text-[#111]",
                          )}
                        >
                          <span className="font-plex text-[11px]">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="flex-1">{h.text}</span>
                          {active === h.id && <span className="text-[#E5381F]">■</span>}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className={cn(
                  label,
                  "mt-8 hidden w-full items-center justify-between border border-[#111] px-3 py-2.5 transition-colors hover:bg-[#111] hover:text-[#F4F2EE] lg:flex print:hidden",
                )}
              >
                Yazdır <span>↗</span>
              </button>
            </div>
          </aside>

          <article className="col-span-12 [counter-reset:h2] lg:col-span-7 lg:col-start-5 [&>div>p:first-child]:text-[21px] [&>div>p:first-child]:leading-[1.6]">
            <MarkdownContent content={post.content} components={md} />

            <div className="mt-16 border-t border-[#111] pt-4 font-swiss text-[15px] text-[#4A4A4A]">
              Bu yazı hakkında bir görüşün varsa:{" "}
              <a
                href={`mailto:${SITE.email}?subject=${encodeURIComponent(post.title)}`}
                className="border-b border-[#111] text-[#111] hover:border-[#E5381F] hover:text-[#E5381F]"
              >
                {SITE.email}
              </a>
            </div>
          </article>
        </div>

        {(prev ?? next) && (
          <nav className="mt-24 grid border-t border-[#111] sm:grid-cols-2 print:hidden">
            {[
              { p: prev, l: "← Daha yeni" },
              { p: next, l: "Daha eski →" },
            ].map(({ p, l }, i) =>
              p ? (
                <Link
                  key={p.slug}
                  href={`/ciddi/blog/${p.slug}`}
                  className={cn(
                    "group py-6",
                    i === 1 && "border-t border-[#111]/20 sm:border-t-0 sm:border-l sm:pl-6 sm:text-right",
                  )}
                >
                  <span className={cn(label, "text-[#6B6B6B]")}>{l}</span>
                  <span className="mt-2 block font-editorial text-3xl leading-tight transition-colors group-hover:text-[#E5381F]">
                    {p.title}
                  </span>
                </Link>
              ) : (
                <span key={l} />
              ),
            )}
          </nav>
        )}

        <Footer />
      </main>
    </div>
  );
}
