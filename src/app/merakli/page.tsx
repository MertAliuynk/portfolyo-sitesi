import { HomeExperience } from "~/components/home/HomeExperience";
import { RememberMood } from "~/components/mood/RememberMood";
import { SITE } from "~/lib/site";
import { api, HydrateClient } from "~/trpc/server";

export const metadata = {
  title: `${SITE.name} — Meraklı mod`,
};

export default async function MerakliPage() {
  const projects = await api.project.featured();

  return (
    <HydrateClient>
      <RememberMood mood="merakli" />
      <HomeExperience projects={projects} />
    </HydrateClient>
  );
}
