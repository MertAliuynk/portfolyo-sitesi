"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { usePortalStore } from "~/stores/portal-store";

export function PortalTransition() {
  const active = usePortalStore((s) => s.active);
  const href = usePortalStore((s) => s.href);
  const message = usePortalStore((s) => s.message);
  const reset = usePortalStore((s) => s.reset);
  const router = useRouter();

  useEffect(() => {
    if (!active || !href) return;

    const pushTimer = setTimeout(() => {
      router.push(href);
    }, 850);
    const resetTimer = setTimeout(() => {
      reset();
    }, 1650);

    return () => {
      clearTimeout(pushTimer);
      clearTimeout(resetTimer);
    };
  }, [active, href, router, reset]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink"
          initial={{ clipPath: "circle(0% at 50% 50%)" }}
          animate={{ clipPath: "circle(150% at 50% 50%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-magenta/30 via-violet/20 to-cyan/30" />
          <motion.div
            aria-hidden
            className="absolute h-[40rem] w-[40rem] rounded-full border border-white/10"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="relative px-6 text-center font-display text-lg font-medium text-paper sm:text-2xl"
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
