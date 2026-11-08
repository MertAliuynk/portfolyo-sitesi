import { CiddiGamesList } from "~/components/ciddi/CiddiGames";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";

export const metadata = pageMeta({ title: `Laboratuvar — ${SITE.name}`, canonical: "/ciddi/oyunlar" });

export default function CiddiGamesPage() {
  return <CiddiGamesList />;
}
