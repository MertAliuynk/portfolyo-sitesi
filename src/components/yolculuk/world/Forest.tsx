"use client";

import { Instance, Instances } from "@react-three/drei";
import { CylinderCollider, RigidBody } from "@react-three/rapier";
import { useMemo } from "react";

import {
  CITY,
  GALLERY,
  GARDEN,
  ISLAND_R,
  LIGHTHOUSE,
  onPier,
  PAL,
  PLAZA,
  PORTAL,
  TRACK,
} from "~/components/yolculuk/layout";
import { ROADS } from "~/components/yolculuk/world/Plaza";
import { seeded } from "~/components/yolculuk/world/parts";
import { Flowers } from "~/components/yolculuk/world/Sky";

/** true where something already stands, so trees keep out */
function occupied(x: number, z: number, pad = 0) {
  const r = Math.hypot(x, z);
  if (r > ISLAND_R - 7) return true;
  if (r < PLAZA.r + 5 + pad) return true;
  if (
    Math.abs(x - CITY.x) < CITY.w / 2 + 7 &&
    Math.abs(z - CITY.z) < CITY.d / 2 + 7
  )
    return true;
  const u = (x - TRACK.x) / (TRACK.rx + TRACK.width / 2 + 9);
  const v = (z - TRACK.z) / (TRACK.rz + TRACK.width / 2 + 7);
  if (u * u + v * v < 1) return true;
  if (Math.hypot(x - GARDEN.x, z - GARDEN.z) < GARDEN.r + 4) return true;
  if (Math.abs(x - GALLERY.x) < 50 && z > GALLERY.z - 18 && z < GALLERY.z + 22)
    return true;
  if (Math.hypot(x - PORTAL.x, z - PORTAL.z) < 10) return true;
  if (Math.hypot(x - LIGHTHOUSE.x, z - LIGHTHOUSE.z) < 10) return true;
  if (onPier(x * 1.05, z * 1.05)) return true;
  for (const [px, pz, pr] of [
    [-16, -24, 8],
    [30, -30, 8],
    [-20, -12, 5],
    [22, 12, 5],
  ] as const)
    if (Math.hypot(x - px, z - pz) < pr) return true;
  for (const road of ROADS) {
    const [x1, z1] = road.from;
    const [x2, z2] = road.to;
    const dx = x2 - x1;
    const dz = z2 - z1;
    const t = Math.max(
      0,
      Math.min(1, ((x - x1) * dx + (z - z1) * dz) / (dx * dx + dz * dz)),
    );
    if (Math.hypot(x - (x1 + dx * t), z - (z1 + dz * t)) < road.w / 2 + 3)
      return true;
  }
  return false;
}

