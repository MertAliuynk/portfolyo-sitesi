import { NostaljikExperience } from "~/components/nostaljik/NostaljikExperience";
import { toPostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `MertOS 98 — ${SITE.name}`,
};

export default async function NostaljikPage() {
  const [projects, posts] = await Promise.all([
    api.project.all(),
    api.post.all(),
  ]);
  return (
    <NostaljikExperience projects={projects} posts={posts.map(toPostView)} />
  );
}
