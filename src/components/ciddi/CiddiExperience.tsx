"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { EASE, Header, Reveal, SectionHead } from "~/components/ciddi/kit";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type Project = RouterOutputs["project"]["all"][number];

export interface CiddiPost {
  slug: string;
  title: string;
  tag: string;
  readingTime: number;
  date: string;
}

const METHOD = [
  {
    title: "Problem tanımı",
    desc: "Koddan önce: kim kullanacak, neden, hangi metrikle başarılı sayılacak.",
  },
  {
    title: "Prototip",
    desc: "En ucuz doğrulama yöntemi. Kararlar varsayımla değil, kullanıcıyla alınır.",
  },
  {
    title: "Mimari",
    desc: "Sınırlar, veri modeli ve hata senaryoları yazılı hale getirilir.",
  },
  {
    title: "Uygulama",
    desc: "Tip güvenliği, test ve performans bütçesiyle. Kalite detayda kazanılır.",
  },
  {
    title: "Yayın ve ölçüm",
    desc: "Kademeli yayın, gözlemlenebilirlik ve kısa geri bildirim döngüsü.",
  },
];

const CAPABILITIES = [
  { group: "Dil ve arayüz", items: ["TypeScript", "React", "Next.js", "Tailwind CSS"] },
  { group: "Sunucu ve API", items: ["Node.js", "tRPC", "REST", "WebSocket"] },
  { group: "Veri", items: ["PostgreSQL", "Prisma", "Redis", "SQLite"] },
  { group: "Grafik ve altyapı", items: ["Three.js", "WebGL", "Docker", "Sistem tasarımı"] },
];

const FIGURES = [
  { value: "5+", label: "Yıl profesyonel deneyim" },
  { value: "40+", label: "Teslim edilmiş proje" },
  { value: "12", label: "Üretimde kullanılan teknoloji" },
];

/* ------------------------------------------------------------------ */

const HEADLINE = [
  { text: "Ölçülebilir ürünler,", italic: false },
  { text: "net sınırlar,", italic: false },
  { text: "gereksiz hiçbir şey.", italic: true },
];

