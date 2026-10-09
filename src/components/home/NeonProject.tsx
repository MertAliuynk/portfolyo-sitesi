"use client";

import { motion } from "framer-motion";
import { Code2, ExternalLink } from "lucide-react";
import Link from "next/link";

import { neonRich } from "~/components/rich/neonRich";
import { BackHome } from "~/components/ui/BackHome";
import { projectDoc, type ProjectView } from "~/lib/projects";
import { RichRenderer } from "~/lib/rich/render";
import { cn } from "~/lib/utils";

const GRADIENTS: Record<string, string> = {
  magenta: "from-fuchsia-500 via-purple-500 to-indigo-600",
  sunset: "from-orange-400 via-pink-500 to-rose-500",
  ocean: "from-cyan-400 via-sky-500 to-blue-600",
  forest: "from-emerald-400 via-teal-500 to-cyan-500",
  cosmic: "from-violet-500 via-fuchsia-500 to-pink-500",
};

export function NeonProject({ project, others }: { project: ProjectView; others: ProjectView[] }) {
  const facts = [
    ["Yıl", String(project.year)],
    ["Rol", project.role],
    ["Süre", project.duration],
    ["Durum", project.status],
  ].filter((f): f is [string, string] => !!f[1]);

  return (
    <main className="relative mx-auto min-h-screen max-w-3xl px-6 py-28 sm:py-36">
      <BackHome />
      <Link href="/projeler" className="text-xs tracking-[0.3em] text-cyan uppercase hover:underline">
        ← Tüm projeler
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br p-8 shadow-2xl shadow-black/40 sm:p-12",
          GRADIENTS[project.gradient] ?? GRADIENTS.magenta,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_55%)]" />
        <p className="font-display relative text-xs tracking-[0.3em] text-white/70 uppercase">Vaka çalışması</p>
        <h1 className="font-display relative mt-3 text-4xl font-bold text-white sm:text-6xl">{project.name}</h1>
        {project.subtitle && <p className="relative mt-2 text-lg text-white/85">{project.subtitle}</p>}
      </motion.div>

      <p className="mt-8 text-lg text-paper/75">{project.summary}</p>

      {facts.length > 0 && (
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {facts.map(([k, v]) => (
            <div key={k} className="glass-panel rounded-xl p-3">
              <dt className="font-display text-[10px] tracking-[0.25em] text-paper/40 uppercase">{k}</dt>
              <dd className="mt-1 text-sm text-paper">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span key={t} className="rounded-full border border-white/10 px-3 py-1 text-xs text-paper/60">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-6 flex gap-5">
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan hover:underline">
            <ExternalLink className="h-4 w-4" /> Canlı
          </a>
        )}
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-paper/60 hover:text-paper">
            <Code2 className="h-4 w-4" /> Kod
          </a>
        )}
      </div>

      {project.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.coverImage}
          alt=""
          className="mt-10 w-full rounded-2xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(255,47,208,0.45)]"
        />
      )}

      <div className="mt-12 text-base sm:text-lg">
        <RichRenderer doc={projectDoc(project)} components={neonRich} />
      </div>

      {others.length > 0 && (
        <div className="mt-20 grid gap-4 sm:grid-cols-2">
          {others.slice(0, 4).map((o) => (
            <Link
              key={o.slug}
              href={`/projeler/${o.slug}`}
              className="glass-panel group rounded-2xl p-5 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <span className="font-display text-xs tracking-[0.25em] text-paper/40 uppercase">{o.year}</span>
              <span className="font-display group-hover:text-gradient mt-1 block text-xl font-bold">{o.name}</span>
              <span className="mt-1 block text-sm text-paper/60">{o.summary}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export function NeonProjectList({ projects }: { projects: ProjectView[] }) {
  return (
    <main className="relative mx-auto min-h-screen max-w-5xl px-6 py-28 sm:py-36">
      <BackHome />
      <p className="font-display text-xs tracking-[0.3em] text-paper/40 uppercase">Portföy</p>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
        Bütün <span className="text-gradient-warm">işler</span>.
      </h1>
      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.slug} href={`/projeler/${p.slug}`} className="glass-panel group block overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:border-white/20">
            <div className={cn("relative grid aspect-[16/9] place-items-center bg-gradient-to-br", GRADIENTS[p.gradient] ?? GRADIENTS.magenta)}>
              {p.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <span className="font-display text-3xl font-bold text-white/95 drop-shadow-lg">{p.name}</span>
              )}
            </div>
            <div className="p-6">
              <p className="font-display text-xs tracking-[0.3em] text-paper/40 uppercase">{p.year}</p>
              <h2 className="font-display group-hover:text-gradient mt-1 text-2xl font-bold">{p.name}</h2>
              <p className="mt-2 text-sm text-paper/60">{p.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
