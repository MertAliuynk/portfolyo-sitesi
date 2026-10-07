import { CiddiGamesList } from "~/components/ciddi/CiddiGames";
import { SITE } from "~/lib/site";

export const metadata = {
  title: `Laboratuvar — ${SITE.name}`,
};

export default function CiddiGamesPage() {
  return <CiddiGamesList />;
}
