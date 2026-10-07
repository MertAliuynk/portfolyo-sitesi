"use client";

import { motion } from "framer-motion";
import { Code2, ExternalLink } from "lucide-react";

import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type Project = RouterOutputs["project"]["all"][number];

const GRADIENTS: Record<string, string> = {
  magenta: "from-fuchsia-500 via-purple-500 to-indigo-600",
  sunset: "from-orange-400 via-pink-500 to-rose-500",
  ocean: "from-cyan-400 via-sky-500 to-blue-600",
  forest: "from-emerald-400 via-teal-500 to-cyan-500",
  cosmic: "from-violet-500 via-fuchsia-500 to-pink-500",
};

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const tags = project.tags.split(",").map((t) => t.trim());
  const gradient = GRADIENTS[project.gradient] ?? GRADIENTS.magenta;
  const reversed = index % 2 === 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="grid items-center gap-8 sm:grid-cols-2 sm:gap-12"
    >
      <div className={cn(reversed && "sm:order-2")}>
        <motion.div
          whileHover={{ rotate: reversed ? 1 : -1, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={cn(
            "relative aspect-4/3 overflow-hidden rounded-3xl bg-gradient-to-br shadow-2xl shadow-black/40",
            gradient,
          )}
        >
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
            <span className="font-display text-2xl font-bold text-white/95 drop-shadow-lg sm:text-3xl">
              {project.title.split("—")[0]}
            </span>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
        </motion.div>
      </div>

      <div className={cn(reversed && "sm:order-1")}>
        <p className="font-display text-xs tracking-[0.3em] text-paper/40 uppercase">
          {project.year}
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
          {project.title}
        </h3>
        <p className="mt-3 text-paper/70">{project.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-paper/60"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5 flex gap-5">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan hover:underline"
            >
              <ExternalLink className="h-4 w-4" /> Canlı
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-paper/60 transition hover:text-paper"
            >
              <Code2 className="h-4 w-4" /> Kod
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
