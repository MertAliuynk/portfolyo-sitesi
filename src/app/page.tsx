import { MoodGate } from "~/components/mood/MoodGate";
import { SITE } from "~/lib/site";

export const metadata = {
  title: `${SITE.name} — Bugün nasıl hissediyorsun?`,
};

export default function Home() {
  return <MoodGate />;
}
