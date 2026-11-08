"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useRef, useState } from "react";
import type * as THREE from "three";

import { PAL } from "~/components/yolculuk/layout";
import { useDrive, type Zone } from "~/components/yolculuk/store";

/** deterministic random so the island looks the same on every visit */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/**
 * HTML labels are drawn over the canvas, so they would show through walls
 * from across the island. Only show them near the camera, and never while
 * reading a board.
 */
export function useLabelVisible(x: number, z: number, maxDist = 55) {
  const reading = useDrive((s) => s.reading !== null);
  const [near, setNear] = useState(false);
  const nearRef = useRef(false);
  useFrame(({ camera }) => {
    const d = Math.hypot(camera.position.x - x, camera.position.z - z);
    // a little hysteresis so labels don't flicker at the edge
    const next = nearRef.current ? d < maxDist + 4 : d < maxDist;
    if (next !== nearRef.current) {
      nearRef.current = next;
      setNear(next);
    }
  });
  return near && !reading;
}

/** a coloured pad on the ground with a floating label; driving onto it opens its card */
export function ZonePad({ zone, sign = true }: { zone: Zone; sign?: boolean }) {
  const active = useDrive((s) => s.zone === zone.id);
  const labelVisible = useLabelVisible(zone.at[0], zone.at[1]);
  const arrow = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (arrow.current) {
      arrow.current.position.y =
        3.2 + Math.sin(state.clock.elapsedTime * 3) * 0.25;
      arrow.current.rotation.y = state.clock.elapsedTime * 1.5;
    }
  });
  return (
    <group position={[zone.at[0], 0, zone.at[1]]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
        receiveShadow
      >
        <circleGeometry args={[zone.radius, 48]} />
        <meshStandardMaterial
          color={zone.color}
          transparent
          opacity={active ? 0.65 : 0.35}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[zone.radius - 0.28, zone.radius, 64]} />
        <meshStandardMaterial color={zone.color} />
      </mesh>
      {!active && (
        <group ref={arrow}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.45, 0.9, 4]} />
            <meshStandardMaterial
              color={zone.color}
              emissive={zone.color}
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      )}
      {sign && labelVisible && (
        <Html
          position={[0, 4.6, 0]}
          center
          distanceFactor={18}
          zIndexRange={[20, 0]}
        >
          <span className="font-pop pointer-events-none rounded-full border-[2.5px] border-[#1A1A1A] bg-[#FFF8EA] px-3 py-1 text-sm font-extrabold whitespace-nowrap text-[#1A1A1A] shadow-[2px_2px_0_#1A1A1A] select-none">
            {zone.title}
          </span>
        </Html>
      )}
    </group>
  );
}

/** cone-ish conifer */
export function PineTree({
  x,
  z,
  s = 1,
}: {
  x: number;
  z: number;
  s?: number;
}) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 1.6, 7]} />
        <meshStandardMaterial color={PAL.trunk} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[1.4, 2.4, 7]} />
        <meshStandardMaterial color={PAL.leaf} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 3.3, 0]} castShadow>
        <coneGeometry args={[1, 1.8, 7]} />
        <meshStandardMaterial color={PAL.leaf2} roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

/** round, fluffy deciduous tree */
export function RoundTree({
  x,
  z,
  s = 1,
  color = "#6cc070",
}: {
  x: number;
  z: number;
  s?: number;
  color?: string;
}) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.8, 7]} />
        <meshStandardMaterial color={PAL.trunk} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.5, 0]} castShadow>
        <icosahedronGeometry args={[1.35, 0]} />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0.55, 2.1, 0.3]} castShadow>
        <icosahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color={color} roughness={0.8} flatShading />
      </mesh>
    </group>
  );
}

/** static box collider + mesh in one go */
export function SolidBox({
  position,
  size,
  color,
  rotation = [0, 0, 0],
  castShadow = true,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  rotation?: [number, number, number];
  castShadow?: boolean;
}) {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={position}
      rotation={rotation}
    >
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
      <mesh castShadow={castShadow} receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </RigidBody>
  );
}
