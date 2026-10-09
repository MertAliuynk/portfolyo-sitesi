import { notFound } from "next/navigation";

import { NeonPost } from "~/components/home/NeonPost";
import { toPostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { api, HydrateClient } from "~/trpc/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await api.post.bySlug({ slug });
  return { title: post ? `${post.title} — ${SITE.name}` : SITE.name };
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
