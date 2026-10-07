"use client";

import { CursorGlow } from "~/components/effects/CursorGlow";
import { GrainOverlay } from "~/components/effects/GrainOverlay";
import { KonamiListener } from "~/components/effects/KonamiListener";
import { PortalTransition } from "~/components/effects/PortalTransition";
import { ScrollProgress } from "~/components/effects/ScrollProgress";
import { About } from "~/components/home/About";
import { GamePortalReveal } from "~/components/home/GamePortalReveal";
import { Hero } from "~/components/home/Hero";
import { MoodChip } from "~/components/home/MoodChip";
import { HorizontalFun } from "~/components/home/HorizontalFun";
import { Projects } from "~/components/home/Projects";
import { SecretTerminal } from "~/components/home/SecretTerminal";
import { SeriousIntro } from "~/components/home/SeriousIntro";
import { TransitionDrop } from "~/components/home/TransitionDrop";
import { ScrollTeaser } from "~/components/ui/ScrollTeaser";
import type { RouterOutputs } from "~/trpc/react";

export function HomeExperience({
  projects,
}: {
  projects: RouterOutputs["project"]["all"];
}) {
  return (
    <main className="relative">
      <GrainOverlay />
      <CursorGlow />
      <ScrollProgress />
      <KonamiListener />
      <PortalTransition />
      <MoodChip />

      <Hero />
      <SeriousIntro />
      <ScrollTeaser message="Hâlâ buradasın. Güzel." />
      <About />
      <Projects projects={projects} />
      <ScrollTeaser message="Bir şey değişmek üzere." />
      <TransitionDrop />
      <HorizontalFun />
      <GamePortalReveal />
      <ScrollTeaser message="Bitti sandın değil mi? Neredeyse." />
      <SecretTerminal />
    </main>
  );
}
