import { JsonLd, projectJsonLd, siteUrl } from "~/lib/seo";
import { getProject } from "~/server/content";

/** structured data for the canonical copy of a project */
export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const [project, url] = await Promise.all([getProject((await params).slug), siteUrl()]);
  return (
    <>
      {project && <JsonLd data={projectJsonLd(url, project)} />}
      {children}
    </>
  );
}
