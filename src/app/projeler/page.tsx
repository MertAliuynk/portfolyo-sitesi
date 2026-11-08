import { NeonProjectList } from "~/components/home/NeonProject";
import { toProjectView } from "~/lib/projects";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = pageMeta({
  title: `Projeler — ${SITE.name}`,
  description: `${SITE.name}'ın yaptığı yazılım projeleri: web uygulamaları, araçlar ve deneyler.`,
  canonical: "/projeler",
});

export default async function ProjectsPage() {
  const projects = await api.project.all();
  return <NeonProjectList projects={projects.map(toProjectView)} />;
}
