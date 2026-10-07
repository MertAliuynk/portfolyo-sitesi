import { MutluExperience } from "~/components/mutlu/MutluExperience";
import { toPostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `${SITE.name} — Aşırı mutlu mod`,
};

export default async function MutluPage() {
  const [projects, posts] = await Promise.all([
    api.project.featured(),
    api.post.all(),
  ]);
  return (
    <MutluExperience projects={projects} posts={posts.map(toPostView)} />
  );
}
