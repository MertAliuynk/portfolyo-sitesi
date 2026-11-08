import { notFound } from "next/navigation";

import { DriveLoader } from "~/components/yolculuk/DriveLoader";
import { toPostView } from "~/lib/posts";
import { toProjectView } from "~/lib/projects";
import { DRIVE_ENABLED } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: "Yolculuk",
  description: "Siteyi arabayla gez.",
  robots: { index: false, follow: false },
};

export default async function YolculukPage() {
  // still under construction: closed until DRIVE_ENABLED is switched on
  if (!DRIVE_ENABLED) notFound();

  const [projects, posts] = await Promise.all([api.project.all(), api.post.all()]);
  return (
    <>
      <style>{`html,body{background:#ffe6c4 !important;overflow:hidden;}`}</style>
      <DriveLoader projects={projects.map(toProjectView)} posts={posts.map(toPostView)} />
    </>
  );
}
