import { SakinGamesList } from "~/components/sakin/SakinGames";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";

export const metadata = pageMeta({ title: `Küçük molalar — ${SITE.name}`, canonical: "/sakin/oyunlar" });

export default function SakinGamesPage() {
  return <SakinGamesList />;
}
