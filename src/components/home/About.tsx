"use client";

import { motion } from "framer-motion";

import { SkillMarquee } from "~/components/ui/SkillMarquee";
import { StatCounter } from "~/components/ui/StatCounter";
import { SITE } from "~/lib/site";

export function About() {
  return (
    <section className="relative mx-auto max-w-4xl px-6 py-28 sm:py-36">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="font-display text-3xl font-bold sm:text-4xl"
      >
        Kısaca <span className="text-gradient">ben</span>.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-6 max-w-2xl text-lg leading-relaxed text-paper/70"
      >
        {SITE.bio}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4"
      >
        {SITE.stats.map((stat) => (
          <StatCounter key={stat.label} {...stat} />
        ))}
      </motion.div>

      <div className="mt-16">
        <SkillMarquee skills={SITE.skills} />
      </div>
    </section>
  );
}
