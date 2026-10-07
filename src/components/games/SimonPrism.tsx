"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { beep } from "~/lib/beep";
import { GameShell } from "./GameShell";

const PAD_COLORS = ["#ff2fd0", "#22d3ee", "#facc15", "#fb923c"];
const PAD_FREQS = [220, 294, 370, 440];
const PAD_ANGLES = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
const RADIUS = 3;

function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

function CenterCrystal() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.3;
    ref.current.rotation.y += delta * 0.45;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#f6f3ff" wireframe transparent opacity={0.5} />
    </mesh>
  );
}

function Pad({
  color,
  position,
  lit,
  onClick,
}: {
  color: string;
  position: [number, number, number];
  lit: boolean;
  onClick: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const target = lit ? 1.35 : 1;
    const next = THREE.MathUtils.damp(ref.current.scale.x, target, 10, delta);
    ref.current.scale.setScalar(next);
  });

  return (
    <mesh
      ref={ref}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <icosahedronGeometry args={[0.85, 0]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={lit ? 1.5 : 0.35}
      />
    </mesh>
  );
}

function Scene({
  activePad,
  onPadClick,
}: {
  activePad: number | null;
  onPadClick: (i: number) => void;
}) {
  return (
    <>
      <CameraRig />
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 8, 4]} intensity={50} color="#ffffff" />

      <CenterCrystal />

      {PAD_ANGLES.map((angle, i) => (
        <Pad
          key={i}
          color={PAD_COLORS[i] ?? "#ffffff"}
          position={[Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS]}
          lit={activePad === i}
          onClick={() => onPadClick(i)}
        />
      ))}
    </>
  );
}

export function SimonPrism() {
  const [phase, setPhase] = useState<"idle" | "showing" | "input" | "over">(
    "idle",
  );
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [best, setBest] = useState(0);

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const playSequence = useCallback(
    (seq: number[]) => {
      clearTimers();
      setPhase("showing");
      setActivePad(null);

      seq.forEach((pad, i) => {
        const onTime = 650 * i + 200;
        const offTime = onTime + 380;

        timeouts.current.push(
          setTimeout(() => {
            setActivePad(pad);
            beep(PAD_FREQS[pad] ?? 300, 0.25);
          }, onTime),
        );
        timeouts.current.push(
          setTimeout(() => setActivePad(null), offTime),
        );
      });

      timeouts.current.push(
        setTimeout(
          () => {
            setPlayerStep(0);
            setPhase("input");
          },
          650 * seq.length + 250,
        ),
      );
    },
    [clearTimers],
  );

  const start = useCallback(() => {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    playSequence(first);
  }, [playSequence]);

  const handlePadClick = useCallback(
    (i: number) => {
      if (phase !== "input") return;

      beep(PAD_FREQS[i] ?? 300, 0.15);
      setActivePad(i);
      setTimeout(() => setActivePad(null), 180);

      if (sequence[playerStep] !== i) {
        clearTimers();
        beep(110, 0.35);
        setBest((b) => Math.max(b, sequence.length - 1));
        setPhase("over");
        return;
      }

      if (playerStep + 1 === sequence.length) {
        const next = [...sequence, Math.floor(Math.random() * 4)];
        timeouts.current.push(
          setTimeout(() => {
            setSequence(next);
            playSequence(next);
          }, 550),
        );
        setPhase("showing");
      } else {
        setPlayerStep((s) => s + 1);
      }
    },
    [phase, sequence, playerStep, playSequence, clearTimers],
  );

  const round = Math.max(0, sequence.length - 1);

  return (
    <GameShell title="Simon Prism">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 6, 7], fov: 50 }}>
        <Scene activePad={activePad} onPadClick={handlePadClick} />
      </Canvas>

      <div className="pointer-events-none absolute top-4 right-4 z-30 text-right">
        <p className="font-display text-3xl font-bold text-paper">{round}</p>
        <p className="text-xs text-paper/40">en iyi: {best}</p>
      </div>

      {phase === "showing" && (
        <p className="pointer-events-none absolute bottom-10 left-1/2 z-30 -translate-x-1/2 text-xs tracking-widest text-paper/40 uppercase">
          izle...
        </p>
      )}
      {phase === "input" && (
        <p className="pointer-events-none absolute bottom-10 left-1/2 z-30 -translate-x-1/2 text-xs tracking-widest text-cyan uppercase">
          sıra sende
        </p>
      )}

      {(phase === "idle" || phase === "over") && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-ink/70 px-6 text-center backdrop-blur-sm">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {phase === "idle" ? "Simon Prism" : "Sıra bozuldu."}
          </h2>
          {phase === "over" && (
            <p className="text-paper/60">
              Tur: <span className="text-gradient font-semibold">{round}</span>
            </p>
          )}
          <p className="max-w-xs text-sm text-paper/50">
            Işıklı yüzeylerin sırasını izle, sonra aynı sırayla tıkla.
          </p>
          <button
            onClick={start}
            className="glass-panel rounded-full px-6 py-3 text-sm font-semibold text-paper transition hover:bg-white/10"
          >
            {phase === "idle" ? "Başla" : "Tekrar dene"}
          </button>
        </div>
      )}
    </GameShell>
  );
}
