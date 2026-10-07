"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */

export function IstanbulClock() {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Europe/Istanbul",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="tabular-nums">{time}</span>;
}

export function Rule({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: EASE }}
      className={cn("h-px origin-left bg-[#111]", className)}
    />
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({
  no,
  title,
  aside,
  id,
}: {
  no: string;
  title: string;
  aside?: string;
  id: string;
}) {
  return (
    <div id={id} className="scroll-mt-20">
      <Rule />
      <div className="grid grid-cols-12 gap-4 pt-3 font-plex text-[11px] tracking-[0.08em] uppercase">
        <span className="col-span-3 sm:col-span-2">§ {no}</span>
        <span className="col-span-6 sm:col-span-7">{title}</span>
        <span className="col-span-3 text-right text-[#6B6B6B]">{aside}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Header() {
  const links = [
    ["Profil", "/ciddi#profil"],
    ["İşler", "/ciddi#isler"],
    ["Yöntem", "/ciddi#yontem"],
    ["Yazılar", "/ciddi/blog"],
    ["Laboratuvar", "/ciddi/oyunlar"],
    ["İletişim", "/ciddi#iletisim"],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#111] bg-[#F4F2EE]/92 backdrop-blur-sm print:hidden">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 items-center gap-4 px-5 py-3 font-swiss text-[13px] sm:grid-cols-12 sm:px-10">
        <Link href="/ciddi" className="font-semibold sm:col-span-3">
          {SITE.name}
        </Link>
        <span className="hidden font-plex text-[12px] text-[#6B6B6B] sm:col-span-3 sm:block">
          İstanbul · <IstanbulClock /> GMT+3
        </span>
        <nav className="hidden gap-5 sm:col-span-5 lg:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href!}
              className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#111] after:transition-transform after:duration-300 hover:after:scale-x-100"
            >
              {label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="justify-self-end font-plex text-[12px] sm:col-span-6 lg:col-span-1"
        >
          Mod: Ciddi <span className="text-[#E5381F]">↺</span>
        </Link>
      </div>
      {/* below lg the links move to a scrollable second row */}
      <nav className="flex gap-5 overflow-x-auto border-t border-[#111]/15 px-5 py-2 font-swiss text-[13px] whitespace-nowrap sm:px-10 lg:hidden">
        {links.map(([label, href]) => (
          <Link key={href} href={href!} className="shrink-0 text-[#4A4A4A] hover:text-[#111]">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
