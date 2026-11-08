"use client";

import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { GARDEN, PAL } from "~/components/yolculuk/layout";
import { RoundTree, seeded } from "~/components/yolculuk/world/parts";

const { x: GX, z: GZ, r: GR } = GARDEN;
const POND_R = 6.5;
const SLOTS = 10;
/** slot 0 faces the road (towards -x), slot 5 holds the gazebo */
const slotAngle = (i: number) => Math.PI * 1.5 + (i / SLOTS) * Math.PI * 2; // 1.5π → direction -x
const polar = (a: number, r: number) => ({
  x: GX + Math.sin(a) * r,
  z: GZ + Math.cos(a) * r,
});

const FLOWER_COLORS = [
  "#ff5a7a",
  "#ffc93c",
  "#ffffff",
  "#b79cff",
  "#ff8ad8",
  "#ff7a1a",
  "#4d9fff",
];

function Ground() {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GX, 0.01, GZ]}
        receiveShadow
      >
        <circleGeometry args={[GR, 64]} />
        <meshStandardMaterial color="#b4e08c" roughness={1} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GX, 0.02, GZ]}
        receiveShadow
      >
        <ringGeometry args={[14.6, 17.4, 64]} />
        <meshStandardMaterial color="#e9d9b6" roughness={1} />
      </mesh>
      {/* four paths from the ring into the pond */}
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
        const p = polar(a, 11);
        return (
          <mesh
            key={k}
            rotation={[-Math.PI / 2, 0, a]}
            position={[p.x, 0.021, p.z]}
            receiveShadow
          >
            <planeGeometry args={[2.6, 8]} />
            <meshStandardMaterial color="#e9d9b6" roughness={1} />
          </mesh>
        );
      })}
    </>
  );
}

