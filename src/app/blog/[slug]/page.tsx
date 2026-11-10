import { notFound } from "next/navigation";

import { NeonPost } from "~/components/home/NeonPost";
import { toPostView } from "~/lib/posts";
import { postMeta } from "~/lib/seo";
import { api, HydrateClient } from "~/trpc/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return postMeta((await params).slug);
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = await api.post.all();
  const post = all.find((p) => p.slug === slug);
  if (!post) notFound();

  // same topic first, then the newest — internal links help readers and search alike
  const related = all
    .filter((p) => p.slug !== slug)
    .sort((a, b) => Number(b.tag === post.tag) - Number(a.tag === post.tag))
    .slice(0, 4)
    .map(toPostView);

  return (
    <HydrateClient>
      <NeonPost post={toPostView(post)} related={related} />
    </HydrateClient>
  );
}
