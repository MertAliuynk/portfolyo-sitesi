"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Shell } from "~/components/sakin/SakinBlog";
import { SLOW, soft } from "~/components/sakin/SakinExperience";
import { sakinRich } from "~/components/sakin/rich";
import { projectDoc, type ProjectView } from "~/lib/projects";
import { RichRenderer } from "~/lib/rich/render";
import { cn } from "~/lib/utils";

export function SakinProject({ project, others }: { project: ProjectView; others: ProjectView[] }) {
  const meta = [project.role, project.duration, project.status].filter(Boolean).join(" · ");

  return (
    <Shell>
      <article className="mx-auto max-w-[37rem] px-6 pt-40 pb-24">
        <Link href="/sakin/projeler" className={cn("font-soft text-[14px] italic opacity-60 transition-opacity hover:opacity-100", soft)}>
          ← üzerinde çalıştıklarım
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.2, ease: SLOW }}
          className="mt-20 text-center"
        >
          <p className="font-soft text-[12px] tracking-[0.25em] uppercase opacity-50">
            {project.year}
            {meta && ` · ${meta}`}
          </p>
          <h1 className={cn("mt-6 font-soft text-[clamp(2.6rem,7vw,4.2rem)] leading-[1.05] font-light italic", soft)}>
            {project.name}
          </h1>
          {project.subtitle && <p className={cn("mt-3 font-soft text-xl opacity-60", soft)}>{project.subtitle}</p>}
          <p className={cn("mx-auto mt-8 max-w-md font-soft text-[1.15rem] leading-[1.75] opacity-80", soft)}>{project.summary}</p>
          <p className="mt-5 font-soft text-sm opacity-45">{project.tags.join("  ·  ")}</p>
          {(project.liveUrl ?? project.repoUrl) && (
            <div className={cn("mt-6 flex justify-center gap-6 font-soft text-[15px] italic", soft)}>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="border-b border-current/30 pb-0.5 hover:border-current">
                  yakından bak
                </a>
              )}
              {project.repoUrl && (
                <a href={project.repoUrl} target="_blank" rel="noreferrer" className="border-b border-current/30 pb-0.5 hover:border-current">
                  koduna göz at
                </a>
              )}
            </div>
          )}
        </motion.header>

        {project.coverImage && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.4, delay: 0.5 }}
            src={project.coverImage}
            alt=""
            className="mt-16 w-full rounded-[2rem]"
          />
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.4, delay: 0.8 }}
          className="mt-20 text-[1.25rem]"
        >
          <RichRenderer doc={projectDoc(project)} components={sakinRich} />
        </motion.div>

        {others.length > 0 && (
          <div className="mt-24 border-t border-current/15 pt-8 text-center">
            <p className="font-soft text-[12px] tracking-[0.22em] uppercase opacity-50">Bir de bunlar</p>
            <div className="mt-5 flex flex-col gap-3">
              {others.slice(0, 3).map((o) => (
                <Link
                  key={o.slug}
                  href={`/sakin/projeler/${o.slug}`}
                  className={cn("font-soft text-2xl font-light italic transition-colors duration-700 hover:text-[#6E8060]", soft)}
                >
                  {o.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </Shell>
  );
}

export function SakinProjectList({ projects }: { projects: ProjectView[] }) {
  return (
    <Shell>
      <section className="mx-auto max-w-[42rem] px-6 pt-40 pb-32">
        <p className={cn("font-soft text-lg italic opacity-55", soft)}>Acele etmeden yapılmış şeyler.</p>
        <h1 className={cn("mt-3 font-soft text-[clamp(3rem,8vw,5.5rem)] leading-none font-light tracking-[-0.02em] italic", soft)}>
          Üzerinde çalıştıklarım
        </h1>
        <ul className="mt-20">
          {projects.map((p, i) => (
            <motion.li
              key={p.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.8, delay: 0.4 + i * 0.15, ease: SLOW }}
              className="border-t border-current/15"
            >
              <Link href={`/sakin/projeler/${p.slug}`} className="group block py-9">
                <span className="font-soft text-[12px] tracking-[0.22em] uppercase opacity-50">
                  {p.year}
                  {p.status && ` · ${p.status}`}
                </span>
                <span className={cn("mt-3 block font-soft text-[2rem] leading-[1.15] font-light italic transition-colors duration-700 group-hover:text-[#6E8060]", soft)}>
                  {p.name}
                </span>
                <span className={cn("mt-2 block font-soft text-[1.05rem] leading-[1.7] opacity-70", soft)}>{p.summary}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
