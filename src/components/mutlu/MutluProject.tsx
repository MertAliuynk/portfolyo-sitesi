"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { chunky } from "~/components/mutlu/kit";
import { Shell } from "~/components/mutlu/MutluBlog";
import { mutluRich } from "~/components/mutlu/rich";
import { Star } from "~/components/mutlu/shapes";
import { projectDoc, type ProjectView } from "~/lib/projects";
import { RichRenderer } from "~/lib/rich/render";
import { cn } from "~/lib/utils";

export const MUTLU_GRADIENT: Record<string, string> = {
  magenta: "#FF8AD8",
  sunset: "#FFC93C",
  ocean: "#4D9FFF",
  forest: "#2EC27E",
  cosmic: "#B79CFF",
};

function Pill({ label, value, bg }: { label: string; value: string; bg: string }) {
  return (
    <span className="rounded-2xl border-[3px] border-[#1A1A1A] px-4 py-2 shadow-[4px_4px_0_#1A1A1A]" style={{ background: bg }}>
      <span className="block font-pop text-[11px] font-bold tracking-wide uppercase opacity-70">{label}</span>
      <span className="block font-pop text-lg leading-tight font-extrabold">{value}</span>
    </span>
  );
}

export function MutluProject({ project, others }: { project: ProjectView; others: ProjectView[] }) {
  const color = MUTLU_GRADIENT[project.gradient] ?? "#FFC93C";
  const meta = [
    ["Yıl", String(project.year)],
    ["Rol", project.role],
    ["Süre", project.duration],
    ["Durum", project.status],
  ].filter((m): m is [string, string] => !!m[1]);
  const pillColors = ["#FFF8EA", "#FFE27A", "#BFE0FF", "#C4F0D6"];

  return (
    <Shell>
      <article className="mx-auto max-w-4xl px-5 pt-32 pb-10 sm:px-6">
        <Link
          href="/mutlu/projeler"
          className={cn(chunky, "inline-block rounded-xl bg-[#FFF1D6] px-4 py-1.5 font-pop text-sm font-bold")}
        >
          ← tüm projeler
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative mt-10 rounded-[32px] border-[3px] border-[#1A1A1A] p-7 shadow-[8px_8px_0_#1A1A1A] sm:p-10"
          style={{ background: color }}
        >
          <Star fill="#FFF1D6" className="absolute -top-7 -right-5 w-16 rotate-12" />
          <p className="font-hand text-2xl">vaka çalışması</p>
          <h1 className="mt-2 font-pop text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.9] font-extrabold tracking-tight">
            {project.name}
          </h1>
          {project.subtitle && <p className="mt-3 font-pop text-xl font-bold opacity-80">{project.subtitle}</p>}
          <p className="mt-5 max-w-2xl text-lg font-semibold">{project.summary}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span key={t} className="rounded-full border-2 border-[#1A1A1A] bg-[#FFF1D6] px-3 py-0.5 text-sm font-bold">
                {t}
              </span>
            ))}
          </div>

          {(project.liveUrl ?? project.repoUrl) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(chunky, "rounded-xl bg-[#1A1A1A] px-5 py-2.5 font-pop font-bold text-[#FFF1D6] shadow-[4px_4px_0_#FFF1D6]")}
                >
                  canlı gör ↗
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noreferrer" className={cn(chunky, "rounded-xl bg-[#FFF1D6] px-5 py-2.5 font-pop font-bold")}>
                  kodu incele
                </a>
              )}
            </div>
          )}
        </motion.header>

        {meta.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-4">
            {meta.map(([label, value], i) => (
              <Pill key={label} label={label} value={value} bg={pillColors[i % pillColors.length]!} />
            ))}
          </div>
        )}

        {project.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.coverImage}
            alt=""
            className="mt-10 w-full rotate-1 rounded-[28px] border-[3px] border-[#1A1A1A] shadow-[8px_8px_0_#1A1A1A]"
          />
        )}

        <div className="mt-12 rounded-[32px] border-[3px] border-[#1A1A1A] bg-[#FFF8EA] p-6 shadow-[8px_8px_0_#1A1A1A] sm:p-12">
          <RichRenderer doc={projectDoc(project)} components={mutluRich} />
        </div>

        {others.length > 0 && (
          <section className="mt-20">
            <h2 className="font-pop text-3xl font-extrabold">Bir de bunlara bak!</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {others.slice(0, 4).map((o) => (
                <Link
                  key={o.slug}
                  href={`/mutlu/projeler/${o.slug}`}
                  className={cn(chunky, "rounded-2xl p-5")}
                  style={{ background: MUTLU_GRADIENT[o.gradient] ?? "#FFC93C" }}
                >
                  <span className="font-hand text-xl">{o.year}</span>
                  <span className="block font-pop text-2xl leading-tight font-extrabold">{o.name} →</span>
                  <span className="mt-1 block font-medium">{o.summary}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </Shell>
  );
}

export function MutluProjectList({ projects }: { projects: ProjectView[] }) {
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-5 pt-36 pb-16 sm:px-10">
        <h1 className="font-pop text-[clamp(3.6rem,11vw,9rem)] leading-[0.85] font-extrabold tracking-tight">
          Tüm projeler<span className="text-[#FF5A36]">!</span>
        </h1>
        <p className="mt-8 max-w-xl font-pop text-xl font-medium sm:text-2xl">
          Yaptığım her şey burada. Birine tıkla, perde arkasını anlatayım.
        </p>
        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {projects.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 50, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5 }}
              whileHover={{ rotate: 0, y: -8 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ type: "spring", stiffness: 170, damping: 16 }}
            >
              <Link
                href={`/mutlu/projeler/${p.slug}`}
                className="block h-full rounded-[28px] border-[3px] border-[#1A1A1A] p-7 shadow-[8px_8px_0_#1A1A1A] transition-shadow hover:shadow-[12px_12px_0_#1A1A1A]"
                style={{ background: MUTLU_GRADIENT[p.gradient] ?? "#FFC93C" }}
              >
                {p.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverImage} alt="" className="mb-5 aspect-video w-full rounded-2xl border-[3px] border-[#1A1A1A] object-cover" />
                )}
                <div className="flex items-center justify-between">
                  <span className="rotate-6 rounded-lg border-[3px] border-[#1A1A1A] bg-[#FFF1D6] px-3 font-hand text-2xl">{p.year}</span>
                  {p.status && <span className="font-pop text-sm font-bold">{p.status}</span>}
                </div>
                <h2 className="mt-5 font-pop text-4xl leading-none font-extrabold tracking-tight">{p.name}</h2>
                {p.subtitle && <p className="mt-2 font-pop font-bold opacity-80">{p.subtitle}</p>}
                <p className="mt-3 font-medium">{p.summary}</p>
                <span className="mt-5 inline-block font-hand text-2xl">hikayesi →</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </Shell>
  );
}
