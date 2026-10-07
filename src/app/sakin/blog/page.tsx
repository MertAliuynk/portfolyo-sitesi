import { SakinBlogList } from "~/components/sakin/SakinBlog";
import { toPostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `Yazılar — ${SITE.name}`,
};

export default async function SakinBlogPage() {
  const posts = await api.post.all();
  return <SakinBlogList posts={posts.map(toPostView)} />;
}
