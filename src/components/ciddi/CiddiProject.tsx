"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo } from "react";

import { EASE, Header, Reveal, Rule } from "~/components/ciddi/kit";
import { ciddiRich } from "~/components/ciddi/rich";
import { projectDoc, type ProjectView } from "~/lib/projects";
import { headingsOf } from "~/lib/rich/extract";
import { RichRenderer } from "~/lib/rich/render";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

const label = "font-plex text-[11px] tracking-[0.08em] uppercase";

function Footer() {
  return (
    <footer className="mt-32 flex flex-col justify-between gap-2 border-t border-[#111]/20 pt-4 pb-10 font-plex text-[11px] tracking-[0.06em] text-[#6B6B6B] uppercase sm:flex-row print:hidden">
      <span>
        © {new Date().getFullYear()} {SITE.name}
      </span>
      <Link href="/ciddi" className="hover:text-[#111]">
        Ana sayfa
      </Link>
      <Link href="/" className="hover:text-[#111]">
        Modu değiştir
      </Link>
    </footer>
  );
}

export function CiddiProject({ project, others }: { project: ProjectView; others: ProjectView[] }) {
  const doc = useMemo(() => projectDoc(project), [project]);
  const headings = useMemo(() => headingsOf(doc), [doc]);
  const facts = [
    ["Yıl", String(project.year)],
    ["Rol", project.role],
    ["Süre", project.duration],
    ["Durum", project.status],
    ["Teknoloji", project.tags.join(", ")],
  ].filter((f): f is [string, string] => !!f[1]);

  return (
    <div className="min-h-screen bg-[#F4F2EE] text-[#111] antialiased">
      <Header />
      <main className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <div className="flex justify-between pt-10 sm:pt-14">
          <Link href="/ciddi/projeler" className={cn(label, "hover:text-[#E5381F]")}>
            ← Seçili işler
          </Link>
          <span className={cn(label, "text-[#6B6B6B]")}>Vaka çalışması</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="mt-10 font-editorial text-[clamp(3.2rem,9vw,8.5rem)] leading-[0.92] tracking-[-0.025em] sm:mt-16"
        >
          {project.name}
          <span className="text-[#E5381F]">.</span>
        </motion.h1>
        {project.subtitle && (
          <p className="mt-4 font-editorial text-2xl text-[#4A4A4A] italic sm:text-3xl">{project.subtitle}</p>
        )}
        <Reveal delay={0.2} className="mt-8 max-w-3xl">
          <p className="font-swiss text-xl leading-[1.55]">{project.summary}</p>
        </Reveal>

        {project.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.coverImage} alt="" className="mt-12 max-h-[75vh] w-full border border-[#111]/15 object-cover" />
        )}

        <div className="mt-14">
          <Rule />
        </div>

        <div className="grid grid-cols-12 gap-x-4 gap-y-10 pt-8">
          <aside className="col-span-12 lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <dl className="grid grid-cols-2 gap-y-4 font-swiss text-[14px] lg:grid-cols-1">
                {facts.map(([k, v]) => (
                  <div key={k} className={k === "Teknoloji" ? "col-span-2 lg:col-span-1" : ""}>
                    <dt className={cn(label, "text-[#6B6B6B]")}>{k}</dt>
                    <dd className="mt-1">{v}</dd>
                  </div>
                ))}
              </dl>
              {(project.liveUrl ?? project.repoUrl) && (
                <div className="mt-8 flex flex-col gap-2">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(label, "flex justify-between border border-[#111] px-3 py-2.5 transition-colors hover:bg-[#111] hover:text-[#F4F2EE]")}
                    >
                      Canlı sürüm <span>↗</span>
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(label, "flex justify-between border border-[#111]/30 px-3 py-2.5 transition-colors hover:border-[#111]")}
                    >
                      Kaynak kod <span>↗</span>
                    </a>
                  )}
                </div>
              )}
              {headings.length > 0 && (
                <nav className="mt-10 hidden lg:block">
                  <p className={cn(label, "text-[#6B6B6B]")}>İçindekiler</p>
                  <ol className="mt-3 border-t border-[#111]/20">
                    {headings.map((h, i) => (
                      <li key={h.id} className="border-b border-[#111]/20">
                        <a href={`#${h.id}`} className="flex gap-3 py-2 font-swiss text-[13px] text-[#6B6B6B] hover:text-[#111]">
                          <span className="font-plex text-[11px]">{String(i + 1).padStart(2, "0")}</span>
                          {h.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
            </div>
          </aside>
          <article className="col-span-12 [counter-reset:h2] lg:col-span-7 lg:col-start-5">
            <RichRenderer doc={doc} components={ciddiRich} />
          </article>
        </div>

        {others.length > 0 && (
          <nav className="mt-24 border-t border-[#111]">
            <p className={cn(label, "pt-3 text-[#6B6B6B]")}>Diğer işler</p>
            <ul className="mt-4">
              {others.slice(0, 4).map((o) => (
                <li key={o.slug} className="border-b border-[#111]/20">
                  <Link href={`/ciddi/projeler/${o.slug}`} className="group grid grid-cols-12 items-baseline gap-4 py-5">
                    <span className="col-span-2 font-plex text-[12px] sm:col-span-1">{o.year}</span>
                    <span className="col-span-10 font-editorial text-3xl transition-colors group-hover:text-[#E5381F] sm:col-span-6">
                      {o.name}
                    </span>
                    <span className="col-span-12 font-swiss text-[13px] text-[#6B6B6B] sm:col-span-5">{o.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <Footer />
      </main>
    </div>
  );
}

export function CiddiProjectList({ projects }: { projects: ProjectView[] }) {
  return (
    <div className="min-h-screen bg-[#F4F2EE] text-[#111] antialiased">
      <Header />
      <main className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <div className="flex justify-between pt-10 sm:pt-14">
          <span className={label}>Arşiv</span>
          <span className={cn(label, "text-[#6B6B6B]")}>{projects.length} proje</span>
        </div>
        <h1 className="mt-8 font-editorial text-[clamp(3.6rem,12vw,12rem)] leading-[0.85] tracking-[-0.03em]">
          Seçili işler<span className="text-[#E5381F]">.</span>
        </h1>
        <div className="mt-16">
          <Rule />
        </div>
        <ul>
          {projects.map((p, i) => (
            <li key={p.slug} className="border-b border-[#111]/20">
              <Link
                href={`/ciddi/projeler/${p.slug}`}
                className="group grid grid-cols-12 items-baseline gap-x-4 gap-y-2 py-7 transition-colors hover:bg-[#111] hover:text-[#F4F2EE]"
              >
                <span className="col-span-2 pl-1 font-plex text-[12px] sm:col-span-1 sm:pl-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="col-span-10 sm:col-span-6">
                  <span className="block font-editorial text-4xl leading-none sm:text-5xl">{p.name}</span>
                  <span className="mt-2 block font-swiss text-[14px] opacity-70">{p.summary}</span>
                </span>
                <span className="col-span-6 font-swiss text-[13px] sm:col-span-3">{p.tags.slice(0, 3).join(" · ")}</span>
                <span className="col-span-4 font-plex text-[12px] sm:col-span-1">{p.year}</span>
                <span className="col-span-2 pr-1 text-right font-swiss text-xl sm:col-span-1 sm:pr-3">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <Footer />
      </main>
    </div>
  );
}
