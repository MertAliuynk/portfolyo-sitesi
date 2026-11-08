"use client";

import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import {
  DRIVE_R,
  ISLAND_R,
  LIGHTHOUSE,
  PAL,
  PIER,
  PIER_DIR,
  PIER_FROM,
  PIER_HALF_W,
  PIER_TO,
  SEA_Y,
} from "~/components/yolculuk/layout";
import { seeded } from "~/components/yolculuk/world/parts";

/* ------------------------------------------------------------------ */
/* ground, beach, sea                                                   */
/* ------------------------------------------------------------------ */

function Ground() {
  const patches = useMemo(() => {
    const rand = seeded(11);
    return Array.from({ length: 40 }, () => {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * (ISLAND_R - 10);
      return { x: Math.sin(a) * r, z: Math.cos(a) * r, s: 3 + rand() * 7 };
    });
  }, []);

  return (
    <RigidBody type="fixed" colliders={false} friction={1}>
      <CylinderCollider args={[1, DRIVE_R + 2]} position={[0, -1, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[ISLAND_R, 96]} />
        <meshStandardMaterial color={PAL.grass} roughness={1} />
      </mesh>
      {patches.map((p, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[p.x, 0.005, p.z]}
          receiveShadow
        >
          <circleGeometry args={[p.s, 20]} />
          <meshStandardMaterial color={PAL.grassDark} roughness={1} />
        </mesh>
      ))}
      {/* sloping beach ring */}
      <mesh position={[0, SEA_Y / 2 - 0.05, 0]} receiveShadow>
        <cylinderGeometry
          args={[ISLAND_R + 0.02, ISLAND_R + 12, -SEA_Y + 0.1, 96, 1, true]}
        />
        <meshStandardMaterial
          color={PAL.sand}
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.002, 0]}
        receiveShadow
      >
        <ringGeometry args={[ISLAND_R - 6, ISLAND_R + 0.05, 96]} />
        <meshStandardMaterial color={PAL.sand} roughness={1} />
      </mesh>
    </RigidBody>
  );
}

