"use client";

import { Instance, Instances } from "@react-three/drei";
import {
  CuboidCollider,
  CylinderCollider,
  RigidBody,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { CITY, KIOSK, PAL } from "~/components/yolculuk/layout";
import { car } from "~/components/yolculuk/store";
import { RoundTree, seeded } from "~/components/yolculuk/world/parts";

const X0 = CITY.x - CITY.w / 2; // -36
const X1 = CITY.x + CITY.w / 2; // 36
const Z0 = CITY.z - CITY.d / 2; // 32
const Z1 = CITY.z + CITY.d / 2; // 84
const STREET = 6;
const XS = [X0, -12, 12, X1]; // streets running along z
const ZS = [Z0, 50, 68, Z1]; // streets running along x

const BUILDING_COLORS = [
  "#ffd6a5",
  "#fdffb6",
  "#caffbf",
  "#9bf6ff",
  "#a0c4ff",
  "#bdb2ff",
  "#ffc6ff",
  "#ffadad",
  "#f1e3c8",
];

/** shared window texture: a grid of lit and dark windows on a white wall */
function useWindowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const g = c.getContext("2d")!;
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 64, 64);
    const rand = seeded(5);
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 4; x++) {
        g.fillStyle = rand() > 0.55 ? "#ffe8a3" : "#5d6b86";
        g.fillRect(4 + x * 15, 4 + y * 15, 9, 10);
      }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    return tex;
  }, []);
}

interface Building {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
  roof: number;
}

function useBuildings() {
  return useMemo(() => {
    const rand = seeded(42);
    const out: Building[] = [];
    for (let i = 0; i < XS.length - 1; i++)
      for (let j = 0; j < ZS.length - 1; j++) {
        const bx0 = XS[i]! + STREET / 2 + 1;
        const bx1 = XS[i + 1]! - STREET / 2 - 1;
        const bz0 = ZS[j]! + STREET / 2 + 1;
        const bz1 = ZS[j + 1]! - STREET / 2 - 1;
        // the middle block is the open square with the kiosk
        if (i === 1 && j === 1) continue;
        // the block in front of it is split by the boulevard from the plaza
        const boulevard = i === 1 && j === 0;
        const halves = boulevard || rand() > 0.4 ? 2 : 1;
        const bw = (bx1 - bx0) / halves;
        for (let k = 0; k < halves; k++) {
          const rows = rand() > 0.5 ? 2 : 1;
          const bd = (bz1 - bz0) / rows;
          for (let r = 0; r < rows; r++) {
            const w = boulevard ? bw - 4.6 : bw - 1.2;
            const d = bd - 1.2;
            out.push({
              x: boulevard
                ? k
                  ? bx1 - w / 2
                  : bx0 + w / 2
                : bx0 + bw * (k + 0.5),
              z: bz0 + bd * (r + 0.5),
              w,
              d,
              h: 5 + Math.floor(rand() * 5) * 2.4,
              color:
                BUILDING_COLORS[Math.floor(rand() * BUILDING_COLORS.length)]!,
              roof: rand(),
            });
          }
        }
      }
    return out;
  }, []);
}

