"use client";

import { motion } from "framer-motion";

/**
 * A quiet "are you still there?" prompt that catches the eye mid-scroll,
 * placed between major sections to keep the page teasing forward motion.
 */
export function ScrollTeaser({ message }: { message: string }) {
  return (
    <div className="relative flex h-[26vh] items-center justify-center px-6 sm:h-[32vh]">
      <motion.p
        initial={{ opacity: 0, y: 14, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: "-35% 0px -35% 0px" }}
        transition={{ duration: 0.5 }}
        className="font-display text-center text-lg text-paper/30 sm:text-xl"
      >
        {message}
      </motion.p>
    </div>
  );
}
