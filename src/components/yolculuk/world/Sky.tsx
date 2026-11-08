"use client";

import { Instance, Instances } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { ISLAND_R, PAL } from "~/components/yolculuk/layout";
import { seeded } from "~/components/yolculuk/world/parts";

export const HORIZON = "#ffe2c6";
const ZENITH = "#8fd0ff";

/** gradient dome: peach at the horizon, soft blue up high */
export function SkyDome() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color(ZENITH) },
          bottom: { value: new THREE.Color(HORIZON) },
        },
        vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 top; uniform vec3 bottom; varying vec3 vPos;
          void main(){ float h = clamp(normalize(vPos).y * 1.6 + 0.05, 0.0, 1.0); gl_FragColor = vec4(mix(bottom, top, smoothstep(0.0, 1.0, h)), 1.0); }`,
      }),
    [],
  );
  const ref = useRef<THREE.Mesh>(null);
  // the dome travels with the camera so it's never reached
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return (
    <mesh ref={ref} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[380, 32, 16]} />
    </mesh>
  );
}

/** puffy low-poly clouds drifting around the island, out over the sea */
export function Clouds() {
  const clouds = useMemo(() => {
    const rand = seeded(303);
    return Array.from({ length: 18 }, (_, i) => {
      const a = (i / 18) * Math.PI * 2 + rand() * 0.3;
      const r = ISLAND_R + 40 + rand() * 70;
      const blobs = Array.from(
        { length: 3 + Math.floor(rand() * 3) },
        (_, k) => ({
          x: (k - 1.5) * 2.6 + rand(),
          y: rand() * 1.2,
          z: (rand() - 0.5) * 2.4,
          s: 2 + rand() * 1.8,
        }),
      );
      return {
        a,
        r,
        y: 10 + rand() * 10,
        speed: 0.004 + rand() * 0.006,
        blobs,
      };
    });
  }, []);
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    group.current?.children.forEach((c, i) => {
      const cl = clouds[i]!;
      cl.a += cl.speed * dt;
      c.position.set(Math.sin(cl.a) * cl.r, cl.y, Math.cos(cl.a) * cl.r);
    });
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group
          key={i}
          position={[Math.sin(c.a) * c.r, c.y, Math.cos(c.a) * c.r]}
        >
          {c.blobs.map((b, k) => (
            <mesh key={k} position={[b.x, b.y, b.z]} scale={b.s}>
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={1}
                flatShading
                emissive="#fff4ea"
                emissiveIntensity={0.35}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** little birds circling high above the plaza */
export function Birds() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ref.current?.children.forEach((b, i) => {
      const a = t * 0.25 + i * 0.7;
      b.position.set(
        Math.sin(a) * (30 + i * 3),
        18 + Math.sin(t * 2 + i) * 0.6,
        Math.cos(a) * (30 + i * 3) + 10,
      );
      b.rotation.y = a + Math.PI / 2;
      const flap = Math.sin(t * 10 + i) * 0.6;
      b.children[0]!.rotation.z = flap;
      b.children[1]!.rotation.z = -flap;
    });
  });
  return (
    <group ref={ref}>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i}>
          <mesh position={[-0.35, 0, 0]}>
            <boxGeometry args={[0.7, 0.04, 0.25]} />
            <meshBasicMaterial color={PAL.ink} />
          </mesh>
          <mesh position={[0.35, 0, 0]}>
            <boxGeometry args={[0.7, 0.04, 0.25]} />
            <meshBasicMaterial color={PAL.ink} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** used by Forest: scattered wildflowers */
export function Flowers({
  spots,
}: {
  spots: { x: number; z: number; c: string; s: number }[];
}) {
  return (
    <>
      <Instances limit={spots.length}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 4]} />
        <meshStandardMaterial color="#4f9a45" />
        {spots.map((f, i) => (
          <Instance key={i} position={[f.x, 0.2 * f.s, f.z]} scale={f.s} />
        ))}
      </Instances>
      <Instances limit={spots.length}>
        <icosahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial roughness={0.6} />
        {spots.map((f, i) => (
          <Instance
            key={i}
            position={[f.x, 0.42 * f.s, f.z]}
            scale={f.s}
            color={f.c}
          />
        ))}
      </Instances>
    </>
  );
}
