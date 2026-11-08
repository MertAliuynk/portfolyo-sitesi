"use client";

import { Html, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";

import {
  BOARD,
  baseFov,
  isPortrait,
  readingView,
  SUMMARY_PX,
  type BoardPose,
} from "~/components/yolculuk/boards";
import { PAL } from "~/components/yolculuk/layout";
import { useDrive } from "~/components/yolculuk/store";
import { useLabelVisible } from "~/components/yolculuk/world/parts";

const L = BOARD.landscape;
const P = BOARD.portrait;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A board on legs that can be read up close. From afar it shows `summary`
 * (designed at 760×420 px); once the visitor reads it the camera parks in
 * front and `reading` is rendered at screen resolution. On a phone the board
 * stretches into a tall poster so the text stays big enough.
 */
export function Billboard({
  id,
  pose,
  color,
  face = PAL.cream,
  summary,
  reading,
  children,
}: {
  id: string;
  pose: BoardPose;
  color: string;
  face?: string;
  summary: React.ReactNode;
  reading: (layout: {
    portrait: boolean;
    width: number;
    height: number;
  }) => React.ReactNode;
  children?: React.ReactNode;
}) {
  const active = useDrive((s) => s.reading?.board === id);
  const summaryVisible = useLabelVisible(pose.x, pose.z, 62);
  const size = useThree((s) => s.size);
  const portrait = isPortrait(size.width, size.height);
  const frame = useRef<THREE.Group>(null);
  const faceMesh = useRef<THREE.Mesh>(null);
  const morph = useRef(0);
  const [settled, setSettled] = useState(false);

  const view = readingView(pose, size.width, size.height, baseFov(portrait));

  useEffect(() => {
    if (!active) setSettled(false);
  }, [active]);

  const since = useRef(0);
  useFrame(({ camera, clock }, dt) => {
    // show the sharp reading layer once the camera has (nearly) arrived,
    // or after a moment on slow devices
    if (!active) since.current = 0;
    else if (!settled) {
      if (!since.current) since.current = clock.elapsedTime;
      const c = view.camera;
      const d = Math.hypot(
        camera.position.x - c.x,
        camera.position.y - c.y,
        camera.position.z - c.z,
      );
      if (d < view.dist * 0.12 || clock.elapsedTime - since.current > 1.2)
        setSettled(true);
    }
    const target = active && portrait ? 1 : 0;
    morph.current += (target - morph.current) * (1 - Math.exp(-7 * dt));
    const m = morph.current;
    if (frame.current) {
      frame.current.position.y = lerp(L.centerY, P.centerY, m);
      frame.current.scale.set(
        lerp(L.frameW, P.frameW, m),
        lerp(L.frameH, P.frameH, m),
        1,
      );
    }
    if (faceMesh.current) {
      // the face lives inside the frame group, so scale it relative to it
      faceMesh.current.scale.set(
        lerp(L.faceW, P.faceW, m) / lerp(L.frameW, P.frameW, m),
        lerp(L.faceH, P.faceH, m) / lerp(L.frameH, P.frameH, m),
        1,
      );
    }
  });

  const b = view.board;
  const w = Math.round(b.faceW * view.pxPerUnit);
  const h = Math.round(b.faceH * view.pxPerUnit);

  return (
    <group position={[pose.x, 0, pose.z]} rotation={[0, pose.rot, 0]}>
      {children}
      <group
        ref={frame}
        position={[0, L.centerY, 0]}
        scale={[L.frameW, L.frameH, 1]}
      >
        <RoundedBox args={[1, 1, 0.34]} radius={0.06} smoothness={3} castShadow>
          <meshStandardMaterial color={color} roughness={0.55} />
        </RoundedBox>
        <mesh
          ref={faceMesh}
          position={[0, 0, -0.18]}
          scale={[L.faceW / L.frameW, L.faceH / L.frameH, 1]}
        >
          <boxGeometry args={[1, 1, 0.04]} />
          <meshStandardMaterial color={face} roughness={0.9} />
        </mesh>
      </group>

      {summaryVisible && (
        <Html
          position={[0, L.centerY, -0.23]}
          rotation={[0, Math.PI, 0]}
          transform
          distanceFactor={400 / SUMMARY_PX}
          zIndexRange={[10, 0]}
          className="pointer-events-none select-none"
        >
          <div
            style={{
              width: L.faceW * SUMMARY_PX,
              height: L.faceH * SUMMARY_PX,
            }}
            className="font-pop overflow-hidden text-[#1A1A1A]"
          >
            {summary}
          </div>
        </Html>
      )}

      {active && settled && (
        <Html
          position={[0, b.centerY, -0.23]}
          rotation={[0, Math.PI, 0]}
          transform
          distanceFactor={400 / view.pxPerUnit}
          zIndexRange={[12, 0]}
        >
          <div
            style={{ width: w, height: h }}
            className="font-pop animate-[board-in_.35s_ease-out] overflow-hidden text-[#1A1A1A] select-text"
          >
            {reading({ portrait: view.portrait, width: w, height: h })}
          </div>
        </Html>
      )}
    </group>
  );
}
