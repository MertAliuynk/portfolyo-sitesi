"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

export function CursorGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { damping: 30, stiffness: 200, mass: 0.5 });
  const sy = useSpring(y, { damping: 30, stiffness: 200, mass: 0.5 });

  useEffect(() => {
    function move(e: MouseEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
    }
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-0 hidden h-[36rem] w-[36rem] rounded-full opacity-25 blur-[120px] sm:block"
      style={{
        x: sx,
        y: sy,
        translateX: "-50%",
        translateY: "-50%",
        background:
          "radial-gradient(circle, var(--color-magenta), var(--color-violet) 45%, transparent 70%)",
      }}
    />
  );
}
