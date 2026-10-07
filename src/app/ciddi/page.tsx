import { CiddiExperience } from "~/components/ciddi/CiddiExperience";
import { SITE } from "~/lib/site";
import { api } from "~/trpc/server";

export const metadata = {
  title: `${SITE.name} — ${SITE.role}`,
};

export default async function CiddiPage() {
  const [projects, posts] = await Promise.all([
    api.project.all(),
    api.post.all(),
  ]);

  return (
    <CiddiExperience
      projects={projects}
      posts={posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        tag: p.tag,
        readingTime: p.readingTime,
        date: new Intl.DateTimeFormat("tr-TR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(p.publishedAt),
      }))}
    />
  );
}
