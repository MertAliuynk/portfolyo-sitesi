"use client";

import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

export function MoodChip() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.6 }}
      className="fixed top-6 left-6 z-40"
    >
      <Link
        href="/"
        className="glass-panel group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-paper/60 transition hover:text-paper"
      >
        <RotateCcw className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-rotate-180" />
        mod: meraklı
      </Link>
    </motion.div>
  );
}
