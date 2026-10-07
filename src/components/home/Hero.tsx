"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { SecretOrb } from "~/components/effects/SecretOrb";
import { HeroScene } from "~/components/three/HeroScene";
import { SITE } from "~/lib/site";

const dots = [
  { top: "18%", left: "10%", size: "h-2 w-2", color: "bg-magenta/60", delay: 0 },
  { top: "30%", left: "85%", size: "h-3 w-3", color: "bg-cyan/50", delay: 1.2 },
  { top: "68%", left: "18%", size: "h-1.5 w-1.5", color: "bg-yellow/60", delay: 0.6 },
  { top: "78%", left: "68%", size: "h-2.5 w-2.5", color: "bg-violet/60", delay: 2 },
  { top: "48%", left: "6%", size: "h-1.5 w-1.5", color: "bg-orange/50", delay: 1.6 },
  { top: "14%", left: "58%", size: "h-2 w-2", color: "bg-magenta/40", delay: 0.4 },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <HeroScene />
      </div>

      {dots.map((dot, i) => (
        <span
          key={i}
          style={{
            top: dot.top,
            left: dot.left,
            animationDelay: `${dot.delay}s`,
          }}
          className={`animate-float absolute rounded-full blur-[1px] ${dot.size} ${dot.color}`}
        />
      ))}

      {/* disguised as one more decorative dot — the actual secret */}
      <SecretOrb className="top-[40%] left-[80%] sm:left-[76%]" />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="font-display pointer-events-none relative text-sm tracking-[0.3em] text-paper/50 uppercase"
      >
        {SITE.role}
      </motion.p>

      <h1 className="font-display pointer-events-none relative mt-4 text-4xl leading-[1.1] font-bold sm:text-6xl md:text-7xl">
        {SITE.heroLines.map((line, i) => (
          <motion.span
            key={line}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.15 + i * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={
              i === SITE.heroLines.length - 1 ? "text-gradient block" : "block"
            }
          >
            {line}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.6 }}
        className="pointer-events-none relative mt-6 max-w-md text-balance text-paper/60"
      >
        {SITE.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-paper/40"
      >
        <span className="text-xs tracking-widest uppercase">kaydır</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}
