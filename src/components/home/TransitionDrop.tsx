"use client";

import { motion } from "framer-motion";

import { GravityDrop } from "~/components/effects/GravityDrop";

const LINE_1 = ["Buraya", "kadar", "ciddiydik."];
const LINE_2 = ["Şimdi", "eğlence", "başlıyor."];

export function TransitionDrop() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center gap-3 overflow-hidden px-6 text-center">
      <div className="font-display flex flex-wrap justify-center gap-x-3 text-3xl font-bold text-paper/35 line-through decoration-2 sm:text-5xl">
        {LINE_1.map((word, i) => (
          <GravityDrop key={word} index={i}>
            {word}
          </GravityDrop>
        ))}
      </div>

      <div className="font-display mt-2 flex flex-wrap justify-center gap-x-4 text-4xl font-bold sm:text-6xl">
        {LINE_2.map((word, i) => (
          <GravityDrop
            key={word}
            index={LINE_1.length + i}
            rotate={i % 2 === 0 ? -3 : 3}
            className="text-gradient-warm"
          >
            {word}
          </GravityDrop>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="mt-8 text-sm text-paper/40"
      >
        (aşağı inmeye devam et, cidden.)
      </motion.p>
    </section>
  );
}
