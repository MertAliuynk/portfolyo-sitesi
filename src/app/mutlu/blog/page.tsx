import { MutluBlogList } from "~/components/mutlu/MutluBlog";
import { toPostView } from "~/lib/posts";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = pageMeta({ title: `Yazılarım! — ${SITE.name}`, canonical: "/blog" });

export default async function MutluBlogPage() {
  const posts = await api.post.all();
  return <MutluBlogList posts={posts.map(toPostView)} />;
}
