import { CiddiProjectList } from "~/components/ciddi/CiddiProject";
import { toProjectView } from "~/lib/projects";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `Seçili işler — ${SITE.name}`,
};

export default async function ProjectsPage() {
  const projects = await api.project.all();
  return <CiddiProjectList projects={projects.map(toProjectView)} />;
}
