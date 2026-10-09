import { NeonProjectList } from "~/components/home/NeonProject";
import { toProjectView } from "~/lib/projects";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `Projeler — ${SITE.name}`,
};

export default async function ProjectsPage() {
  const projects = await api.project.all();
  return <NeonProjectList projects={projects.map(toProjectView)} />;
}
