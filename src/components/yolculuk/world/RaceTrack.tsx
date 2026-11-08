"use client";

import { Html, Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { PAL, TRACK } from "~/components/yolculuk/layout";
import { car, useDrive } from "~/components/yolculuk/store";
import { Ramp } from "~/components/yolculuk/world/Plaza";
import { seeded, useLabelVisible } from "~/components/yolculuk/world/parts";

const { x: CX, z: CZ, rx: RX, rz: RZ, width: W } = TRACK;

/** point on the centre line (t = 0 is the start line, nearest the plaza) */
function at(t: number, offset = 0) {
  const x = Math.cos(t) * (RX + offset);
  const z = Math.sin(t) * (RZ + offset);
  return { x: CX + x, z: CZ + z };
}

function useCheckerTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const g = c.getContext("2d")!;
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        g.fillStyle = (x + y) % 2 ? "#1A1A1A" : "#ffffff";
        g.fillRect(x * 8, y * 8, 8, 8);
      }
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }, []);
}

function TrackSurface() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, RX + W / 2, RZ + W / 2, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Path();
    hole.absellipse(0, 0, RX - W / 2, RZ - W / 2, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole);
    const g = new THREE.ShapeGeometry(shape, 96);
    g.rotateX(-Math.PI / 2); // shape y → -z: the ellipse is symmetric, so fine
    return g;
  }, []);
  return (
    <group position={[CX, 0.03, CZ]}>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial color={PAL.asphalt} roughness={0.9} />
      </mesh>
      {/* infield grass */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        scale={[RX - W / 2, RZ - W / 2, 1]}
        receiveShadow
      >
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#86c46a" roughness={1} />
      </mesh>
    </group>
  );
}

function Curbs() {
  const pieces = useMemo(() => {
    const out: { x: number; z: number; rot: number; red: boolean }[] = [];
    for (const side of [-1, 1]) {
      const n = 120;
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        const p = at(t, side * (W / 2 + 0.35));
        // tangent direction
        const dx = -Math.sin(t) * RX;
        const dz = Math.cos(t) * RZ;
        out.push({ x: p.x, z: p.z, rot: Math.atan2(dx, dz), red: i % 2 === 0 });
      }
    }
    return out;
  }, []);
  return (
    <>
      {[true, false].map((red) => (
        <Instances key={String(red)} limit={pieces.length}>
          <boxGeometry args={[0.7, 0.12, 1.7]} />
          <meshStandardMaterial color={red ? PAL.tomato : "#ffffff"} />
          {pieces
            .filter((p) => p.red === red)
            .map((p, i) => (
              <Instance
                key={i}
                position={[p.x, 0.06, p.z]}
                rotation={[0, p.rot, 0]}
              />
            ))}
        </Instances>
      ))}
    </>
  );
}

function StartLine() {
  const tex = useCheckerTexture();
  const p = at(0);
  const label = useLabelVisible(p.x, p.z);
  const t = useMemo(() => {
    const c = tex.clone();
    c.needsUpdate = true;
    c.repeat.set(W / 2, 1);
    return c;
  }, [tex]);
  return (
    <group position={[p.x, 0, p.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
        <planeGeometry args={[W, 2]} />
        <meshStandardMaterial map={t} />
      </mesh>
      {/* gate */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[0.4, 3, 0.4]} position={[W / 2 + 1.2, 3, 0]} />
        <CuboidCollider args={[0.4, 3, 0.4]} position={[-W / 2 - 1.2, 3, 0]} />
      </RigidBody>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * (W / 2 + 1.2), 3, 0]} castShadow>
          <boxGeometry args={[0.8, 6, 0.8]} />
          <meshStandardMaterial color={PAL.ink} />
        </mesh>
      ))}
      <mesh position={[0, 6.3, 0]} castShadow>
        <boxGeometry args={[W + 3.4, 1.2, 0.6]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      {label && (
        <Html
          position={[0, 7.6, 0]}
          center
          distanceFactor={18}
          zIndexRange={[10, 0]}
        >
          <span className="font-pop pointer-events-none rounded-lg bg-[#1A1A1A] px-3 py-1 text-base font-extrabold whitespace-nowrap text-[#FFC93C] select-none">
            🏁 MERT GP
          </span>
        </Html>
      )}
    </group>
  );
}

