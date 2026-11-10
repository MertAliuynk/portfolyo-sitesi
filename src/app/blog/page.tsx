import { BackHome } from "~/components/ui/BackHome";
import { BlogCard } from "~/components/ui/BlogCard";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { api, HydrateClient } from "~/trpc/server";

export const metadata = pageMeta({
  title: `Blog — ${SITE.name}`,
  description: `${SITE.name}'ın yazıları: yazılım, mühendislik, tasarım ve öğrencilikten notlar.`,
  canonical: "/blog",
});

export default async function BlogPage() {
  const posts = await api.post.all();

  return (
    <HydrateClient>
      <main className="relative mx-auto min-h-screen max-w-5xl px-6 py-28 sm:py-36">
        <BackHome />
        <p className="font-display text-paper/40 text-xs tracking-[0.3em] uppercase">
          Blog
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
          Yazdıklarım.
        </h1>
        <p className="text-paper/60 mt-4 max-w-lg">
          Mühendislik, tasarım ve arada bir de kariyer üzerine notlar.
        </p>

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {posts.map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>
      </main>
    </HydrateClient>
  );
}
