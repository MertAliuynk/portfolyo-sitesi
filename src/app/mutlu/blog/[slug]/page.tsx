import { notFound } from "next/navigation";

import { MutluPost } from "~/components/mutlu/MutluBlog";
import { toPostView } from "~/lib/posts";
import { postMeta } from "~/lib/seo";
import { api } from "~/trpc/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return postMeta((await params).slug);
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