function Grandstand() {
  // far side of the track, facing the circuit
  const x = CX - RX - W / 2 - 4;
  const crowd = useMemo(() => {
    const rand = seeded(77);
    const out: { p: [number, number, number]; c: string }[] = [];
    const colors = [
      PAL.tomato,
      PAL.sun,
      PAL.sky2,
      PAL.pink,
      PAL.grassy,
      PAL.lilac,
      "#ffffff",
    ];
    for (let row = 0; row < 4; row++)
      for (let i = 0; i < 26; i++) {
        if (rand() < 0.2) continue;
        out.push({
          p: [x - row * 1.2 + 0.2, 1 + row * 0.9 + 0.45, CZ - 15 + i * 1.15],
          c: colors[Math.floor(rand() * colors.length)]!,
        });
      }
    return out;
  }, [x]);
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[3, 2.5, 16]} position={[x - 1.8, 2.5, CZ]} />
      </RigidBody>
      {[0, 1, 2, 3].map((row) => (
        <mesh
          key={row}
          position={[x - row * 1.2, 0.5 + row * 0.9, CZ]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.2, 1 + row * 1.8, 31]} />
          <meshStandardMaterial color={row % 2 ? "#e8e1d4" : "#d6cbb6"} />
        </mesh>
      ))}
      <mesh position={[x - 3.6, 6.4, CZ]} castShadow>
        <boxGeometry args={[4.2, 0.25, 32]} />
        <meshStandardMaterial color={PAL.tomato} />
      </mesh>
      <Instances limit={crowd.length}>
        <sphereGeometry args={[0.32, 8, 6]} />
        <meshStandardMaterial />
        {crowd.map((c, i) => (
          <Instance key={i} position={c.p} color={c.c} />
        ))}
      </Instances>
    </>
  );
}

function TyreWalls() {
  const stacks = useMemo(() => {
    const out: [number, number][] = [];
    for (const t0 of [Math.PI / 2, -Math.PI / 2]) {
      for (let k = -6; k <= 6; k++) {
        const p = at(t0 + k * 0.07, W / 2 + 2.2);
        out.push([p.x, p.z]);
      }
    }
    return out;
  }, []);
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        {stacks.map(([x, z], i) => (
          <CylinderCollider key={i} args={[0.6, 0.6]} position={[x, 0.6, z]} />
        ))}
      </RigidBody>
      <Instances limit={stacks.length * 3}>
        <torusGeometry args={[0.42, 0.2, 8, 14]} />
        <meshStandardMaterial color="#22222a" roughness={0.9} />
        {stacks.flatMap(([x, z], i) =>
          [0, 1, 2].map((k) => (
            <Instance
              key={`${i}-${k}`}
              position={[x, 0.2 + k * 0.4, z]}
              rotation={[Math.PI / 2, 0, 0]}
            />
          )),
        )}
      </Instances>
    </>
  );
}

/**
 * Lap timing: four checkpoints round the oval. Crossing the start line after
 * visiting all of them (either direction) completes a lap.
 */
function LapTimer() {
  const st = useRef({ visited: [false, false, false, false], dir: 0 });
  useFrame(() => {
    const u = (car.x - CX) / RX;
    const v = (car.z - CZ) / RZ;
    const r = Math.hypot(u, v);
    const onTrack = Math.abs(r - 1) * Math.min(RX, RZ) < W / 2 + 1;
    if (!onTrack) return;
    const t = Math.atan2(v, u);
    const near = (target: number) =>
      Math.abs(Math.atan2(Math.sin(t - target), Math.cos(t - target))) < 0.12;
    const s = st.current;
    const lap = useDrive.getState().lap;
    const now = performance.now();

    if (near(0)) {
      const all = s.visited[1] && s.visited[2] && s.visited[3];
      if (!lap.running) {
        useDrive.setState({
          lap: { ...lap, running: true, start: now, next: 1 },
        });
        s.visited = [true, false, false, false];
      } else if (all) {
        const time = now - lap.start;
        useDrive.setState({
          lap: {
            running: true,
            start: now,
            last: time,
            best: lap.best === null ? time : Math.min(lap.best, time),
            next: 1,
          },
        });
        s.visited = [true, false, false, false];
      }
      return;
    }
    if (near(Math.PI / 2)) s.visited[1] = true;
    if (near(Math.PI) || near(-Math.PI)) s.visited[2] = true;
    if (near(-Math.PI / 2)) s.visited[3] = true;
  });
  return null;
}

export function RaceTrack() {
  return (
    <>
      <TrackSurface />
      <Curbs />
      <StartLine />
      <Grandstand />
      <TyreWalls />
      <Ramp x={CX} z={CZ - 6} rot={0} color={PAL.sun} scale={1.2} />
      <Ramp x={CX} z={CZ + 10} rot={Math.PI} color={PAL.sky2} scale={1.2} />
      <LapTimer />
    </>
  );
}
