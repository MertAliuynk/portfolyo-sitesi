import { notFound } from "next/navigation";

import { CiddiGamePage } from "~/components/ciddi/CiddiGames";
import { CIDDI_GAMES, findGame } from "~/lib/games";
import { SITE } from "~/lib/site";

export function generateStaticParams() {
  return CIDDI_GAMES.map((g) => ({ oyun: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ oyun: string }>;
}) {
  const { oyun } = await params;
  const game = findGame(CIDDI_GAMES, oyun);
  return { title: game ? `${game.title} — Laboratuvar — ${SITE.name}` : SITE.name };
}

export default async function CiddiGameRoute({
  params,
}: {
  params: Promise<{ oyun: string }>;
}) {
  const { oyun } = await params;
  if (!findGame(CIDDI_GAMES, oyun)) notFound();
  return <CiddiGamePage slug={oyun} />;
}
