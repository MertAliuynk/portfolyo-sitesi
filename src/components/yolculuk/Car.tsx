"use client";

import { Outlines, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CuboidCollider,
  RigidBody,
  useRapier,
  type RapierCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { baseFov, isPortrait, readingView } from "~/components/yolculuk/boards";
import { DRIVE_R, onPier, PAL, START } from "~/components/yolculuk/layout";
import {
  car,
  controlsLocked,
  input,
  useDrive,
} from "~/components/yolculuk/store";

/* arcade tuning — tweak freely */
const ACCEL = 22;
const BRAKE = 36;
const MAX_FORWARD = 19;
const MAX_REVERSE = 8;
const TURBO_SPEED = 1.65; // × max speed while boosting
const TURBO_ACCEL = 1.9;
const BOOST_DRAIN = 0.32; // per second
const BOOST_REFILL = 0.12;
const DRAG = 3.4;
const TURN = 2.5;
const GRAVITY = 30;
const JUMP = 11;

const INK = PAL.ink;
const LINE = 0.035;
const GLASS = "#2c4a66";

type CarCtl = ReturnType<
  ReturnType<typeof useRapier>["world"]["createCharacterController"]
>;

/* ------------------------------------------------------------------ */
/* model                                                                */
/* ------------------------------------------------------------------ */

function Wheel({
  position,
  steer,
}: {
  position: [number, number, number];
  steer?: boolean;
}) {
  const side = Math.sign(position[0]);
  return (
    <group position={position} name={steer ? "steer" : "wheel"}>
      <group name="spin">
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.44, 0.44, 0.4, 20]} />
          <meshStandardMaterial color="#2a2730" roughness={0.85} />
          <Outlines thickness={LINE} color={INK} />
        </mesh>
        <mesh position={[side * 0.205, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.02, 16]} />
          <meshStandardMaterial color={PAL.cream} roughness={0.4} />
        </mesh>
        {/* a spoke so the spin is visible */}
        <mesh position={[side * 0.215, 0, 0]}>
          <boxGeometry args={[0.02, 0.36, 0.08]} />
          <meshStandardMaterial color={PAL.sun} />
        </mesh>
        <mesh position={[side * 0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 10]} />
          <meshStandardMaterial color={PAL.tomato} />
        </mesh>
      </group>
    </group>
  );
}

