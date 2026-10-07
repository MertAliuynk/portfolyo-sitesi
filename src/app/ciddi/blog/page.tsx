import { CiddiBlogList } from "~/components/ciddi/CiddiBlog";
import { toPostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `Yazılar — ${SITE.name}`,
};

export default async function CiddiBlogPage() {
  const posts = await api.post.all();
  return <CiddiBlogList posts={posts.map(toPostView)} />;
}