export function Forest() {
  const { pines, rounds, rocks, tufts, flowers } = useMemo(() => {
    const rand = seeded(101);
    const pines: { x: number; z: number; s: number }[] = [];
    const rounds: { x: number; z: number; s: number; c: string }[] = [];
    const rocks: { x: number; z: number; s: number; r: number }[] = [];
    const tufts: { x: number; z: number; s: number }[] = [];
    const roundColors = ["#6cc070", "#8fd16a", "#5bbf8a", "#a7d86b"];
    let guard = 0;
    while (pines.length + rounds.length < 140 && guard++ < 6000) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * ISLAND_R;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (occupied(x, z, 2)) continue;
      if ([...pines, ...rounds].some((t) => Math.hypot(t.x - x, t.z - z) < 4.2))
        continue;
      if (rand() > 0.45) pines.push({ x, z, s: 0.8 + rand() * 0.7 });
      else
        rounds.push({
          x,
          z,
          s: 0.8 + rand() * 0.6,
          c: roundColors[Math.floor(rand() * 4)]!,
        });
    }
    guard = 0;
    while (rocks.length < 40 && guard++ < 3000) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * ISLAND_R;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (occupied(x, z)) continue;
      rocks.push({ x, z, s: 0.5 + rand() * 1.1, r: rand() * 3 });
    }
    guard = 0;
    while (tufts.length < 260 && guard++ < 8000) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * ISLAND_R;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      if (occupied(x, z)) continue;
      tufts.push({ x, z, s: 0.6 + rand() * 0.7 });
    }
    const flowers: { x: number; z: number; c: string; s: number }[] = [];
    const flowerColors = [
      "#ff8ad8",
      "#ffc93c",
      "#ffffff",
      "#b79cff",
      "#ff7a59",
      "#7cc4ff",
    ];
    guard = 0;
    while (flowers.length < 420 && guard++ < 9000) {
      // flowers grow in little clumps
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * ISLAND_R;
      const cx = Math.sin(a) * r;
      const cz = Math.cos(a) * r;
      if (occupied(cx, cz)) continue;
      const c = flowerColors[Math.floor(rand() * flowerColors.length)]!;
      for (let k = 0; k < 6; k++) {
        const x = cx + (rand() - 0.5) * 2.4;
        const z = cz + (rand() - 0.5) * 2.4;
        if (!occupied(x, z)) flowers.push({ x, z, c, s: 0.8 + rand() * 0.6 });
      }
    }
    return { pines, rounds, rocks, tufts, flowers };
  }, []);

  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        {pines.map((t, i) => (
          <CylinderCollider
            key={`p${i}`}
            args={[1.6 * t.s, 0.4 * t.s]}
            position={[t.x, 1.6 * t.s, t.z]}
          />
        ))}
        {rounds.map((t, i) => (
          <CylinderCollider
            key={`r${i}`}
            args={[1.5 * t.s, 0.35 * t.s]}
            position={[t.x, 1.5 * t.s, t.z]}
          />
        ))}
        {rocks
          .filter((r) => r.s > 0.9)
          .map((r, i) => (
            <CylinderCollider
              key={`k${i}`}
              args={[0.6 * r.s, 0.75 * r.s]}
              position={[r.x, 0.6 * r.s, r.z]}
            />
          ))}
      </RigidBody>

      {/* pines: trunk + two cones */}
      <Instances limit={pines.length} castShadow>
        <cylinderGeometry args={[0.25, 0.35, 1.6, 7]} />
        <meshStandardMaterial color={PAL.trunk} roughness={0.9} />
        {pines.map((t, i) => (
          <Instance key={i} position={[t.x, 0.8 * t.s, t.z]} scale={t.s} />
        ))}
      </Instances>
      <Instances limit={pines.length} castShadow>
        <coneGeometry args={[1.4, 2.4, 7]} />
        <meshStandardMaterial color={PAL.leaf} roughness={0.8} flatShading />
        {pines.map((t, i) => (
          <Instance key={i} position={[t.x, 2.3 * t.s, t.z]} scale={t.s} />
        ))}
      </Instances>
      <Instances limit={pines.length} castShadow>
        <coneGeometry args={[1, 1.8, 7]} />
        <meshStandardMaterial color={PAL.leaf2} roughness={0.8} flatShading />
        {pines.map((t, i) => (
          <Instance key={i} position={[t.x, 3.3 * t.s, t.z]} scale={t.s} />
        ))}
      </Instances>

      {/* round trees: trunk + canopy */}
      <Instances limit={rounds.length} castShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.8, 7]} />
        <meshStandardMaterial color={PAL.trunk} roughness={0.9} />
        {rounds.map((t, i) => (
          <Instance key={i} position={[t.x, 0.9 * t.s, t.z]} scale={t.s} />
        ))}
      </Instances>
      <Instances limit={rounds.length} castShadow>
        <icosahedronGeometry args={[1.45, 0]} />
        <meshStandardMaterial roughness={0.8} flatShading />
        {rounds.map((t, i) => (
          <Instance
            key={i}
            position={[t.x, 2.6 * t.s, t.z]}
            scale={t.s}
            color={t.c}
          />
        ))}
      </Instances>

      <Instances limit={rocks.length} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#b8b0a4" flatShading roughness={0.9} />
        {rocks.map((r, i) => (
          <Instance
            key={i}
            position={[r.x, 0.3 * r.s, r.z]}
            scale={[r.s, r.s * 0.7, r.s]}
            rotation={[r.r, r.r * 2, 0]}
          />
        ))}
      </Instances>

      <Instances limit={tufts.length}>
        <coneGeometry args={[0.18, 0.6, 4]} />
        <meshStandardMaterial color="#6fae55" flatShading />
        {tufts.map((t, i) => (
          <Instance key={i} position={[t.x, 0.3 * t.s, t.z]} scale={t.s} />
        ))}
      </Instances>

      <Flowers spots={flowers} />
    </>
  );
}
