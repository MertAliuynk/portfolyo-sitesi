"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Link from "next/link";

import { SITE } from "~/lib/site";

const lines = [
  "> whoami",
  `${SITE.name} — ${SITE.role}`,
  "> ls sırlar/",
  "bul_beni.exe   kod_gir.sh   sabırlı_ol.md",
  "> cat iletisim.txt",
];

export function SecretTerminal() {
  return (
    <footer className="relative mx-auto max-w-3xl px-6 pt-10 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="glass-panel overflow-hidden rounded-2xl"
      >
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-magenta/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-cyan/70" />
          <span className="ml-3 font-mono text-xs text-paper/40">
            mert@portfolio: ~
          </span>
        </div>
        <div className="space-y-1.5 p-6 font-mono text-sm text-paper/70">
          {lines.map((line, i) => (
            <motion.p
              key={line}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={line.startsWith(">") ? "text-cyan" : ""}
            >
              {line}
            </motion.p>
          ))}
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a
              href={`mailto:${SITE.email}`}
              className="hover:text-gradient inline-flex items-center gap-1.5 text-paper"
            >
              <Mail className="h-3.5 w-3.5" /> {SITE.email}
            </a>
            <span className="animate-blink text-paper/50">_</span>
          </p>
          <div className="mt-4 flex flex-wrap gap-4 border-t border-white/5 pt-4">
            {SITE.socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-paper/50 hover:text-paper"
              >
                {s.label}
              </a>
            ))}
            <Link href="/blog" className="text-paper/50 hover:text-paper">
              Blog yazılarım →
            </Link>
          </div>
        </div>
      </motion.div>
      <p className="mt-6 text-center text-xs text-paper/25">
        © {new Date().getFullYear()} {SITE.name}. Bu site kaydırınca değişir,
        tıklanınca konuşur.
      </p>
    </footer>
  );
}
