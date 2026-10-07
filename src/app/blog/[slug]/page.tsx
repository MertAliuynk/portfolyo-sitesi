import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownContent } from "~/components/markdown/MarkdownContent";
import { BackHome } from "~/components/ui/BackHome";
import { api, HydrateClient } from "~/trpc/server";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await api.post.bySlug({ slug });

  if (!post) notFound();

  return (
    <HydrateClient>
      <main className="relative mx-auto min-h-screen max-w-2xl px-6 py-28 sm:py-36">
        <BackHome />
        <Link
          href="/blog"
          className="text-xs tracking-[0.3em] text-cyan uppercase hover:underline"
        >
          ← Tüm yazılar
        </Link>
        <p className="mt-6 font-display text-xs tracking-[0.3em] text-paper/40 uppercase">
          {post.tag} · {post.readingTime} dk okuma
        </p>
        <h1 className="font-display mt-3 text-3xl font-bold sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-10 text-base sm:text-lg">
          <MarkdownContent content={post.content} />
        </div>
      </main>
    </HydrateClient>
  );
}
