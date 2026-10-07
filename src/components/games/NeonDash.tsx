"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { beep } from "~/lib/beep";
import { GameShell } from "./GameShell";

const LANES = [-2.2, 0, 2.2];
const SPAWN_Z = -70;
const CATCH_Z = 6;
const POOL_SIZE = 30;

interface Obstacle {
  id: number;
  lane: number;
  z: number;
  passed: boolean;
}

function Scene({
  playingRef,
  laneRef,
  onGameOver,
  onScore,
}: {
  playingRef: React.MutableRefObject<boolean>;
  laneRef: React.MutableRefObject<number>;
  onGameOver: () => void;
  onScore: (n: number) => void;
}) {
  const playerRef = useRef<THREE.Mesh>(null);
  const poolRef = useRef<THREE.Group>(null);
  const obstacles = useRef<Obstacle[]>([]);
  const nextId = useRef(0);
  const spawnTimer = useRef(0.6);
  const speed = useRef(22);
  const scoreRef = useRef(0);

  useFrame((_, rawDelta) => {
    if (!playingRef.current) return;
    const delta = Math.min(rawDelta, 0.05);

    speed.current = Math.min(speed.current + delta * 0.55, 48);

    if (playerRef.current) {
      const targetX = LANES[laneRef.current] ?? 0;
      playerRef.current.position.x = THREE.MathUtils.damp(
        playerRef.current.position.x,
        targetX,
        14,
        delta,
      );
    }

    spawnTimer.current -= delta;
    if (spawnTimer.current <= 0) {
      spawnTimer.current = THREE.MathUtils.randFloat(0.5, 0.85);
      obstacles.current.push({
        id: nextId.current++,
        lane: Math.floor(Math.random() * 3),
        z: SPAWN_Z,
        passed: false,
      });
    }

    for (const ob of obstacles.current) {
      ob.z += speed.current * delta;

      if (
        !ob.passed &&
        ob.z > CATCH_Z - 1.5 &&
        ob.z < CATCH_Z + 0.7 &&
        ob.lane === laneRef.current
      ) {
        playingRef.current = false;
        onGameOver();
      }

      if (!ob.passed && ob.z > CATCH_Z + 1) {
        ob.passed = true;
        scoreRef.current += 1;
        onScore(scoreRef.current);
      }
    }

    obstacles.current = obstacles.current.filter((o) => o.z < CATCH_Z + 10);

    if (poolRef.current) {
      poolRef.current.children.forEach((child, i) => {
        const ob = obstacles.current[i];
        if (ob) {
          child.visible = true;
          child.position.set(LANES[ob.lane] ?? 0, 0.5, ob.z);
        } else {
          child.visible = false;
        }
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 6, CATCH_Z + 4]} intensity={45} color="#ff2fd0" />
      <pointLight position={[0, 6, -25]} intensity={35} color="#22d3ee" />

      <gridHelper args={[400, 80, "#ff2fd0", "#241c3f"]} position={[0, -0.01, -100]} />
      <mesh position={[0, -0.02, -100]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 400]} />
        <meshBasicMaterial color="#05040d" />
      </mesh>

      <mesh ref={playerRef} position={[0, 0.5, CATCH_Z]}>
        <boxGeometry args={[0.9, 0.9, 0.9]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.7} />
      </mesh>

      <group ref={poolRef}>
        {Array.from({ length: POOL_SIZE }).map((_, i) => (
          <mesh key={i} visible={false}>
            <boxGeometry args={[0.9, 1.4, 0.9]} />
            <meshStandardMaterial color="#ff2fd0" emissive="#ff2fd0" emissiveIntensity={0.55} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export function NeonDash() {
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [roundKey, setRoundKey] = useState(0);

  const playingRef = useRef(false);
  const laneRef = useRef(1);

  const handleGameOver = useCallback(() => {
    beep(120, 0.3);
    setPhase("over");
    setBest((b) => Math.max(b, score));
  }, [score]);

  const handleScore = useCallback((n: number) => {
    setScore(n);
  }, []);

  const start = useCallback(() => {
    laneRef.current = 1;
    playingRef.current = true;
    setScore(0);
    setRoundKey((k) => k + 1);
    setPhase("playing");
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (phase !== "playing") {
        if (e.key === " " || e.key === "Enter") start();
        return;
      }
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        laneRef.current = Math.max(0, laneRef.current - 1);
      } else if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        laneRef.current = Math.min(2, laneRef.current + 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, start]);

  return (
    <GameShell title="Neon Dash">
      <Canvas
        key={roundKey}
        dpr={[1, 1.5]}
        camera={{ position: [0, 4.4, 13], rotation: [-0.3, 0, 0], fov: 58 }}
      >
        <Scene
          playingRef={playingRef}
          laneRef={laneRef}
          onGameOver={handleGameOver}
          onScore={handleScore}
        />
      </Canvas>

      <div className="pointer-events-none absolute top-4 right-4 z-30 text-right">
        <p className="font-display text-3xl font-bold text-paper">{score}</p>
        <p className="text-xs text-paper/40">en iyi: {best}</p>
      </div>

      {phase !== "playing" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-ink/70 px-6 text-center backdrop-blur-sm">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {phase === "idle" ? "Neon Dash" : "Çarptın."}
          </h2>
          {phase === "over" && (
            <p className="text-paper/60">
              Skor: <span className="text-gradient font-semibold">{score}</span>
            </p>
          )}
          <p className="max-w-xs text-sm text-paper/50">
            Şerit değiştirmek için ← → veya A D kullan. Engellerden kaç.
          </p>
          <button
            onClick={start}
            className="glass-panel rounded-full px-6 py-3 text-sm font-semibold text-paper transition hover:bg-white/10"
          >
            {phase === "idle" ? "Başla" : "Tekrar dene"}
          </button>
        </div>
      )}

      {/* mobile touch controls */}
      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-4 sm:hidden">
        <button
          onClick={() => (laneRef.current = Math.max(0, laneRef.current - 1))}
          className="glass-panel h-14 w-14 rounded-full text-xl"
        >
          ←
        </button>
        <button
          onClick={() => (laneRef.current = Math.min(2, laneRef.current + 1))}
          className="glass-panel h-14 w-14 rounded-full text-xl"
        >
          →
        </button>
      </div>
    </GameShell>
  );
}
