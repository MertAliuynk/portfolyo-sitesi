import { SakinExperience } from "~/components/sakin/SakinExperience";
import { toPostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `${SITE.name} — Sakin mod`,
};

export default async function SakinPage() {
  const [projects, posts] = await Promise.all([
    api.project.featured(),
    api.post.all(),
  ]);
  return <SakinExperience projects={projects} posts={posts.map(toPostView)} />;
}
