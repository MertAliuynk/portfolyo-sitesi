import { CiddiProjectList } from "~/components/ciddi/CiddiProject";
import { toProjectView } from "~/lib/projects";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = pageMeta({ title: `Seçili işler — ${SITE.name}`, canonical: "/projeler" });

export default async function ProjectsPage() {
  const projects = await api.project.all();
  return <CiddiProjectList projects={projects.map(toProjectView)} />;
}
