import { BackHome } from "~/components/ui/BackHome";
import { BlogCard } from "~/components/ui/BlogCard";
import { SITE } from "~/lib/site";
import { api, HydrateClient } from "~/trpc/server";

export const metadata = {
  title: `Blog — ${SITE.name}`,
};

export default async function BlogPage() {
  const posts = await api.post.all();

  return (
    <HydrateClient>
      <main className="relative mx-auto min-h-screen max-w-5xl px-6 py-28 sm:py-36">
        <BackHome />
        <p className="font-display text-xs tracking-[0.3em] text-paper/40 uppercase">
          Blog
        </p>
        <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
          Yazdıklarım.
        </h1>
        <p className="mt-4 max-w-lg text-paper/60">
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
