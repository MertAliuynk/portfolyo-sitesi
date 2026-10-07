"use client";

import { motion } from "framer-motion";

import { SITE } from "~/lib/site";

export function SeriousIntro() {
  return (
    <section className="relative mx-auto max-w-3xl px-6 py-32 sm:py-44">
      <div className="flex flex-col gap-10">
        {SITE.manifesto.map((paragraph, i) => (
          <motion.p
            key={paragraph.slice(0, 12)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.7, delay: i * 0.05 }}
            className="text-xl leading-relaxed text-paper/70 sm:text-2xl"
          >
            {paragraph}
          </motion.p>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="text-gradient font-display mt-16 text-3xl font-bold sm:text-4xl"
      >
        &ldquo;{SITE.pullQuote}&rdquo;
      </motion.p>
    </section>
  );
}
