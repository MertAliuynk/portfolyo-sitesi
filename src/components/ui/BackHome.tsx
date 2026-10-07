"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { readStoredMood } from "~/lib/moods";

export function BackHome({ label = "Ana sayfa" }: { label?: string }) {
  // go back to whichever mood the visitor picked, not the gate
  const [href, setHref] = useState("/");

  useEffect(() => {
    const mood = readStoredMood();
    if (mood) setHref(`/${mood}`);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-6 left-6 z-40"
    >
      <Link
        href={href}
        className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-paper/70 transition hover:text-paper"
      >
        <ArrowLeft className="h-4 w-4" /> {label}
      </Link>
    </motion.div>
  );
}
