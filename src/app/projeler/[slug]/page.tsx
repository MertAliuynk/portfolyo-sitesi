import { notFound } from "next/navigation";

import { NeonProject } from "~/components/home/NeonProject";
import { toProjectView } from "~/lib/projects";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await api.project.bySlug({ slug });
  return {
    title: project ? `${project.title.split("—")[0]!.trim()} — ${SITE.name}` : SITE.name,
    description: project?.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = (await api.project.all()).map(toProjectView);
  const project = all.find((p) => p.slug === slug);
  if (!project) notFound();

  return <NeonProject project={project} others={all.filter((p) => p.slug !== slug)} />;
}
