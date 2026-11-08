import { MutluGamesList } from "~/components/mutlu/MutluGames";
import { pageMeta } from "~/lib/seo";
import { SITE } from "~/lib/site";

export const metadata = pageMeta({ title: `Oyun zamanı! — ${SITE.name}`, canonical: "/mutlu/oyunlar" });

export default function MutluGamesPage() {
  return <MutluGamesList />;
}
