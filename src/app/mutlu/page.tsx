import { MutluExperience } from "~/components/mutlu/MutluExperience";
import { toPostView } from "~/lib/posts";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = pageMeta({ title: `${SITE.name} — Yazılımcı · Mutlu mod`, canonical: "/mutlu" });

export default async function MutluPage() {
  const [projects, posts] = await Promise.all([
    api.project.featured(),
    api.post.all(),
  ]);
  return (
    <MutluExperience projects={projects} posts={posts.map(toPostView)} />
  );
}
