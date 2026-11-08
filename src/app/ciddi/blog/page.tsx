import { CiddiBlogList } from "~/components/ciddi/CiddiBlog";
import { toPostView } from "~/lib/posts";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = pageMeta({ title: `Yazılar — ${SITE.name}`, canonical: "/blog" });

export default async function CiddiBlogPage() {
  const posts = await api.post.all();
  return <CiddiBlogList posts={posts.map(toPostView)} />;
}
