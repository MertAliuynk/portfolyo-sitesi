"use client";

import Link from "next/link";
import { useMemo } from "react";

import { neonRich } from "~/components/rich/neonRich";
import { BackHome } from "~/components/ui/BackHome";
import type { PostView } from "~/lib/posts";
import { headingsOf } from "~/lib/rich/extract";
import { RichRenderer } from "~/lib/rich/render";
import { LEVELS } from "~/lib/seo-check";
import { SITE } from "~/lib/site";

export function NeonPost({
  post,
  related = [],
}: {
  post: PostView;
  related?: PostView[];
}) {
  const toc = useMemo(() => headingsOf(post.doc), [post.doc]);
  const level = LEVELS.find((l) => l.id === post.level);

  return (
    <main className="relative mx-auto min-h-screen max-w-2xl px-6 py-28 sm:py-36">
      <BackHome />

      {/* the same trail the structured data gives Google */}
      <nav
        aria-label="Sayfa yolu"
        className="text-paper/40 text-xs tracking-[0.2em] uppercase"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-cyan">
              Ana sayfa
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href="/blog" className="text-cyan hover:underline">
              Blog
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="text-paper/60">{post.tag}</li>
        </ol>
      </nav>

      <article>
        <header>
          <h1 className="font-display mt-6 text-3xl font-bold sm:text-5xl">
            {post.title}
          </h1>
          <p className="font-display text-paper/45 mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs tracking-[0.2em] uppercase">
            {level && (
              <span className="border-cyan/40 text-cyan rounded-full border px-2.5 py-0.5 tracking-[0.15em]">
                {level.label} seviye
              </span>
            )}
            <span>{post.readingTime} dk okuma</span>
            <span>·</span>
            <time dateTime={post.publishedIso}>{post.dateLong}</time>
            {post.updatedLong && post.updatedIso && (
              <>
                <span>·</span>
                <span>
                  güncellendi{" "}
                  <time dateTime={post.updatedIso}>{post.updatedLong}</time>
                </span>
              </>
            )}
          </p>
          {post.excerpt && (
            <p className="text-paper/75 mt-6 text-lg leading-relaxed sm:text-xl">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="mt-10 w-full rounded-2xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(255,47,208,0.45)]"
          />
        )}

        {toc.length >= 3 && (
          <nav
            aria-label="İçindekiler"
            className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
          >
            <p className="font-display text-paper/45 text-xs tracking-[0.3em] uppercase">
              Bu derste
            </p>
            <ol className="mt-3 space-y-1.5">
              {toc.map((h, i) => (
                <li key={h.id} className="flex gap-3 text-[15px]">
                  <span className="text-paper/30 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={`#${h.id}`}
                    className="text-paper/80 hover:text-cyan transition"
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="mt-10 text-base sm:text-lg [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24">
          <RichRenderer doc={post.doc} components={neonRich} />
        </div>

        <footer className="mt-16 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <span className="font-display from-magenta to-cyan text-ink grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br text-lg font-bold">
            M
          </span>
          <p className="text-paper/70 text-sm">
            Yazan{" "}
            <Link
              href="/"
              rel="author"
              className="text-paper hover:text-cyan font-semibold"
            >
              {SITE.name}
            </Link>
            . {SITE.role}, 4. sınıf öğrencisi. Öğrendiklerimi ders gibi
            anlatmaya çalışıyorum; takıldığın yer olursa{" "}
            <a
              href={`mailto:${SITE.email}`}
              className="text-cyan hover:underline"
            >
              yaz
            </a>
            .
          </p>
        </footer>
      </article>

      {related.length > 0 && (
        <aside className="mt-16">
          <p className="font-display text-paper/45 text-xs tracking-[0.3em] uppercase">
            Sıradaki okuma
          </p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/blog/${r.slug}`}
                  className="block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:-translate-y-0.5 hover:border-white/20"
                >
                  <span className="text-paper/40 text-[11px] tracking-[0.2em] uppercase">
                    {r.tag} · {r.readingTime} dk
                  </span>
                  <span className="font-display mt-1 block font-semibold">
                    {r.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </main>
  );
}