function CarModel({
  flame,
  body,
  antenna,
  brakeMat,
}: {
  flame: React.RefObject<THREE.Group | null>;
  body: React.RefObject<THREE.Group | null>;
  antenna: React.RefObject<THREE.Group | null>;
  brakeMat: THREE.MeshStandardMaterial;
}) {
  return (
    <group>
      <group ref={body}>
        {/* chassis */}
        <RoundedBox
          args={[1.8, 0.64, 3.2]}
          radius={0.26}
          smoothness={4}
          position={[0, 0.66, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={PAL.tomato} roughness={0.42} />
          <Outlines thickness={LINE} color={INK} />
        </RoundedBox>
        {/* racing stripes over the hood */}
        {[-0.22, 0.22].map((x) => (
          <mesh key={x} position={[x, 0.985, 0.85]}>
            <boxGeometry args={[0.16, 0.02, 1.25]} />
            <meshStandardMaterial color={PAL.cream} />
          </mesh>
        ))}
        {/* cabin */}
        <RoundedBox
          args={[1.5, 0.74, 1.7]}
          radius={0.3}
          smoothness={4}
          position={[0, 1.24, -0.32]}
          castShadow
        >
          <meshStandardMaterial color={PAL.cream} roughness={0.5} />
          <Outlines thickness={LINE} color={INK} />
        </RoundedBox>
        {/* windows */}
        <RoundedBox
          args={[1.22, 0.42, 0.05]}
          radius={0.02}
          position={[0, 1.27, 0.535]}
        >
          <meshStandardMaterial
            color={GLASS}
            roughness={0.15}
            metalness={0.2}
          />
        </RoundedBox>
        <RoundedBox
          args={[1.22, 0.38, 0.05]}
          radius={0.02}
          position={[0, 1.27, -1.175]}
        >
          <meshStandardMaterial
            color={GLASS}
            roughness={0.15}
            metalness={0.2}
          />
        </RoundedBox>
        {[-1, 1].map((s) => (
          <RoundedBox
            key={s}
            args={[0.05, 0.38, 1.18]}
            radius={0.02}
            position={[s * 0.755, 1.27, -0.32]}
          >
            <meshStandardMaterial
              color={GLASS}
              roughness={0.15}
              metalness={0.2}
            />
          </RoundedBox>
        ))}
        {/* glint on the windscreen */}
        <mesh position={[-0.35, 1.3, 0.565]} rotation={[0, 0, 0.5]}>
          <planeGeometry args={[0.07, 0.34]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
        </mesh>
        {/* headlights: round, big and friendly */}
        {[-0.55, 0.55].map((x) => (
          <group key={x} position={[x, 0.74, 1.6]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.06, 20]} />
              <meshStandardMaterial color={INK} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.025]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 20]} />
              <meshStandardMaterial
                color="#fffbe6"
                emissive="#fff1a0"
                emissiveIntensity={1.1}
              />
            </mesh>
            <mesh position={[0.05, 0.06, 0.05]}>
              <sphereGeometry args={[0.045, 8, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
        {/* grille smile */}
        <mesh position={[0, 0.6, 1.585]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.26, 0.045, 8, 20, Math.PI]} />
          <meshStandardMaterial color={INK} />
        </mesh>
        {/* bumpers */}
        <RoundedBox
          args={[1.72, 0.22, 0.32]}
          radius={0.1}
          position={[0, 0.38, 1.56]}
          castShadow
        >
          <meshStandardMaterial color="#3a3640" />
        </RoundedBox>
        <RoundedBox
          args={[1.72, 0.22, 0.32]}
          radius={0.1}
          position={[0, 0.38, -1.56]}
          castShadow
        >
          <meshStandardMaterial color="#3a3640" />
        </RoundedBox>
        {/* tail lights */}
        {[-0.6, 0.6].map((x) => (
          <RoundedBox
            key={x}
            args={[0.36, 0.16, 0.05]}
            radius={0.05}
            position={[x, 0.76, -1.6]}
            material={brakeMat}
          />
        ))}
        {/* surfboard on the roof: it's an island, after all */}
        <group position={[0.08, 1.7, -0.3]} rotation={[0, 0.08, 0.06]}>
          <RoundedBox args={[0.56, 0.08, 2.3]} radius={0.04} castShadow>
            <meshStandardMaterial color={PAL.sky2} />
            <Outlines thickness={0.025} color={INK} />
          </RoundedBox>
          <mesh position={[0, 0.045, 0]}>
            <boxGeometry args={[0.1, 0.01, 2.1]} />
            <meshStandardMaterial color={PAL.sun} />
          </mesh>
        </group>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 1.63, -0.3]}>
            <boxGeometry args={[0.08, 0.08, 1.2]} />
            <meshStandardMaterial color={INK} />
          </mesh>
        ))}
        {/* antenna with a pom-pom; it wobbles */}
        <group ref={antenna} position={[-0.6, 0.98, -1.25]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.025, 1, 6]} />
            <meshStandardMaterial color={INK} />
          </mesh>
          <mesh position={[0, 1.05, 0]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshStandardMaterial color={PAL.pink} />
          </mesh>
        </group>
        {/* exhausts + turbo flames */}
        {[-0.45, 0.45].map((x) => (
          <mesh
            key={x}
            position={[x, 0.36, -1.72]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.09, 0.09, 0.2, 10]} />
            <meshStandardMaterial
              color="#8c8a92"
              metalness={0.6}
              roughness={0.3}
            />
          </mesh>
        ))}
        <group ref={flame} visible={false}>
          {[-0.45, 0.45].map((x) => (
            <group key={x} position={[x, 0.36, -1.85]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.35]}>
                <coneGeometry args={[0.16, 0.72, 10]} />
                <meshBasicMaterial color="#ff9d2e" transparent opacity={0.9} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.22]}>
                <coneGeometry args={[0.09, 0.42, 8]} />
                <meshBasicMaterial color="#fff6c2" />
              </mesh>
            </group>
          ))}
        </group>
      </group>
      <Wheel position={[-0.9, 0.44, 1.02]} steer />
      <Wheel position={[0.9, 0.44, 1.02]} steer />
      <Wheel position={[-0.9, 0.44, -1.02]} />
      <Wheel position={[0.9, 0.44, -1.02]} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* dust puffs                                                           */
