"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { SECRET_ORB_CLICKS } from "~/lib/site";
import { cn } from "~/lib/utils";
import { usePortalStore } from "~/stores/portal-store";

/**
 * Disguised as decoration among the hero's floating dots. Needs several
 * clicks before it reveals itself to be a portal into /playground.
 */
export function SecretOrb({ className }: { className?: string }) {
  const [clicks, setClicks] = useState(0);
  const trigger = usePortalStore((s) => s.trigger);

  function handleClick() {
    const next = clicks + 1;
    if (next >= SECRET_ORB_CLICKS) {
      trigger("/playground", "Bir şey buldun. Oyun alanına ışınlanıyorsun 🎮");
      setClicks(0);
      return;
    }
    setClicks(next);
  }

  const showHint = clicks >= SECRET_ORB_CLICKS - 2 && clicks > 0;

  return (
    <button
      type="button"
      aria-label="?"
      onClick={handleClick}
      className={cn(
        "group absolute z-20 grid h-6 w-6 cursor-default place-items-center",
        className,
      )}
    >
      <motion.span
        animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute h-3 w-3 rounded-full bg-gradient-to-br from-yellow via-orange to-magenta blur-[2px] transition-transform duration-300",
          clicks > 0 && "scale-125",
        )}
      />
      <span className="relative h-1.5 w-1.5 rounded-full bg-paper/70 transition group-hover:bg-paper" />
      <AnimatePresence>
        {showHint && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute top-6 left-1/2 w-max -translate-x-1/2 text-[10px] tracking-wide text-paper/40"
          >
            neredeyse...
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
