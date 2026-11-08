import { notFound } from "next/navigation";

import { MutluProject } from "~/components/mutlu/MutluProject";
import { toProjectView } from "~/lib/projects";
import { projectMeta } from "~/lib/seo";
import { api } from "~/trpc/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return projectMeta((await params).slug);
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

  return <MutluProject project={project} others={all.filter((p) => p.slug !== slug)} />;
}