function Sea() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: PAL.waterDeep,
      roughness: 0.25,
      metalness: 0.05,
      flatShading: true,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.vertexShader =
        "uniform float uTime;\n" +
        shader.vertexShader.replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          transformed.z += sin(position.x * 0.09 + uTime * 0.9) * 0.32
                         + cos(position.y * 0.07 + uTime * 0.7) * 0.32;`,
        );
    };
    return m;
  }, [uniforms]);

  useFrame((_, dt) => {
    uniforms.uTime.value += dt;
  });

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, SEA_Y - 0.25, 0]}
        material={material}
      >
        <planeGeometry args={[900, 900, 120, 120]} />
      </mesh>
      {/* turquoise shallows fading out */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA_Y + 0.12, 0]}>
        <ringGeometry args={[ISLAND_R + 4, ISLAND_R + 24, 96]} />
        <meshStandardMaterial
          color={PAL.waterShallow}
          transparent
          opacity={0.6}
          roughness={0.2}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA_Y + 0.1, 0]}>
        <ringGeometry args={[ISLAND_R + 24, ISLAND_R + 46, 96]} />
        <meshStandardMaterial
          color={PAL.waterShallow}
          transparent
          opacity={0.25}
          roughness={0.2}
        />
      </mesh>
      <Foam />
    </>
  );
}

function Foam() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const k = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.006;
    ref.current.scale.set(k, k, 1);
  });
  return (
    <mesh
      ref={ref}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, SEA_Y + 0.16, 0]}
    >
      <ringGeometry args={[ISLAND_R + 4, ISLAND_R + 5.2, 96]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
    </mesh>
  );
}

/** invisible wall along the shore, open where the pier starts */
function ShoreWall() {
  const walls = useMemo(() => {
    const out: { x: number; z: number; rot: number }[] = [];
    const n = 72;
    const seg = ((2 * Math.PI * (DRIVE_R + 1.5)) / n) * 0.55;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.sin(a) * (DRIVE_R + 1.5);
      const z = Math.cos(a) * (DRIVE_R + 1.5);
      const along = x * PIER_DIR.x + z * PIER_DIR.z;
      const across = -x * PIER_DIR.z + z * PIER_DIR.x;
      if (along > 0 && Math.abs(across) < PIER_HALF_W + 2) continue;
      out.push({ x, z, rot: a });
    }
    return { out, seg };
  }, []);
  return (
    <RigidBody type="fixed" colliders={false}>
      {walls.out.map((w, i) => (
        <CuboidCollider
          key={i}
          args={[walls.seg, 3, 0.6]}
          position={[w.x, 2, w.z]}
          rotation={[0, w.rot, 0]}
        />
      ))}
    </RigidBody>
  );
}

/* ------------------------------------------------------------------ */
/* shore decoration                                                     */
/* ------------------------------------------------------------------ */

function Palm({
  x,
  z,
  rot,
  s,
}: {
  x: number;
  z: number;
  rot: number;
  s: number;
}) {
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]} scale={s}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          position={[i * 0.12, 0.5 + i * 0.9, 0]}
          rotation={[0, 0, -0.08 * i]}
          castShadow
        >
          <cylinderGeometry args={[0.2 - i * 0.02, 0.24 - i * 0.02, 1, 7]} />
          <meshStandardMaterial
            color={i % 2 ? "#a8763f" : "#b9874e"}
            roughness={0.9}
          />
        </mesh>
      ))}
      <group position={[0.6, 4.6, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh
            key={i}
            rotation={[0, (i / 6) * Math.PI * 2, 0.55]}
            position={[
              Math.cos((i / 6) * Math.PI * 2) * 0.9,
              -0.2,
              -Math.sin((i / 6) * Math.PI * 2) * 0.9,
            ]}
            castShadow
          >
            <boxGeometry args={[2.2, 0.06, 0.55]} />
            <meshStandardMaterial
              color={i % 2 ? "#3fae6a" : "#52c27b"}
              roughness={0.8}
            />
          </mesh>
        ))}
        <mesh position={[0, -0.1, 0]}>
          <sphereGeometry args={[0.28, 8, 6]} />
          <meshStandardMaterial color="#7a4b2a" />
        </mesh>
      </group>
    </group>
  );
}

function Palms() {
  const palms = useMemo(() => {
    const rand = seeded(23);
    const out: { x: number; z: number; rot: number; s: number }[] = [];
    for (let i = 0; i < 34; i++) {
      const a = (i / 34) * Math.PI * 2 + rand() * 0.08;
      const r = ISLAND_R - 3 + rand() * 3;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      const along = x * PIER_DIR.x + z * PIER_DIR.z;
      const across = -x * PIER_DIR.z + z * PIER_DIR.x;
      if (along > 0 && Math.abs(across) < 8) continue;
      if (Math.hypot(x - LIGHTHOUSE.x, z - LIGHTHOUSE.z) < 9) continue;
      out.push({ x, z, rot: -a + Math.PI / 2, s: 0.85 + rand() * 0.4 });
    }
    return out;
  }, []);
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        {palms.map((p, i) => (
          <CylinderCollider
            key={i}
            args={[2.5, 0.35 * p.s]}
            position={[p.x, 2.5, p.z]}
          />
        ))}
      </RigidBody>
      {palms.map((p, i) => (
        <Palm key={i} {...p} />
      ))}
    </>
  );
}

function Lighthouse() {
  const beam = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (beam.current) beam.current.rotation.y += dt * 0.9;
  });
  const bands = [0, 1, 2, 3, 4, 5];
  return (
    <group position={[LIGHTHOUSE.x, 0, LIGHTHOUSE.z]}>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[7, 2.6]} position={[0, 7, 0]} />
      </RigidBody>
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <cylinderGeometry args={[3.6, 3.9, 0.6, 20]} />
        <meshStandardMaterial color="#d8c7a6" />
      </mesh>
      {bands.map((i) => (
        <mesh key={i} position={[0, 0.6 + i * 1.8 + 0.9, 0]} castShadow>
          <cylinderGeometry
            args={[2.4 - (i + 1) * 0.16, 2.4 - i * 0.16, 1.8, 20]}
          />
          <meshStandardMaterial
            color={i % 2 ? "#ffffff" : PAL.tomato}
            roughness={0.6}
          />
        </mesh>
      ))}
      <mesh position={[0, 12.1, 0]} castShadow>
        <cylinderGeometry args={[1.75, 1.75, 0.3, 16]} />
        <meshStandardMaterial color={PAL.ink} />
      </mesh>
      <mesh position={[0, 13, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 1.5, 12]} />
        <meshStandardMaterial
          color="#fff6c2"
          emissive="#ffe27a"
          emissiveIntensity={1.4}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[0, 14.2, 0]} castShadow>
        <coneGeometry args={[1.6, 1.2, 12]} />
        <meshStandardMaterial color={PAL.tomato} />
      </mesh>
      <group ref={beam} position={[0, 13, 0]}>
        <mesh position={[9, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[2.2, 18, 16, 1, true]} />
          <meshBasicMaterial
            color="#fff3b0"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function Pier() {
  const length = PIER_TO - PIER_FROM;
  const mid = (PIER_FROM + PIER_TO) / 2;
  const angle = Math.atan2(PIER_DIR.x, PIER_DIR.z);
  const planks = Math.floor(length / 1.1);
  return (
    <group
      position={[PIER_DIR.x * mid, 0, PIER_DIR.z * mid]}
      rotation={[0, angle, 0]}
    >
      <RigidBody type="fixed" colliders={false}>
        {/* deck to drive on, low side rails, and an end stop */}
        <CuboidCollider
          args={[PIER_HALF_W, 0.5, length / 2]}
          position={[0, -0.45, 0]}
        />
        <CuboidCollider
          args={[0.15, 1, length / 2]}
          position={[PIER_HALF_W + 0.2, 0.9, 0]}
        />
        <CuboidCollider
          args={[0.15, 1, length / 2]}
          position={[-PIER_HALF_W - 0.2, 0.9, 0]}
        />
        <CuboidCollider
          args={[PIER_HALF_W, 1, 0.2]}
          position={[0, 0.9, length / 2 + 0.2]}
        />
      </RigidBody>
      {Array.from({ length: planks }, (_, i) => (
        <mesh
          key={i}
          position={[0, 0.02, -length / 2 + 0.55 + i * 1.1]}
          receiveShadow
          castShadow
        >
          <boxGeometry args={[PIER_HALF_W * 2, 0.16, 1]} />
          <meshStandardMaterial
            color={i % 2 ? "#b98a5a" : "#c99a68"}
            roughness={0.9}
          />
        </mesh>
      ))}
      {Array.from({ length: Math.floor(length / 4) + 1 }, (_, i) => (
        <group key={i} position={[0, 0, -length / 2 + i * 4]}>
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * (PIER_HALF_W + 0.2), -0.6, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 2.2, 8]} />
                <meshStandardMaterial color="#7a5636" />
              </mesh>
              <mesh position={[side * (PIER_HALF_W + 0.2), 0.75, 0]} castShadow>
                <boxGeometry args={[0.2, 1.2, 0.2]} />
                <meshStandardMaterial color="#8a6440" />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * (PIER_HALF_W + 0.2), 1.3, 0]}
          castShadow
        >
          <boxGeometry args={[0.16, 0.14, length]} />
          <meshStandardMaterial color="#8a6440" />
        </mesh>
      ))}
      {/* lamp at the end */}
      <mesh position={[PIER_HALF_W - 0.4, 1.6, length / 2 - 0.6]}>
        <cylinderGeometry args={[0.08, 0.08, 3.2, 6]} />
        <meshStandardMaterial color={PAL.ink} />
      </mesh>
      <mesh position={[PIER_HALF_W - 0.4, 3.3, length / 2 - 0.6]}>
        <sphereGeometry args={[0.32, 10, 8]} />
        <meshStandardMaterial
          color="#fff6c2"
          emissive="#ffe27a"
          emissiveIntensity={1.2}
        />
      </mesh>
    </group>
  );
}

function Boat({
  x,
  z,
  color,
  phase,
}: {
  x: number;
  z: number;
  color: string;
  phase: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime + phase;
    if (!ref.current) return;
    ref.current.position.y = SEA_Y + Math.sin(t * 1.2) * 0.18;
    ref.current.rotation.z = Math.sin(t * 0.9) * 0.08;
    ref.current.rotation.x = Math.cos(t * 1.1) * 0.05;
  });
  return (
    <group ref={ref} position={[x, SEA_Y, z]} rotation={[0, phase, 0]}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.8, 0.7, 4.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[1.6, 0.06, 4]} />
        <meshStandardMaterial color="#c99a68" />
      </mesh>
      <mesh position={[0, 2.6, 0.2]}>
        <cylinderGeometry args={[0.07, 0.07, 3.8, 6]} />
        <meshStandardMaterial color="#7a5636" />
      </mesh>
      <mesh position={[0.05, 2.5, -0.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.3, 3]} />
        <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Buoy({ x, z, phase }: { x: number; z: number; phase: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current)
      ref.current.position.y =
        SEA_Y + 0.1 + Math.sin(state.clock.elapsedTime * 1.6 + phase) * 0.15;
  });
  return (
    <group ref={ref} position={[x, SEA_Y, z]}>
      <mesh>
        <cylinderGeometry args={[0.45, 0.6, 0.9, 10]} />
        <meshStandardMaterial color={PAL.tomato} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.2, 10]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function Balloon({
  x,
  z,
  color,
  phase,
}: {
  x: number;
  z: number;
  color: string;
  phase: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * 0.25 + phase;
    // high enough to stay above the follow camera
    ref.current.position.set(
      x + Math.sin(t) * 6,
      24 + Math.sin(t * 2.3) * 1.2,
      z + Math.cos(t) * 6,
    );
  });
  return (
    <group ref={ref}>
      <mesh castShadow>
        <sphereGeometry args={[2.4, 16, 14]} />
        <meshStandardMaterial color={color} roughness={0.6} flatShading />
      </mesh>
      <mesh position={[0, -2.6, 0]}>
        <coneGeometry args={[1.2, 1.4, 12, 1, true]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -4, 0]} castShadow>
        <boxGeometry args={[0.9, 0.7, 0.9]} />
        <meshStandardMaterial color="#a8763f" />
      </mesh>
    </group>
  );
}

export function Island() {
  return (
    <>
      <Ground />
      <Sea />
      <ShoreWall />
      <Palms />
      <Lighthouse />
      <Pier />
      <Boat x={PIER.x + 32} z={PIER.z - 28} color={PAL.sky2} phase={0.4} />
      <Boat x={-128} z={18} color={PAL.sun} phase={1.9} />
      <Boat x={34} z={130} color={PAL.pink} phase={3.1} />
      <Boat x={-90} z={-96} color={PAL.grassy} phase={2.4} />
      {[
        [118, 20],
        [-30, 124],
        [-124, -40],
        [20, -122],
        [90, 84],
        [-96, 72],
      ].map(([x, z], i) => (
        <Buoy key={i} x={x!} z={z!} phase={i} />
      ))}
      <Balloon x={64} z={20} color={PAL.tomato} phase={0} />
      <Balloon x={-20} z={78} color={PAL.sky2} phase={2.2} />
      <Balloon x={-70} z={-50} color={PAL.sun} phase={4.1} />
    </>
  );
}
