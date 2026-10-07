"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useRef } from "react";
import type * as THREE from "three";

import { usePortalStore } from "~/stores/portal-store";

function Ring() {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.3;
      ref.current.rotation.z += delta * 0.16;
    }
    if (matRef.current) {
      const hue = (state.clock.elapsedTime * 0.07) % 1;
      matRef.current.emissive.setHSL(hue, 0.85, 0.55);
    }
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[2.1, 0.28, 24, 100]} />
      <meshStandardMaterial
        ref={matRef}
        color="#0e0a1f"
        emissive="#ff2fd0"
        emissiveIntensity={1.5}
        roughness={0.3}
      />
    </mesh>
  );
}

export function GamePortalReveal() {
  const trigger = usePortalStore((s) => s.trigger);

  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="font-display text-xs tracking-[0.3em] text-paper/40 uppercase"
      >
        Bir şey buldun
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mt-6 h-64 w-64 sm:h-80 sm:w-80"
      >
        <Canvas
          className="pointer-events-none"
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 6], fov: 45 }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[3, 3, 3]} intensity={40} color="#22d3ee" />
          <Ring />
        </Canvas>

        <button
          type="button"
          onClick={() =>
            trigger(
              "/playground",
              "Portala hoş geldin. Oyunlara giriyorsun 🎮",
            )
          }
          aria-label="Gizli oyun alanına git"
          className="group absolute inset-0 grid place-items-center rounded-full"
        >
          <span className="glass-panel rounded-full px-5 py-2 text-sm font-semibold text-paper/80 opacity-0 transition group-hover:opacity-100">
            TIKLA
          </span>
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ delay: 0.2 }}
        className="mt-8 max-w-sm text-paper/50"
      >
        3 küçük oyun seni bekliyor, hepsi Three.js ile kuruldu. Tek tıkla gir.
      </motion.p>
    </section>
  );
}
