"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import { GravityDrop } from "~/components/effects/GravityDrop";
import { SITE } from "~/lib/site";

const PANEL_COUNT = 4;
const FACT_ROTATIONS = [-6, 4, -3, 7, -5, 3];

export function HorizontalFun() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0vw", `-${(PANEL_COUNT - 1) * 100}vw`],
  );

  return (
    <section ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ x }} className="flex h-full">
          <Panel className="bg-gradient-to-br from-violet/20 via-transparent to-transparent">
            <p className="font-display text-xs tracking-[0.3em] text-paper/40 uppercase">
              Uyarı
            </p>
            <h2 className="font-display mt-4 max-w-lg text-3xl font-bold sm:text-5xl">
              Buradan sonrası{" "}
              <span className="text-gradient-warm">biraz farklı ama harika.</span>
            </h2>
            <p className="mt-6 text-sm text-paper/40">
              (yön birazdan değişecek — bu bir hata değil)
            </p>
          </Panel>

          <Panel>
            <h3 className="font-display mb-8 text-2xl font-bold sm:text-3xl">
              Rastgele gerçekler
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {SITE.funFacts.map((fact, i) => (
                <GravityDrop
                  key={fact.label}
                  index={i}
                  rotate={FACT_ROTATIONS[i % FACT_ROTATIONS.length]}
                  className="glass-panel rounded-2xl p-4 text-left"
                >
                  <span className="text-2xl">{fact.emoji}</span>
                  <p className="mt-3 text-xs text-paper/40">{fact.label}</p>
                  <p className="mt-1 font-medium text-paper">{fact.value}</p>
                </GravityDrop>
              ))}
            </div>
          </Panel>

          <Panel>
            <h3 className="font-display mb-8 text-2xl font-bold sm:text-3xl">
              Nasıl çalışırım
            </h3>
            <div className="flex flex-col gap-3">
              {SITE.workflow.map((item) => (
                <div
                  key={item.step}
                  className="glass-panel flex items-start gap-4 rounded-2xl p-4 text-left"
                >
                  <span className="text-gradient font-display text-2xl font-bold">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-semibold text-paper">{item.title}</p>
                    <p className="text-sm text-paper/50">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="bg-gradient-to-br from-magenta/10 via-transparent to-cyan/10">
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl"
            >
              👀
            </motion.span>
            <h3 className="font-display mt-6 max-w-md text-3xl font-bold sm:text-4xl">
              Az sonra <span className="text-gradient">bir şey</span> çıkacak
              karşına.
            </h3>
            <p className="mt-4 max-w-sm text-paper/50">
              Kaydırmaya devam et. Neredeyse oradasın.
            </p>
          </Panel>
        </motion.div>
      </div>
    </section>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-full w-screen shrink-0 flex-col items-center justify-center px-6 text-center sm:px-16 ${className}`}
    >
      {children}
    </div>
  );
}
