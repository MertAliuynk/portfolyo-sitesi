"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** The little car parked below the mood list. Side view, drawn in SVG. */
function ToyCar({ lights }: { lights: boolean }) {
  return (
    <svg viewBox="0 0 220 110" className="h-auto w-44 sm:w-56" aria-hidden>
      {lights && (
        <path d="M205 62 L330 40 L330 92 Z" fill="#fff3b0" opacity="0.35" />
      )}
      <ellipse cx="108" cy="98" rx="92" ry="7" fill="#000" opacity="0.35" />
      <path
        d="M18 78 Q14 58 34 54 L66 50 Q82 26 112 24 L146 24 Q166 26 180 48 L200 54 Q212 58 210 78 Z"
        fill="#FF5A36"
        stroke="#1A1A1A"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M78 50 Q90 32 112 31 L124 31 L124 50 Z"
        fill="#2b3a4a"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M132 31 L146 31 Q160 33 170 50 L132 50 Z"
        fill="#2b3a4a"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect
        x="100"
        y="16"
        width="34"
        height="9"
        rx="3"
        fill="#FFC93C"
        stroke="#1A1A1A"
        strokeWidth="4"
      />
      <rect
        x="198"
        y="58"
        width="10"
        height="8"
        rx="2"
        fill={lights ? "#fff1a0" : "#e6d9a8"}
      />
      <rect x="16" y="60" width="8" height="8" rx="2" fill="#b3001b" />
      {[58, 164].map((cx) => (
        <g key={cx}>
          <circle
            cx={cx}
            cy="80"
            r="17"
            fill="#1f1d1b"
            stroke="#1A1A1A"
            strokeWidth="4"
          />
          <circle cx={cx} cy="80" r="7" fill="#FFF1D6" />
        </g>
      ))}
    </svg>
  );
}

/**
 * A secret below the mood gate: scroll past the list and there is a road
 * with a parked car. Turning the key drives you into /yolculuk.
 */
export function SecretRoad() {
  const router = useRouter();
  const [ignition, setIgnition] = useState(false);

  useEffect(() => {
    router.prefetch("/yolculuk");
  }, [router]);

  function go() {
    if (ignition) return;
    setIgnition(true);
    setTimeout(() => router.push("/yolculuk"), 1300);
  }

  return (
    <section
      aria-label="Gizli yol"
      className="relative overflow-hidden bg-[#151412] px-5 pt-24 pb-28 text-[#EDE9E1] sm:px-10"
    >
      <p className="font-swiss max-w-md text-[13px] opacity-35">
        Buraya kadar indiysen merakın bitmemiş demektir.
      </p>

      <div className="relative mt-16">
        {/* asphalt with a dashed centre line */}
        <div className="absolute inset-x-[-10%] top-1/2 h-36 -translate-y-1/2 bg-[#1f1d1b]">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-[repeating-linear-gradient(90deg,#FFC93C_0_40px,transparent_40px_80px)] opacity-60" />
        </div>

        <div className="relative flex flex-col items-start gap-8 py-6 sm:flex-row sm:items-center">
          <motion.button
            type="button"
            onClick={go}
            aria-label="Arabaya bin"
            animate={
              ignition
                ? {
                    x: [0, -6, 1400],
                    transition: {
                      duration: 1.3,
                      times: [0, 0.2, 1],
                      ease: "easeIn",
                    },
                  }
                : {
                    y: [0, -2, 0],
                    transition: {
                      duration: 0.35,
                      repeat: Infinity,
                      repeatDelay: 2.5,
                    },
                  }
            }
            whileHover={ignition ? undefined : { rotate: -2 }}
            className="relative z-10 cursor-pointer"
          >
            <ToyCar lights={ignition} />
          </motion.button>

          <div className="relative z-10">
            <p className="font-hand text-2xl text-[#FFC93C] sm:text-3xl">
              psst… yürümek yerine sürmek ister misin?
            </p>
            <button
              type="button"
              onClick={go}
              className="font-swiss mt-3 rounded-xl border-2 border-[#EDE9E1]/30 px-4 py-2 text-[14px] transition hover:border-[#FFC93C] hover:text-[#FFC93C]"
            >
              Kontağı çevir →
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {ignition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="fixed inset-0 z-50 grid place-items-center bg-[#ffe3bf]"
          >
            <p className="font-pop text-3xl font-extrabold text-[#1A1A1A] sm:text-5xl">
              Vroom…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
