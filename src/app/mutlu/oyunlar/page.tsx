import { MutluGamesList } from "~/components/mutlu/MutluGames";
import { SITE } from "~/lib/site";

export const metadata = {
  title: `Oyun zamanı! — ${SITE.name}`,
};

export default function MutluGamesPage() {
  return <MutluGamesList />;
}
