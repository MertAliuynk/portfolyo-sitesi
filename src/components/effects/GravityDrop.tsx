"use client";

import { motion } from "framer-motion";

/**
 * Wraps its child so it falls into place from above with a bouncy,
 * gravity-like spring instead of a plain fade — the site's recurring
 * "things physically land" motif.
 */
export function GravityDrop({
  children,
  index = 0,
  rotate = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  rotate?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ y: -260, opacity: 0, rotate: rotate * 2.4 }}
      whileInView={{ y: 0, opacity: 1, rotate }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        type: "spring",
        bounce: 0.55,
        duration: 1,
        delay: index * 0.09,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
