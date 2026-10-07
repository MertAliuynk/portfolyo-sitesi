import { notFound } from "next/navigation";

import { CiddiPost } from "~/components/ciddi/CiddiBlog";
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

export default async function CiddiPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = (await api.post.all()).map(toPostView);
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return <CiddiPost post={post} posts={posts} />;
}
