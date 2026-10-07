import { ProjectCard } from "~/components/ui/ProjectCard";
import type { RouterOutputs } from "~/trpc/react";

export function Projects({
  projects,
}: {
  projects: RouterOutputs["project"]["all"];
}) {
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-28 sm:py-36">
      <div className="mb-16">
        <p className="font-display text-xs tracking-[0.3em] text-paper/40 uppercase">
          Portföy
        </p>
        <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
          Bazı <span className="text-gradient-warm">şeyler</span> yaptım.
        </h2>
      </div>
      <div className="flex flex-col gap-24">
        {projects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