function Hero() {
  return (
    <section id="ust" className="pt-10 sm:pt-14">
      <div className="flex justify-between font-plex text-[11px] tracking-[0.08em] uppercase">
        <span>Portföy — {new Date().getFullYear()} baskısı</span>
        <span className="hidden text-[#6B6B6B] sm:inline">No. 01 / Seçili işler ve yöntem</span>
      </div>

      <h1 className="mt-10 font-editorial text-[clamp(3.25rem,9.6vw,10.5rem)] leading-[0.92] tracking-[-0.025em] sm:mt-16">
        {HEADLINE.map((line, i) => (
          <span key={line.text} className="-mt-[0.18em] block overflow-hidden pt-[0.18em] pb-[0.14em] first:mt-0">
            <motion.span
              initial={{ y: "105%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, delay: 0.1 + i * 0.12, ease: EASE }}
              className={cn("block", line.italic && "italic")}
            >
              {line.text}
              {i === HEADLINE.length - 1 && (
                <span className="ml-3 inline-block h-[0.16em] w-[0.16em] bg-[#E5381F] align-baseline" />
              )}
            </motion.span>
          </span>
        ))}
      </h1>

      <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-8 sm:mt-20">
        <Reveal
          delay={0.5}
          className="col-span-12 font-plex text-[11px] tracking-[0.08em] uppercase sm:col-span-2"
        >
          Özet
        </Reveal>
        <Reveal
          delay={0.55}
          className="col-span-12 font-swiss text-lg leading-[1.55] sm:col-span-6 lg:col-span-5 lg:text-xl"
        >
          <p>
            Ben {SITE.name}. TypeScript ve React ekosisteminde uzmanlaşmış bir
            full-stack yazılım mühendisiyim. Ürün ekipleriyle sıfırdan bire
            giden sistemler kuruyorum: API tasarımından arayüzün son pikseline
            kadar.
          </p>
        </Reveal>
        <Reveal
          delay={0.6}
          className="col-span-12 font-swiss text-[14px] sm:col-span-4 lg:col-span-4 lg:col-start-9"
        >
          <dl className="divide-y divide-[#111]/15 border-y border-[#111]/15">
            <div className="flex justify-between py-2.5">
              <dt className="text-[#6B6B6B]">Durum</dt>
              <dd className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E5381F] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#E5381F]" />
                </span>
                Yeni projelere açık
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#6B6B6B]">Rol</dt>
              <dd>{SITE.role}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#6B6B6B]">Odak</dt>
              <dd>Full-stack · Ürün mühendisliği</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-[#6B6B6B]">Konum</dt>
              <dd>{SITE.location} (uzaktan / hibrit)</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-5 inline-flex w-full items-center justify-between border border-[#111] px-4 py-3 font-plex text-[12px] tracking-[0.06em] uppercase transition-colors hover:bg-[#111] hover:text-[#F4F2EE] print:hidden"
          >
            Bu sayfayı CV olarak yazdır <span>↗</span>
          </button>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Profile() {
  return (
    <section className="pt-28 sm:pt-40">
      <SectionHead id="profil" no="01" title="Profil" aside="Yaklaşım" />
      <div className="mt-10 grid grid-cols-12 gap-x-4 gap-y-10">
        <Reveal className="col-span-12 lg:col-span-4">
          <blockquote className="font-editorial text-4xl leading-[1.05] italic sm:text-5xl">
            “Fonksiyonel olan yeterli değil, altı ay sonra da anlaşılabilir
            olmalı.”
          </blockquote>
        </Reveal>
        <Reveal
          delay={0.1}
          className="col-span-12 font-swiss text-[17px] leading-[1.65] text-[#2A2A2A] lg:col-span-7 lg:col-start-6 lg:columns-2 lg:gap-10"
        >
          {SITE.manifesto.slice(0, 3).map((p) => (
            <p key={p} className="mb-5 break-inside-avoid">
              {p}
            </p>
          ))}
        </Reveal>
      </div>

      <div className="mt-16 grid grid-cols-1 border-t border-[#111] sm:grid-cols-3">
        {FIGURES.map((f, i) => (
          <Reveal
            key={f.label}
            delay={i * 0.08}
            className={cn(
              "py-8 sm:px-6",
              i > 0 && "border-t border-[#111]/15 sm:border-t-0 sm:border-l",
              i === 0 && "sm:pl-0",
            )}
          >
            <p className="font-editorial text-7xl leading-none sm:text-8xl">
              {f.value}
            </p>
            <p className="mt-3 font-swiss text-[14px] text-[#6B6B6B]">
              {f.label}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function WorkRow({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);
  const [name, subtitle] = project.title.split("—").map((s) => s.trim());
  const tags = project.tags.split(",").map((t) => t.trim());

  return (
    <li className="border-b border-[#111]/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "group grid w-full grid-cols-12 items-baseline gap-4 py-5 text-left transition-colors duration-200 sm:py-6",
          "hover:bg-[#111] hover:text-[#F4F2EE]",
          open && "bg-[#111] text-[#F4F2EE]",
        )}
      >
        <span className="col-span-2 pl-1 font-plex text-[12px] sm:col-span-1 sm:pl-3">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="col-span-8 sm:col-span-5">
          <span className="block font-editorial text-3xl leading-none sm:text-[2.6rem]">
            {name}
          </span>
          {subtitle && (
            <span className="mt-1.5 block font-swiss text-[14px] opacity-60">
              {subtitle}
            </span>
          )}
        </span>
        <span className="hidden font-swiss text-[13px] opacity-70 sm:col-span-4 sm:block">
          {tags.slice(0, 3).join(" · ")}
        </span>
        <span className="hidden font-plex text-[12px] sm:col-span-1 sm:block">
          {project.year}
        </span>
        <span className="col-span-2 pr-1 text-right font-swiss text-xl sm:col-span-1 sm:pr-3">
          <span
            className={cn(
              "inline-block transition-transform duration-300",
              open ? "rotate-45" : "group-hover:translate-x-1",
            )}
          >
            {open ? "+" : "→"}
          </span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-12 gap-4 py-8">
              <div className="col-span-12 font-swiss text-[16px] leading-[1.65] sm:col-span-6 sm:col-start-2">
                <p>{project.summary}</p>
                <p className="mt-4 text-[#4A4A4A]">{project.description}</p>
              </div>
              <div className="col-span-12 font-swiss text-[13px] sm:col-span-4 sm:col-start-9">
                <p className="font-plex text-[11px] tracking-[0.08em] uppercase text-[#6B6B6B]">
                  Teknoloji
                </p>
                <p className="mt-2">{tags.join(", ")}</p>
                <div className="mt-6 flex gap-6 font-plex text-[12px] uppercase">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border-b border-[#111] hover:border-[#E5381F] hover:text-[#E5381F]"
                    >
                      Canlı ↗
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="border-b border-[#111] hover:border-[#E5381F] hover:text-[#E5381F]"
                    >
                      Kaynak kod ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function Work({ projects }: { projects: Project[] }) {
  return (
    <section className="pt-28 sm:pt-40">
      <SectionHead
        id="isler"
        no="02"
        title="Seçili işler"
        aside={`${projects.length} kayıt`}
      />
      <div className="mt-8 hidden grid-cols-12 gap-4 border-b border-[#111] pb-2 font-plex text-[11px] tracking-[0.08em] text-[#6B6B6B] uppercase sm:grid">
        <span className="col-span-1 pl-3">No.</span>
        <span className="col-span-5">Proje</span>
        <span className="col-span-4">Kapsam</span>
        <span className="col-span-1">Yıl</span>
      </div>
      <ul className="border-t border-[#111] sm:border-t-0">
        {projects.map((p, i) => (
          <WorkRow key={p.id} project={p} index={i} />
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Method() {
  return (
    <section className="pt-28 sm:pt-40">
      <SectionHead id="yontem" no="03" title="Yöntem" aside="5 aşama" />
      <div className="mt-10 grid gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
        {METHOD.map((m, i) => (
          <Reveal
            key={m.title}
            delay={i * 0.07}
            className="border-l border-[#111] pr-6 pl-5"
          >
            <span className="font-editorial text-6xl leading-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-6 font-swiss text-[15px] font-semibold">
              {m.title}
            </h3>
            <p className="mt-2 font-swiss text-[14px] leading-relaxed text-[#4A4A4A]">
              {m.desc}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="pt-28 sm:pt-40">
      <SectionHead no="04" id="yetkinlik" title="Yetkinlikler" aside="Güncel yığın" />
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {CAPABILITIES.map((c, i) => (
          <Reveal key={c.group} delay={i * 0.06}>
            <h3 className="font-editorial text-3xl italic">{c.group}</h3>
            <ul className="mt-4 border-t border-[#111]/20 font-swiss text-[15px]">
              {c.items.map((item, j) => (
                <li
                  key={item}
                  className="flex justify-between border-b border-[#111]/20 py-2"
                >
                  {item}
                  <span className="font-plex text-[11px] text-[#6B6B6B]">
                    {i + 1}.{j + 1}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Writing({ posts }: { posts: CiddiPost[] }) {
  return (
    <section className="pt-28 sm:pt-40">
      <SectionHead
        id="yazilar"
        no="05"
        title="Yazılar"
        aside={`${posts.length} makale`}
      />
      <ul className="mt-6">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-[#111]/20">
            <Link
              href={`/ciddi/blog/${post.slug}`}
              className="group grid grid-cols-12 items-baseline gap-4 py-5"
            >
              <span className="col-span-12 font-plex text-[12px] text-[#6B6B6B] sm:col-span-2">
                {post.date}
              </span>
              <span className="col-span-10 font-editorial text-2xl leading-tight transition-colors group-hover:text-[#E5381F] sm:col-span-7 sm:text-3xl">
                {post.title}
              </span>
              <span className="hidden font-swiss text-[13px] text-[#6B6B6B] sm:col-span-2 sm:block">
                {post.tag} · {post.readingTime} dk
              </span>
              <span className="col-span-2 text-right font-swiss text-lg transition-transform group-hover:translate-x-1 sm:col-span-1">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/ciddi/blog"
        className="mt-6 inline-flex items-center gap-2 border-b border-[#111] pb-0.5 font-plex text-[12px] tracking-[0.06em] uppercase hover:border-[#E5381F] hover:text-[#E5381F]"
      >
        Tüm yazılar ve arşiv →
      </Link>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Contact() {
  return (
    <section className="pt-28 pb-10 sm:pt-40">
      <SectionHead id="iletisim" no="06" title="İletişim" aside="Yanıt: 24 saat" />
      <Reveal className="mt-10">
        <p className="font-swiss text-[15px] text-[#6B6B6B]">
          Bir proje, bir pozisyon ya da sadece bir soru için:
        </p>
        <a
          href={`mailto:${SITE.email}`}
          className="group mt-3 inline-block font-editorial text-[clamp(2.2rem,7.2vw,7.5rem)] leading-none tracking-[-0.02em] break-all sm:break-normal"
        >
          {SITE.email}
          <span className="block h-[2px] origin-left scale-x-0 bg-[#E5381F] transition-transform duration-500 group-hover:scale-x-100" />
        </a>
      </Reveal>

      <div className="mt-16 grid grid-cols-2 gap-y-6 border-t border-[#111] pt-6 font-swiss text-[14px] sm:grid-cols-4">
        <div>
          <p className="font-plex text-[11px] tracking-[0.08em] text-[#6B6B6B] uppercase">
            Konum
          </p>
          <p className="mt-2">{SITE.location}, GMT+3</p>
        </div>
        <div>
          <p className="font-plex text-[11px] tracking-[0.08em] text-[#6B6B6B] uppercase">
            Çalışma şekli
          </p>
          <p className="mt-2">Tam zamanlı · Danışmanlık</p>
        </div>
        <div className="col-span-2">
          <p className="font-plex text-[11px] tracking-[0.08em] text-[#6B6B6B] uppercase">
            Ağlar
          </p>
          <p className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
            {SITE.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="border-b border-[#111]/30 hover:border-[#111]"
              >
                {s.label}
              </a>
            ))}
          </p>
        </div>
      </div>

      <footer className="mt-24 flex flex-col justify-between gap-2 border-t border-[#111]/20 pt-4 font-plex text-[11px] tracking-[0.06em] text-[#6B6B6B] uppercase sm:flex-row print:hidden">
        <span>
          © {new Date().getFullYear()} {SITE.name}
        </span>
        <Link href="/" className="hover:text-[#111]">
          Bu sayfa ciddi modda görüntüleniyor · modu değiştir
        </Link>
        <a href="#ust" className="hover:text-[#111]">
          Başa dön ↑
        </a>
      </footer>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function CiddiExperience({
  projects,
  posts,
}: {
  projects: Project[];
  posts: CiddiPost[];
}) {
  return (
    <div className="min-h-screen bg-[#F4F2EE] text-[#111] antialiased">
      <Header />
      <main className="mx-auto max-w-[1400px] px-5 sm:px-10">
        <Hero />
        <Profile />
        <Work projects={projects} />
        <Method />
        <Capabilities />
        <Writing posts={posts} />
        <Contact />
      </main>
    </div>
  );
}
