"use client";

import Link from "next/link";

import { neonRich } from "~/components/rich/neonRich";
import { BackHome } from "~/components/ui/BackHome";
import type { PostView } from "~/lib/posts";
import { RichRenderer } from "~/lib/rich/render";

export function NeonPost({ post }: { post: PostView }) {
  return (
    <main className="relative mx-auto min-h-screen max-w-2xl px-6 py-28 sm:py-36">
      <BackHome />
      <Link href="/blog" className="text-xs tracking-[0.3em] text-cyan uppercase hover:underline">
        ← Tüm yazılar
      </Link>
      <p className="font-display mt-6 text-xs tracking-[0.3em] text-paper/40 uppercase">
        {post.tag} · {post.readingTime} dk okuma · {post.dateLong}
      </p>
      <h1 className="font-display mt-3 text-3xl font-bold sm:text-5xl">{post.title}</h1>
      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImage}
          alt=""
          className="mt-10 w-full rounded-2xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(255,47,208,0.45)]"
        />
      )}
      <div className="mt-10 text-base sm:text-lg">
        <RichRenderer doc={post.doc} components={neonRich} />
      </div>
    </main>
  );
}
