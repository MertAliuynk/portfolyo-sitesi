"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { beep } from "~/lib/beep";
import { GameShell } from "./GameShell";

const SPAWN_RADIUS = 15;
const CENTER_RADIUS = 1.3;
const PROJECTILE_SPEED = 24;
const ASTEROID_POOL = 26;
const PROJECTILE_POOL = 24;

interface Asteroid {
  id: number;
  angle: number;
  radius: number;
  speed: number;
}

interface Projectile {
  id: number;
  angle: number;
  radius: number;
}

function polar(angle: number, radius: number): [number, number] {
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function Scene({
  playingRef,
  angleRef,
  asteroidsRef,
  projectilesRef,
  onLoseLife,
  onScore,
}: {
  playingRef: React.MutableRefObject<boolean>;
  angleRef: React.MutableRefObject<number>;
  asteroidsRef: React.MutableRefObject<Asteroid[]>;
  projectilesRef: React.MutableRefObject<Projectile[]>;
  onLoseLife: () => void;
  onScore: (n: number) => void;
}) {
  const turretRef = useRef<THREE.Group>(null);
  const asteroidPoolRef = useRef<THREE.Group>(null);
  const projectilePoolRef = useRef<THREE.Group>(null);
  const nextAsteroidId = useRef(0);
  const spawnTimer = useRef(1);
  const asteroidSpeed = useRef(2.6);
  const scoreRef = useRef(0);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);

    if (turretRef.current) {
      turretRef.current.rotation.y = Math.PI / 2 - angleRef.current;
    }

    if (!playingRef.current) return;

    asteroidSpeed.current = Math.min(asteroidSpeed.current + delta * 0.02, 6);

    spawnTimer.current -= delta;
    if (spawnTimer.current <= 0) {
      spawnTimer.current = THREE.MathUtils.randFloat(0.5, 1.0);
      asteroidsRef.current.push({
        id: nextAsteroidId.current++,
        angle: Math.random() * Math.PI * 2,
        radius: SPAWN_RADIUS,
        speed: asteroidSpeed.current * THREE.MathUtils.randFloat(0.85, 1.2),
      });
    }

    for (const p of projectilesRef.current) {
      p.radius += PROJECTILE_SPEED * delta;
    }
    projectilesRef.current = projectilesRef.current.filter(
      (p) => p.radius < SPAWN_RADIUS + 2,
    );

    for (const a of asteroidsRef.current) {
      a.radius -= a.speed * delta;
    }

    const survivors: Asteroid[] = [];
    for (const a of asteroidsRef.current) {
      if (a.radius <= CENTER_RADIUS) {
        onLoseLife();
        continue;
      }
      survivors.push(a);
    }
    asteroidsRef.current = survivors;

    const remainingAsteroids: Asteroid[] = [];
    for (const a of asteroidsRef.current) {
      const [ax, az] = polar(a.angle, a.radius);
      let hit = false;
      for (const p of projectilesRef.current) {
        const [px, pz] = polar(p.angle, p.radius);
        if (Math.hypot(ax - px, az - pz) < 1) {
          hit = true;
          p.radius = SPAWN_RADIUS + 99;
          break;
        }
      }
      if (hit) {
        scoreRef.current += 1;
        onScore(scoreRef.current);
        beep(660, 0.08);
      } else {
        remainingAsteroids.push(a);
      }
    }
    asteroidsRef.current = remainingAsteroids;
    projectilesRef.current = projectilesRef.current.filter(
      (p) => p.radius < SPAWN_RADIUS + 2,
    );

    if (asteroidPoolRef.current) {
      asteroidPoolRef.current.children.forEach((child, i) => {
        const a = asteroidsRef.current[i];
        if (a) {
          child.visible = true;
          const [x, z] = polar(a.angle, a.radius);
          child.position.set(x, 0.5, z);
        } else {
          child.visible = false;
        }
      });
    }

    if (projectilePoolRef.current) {
      projectilePoolRef.current.children.forEach((child, i) => {
        const p = projectilesRef.current[i];
        if (p) {
          child.visible = true;
          const [x, z] = polar(p.angle, p.radius);
          child.position.set(x, 0.5, z);
        } else {
          child.visible = false;
        }
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 10, 0]} intensity={60} color="#22d3ee" />

      <gridHelper args={[40, 40, "#7c3aed", "#241c3f"]} />
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[SPAWN_RADIUS + 2, 48]} />
        <meshBasicMaterial color="#05040d" />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[CENTER_RADIUS - 0.05, CENTER_RADIUS, 48]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>

      <group ref={turretRef}>
        <mesh>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.9]}>
          <boxGeometry args={[0.25, 0.25, 1.4]} />
          <meshStandardMaterial color="#f6f3ff" emissive="#f6f3ff" emissiveIntensity={0.3} />
        </mesh>
      </group>

      <group ref={asteroidPoolRef}>
        {Array.from({ length: ASTEROID_POOL }).map((_, i) => (
          <mesh key={i} visible={false}>
            <dodecahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial color="#fb923c" emissive="#fb923c" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>

      <group ref={projectilePoolRef}>
        {Array.from({ length: PROJECTILE_POOL }).map((_, i) => (
          <mesh key={i} visible={false}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.9} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export function OrbitSmash() {
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [roundKey, setRoundKey] = useState(0);

  const playingRef = useRef(false);
  const angleRef = useRef(0);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const nextProjectileId = useRef(0);
  const livesRef = useRef(3);

  const handleLoseLife = useCallback(() => {
    if (!playingRef.current) return;
    livesRef.current -= 1;
    beep(140, 0.25);
    setLives(livesRef.current);
    if (livesRef.current <= 0) {
      playingRef.current = false;
      setPhase("over");
      setBest((b) => Math.max(b, score));
    }
  }, [score]);

  const handleScore = useCallback((n: number) => {
    setScore(n);
  }, []);

  const fire = useCallback(() => {
    if (!playingRef.current) return;
    projectilesRef.current.push({
      id: nextProjectileId.current++,
      angle: angleRef.current,
      radius: CENTER_RADIUS + 0.3,
    });
    beep(880, 0.05);
  }, []);

  const start = useCallback(() => {
    asteroidsRef.current = [];
    projectilesRef.current = [];
    livesRef.current = 3;
    playingRef.current = true;
    setScore(0);
    setLives(3);
    setRoundKey((k) => k + 1);
    setPhase("playing");
  }, []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      angleRef.current = Math.atan2(e.clientY - cy, e.clientX - cx);
    }
    function onDown(e: MouseEvent | KeyboardEvent) {
      if ("key" in e && e.key !== " ") return;
      if (phase !== "playing") {
        start();
        return;
      }
      fire();
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onDown);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onDown);
    };
  }, [phase, fire, start]);

  return (
    <GameShell title="Orbit Smash">
      <Canvas
        key={roundKey}
        dpr={[1, 1.5]}
        camera={{ position: [0, 22, 0], rotation: [-Math.PI / 2, 0, 0], fov: 50 }}
      >
        <Scene
          playingRef={playingRef}
          angleRef={angleRef}
          asteroidsRef={asteroidsRef}
          projectilesRef={projectilesRef}
          onLoseLife={handleLoseLife}
          onScore={handleScore}
        />
      </Canvas>

      <div className="pointer-events-none absolute top-4 right-4 z-30 text-right">
        <p className="font-display text-3xl font-bold text-paper">{score}</p>
        <p className="text-xs text-paper/40">
          {"❤".repeat(lives)}
          {"♡".repeat(Math.max(0, 3 - lives))}
        </p>
      </div>

      {phase !== "playing" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-ink/70 px-6 text-center backdrop-blur-sm">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {phase === "idle" ? "Orbit Smash" : "Merkez düştü."}
          </h2>
          {phase === "over" && (
            <p className="text-paper/60">
              Skor: <span className="text-gradient font-semibold">{score}</span>{" "}
              <span className="text-paper/40">(en iyi: {best})</span>
            </p>
          )}
          <p className="max-w-xs text-sm text-paper/50">
            Nişan almak için fareyi hareket ettir, ateş etmek için tıkla ya da
            boşluğa bas.
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
