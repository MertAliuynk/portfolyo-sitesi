import { MutluBlogList } from "~/components/mutlu/MutluBlog";
import { toPostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `Yazılarım! — ${SITE.name}`,
};

export default async function MutluBlogPage() {
  const posts = await api.post.all();
  return <MutluBlogList posts={posts.map(toPostView)} />;
}