function Pond() {
  const water = useRef<THREE.Mesh>(null);
  const jets = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (water.current) {
      const m = water.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 0.12 + Math.sin(t * 2) * 0.05;
    }
    if (jets.current) {
      jets.current.children.forEach((c, i) => {
        c.scale.y = 0.85 + Math.sin(t * 6 + i) * 0.15;
      });
    }
  });
  const rocks = useMemo(() => {
    const rand = seeded(31);
    return Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 2;
      return {
        ...polar(a, POND_R + 0.4),
        s: 0.55 + rand() * 0.35,
        r: rand() * 3,
      };
    });
  }, []);
  return (
    <>
      <mesh
        ref={water}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GX, 0.05, GZ]}
      >
        <circleGeometry args={[POND_R, 48]} />
        <meshStandardMaterial
          color={PAL.waterShallow}
          emissive="#2fb8d0"
          emissiveIntensity={0.12}
          roughness={0.15}
        />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        {rocks.map((r, i) => (
          <CylinderCollider
            key={i}
            args={[0.5, 0.75]}
            position={[r.x, 0.5, r.z]}
          />
        ))}
        <CylinderCollider args={[1.2, 1.3]} position={[GX, 1.2, GZ]} />
      </RigidBody>
      <Instances limit={rocks.length}>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#b8b0a4" flatShading roughness={0.9} />
        {rocks.map((r, i) => (
          <Instance
            key={i}
            position={[r.x, 0.25, r.z]}
            scale={r.s}
            rotation={[r.r, r.r * 2, 0]}
          />
        ))}
      </Instances>
      {/* fountain */}
      <group position={[GX, 0, GZ]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[1.6, 1.8, 0.7, 20]} />
          <meshStandardMaterial color="#e8e1d4" />
        </mesh>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.35, 0.45, 1.4, 12]} />
          <meshStandardMaterial color="#e8e1d4" />
        </mesh>
        <mesh position={[0, 1.95, 0]} castShadow>
          <cylinderGeometry args={[1, 0.6, 0.3, 16]} />
          <meshStandardMaterial color="#e8e1d4" />
        </mesh>
        <group ref={jets} position={[0, 2.1, 0]}>
          <mesh position={[0, 0.9, 0]}>
            <coneGeometry args={[0.25, 1.8, 10, 1, true]} />
            <meshStandardMaterial color="#bdf3ff" transparent opacity={0.65} />
          </mesh>
          {[0, 1, 2, 3].map((k) => (
            <mesh
              key={k}
              position={[
                Math.sin((k / 4) * Math.PI * 2) * 0.5,
                0.35,
                Math.cos((k / 4) * Math.PI * 2) * 0.5,
              ]}
              rotation={[
                Math.cos((k / 4) * Math.PI * 2) * 0.5,
                0,
                -Math.sin((k / 4) * Math.PI * 2) * 0.5,
              ]}
            >
              <coneGeometry args={[0.12, 0.8, 8, 1, true]} />
              <meshStandardMaterial
                color="#bdf3ff"
                transparent
                opacity={0.55}
              />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
}

function FlowerBeds() {
  const beds = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    for (let i = 1; i < SLOTS; i++)
      if (i !== 5) out.push(polar(slotAngle(i), 23));
    return out;
  }, []);
  const flowers = useMemo(() => {
    const rand = seeded(57);
    return beds.flatMap((b, bi) =>
      Array.from({ length: 26 }, () => {
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(rand()) * 2.3;
        return {
          x: b.x + Math.sin(a) * r,
          z: b.z + Math.cos(a) * r,
          h: 0.45 + rand() * 0.35,
          c: FLOWER_COLORS[
            (bi + Math.floor(rand() * 2)) % FLOWER_COLORS.length
          ]!,
        };
      }),
    );
  }, [beds]);
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        {beds.map((b, i) => (
          <CylinderCollider
            key={i}
            args={[0.5, 2.7]}
            position={[b.x, 0.5, b.z]}
          />
        ))}
      </RigidBody>
      {beds.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, 0.15, 0]} receiveShadow>
            <cylinderGeometry args={[2.7, 2.9, 0.3, 24]} />
            <meshStandardMaterial color="#8a5a3b" roughness={1} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <torusGeometry args={[2.85, 0.15, 6, 30]} />
            <meshStandardMaterial color="#e8e1d4" />
          </mesh>
        </group>
      ))}
      <Instances limit={flowers.length}>
        <cylinderGeometry args={[0.03, 0.03, 1, 4]} />
        <meshStandardMaterial color="#3f8f4a" />
        {flowers.map((f, i) => (
          <Instance
            key={i}
            position={[f.x, 0.3 + f.h / 2, f.z]}
            scale={[1, f.h, 1]}
          />
        ))}
      </Instances>
      <Instances limit={flowers.length} castShadow>
        <icosahedronGeometry args={[0.17, 0]} />
        <meshStandardMaterial flatShading />
        {flowers.map((f, i) => (
          <Instance key={i} position={[f.x, 0.32 + f.h, f.z]} color={f.c} />
        ))}
      </Instances>
    </>
  );
}

function Hedges() {
  const pieces = useMemo(() => {
    const out: { x: number; z: number; rot: number }[] = [];
    const n = 40;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      // leave the entrance (towards -x) open
      const toEntrance = Math.abs(
        Math.atan2(Math.sin(a - Math.PI * 1.5), Math.cos(a - Math.PI * 1.5)),
      );
      if (toEntrance < 0.25) continue;
      const p = polar(a, GR - 1);
      out.push({ ...p, rot: a });
    }
    return out;
  }, []);
  const len = ((2 * Math.PI * (GR - 1)) / 40) * 1.02;
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        {pieces.map((p, i) => (
          <CuboidCollider
            key={i}
            args={[len / 2, 0.7, 0.55]}
            position={[p.x, 0.7, p.z]}
            rotation={[0, p.rot, 0]}
          />
        ))}
      </RigidBody>
      <Instances limit={pieces.length} castShadow receiveShadow>
        <boxGeometry args={[len, 1.4, 1.1]} />
        <meshStandardMaterial color="#3f9a55" roughness={0.9} />
        {pieces.map((p, i) => (
          <Instance
            key={i}
            position={[p.x, 0.7, p.z]}
            rotation={[0, p.rot, 0]}
          />
        ))}
      </Instances>
    </>
  );
}

