import { NostaljikExperience } from "~/components/nostaljik/NostaljikExperience";
import { toPostView } from "~/lib/posts";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = pageMeta({ title: `MertOS 98 — ${SITE.name}, Yazılımcı`, canonical: "/nostaljik" });

export default async function NostaljikPage() {
  const [projects, posts] = await Promise.all([
    api.project.all(),
    api.post.all(),
  ]);
  return (
    <NostaljikExperience projects={projects} posts={posts.map(toPostView)} />
  );
}
