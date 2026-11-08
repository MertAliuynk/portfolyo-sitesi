"use client";

import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import type * as THREE from "three";

import {
  GALLERY,
  GARDEN,
  KIOSK,
  PAL,
  PLAZA,
  PORTAL,
  TRACK,
} from "~/components/yolculuk/layout";

/* ------------------------------------------------------------------ */
/* roads                                                                */
/* ------------------------------------------------------------------ */

interface Road {
  from: [number, number];
  to: [number, number];
  w: number;
}

/** main roads from the plaza out to each district */
export const ROADS: Road[] = [
  // runs through the first city block as a boulevard up to the kiosk square
  { from: [0, PLAZA.r - 2], to: [0, KIOSK.z - 13], w: 7 },
  { from: [0, -PLAZA.r + 2], to: [0, GALLERY.z + 12], w: 7 },
  {
    from: [-PLAZA.r + 2, 0],
    to: [TRACK.x + TRACK.rx + TRACK.width / 2, 0],
    w: 7,
  },
  { from: [PLAZA.r - 2, 0], to: [GARDEN.x - GARDEN.r + 1, 0], w: 7 },
];

function RoadStrip({ road }: { road: Road }) {
  const [x1, z1] = road.from;
  const [x2, z2] = road.to;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const angle = Math.atan2(x2 - x1, z2 - z1);
  const dashes = Math.floor(len / 4);
  return (
    <group
      position={[(x1 + x2) / 2, 0, (z1 + z2) / 2]}
      rotation={[0, angle, 0]}
    >
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        receiveShadow
      >
        <planeGeometry args={[road.w, len]} />
        <meshStandardMaterial color={PAL.asphalt} roughness={0.95} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[side * (road.w / 2 - 0.3), 0.025, 0]}
        >
          <planeGeometry args={[0.18, len]} />
          <meshStandardMaterial color={PAL.marking} />
        </mesh>
      ))}
      <Instances limit={dashes}>
        <planeGeometry args={[0.22, 1.8]} />
        <meshStandardMaterial color={PAL.sun} />
        {Array.from({ length: dashes }, (_, i) => (
          <Instance
            key={i}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.026, -len / 2 + 2 + i * 4]}
          />
        ))}
      </Instances>
    </group>
  );
}

