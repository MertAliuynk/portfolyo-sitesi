"use client";

import dynamic from "next/dynamic";

import type { PostView } from "~/lib/posts";
import type { ProjectView } from "~/lib/projects";

/* WebGL + physics only exist in the browser */
const DriveExperience = dynamic(
  () =>
    import("~/components/yolculuk/DriveExperience").then(
      (m) => m.DriveExperience,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="font-pop fixed inset-0 grid place-items-center bg-[#ffe6c4] text-xl font-extrabold text-[#1A1A1A]">
        Ada yükleniyor…
      </div>
    ),
  },
);

export function DriveLoader(props: {
  projects: ProjectView[];
  posts: PostView[];
}) {
  return <DriveExperience {...props} />;
}
