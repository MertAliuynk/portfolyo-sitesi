import { notFound } from "next/navigation";

import { SakinGamePage } from "~/components/sakin/SakinGames";
import { findGame, SAKIN_GAMES } from "~/lib/games";
import { SITE } from "~/lib/site";

export function generateStaticParams() {
  return SAKIN_GAMES.map((g) => ({ oyun: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ oyun: string }>;
}) {
  const { oyun } = await params;
  const game = findGame(SAKIN_GAMES, oyun);
  return { title: game ? `${game.title} — ${SITE.name}` : SITE.name };
}

export default async function SakinGameRoute({
  params,
}: {
  params: Promise<{ oyun: string }>;
}) {
  const { oyun } = await params;
  if (!findGame(SAKIN_GAMES, oyun)) notFound();
  return <SakinGamePage slug={oyun} />;
}
