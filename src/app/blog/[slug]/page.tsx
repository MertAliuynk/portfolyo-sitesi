import { notFound } from "next/navigation";

import { NeonPost } from "~/components/home/NeonPost";
import { toPostView } from "~/lib/posts";
import { postMeta } from "~/lib/seo";
import { api, HydrateClient } from "~/trpc/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return postMeta((await params).slug);
}

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
      <NeonPost post={toPostView(post)} />
    </HydrateClient>
  );
}
