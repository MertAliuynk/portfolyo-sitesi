import { notFound } from "next/navigation";

import { MutluPost } from "~/components/mutlu/MutluBlog";
import { toPostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await api.post.bySlug({ slug });
  return { title: post ? `${post.title} — ${SITE.name}` : SITE.name };
}

export default async function MutluPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = (await api.post.all()).map(toPostView);
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return <MutluPost post={post} posts={posts} />;
}