export function Roads() {
  return (
    <>
      {/* paved plaza with a ring of tiles */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        receiveShadow
      >
        <circleGeometry args={[PLAZA.r, 64]} />
        <meshStandardMaterial color={PAL.plaza} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[PLAZA.r - 0.6, PLAZA.r, 64]} />
        <meshStandardMaterial color="#d6bf92" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
        <ringGeometry args={[4.5, 5, 48]} />
        <meshStandardMaterial color="#d6bf92" />
      </mesh>
      {ROADS.map((r, i) => (
        <RoadStrip key={i} road={r} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* toys on the plaza                                                    */
/* ------------------------------------------------------------------ */

const GLYPHS: Record<string, string[]> = {
  M: ["X...X", "XX.XX", "X.X.X", "X...X", "X...X"],
  E: ["XXXX.", "X....", "XXX..", "X....", "XXXX."],
  R: ["XXXX.", "X...X", "XXXX.", "X..X.", "X...X"],
  T: ["XXXXX", "..X..", "..X..", "..X..", "..X.."],
};

function Letter({
  ch,
  x,
  z,
  color,
}: {
  ch: string;
  x: number;
  z: number;
  color: string;
}) {
  const cells = useMemo(() => {
    const out: [number, number][] = [];
    GLYPHS[ch]!.forEach((row, r) =>
      row
        .split("")
        .forEach((c, col) => c === "X" && out.push([col - 2, 4 - r])),
    );
    return out;
  }, [ch]);
  const v = 0.6;
  return (
    <RigidBody
      position={[x, 0.02, z]}
      colliders={false}
      mass={1.2}
      friction={0.9}
      rotation={[0, Math.PI, 0]}
    >
      {cells.map(([cx, cy], i) => (
        <group key={i} position={[cx * v, cy * v + v / 2, 0]}>
          <CuboidCollider args={[v / 2, v / 2, v / 2]} />
          <mesh castShadow receiveShadow>
            <boxGeometry args={[v, v, v]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </RigidBody>
  );
}

function Crates({ x, z }: { x: number; z: number }) {
  const boxes = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let row = 0; row < 4; row++)
      for (let i = 0; i < 4 - row; i++)
        out.push([x + (i - (3 - row) / 2) * 1.05, 0.5 + row, z]);
    return out;
  }, [x, z]);
  return (
    <>
      {boxes.map((p, i) => (
        <RigidBody
          key={i}
          position={p}
          colliders="cuboid"
          mass={0.4}
          friction={0.8}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial
              color={i % 2 ? PAL.sun : "#e0a400"}
              roughness={0.7}
            />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}

function Pins({ x, z }: { x: number; z: number }) {
  const pins = useMemo(() => {
    const out: [number, number][] = [];
    for (let row = 0; row < 4; row++)
      for (let i = 0; i <= row; i++)
        out.push([x + (i - row / 2) * 0.9, z + row * 0.8]);
    return out;
  }, [x, z]);
  return (
    <>
      {pins.map(([px, pz], i) => (
        <RigidBody
          key={i}
          position={[px, 0.75, pz]}
          colliders={false}
          mass={0.15}
        >
          <CylinderCollider args={[0.7, 0.24]} />
          <mesh castShadow>
            <cylinderGeometry args={[0.16, 0.26, 1.4, 12]} />
            <meshStandardMaterial color="#FFF8EA" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.14, 12]} />
            <meshStandardMaterial color={PAL.tomato} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}

export function Ramp({
  x,
  z,
  rot = 0,
  color = PAL.pink,
  scale = 1,
}: {
  x: number;
  z: number;
  rot?: number;
  color?: string;
  scale?: number;
}) {
  const angle = 0.3;
  const len = 7 * scale;
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <RigidBody
        type="fixed"
        colliders={false}
        position={[0, (len / 2) * Math.sin(angle) - 0.15, 0]}
        rotation={[-angle, 0, 0]}
      >
        <CuboidCollider args={[2.5 * scale, 0.15, len / 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5 * scale, 0.3, len]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {[-1, 0, 1].map((k) => (
          <mesh key={k} position={[k * 1.4 * scale, 0.16, 0]}>
            <boxGeometry args={[0.35, 0.02, len - 0.6]} />
            <meshStandardMaterial color={PAL.cream} />
          </mesh>
        ))}
      </RigidBody>
    </group>
  );
}

/** the "Duygular" gate: a glowing ring back to the mood picker */
function Portal() {
  const ring = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring.current) ring.current.rotation.z = t * 0.6;
    if (inner.current)
      inner.current.scale.setScalar(0.9 + Math.sin(t * 2) * 0.06);
  });
  return (
    <group position={[PORTAL.x, 0, PORTAL.z + 5]}>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[1.8, 0.35]} position={[-2.6, 1.8, 0]} />
        <CylinderCollider args={[1.8, 0.35]} position={[2.6, 1.8, 0]} />
      </RigidBody>
      <mesh ref={ring} position={[0, 3, 0]} castShadow>
        <torusGeometry args={[2.6, 0.35, 12, 48]} />
        <meshStandardMaterial
          color={PAL.lilac}
          emissive={PAL.lilac}
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh ref={inner} position={[0, 3, 0]}>
        <circleGeometry args={[2.3, 40]} />
        <meshBasicMaterial color={PAL.pink} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export function PlazaToys() {
  return (
    <>
      {"MERT".split("").map((ch, i) => (
        <Letter
          key={i}
          ch={ch}
          x={(1.5 - i) * 3.6}
          z={8}
          color={[PAL.tomato, PAL.sky2, PAL.grassy, PAL.pink][i]!}
        />
      ))}
      <Crates x={-20} z={-12} />
      <Pins x={22} z={12} />
      <Ramp x={-16} z={-24} rot={Math.PI * 0.85} color={PAL.sun} />
      <Ramp x={30} z={-30} rot={-Math.PI * 0.75} />
      <Portal />
    </>
  );
}