function BuildingMesh({ b, tex }: { b: Building; tex: THREE.Texture }) {
  const material = useMemo(() => {
    const t = tex.clone();
    t.needsUpdate = true;
    t.repeat.set(
      Math.max(1, Math.round(b.w / 3.2)),
      Math.max(1, Math.round(b.h / 3.2)),
    );
    return new THREE.MeshStandardMaterial({
      color: b.color,
      map: t,
      roughness: 0.8,
      transparent: true,
    });
  }, [b, tex]);
  const extras = useRef<THREE.Group>(null);

  // the camera sits behind and above the car (towards -z): fade whatever
  // building stands between them, so the car never disappears
  useFrame((_, dt) => {
    const behind = car.z - (b.z + b.d / 2);
    const blocking =
      Math.abs(car.x - b.x) < b.w / 2 + 2 &&
      car.z > b.z - b.d / 2 &&
      behind < b.h + 2;
    const target = blocking ? 0.18 : 1;
    if (Math.abs(material.opacity - target) < 0.01) return;
    material.opacity = THREE.MathUtils.lerp(
      material.opacity,
      target,
      1 - Math.exp(-8 * dt),
    );
    material.depthWrite = material.opacity > 0.95;
    if (extras.current) extras.current.visible = material.opacity > 0.6;
  });

  return (
    <group position={[b.x, 0, b.z]}>
      <mesh
        position={[0, b.h / 2, 0]}
        material={material}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[b.w, b.h, b.d]} />
      </mesh>
      <group ref={extras}>
        {/* roof cap + details */}
        <mesh position={[0, b.h + 0.15, 0]} castShadow>
          <boxGeometry args={[b.w + 0.3, 0.3, b.d + 0.3]} />
          <meshStandardMaterial color="#e8e1d4" />
        </mesh>
        {b.roof > 0.5 ? (
          <mesh position={[b.w * 0.2, b.h + 0.9, -b.d * 0.15]} castShadow>
            <cylinderGeometry args={[0.8, 0.8, 1.4, 10]} />
            <meshStandardMaterial color="#b98a5a" />
          </mesh>
        ) : (
          <mesh position={[-b.w * 0.2, b.h + 0.65, b.d * 0.2]} castShadow>
            <boxGeometry args={[1.4, 0.9, 1]} />
            <meshStandardMaterial color="#cfd8dc" />
          </mesh>
        )}
        {/* door */}
        <mesh position={[0, 1.1, -b.d / 2 - 0.01]}>
          <planeGeometry args={[1.4, 2.2]} />
          <meshStandardMaterial color="#6b4a35" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function Streets() {
  const crossings = useMemo(() => {
    const out: { x: number; z: number; rot: number }[] = [];
    XS.forEach((x) => ZS.forEach((z) => out.push({ x, z, rot: 0 })));
    return out;
  }, []);
  return (
    <>
      {XS.map((x) => (
        <mesh
          key={`x${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.021, (Z0 + Z1) / 2]}
          receiveShadow
        >
          <planeGeometry args={[STREET, Z1 - Z0 + STREET]} />
          <meshStandardMaterial color={PAL.asphalt} roughness={0.95} />
        </mesh>
      ))}
      {ZS.map((z) => (
        <mesh
          key={`z${z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[(X0 + X1) / 2, 0.022, z]}
          receiveShadow
        >
          <planeGeometry args={[X1 - X0 + STREET, STREET]} />
          <meshStandardMaterial color={PAL.asphalt} roughness={0.95} />
        </mesh>
      ))}
      {/* sidewalks under the blocks */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[CITY.x, 0.012, CITY.z]}
        receiveShadow
      >
        <planeGeometry args={[CITY.w + STREET + 2, CITY.d + STREET + 2]} />
        <meshStandardMaterial color="#d9d2c3" roughness={1} />
      </mesh>
      {/* zebra crossings next to each intersection */}
      <Instances limit={crossings.length * 6 * 2}>
        <planeGeometry args={[0.6, 2.4]} />
        <meshStandardMaterial color={PAL.marking} />
        {crossings.flatMap((c, i) =>
          Array.from({ length: 6 }, (_, k) => [
            <Instance
              key={`${i}a${k}`}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[c.x - 2.25 + k * 0.9, 0.024, c.z + STREET / 2 + 1.4]}
            />,
            <Instance
              key={`${i}b${k}`}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
              position={[c.x + STREET / 2 + 1.4, 0.024, c.z - 2.25 + k * 0.9]}
            />,
          ]).flat(),
        )}
      </Instances>
    </>
  );
}

function Lamps() {
  const spots = useMemo(() => {
    const out: [number, number][] = [];
    XS.forEach((x) => {
      for (let z = Z0 + 8; z < Z1; z += 12) out.push([x + STREET / 2 + 0.6, z]);
    });
    ZS.forEach((z) => {
      for (let x = X0 + 8; x < X1; x += 12) out.push([x, z - STREET / 2 - 0.6]);
    });
    return out;
  }, []);
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        {spots.map(([x, z], i) => (
          <CylinderCollider key={i} args={[2, 0.15]} position={[x, 2, z]} />
        ))}
      </RigidBody>
      <Instances limit={spots.length} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 4, 6]} />
        <meshStandardMaterial color="#2f2f38" />
        {spots.map(([x, z], i) => (
          <Instance key={i} position={[x, 2, z]} />
        ))}
      </Instances>
      <Instances limit={spots.length}>
        <sphereGeometry args={[0.32, 10, 8]} />
        <meshStandardMaterial
          color="#fff6c2"
          emissive="#ffe27a"
          emissiveIntensity={1.1}
        />
        {spots.map(([x, z], i) => (
          <Instance key={i} position={[x, 4.1, z]} />
        ))}
      </Instances>
    </>
  );
}