function Gazebo() {
  const p = polar(slotAngle(5), 22);
  return (
    <group position={[p.x, 0, p.z]}>
      <RigidBody type="fixed" colliders={false}>
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const a = (k / 6) * Math.PI * 2;
          return (
            <CylinderCollider
              key={k}
              args={[1.5, 0.2]}
              position={[Math.sin(a) * 3, 1.5, Math.cos(a) * 3]}
            />
          );
        })}
      </RigidBody>
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[3.6, 3.6, 0.3, 6]} />
        <meshStandardMaterial color="#e8e1d4" />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const a = (k / 6) * Math.PI * 2;
        return (
          <mesh
            key={k}
            position={[Math.sin(a) * 3, 1.6, Math.cos(a) * 3]}
            castShadow
          >
            <cylinderGeometry args={[0.15, 0.15, 2.8, 8]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        );
      })}
      <mesh position={[0, 3.6, 0]} castShadow>
        <coneGeometry args={[4, 1.8, 6]} />
        <meshStandardMaterial color={PAL.pink} flatShading />
      </mesh>
    </group>
  );
}

function Benches() {
  return (
    <>
      {[0, 1, 2, 3].map((k) => {
        const a = (k / 4) * Math.PI * 2;
        const p = polar(a, 9.6);
        return (
          <RigidBody
            key={k}
            type="fixed"
            colliders={false}
            position={[p.x, 0, p.z]}
            rotation={[0, a, 0]}
          >
            <CuboidCollider args={[1.2, 0.5, 0.4]} position={[0, 0.5, 0]} />
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[2.4, 0.15, 0.7]} />
              <meshStandardMaterial color="#b98a5a" />
            </mesh>
            <mesh position={[0, 0.9, 0.3]} castShadow>
              <boxGeometry args={[2.4, 0.6, 0.1]} />
              <meshStandardMaterial color="#b98a5a" />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 1, 0.25, 0]}>
                <boxGeometry args={[0.12, 0.5, 0.6]} />
                <meshStandardMaterial color="#444" />
              </mesh>
            ))}
          </RigidBody>
        );
      })}
    </>
  );
}

function Butterfly({ phase, color }: { phase: number; color: string }) {
  const ref = useRef<THREE.Group>(null);
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.5 + phase;
    if (ref.current) {
      ref.current.position.set(
        GX + Math.sin(t) * (12 + Math.sin(t * 3) * 3),
        1.6 + Math.sin(t * 4) * 0.5,
        GZ + Math.cos(t * 1.3) * 12,
      );
      ref.current.rotation.y = t + Math.PI / 2;
    }
    const flap = Math.sin(state.clock.elapsedTime * 18 + phase) * 0.9;
    if (left.current) left.current.rotation.z = flap;
    if (right.current) right.current.rotation.z = -flap;
  });
  return (
    <group ref={ref}>
      <mesh ref={left} position={[0.18, 0, 0]}>
        <planeGeometry args={[0.36, 0.3]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={right} position={[-0.18, 0, 0]}>
        <planeGeometry args={[0.36, 0.3]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Garden() {
  return (
    <>
      <Ground />
      <Pond />
      <FlowerBeds />
      <Hedges />
      <Gazebo />
      <Benches />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const p = polar((k / 6) * Math.PI * 2 + 0.5, 12.2);
        return (
          <RoundTree
            key={k}
            x={p.x}
            z={p.z}
            s={0.8}
            color={k % 2 ? "#7cc96b" : "#9ad66e"}
          />
        );
      })}
      <RigidBody type="fixed" colliders={false}>
        {[0, 1, 2, 3, 4, 5].map((k) => {
          const p = polar((k / 6) * Math.PI * 2 + 0.5, 12.2);
          return (
            <CylinderCollider
              key={k}
              args={[1.5, 0.35]}
              position={[p.x, 1.5, p.z]}
            />
          );
        })}
      </RigidBody>
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <Butterfly key={k} phase={k * 1.7} color={FLOWER_COLORS[k]!} />
      ))}
    </>
  );
}
