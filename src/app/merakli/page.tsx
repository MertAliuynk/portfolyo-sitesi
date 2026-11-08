import { HomeExperience } from "~/components/home/HomeExperience";
import { RememberMood } from "~/components/mood/RememberMood";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { api, HydrateClient } from "~/trpc/server";

export const metadata = pageMeta({ title: `${SITE.name} — Yazılımcı · Meraklı mod`, canonical: "/merakli" });

export default async function MerakliPage() {
  const projects = await api.project.featured();

  return (
    <HydrateClient>
      <RememberMood mood="merakli" />
      <HomeExperience projects={projects} />
    </HydrateClient>
  );
}
