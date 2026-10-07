import { SakinGamesList } from "~/components/sakin/SakinGames";
import { SITE } from "~/lib/site";

export const metadata = {
  title: `Küçük molalar — ${SITE.name}`,
};

export default function SakinGamesPage() {
  return <SakinGamesList />;
}