/* ------------------------------------------------------------------ */

const PUFFS = 40;

interface Puff {
  life: number;
  max: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  s: number;
}

function useDust() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const puffs = useMemo<Puff[]>(
    () =>
      Array.from({ length: PUFFS }, () => ({
        life: 1,
        max: 1,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        s: 1,
      })),
    [],
  );
  const next = useRef(0);
  const tmp = useMemo(
    () => ({
      m: new THREE.Matrix4(),
      q: new THREE.Quaternion(),
      v: new THREE.Vector3(),
      s: new THREE.Vector3(),
    }),
    [],
  );

  const spawn = (
    x: number,
    y: number,
    z: number,
    spread: number,
    size: number,
  ) => {
    const p = puffs[next.current]!;
    next.current = (next.current + 1) % PUFFS;
    Object.assign(p, {
      life: 0,
      max: 0.55 + Math.random() * 0.35,
      x,
      y,
      z,
      vx: (Math.random() - 0.5) * spread,
      vy: 0.6 + Math.random() * 0.9,
      vz: (Math.random() - 0.5) * spread,
      s: size * (0.7 + Math.random() * 0.5),
    });
  };

  const update = (dt: number) => {
    const im = mesh.current;
    if (!im) return;
    puffs.forEach((p, i) => {
      if (p.life < p.max) {
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        p.vy *= 0.96;
      }
      const k = Math.min(1, p.life / p.max);
      // pop up quickly, then shrink away
      const size =
        p.life < p.max ? p.s * Math.sin(Math.PI * Math.pow(k, 0.6)) : 0;
      tmp.m.compose(
        tmp.v.set(p.x, p.y, p.z),
        tmp.q,
        tmp.s.setScalar(Math.max(size, 0.0001)),
      );
      im.setMatrixAt(i, tmp.m);
    });
    im.instanceMatrix.needsUpdate = true;
  };

  const node = (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, PUFFS]}
      frustumCulled={false}
    >
      <icosahedronGeometry args={[0.32, 1]} />
      <meshStandardMaterial color="#fff6e6" roughness={1} flatShading />
    </instancedMesh>
  );
  return { node, spawn, update };
}

/* ------------------------------------------------------------------ */
/* the car                                                              */
/* ------------------------------------------------------------------ */

