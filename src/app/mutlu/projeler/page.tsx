import { MutluProjectList } from "~/components/mutlu/MutluProject";
import { toProjectView } from "~/lib/projects";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `Tüm projeler! — ${SITE.name}`,
};

export default async function ProjectsPage() {
  const projects = await api.project.all();
  return <MutluProjectList projects={projects.map(toProjectView)} />;
}
