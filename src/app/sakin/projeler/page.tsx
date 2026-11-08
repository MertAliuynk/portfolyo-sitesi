import { SakinProjectList } from "~/components/sakin/SakinProject";
import { toProjectView } from "~/lib/projects";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = pageMeta({ title: `Üzerinde çalıştıklarım — ${SITE.name}`, canonical: "/projeler" });

export default async function ProjectsPage() {
  const projects = await api.project.all();
  return <SakinProjectList projects={projects.map(toProjectView)} />;
}
