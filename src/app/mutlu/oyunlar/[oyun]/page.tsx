import { notFound } from "next/navigation";

import { MutluGamePage } from "~/components/mutlu/MutluGames";
import { findGame, MUTLU_GAMES } from "~/lib/games";
import { SITE } from "~/lib/site";

export function generateStaticParams() {
  return MUTLU_GAMES.map((g) => ({ oyun: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ oyun: string }>;
}) {
  const { oyun } = await params;
  const game = findGame(MUTLU_GAMES, oyun);
  return { title: game ? `${game.title} — ${SITE.name}` : SITE.name };
}

export default async function MutluGameRoute({
  params,
}: {
  params: Promise<{ oyun: string }>;
}) {
  const { oyun } = await params;
  if (!findGame(MUTLU_GAMES, oyun)) notFound();
  return <MutluGamePage slug={oyun} />;
}