function Cones() {
  const cones = useMemo(() => {
    const out: [number, number][] = [];
    [
      [-12, 50],
      [12, 68],
      [-12, 68],
      [12, 50],
    ].forEach(([x, z]) => {
      for (let k = 0; k < 4; k++) out.push([x! - 1.8 + k * 1.2, z! + 0.3]);
    });
    return out;
  }, []);
  return (
    <>
      {cones.map(([x, z], i) => (
        <RigidBody key={i} position={[x, 0.4, z]} colliders={false} mass={0.08}>
          <CylinderCollider args={[0.38, 0.28]} />
          <mesh castShadow>
            <coneGeometry args={[0.3, 0.76, 10]} />
            <meshStandardMaterial color="#ff7a1a" />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.12, 10]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}

function ParkedCar({
  x,
  z,
  rot,
  color,
}: {
  x: number;
  z: number;
  rot: number;
  color: string;
}) {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[x, 0, z]}
      rotation={[0, rot, 0]}
    >
      <CuboidCollider args={[0.85, 0.7, 1.5]} position={[0, 0.7, 0]} />
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.6, 0.6, 3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.1, -0.2]} castShadow>
        <boxGeometry args={[1.4, 0.5, 1.6]} />
        <meshStandardMaterial color="#e8eef4" />
      </mesh>
      {[-0.8, 0.8].map((wx) =>
        [-1, 1].map((wz) => (
          <mesh
            key={`${wx}${wz}`}
            position={[wx, 0.35, wz]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.35, 0.35, 0.25, 10]} />
            <meshStandardMaterial color="#1f1d1b" />
          </mesh>
        )),
      )}
    </RigidBody>
  );
}

/** the reading kiosk on the city square */
function Kiosk() {
  return (
    <group position={[KIOSK.x, 0, KIOSK.z]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, -2]}
        receiveShadow
      >
        <circleGeometry args={[9, 40]} />
        <meshStandardMaterial color={PAL.plaza} />
      </mesh>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[4, 2.5, 3]} position={[0, 2.5, 1]} />
      </RigidBody>
      <mesh position={[0, 0.4, 1]} receiveShadow>
        <boxGeometry args={[9, 0.8, 7]} />
        <meshStandardMaterial color="#efe6d6" />
      </mesh>
      <mesh position={[0, 3, 1.5]} castShadow>
        <boxGeometry args={[7, 4.4, 5]} />
        <meshStandardMaterial color={PAL.sky2} />
      </mesh>
      {[-3, -1, 1, 3].map((cx) => (
        <mesh key={cx} position={[cx, 2.6, -1.6]} castShadow>
          <cylinderGeometry args={[0.28, 0.32, 3.6, 10]} />
          <meshStandardMaterial color={PAL.cream} />
        </mesh>
      ))}
      <mesh position={[0, 5.4, 0.6]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[5.6, 2.4, 4]} />
        <meshStandardMaterial color={PAL.tomato} flatShading />
      </mesh>
      {/* benches and trees around the square (the post board stands in front) */}
      {[-6, 6].map((bx) => (
        <group key={bx} position={[bx, 0, -6]}>
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[2.4, 0.15, 0.7]} />
            <meshStandardMaterial color="#b98a5a" />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[2.2, 0.5, 0.15]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        </group>
      ))}
      <RoundTree x={-7} z={4} s={0.9} color="#7cc96b" />
      <RoundTree x={7} z={4} s={0.9} color="#7cc96b" />
    </group>
  );
}

export function City() {
  const tex = useWindowTexture();
  const buildings = useBuildings();
  const parked = useMemo(() => {
    const rand = seeded(9);
    return [
      { x: -12 + 2, z: 40, rot: 0 },
      { x: 12 - 2, z: 76, rot: Math.PI },
      { x: -36 + 2, z: 60, rot: 0 },
      { x: 36 - 2, z: 42, rot: Math.PI },
      { x: 2, z: 84 - 2, rot: Math.PI / 2 },
    ].map((c) => ({ ...c, color: BUILDING_COLORS[Math.floor(rand() * 9)]! }));
  }, []);

  return (
    <>
      <Streets />
      <RigidBody type="fixed" colliders={false}>
        {buildings.map((b, i) => (
          <CuboidCollider
            key={i}
            args={[b.w / 2, b.h / 2, b.d / 2]}
            position={[b.x, b.h / 2, b.z]}
          />
        ))}
      </RigidBody>
      {buildings.map((b, i) => (
        <BuildingMesh key={i} b={b} tex={tex} />
      ))}
      <Lamps />
      <Cones />
      {parked.map((c, i) => (
        <ParkedCar key={i} {...c} />
      ))}
      <Kiosk />
    </>
  );
}
