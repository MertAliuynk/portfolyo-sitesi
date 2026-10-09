import { SakinProjectList } from "~/components/sakin/SakinProject";
import { toProjectView } from "~/lib/projects";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `Üzerinde çalıştıklarım — ${SITE.name}`,
};

export default async function ProjectsPage() {
  const projects = await api.project.all();
  return <SakinProjectList projects={projects.map(toProjectView)} />;
}