export function Car({
  lightRef,
}: {
  lightRef: React.RefObject<THREE.DirectionalLight | null>;
}) {
  const rbRef = useRef<RapierRigidBody>(null);
  const collider = useRef<RapierCollider>(null);
  const visual = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const antenna = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Group>(null);
  const brakeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c8102e",
        emissive: "#ff2a2a",
        emissiveIntensity: 0.4,
      }),
    [],
  );
  const dust = useDust();
  const { world } = useRapier();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const ctl = useRef<CarCtl | null>(null);
  const resetCount = useDrive((s) => s.resetCount);

  const sim = useRef({
    speed: 0,
    heading: 0,
    vy: 0,
    steer: 0,
    spin: 0,
    boost: 1,
    jumpHeld: false,
    hudT: 0,
    dustT: 0,
    lastZone: null as string | null,
    wasGrounded: true,
    fallSpeed: 0,
    lastSpeed: 0,
    // body springs
    squash: 0,
    squashV: 0,
    pitch: 0,
    pitchV: 0,
    roll: 0,
    rollV: 0,
    ant: 0,
    antV: 0,
  });

  useEffect(() => {
    const c = world.createCharacterController(0.05);
    c.setUp({ x: 0, y: 1, z: 0 });
    c.setApplyImpulsesToDynamicBodies(true);
    c.setCharacterMass(7);
    c.enableAutostep(0.35, 0.3, false);
    c.setMaxSlopeClimbAngle((40 * Math.PI) / 180);
    c.setMinSlopeSlideAngle((52 * Math.PI) / 180);
    c.enableSnapToGround(0.35);
    ctl.current = c;
    return () => {
      world.removeCharacterController(c);
      ctl.current = null;
    };
  }, [world]);

  useEffect(() => {
    if (!rbRef.current) return;
    rbRef.current.setNextKinematicTranslation({
      x: START[0],
      y: START[1],
      z: START[2],
    });
    rbRef.current.setNextKinematicRotation(new THREE.Quaternion());
    Object.assign(sim.current, { speed: 0, heading: 0, vy: 0 });
  }, [resetCount]);

  const tmpQ = useRef(new THREE.Quaternion());
  const up = useRef(new THREE.Vector3(0, 1, 0));
  const camTarget = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());

  useFrame((state, rawDt) => {
    const rb = rbRef.current;
    const col = collider.current;
    const c = ctl.current;
    if (!rb || !col || !c) return;
    const dt = Math.min(rawDt, 1 / 30);
    const s = sim.current;
    const live = useDrive.getState().started && !controlsLocked();
    const grounded = c.computedGrounded();

    /* ---- turbo ---- */
    const boosting = live && input.turbo && s.boost > 0.02 && input.forward;
    s.boost = THREE.MathUtils.clamp(
      s.boost + (boosting ? -BOOST_DRAIN : BOOST_REFILL) * dt,
      0,
      1,
    );
    const maxF = MAX_FORWARD * (boosting ? TURBO_SPEED : 1);

    /* ---- throttle, brake, reverse ---- */
    const throttle = live ? (input.forward ? 1 : 0) - (input.back ? 1 : 0) : 0;
    const accel = ACCEL * (boosting ? TURBO_ACCEL : 1) * (grounded ? 1 : 0.35);
    if (throttle > 0) s.speed += (s.speed < 0 ? BRAKE : accel) * dt;
    else if (throttle < 0) s.speed -= (s.speed > 0 ? BRAKE : accel * 0.7) * dt;
    else if (grounded)
      s.speed -= Math.sign(s.speed) * Math.min(Math.abs(s.speed), DRAG * dt);
    const braking = live && input.brake && grounded;
    if (braking)
      s.speed -=
        Math.sign(s.speed) * Math.min(Math.abs(s.speed), BRAKE * 1.4 * dt);
    // past the turbo limit: ease back down instead of snapping
    if (s.speed > maxF) s.speed = Math.max(maxF, s.speed - BRAKE * 0.5 * dt);
    s.speed = Math.max(s.speed, -MAX_REVERSE);

    /* ---- steering: stronger at speed, flipped in reverse, weak in the air ---- */
    const steerInput = live ? (input.left ? 1 : 0) - (input.right ? 1 : 0) : 0;
    s.steer = THREE.MathUtils.lerp(s.steer, steerInput, 1 - Math.exp(-10 * dt));
    const grip =
      THREE.MathUtils.clamp(Math.abs(s.speed) / 6, 0, 1) * (grounded ? 1 : 0.3);
    s.heading +=
      s.steer *
      TURN *
      grip *
      Math.sign(s.speed || 1) *
      dt *
      (input.brake ? 1.5 : 1);

    /* ---- jump + gravity ---- */
    if (live && input.jump && !s.jumpHeld && grounded) s.vy = JUMP;
    s.jumpHeld = input.jump;
    s.vy -= GRAVITY * dt;

    const desired = {
      x: Math.sin(s.heading) * s.speed * dt,
      y: s.vy * dt,
      z: Math.cos(s.heading) * s.speed * dt,
    };
    c.computeColliderMovement(col, desired);
    const moved = c.computedMovement();
    const nowGrounded = c.computedGrounded();
    if (!nowGrounded) s.fallSpeed = s.vy;
    if (nowGrounded && s.vy < 0) s.vy = -1;
    if (!nowGrounded && desired.y > 0 && moved.y < desired.y * 0.5)
      s.vy = Math.min(s.vy, 0); // hit a ceiling

    const want = Math.hypot(desired.x, desired.z);
    const got = Math.hypot(moved.x, moved.z);
    if (want > 0.001 && got / want < 0.6) s.speed *= 0.85;

    const p = rb.translation();
    const next = { x: p.x + moved.x, y: p.y + moved.y, z: p.z + moved.z };
    // never past the shoreline wall (belt and braces with the colliders)
    const r = Math.hypot(next.x, next.z);
    if (r > DRIVE_R && !onPier(next.x, next.z)) {
      next.x *= DRIVE_R / r;
      next.z *= DRIVE_R / r;
      s.speed *= 0.7;
    }
    if (next.y < -12) {
      useDrive.getState().reset();
      return;
    }
    rb.setNextKinematicTranslation(next);
    tmpQ.current.setFromAxisAngle(up.current, s.heading);
    rb.setNextKinematicRotation(tmpQ.current);

    /* ---- telemetry for minimap / laps ---- */
    Object.assign(car, {
      x: next.x,
      y: next.y,
      z: next.z,
      heading: s.heading,
      speed: s.speed,
      grounded: nowGrounded,
      boost: s.boost,
    });

    /* ---- body springs: pitch on throttle, roll in turns, squash on landing ---- */
    if (nowGrounded && !s.wasGrounded && s.fallSpeed < -4) {
      s.squashV -= Math.min(1.4, -s.fallSpeed / 9);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        dust.spawn(
          next.x + Math.sin(a) * 1.2,
          next.y + 0.15,
          next.z + Math.cos(a) * 1.6,
          3,
          1.1,
        );
      }
    }
    s.wasGrounded = nowGrounded;
    const accelNow = (s.speed - s.lastSpeed) / Math.max(dt, 1e-4);
    s.lastSpeed = s.speed;
    const spring = (
      x: number,
      v: number,
      target: number,
      k: number,
      damp: number,
    ): [number, number] => {
      const nv = v + ((target - x) * k - v * damp) * dt;
      return [x + nv * dt, nv];
    };
    const stretch = nowGrounded
      ? 0
      : THREE.MathUtils.clamp(s.vy * 0.012, -0.08, 0.1);
    [s.squash, s.squashV] = spring(s.squash, s.squashV, stretch, 220, 12);
    const pitchTarget = nowGrounded
      ? THREE.MathUtils.clamp(-accelNow * 0.004, -0.09, 0.09)
      : THREE.MathUtils.clamp(-s.vy * 0.02, -0.3, 0.3);
    [s.pitch, s.pitchV] = spring(s.pitch, s.pitchV, pitchTarget, 120, 10);
    const rollTarget =
      -s.steer * grip * Math.min(Math.abs(s.speed) / MAX_FORWARD, 1.3) * 0.12;
    [s.roll, s.rollV] = spring(s.roll, s.rollV, rollTarget, 140, 9);
    [s.ant, s.antV] = spring(
      s.ant,
      s.antV,
      THREE.MathUtils.clamp(-accelNow * 0.02, -0.7, 0.7),
      60,
      3,
    );

    /* ---- visuals ---- */
    s.spin += (s.speed * dt) / 0.44;
    visual.current?.traverse((o) => {
      if (o.name === "spin") o.rotation.x = s.spin;
      if (o.name === "steer") o.rotation.y = s.steer * 0.5;
    });
    if (bodyRef.current) {
      const sq = s.squash;
      bodyRef.current.scale.set(1 - sq * 0.5, 1 + sq, 1 - sq * 0.5);
      // a tiny engine rumble at speed
      const rumble =
        Math.sin(state.clock.elapsedTime * 22) *
        Math.min(Math.abs(s.speed) / 60, 0.015);
      bodyRef.current.position.y = sq * 0.4 + rumble;
      bodyRef.current.rotation.x = s.pitch;
      bodyRef.current.rotation.z = s.roll;
    }
    if (antenna.current) {
      antenna.current.rotation.x = s.ant;
      antenna.current.rotation.z = -s.roll * 2;
    }
    if (flame.current) {
      flame.current.visible = boosting;
      const f = 0.8 + Math.sin(state.clock.elapsedTime * 60) * 0.25;
      flame.current.scale.set(f, f, 0.8 + f * 0.6);
    }
    const brakeGlow =
      braking || (throttle < 0 && s.speed > 0.5)
        ? 2.4
        : throttle < 0
          ? 1.4
          : 0.4;
    brakeMat.emissiveIntensity = THREE.MathUtils.lerp(
      brakeMat.emissiveIntensity,
      brakeGlow,
      0.3,
    );

    /* ---- dust from the rear wheels ---- */
    s.dustT -= dt;
    const drifting = Math.abs(s.steer) > 0.6 && Math.abs(s.speed) > 9;
    if (
      nowGrounded &&
      s.dustT <= 0 &&
      (Math.abs(s.speed) > 6 || braking || boosting)
    ) {
      s.dustT = boosting ? 0.03 : drifting || braking ? 0.045 : 0.1;
      const back = -1.25 * Math.sign(s.speed || 1);
      for (const side of [-0.85, 0.85]) {
        const ox = Math.cos(s.heading) * side + Math.sin(s.heading) * back;
        const oz = -Math.sin(s.heading) * side + Math.cos(s.heading) * back;
        dust.spawn(
          next.x + ox,
          next.y + 0.2,
          next.z + oz,
          1.4,
          boosting ? 0.9 : 0.7,
        );
      }
    }
    dust.update(dt);

    /* ---- camera: follow the car, or park in front of the board being read ---- */
    const portrait = isPortrait(size.width, size.height);
    const { reading, boards } = useDrive.getState();
    const pose = reading ? boards[reading.board] : undefined;
    let targetFov = baseFov(portrait) + (boosting ? 9 : 0);
    if (pose) {
      const v = readingView(pose, size.width, size.height, baseFov(portrait));
      camTarget.current.set(v.camera.x, v.camera.y, v.camera.z);
      lookTarget.current.set(v.target.x, v.target.y, v.target.z);
      camera.position.lerp(camTarget.current, 1 - Math.exp(-4.5 * dt));
      look.current.lerp(lookTarget.current, 1 - Math.exp(-7 * dt));
      targetFov = baseFov(portrait);
    } else {
      const dist = portrait ? 21 : 15;
      camTarget.current.set(next.x, next.y + dist, next.z - dist);
      camera.position.lerp(camTarget.current, 1 - Math.exp(-4 * dt));
      lookTarget.current.set(next.x, next.y, next.z);
      look.current.lerp(lookTarget.current, 1 - Math.exp(-6 * dt));
    }
    camera.lookAt(look.current);
    if (Math.abs(camera.fov - targetFov) > 0.05) {
      camera.fov = THREE.MathUtils.lerp(
        camera.fov,
        targetFov,
        1 - Math.exp(-3 * dt),
      );
      camera.updateProjectionMatrix();
    }
    const light = lightRef.current;
    if (light) {
      const fx = pose ? pose.x : next.x;
      const fz = pose ? pose.z : next.z;
      light.position.set(fx + 14, 26, fz + 8);
      light.target.position.set(fx, 0, fz);
      light.target.updateMatrixWorld();
    }

    /* ---- HUD (throttled) + zones ---- */
    s.hudT += dt;
    if (s.hudT > 0.1) {
      s.hudT = 0;
      useDrive
        .getState()
        .setHud(
          Math.round(Math.abs(s.speed) * 3.6),
          Math.round(s.boost * 100) / 100,
        );
    }
    const zones = useDrive.getState().zones;
    const zone =
      zones.find(
        (z) => Math.hypot(next.x - z.at[0], next.z - z.at[1]) < z.radius,
      )?.id ?? null;
    if (zone !== s.lastZone) {
      s.lastZone = zone;
      useDrive.getState().setZone(zone);
    }
  });

  return (
    <>
      <RigidBody
        ref={rbRef}
        type="kinematicPosition"
        colliders={false}
        position={START}
      >
        <CuboidCollider
          ref={collider}
          args={[0.85, 0.42, 1.55]}
          position={[0, 0.42, 0]}
        />
        <group ref={visual}>
          <CarModel
            flame={flame}
            body={bodyRef}
            antenna={antenna}
            brakeMat={brakeMat}
          />
        </group>
      </RigidBody>
      {dust.node}
    </>
  );
}
