import { MutluProjectList } from "~/components/mutlu/MutluProject";
import { toProjectView } from "~/lib/projects";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = pageMeta({ title: `Tüm projeler! — ${SITE.name}`, canonical: "/projeler" });

export default async function ProjectsPage() {
  const projects = await api.project.all();
  return <MutluProjectList projects={projects.map(toProjectView)} />;
}
