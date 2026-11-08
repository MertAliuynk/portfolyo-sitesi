"use client";

import { useEffect, useRef } from "react";

import {
  CITY,
  GALLERY,
  GARDEN,
  ISLAND_R,
  KIOSK,
  LIGHTHOUSE,
  PAL,
  PIER_DIR,
  PIER_FROM,
  PIER_TO,
  PLAZA,
  PORTAL,
  TRACK,
} from "~/components/yolculuk/layout";
import { car, useDrive } from "~/components/yolculuk/store";

/*
 * The camera looks along +z, so on screen +z is "up" and +x is LEFT.
 * Map coordinates follow the screen: mx = -x, my = -z.
 */
const R = ISLAND_R + 18;
const mx = (x: number) => -x;
const my = (z: number) => -z;

const LANDMARKS = [
  { icon: "🏙️", x: CITY.x - 22, z: CITY.z + 6 },
  { icon: "📌", x: KIOSK.x, z: KIOSK.z - 5 },
  { icon: "🏁", x: TRACK.x, z: TRACK.z },
  { icon: "🌷", x: GARDEN.x, z: GARDEN.z + 16 },
  { icon: "🖼️", x: GALLERY.x, z: GALLERY.z - 4 },
  { icon: "✨", x: PORTAL.x, z: PORTAL.z + 5 },
  { icon: "⛵", x: PIER_DIR.x * (PIER_TO + 6), z: PIER_DIR.z * (PIER_TO + 6) },
];

export function Minimap({ compact = false }: { compact?: boolean }) {
  const marker = useRef<SVGGElement>(null);
  const zones = useDrive((s) => s.zones);

  useEffect(() => {
    const id = window.setInterval(() => {
      const deg = (-car.heading * 180) / Math.PI;
      marker.current?.setAttribute(
        "transform",
        `translate(${mx(car.x)} ${my(car.z)}) rotate(${deg})`,
      );
    }, 80);
    return () => window.clearInterval(id);
  }, []);

  const pierA = { x: PIER_DIR.x * PIER_FROM, z: PIER_DIR.z * PIER_FROM };
  const pierB = { x: PIER_DIR.x * PIER_TO, z: PIER_DIR.z * PIER_TO };

  return (
    <svg
      viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`}
      className="h-full w-full"
      aria-label="Mini harita"
      role="img"
    >
      <defs>
        <pattern
          id="mm-waves"
          width="22"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 8 Q 5.5 3 11 8 T 22 8"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.45"
            strokeWidth="1.6"
          />
        </pattern>
        <pattern
          id="mm-dots"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1" fill="#1a1a1a" opacity="0.08" />
        </pattern>
      </defs>
      {/* sea */}
      <rect x={-R} y={-R} width={R * 2} height={R * 2} fill="#7fd6dc" />
      <rect x={-R} y={-R} width={R * 2} height={R * 2} fill="url(#mm-waves)" />
      {/* island */}
      <circle r={ISLAND_R + 6} fill="#ffffff" opacity={0.5} />
      <circle r={ISLAND_R + 3} fill={PAL.sand} />
      <circle r={ISLAND_R - 2} fill="#a6dc84" />
      <circle r={ISLAND_R - 2} fill="url(#mm-dots)" />
      {/* pier */}
      <line
        x1={mx(pierA.x)}
        y1={my(pierA.z)}
        x2={mx(pierB.x)}
        y2={my(pierB.z)}
        stroke="#c99a68"
        strokeWidth={6}
        strokeLinecap="round"
      />
      {/* districts */}
      <rect
        x={mx(CITY.x + CITY.w / 2) - 3}
        y={my(CITY.z + CITY.d / 2) - 3}
        width={CITY.w + 6}
        height={CITY.d + 6}
        rx={10}
        fill="#d8ccf2"
      />
      {[-24, 0, 24].map((dx) =>
        [-17, 0, 17].map((dz) =>
          dx === 0 && dz === 0 ? null : (
            <rect
              key={`${dx}${dz}`}
              x={mx(CITY.x + dx) - 7}
              y={my(CITY.z + dz) - 5}
              width={14}
              height={10}
              rx={3}
              fill="#b9a7e6"
            />
          ),
        ),
      )}
      <ellipse
        cx={mx(TRACK.x)}
        cy={my(TRACK.z)}
        rx={TRACK.rx}
        ry={TRACK.rz}
        fill="#93cf73"
        stroke="#5a5866"
        strokeWidth={TRACK.width}
      />
      <ellipse
        cx={mx(TRACK.x)}
        cy={my(TRACK.z)}
        rx={TRACK.rx}
        ry={TRACK.rz}
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.2}
        strokeDasharray="4 5"
      />
      <circle cx={mx(GARDEN.x)} cy={my(GARDEN.z)} r={GARDEN.r} fill="#7ccb64" />
      <circle
        cx={mx(GARDEN.x)}
        cy={my(GARDEN.z)}
        r={GARDEN.r}
        fill="none"
        stroke="#3e8f4a"
        strokeWidth={3}
        strokeDasharray="10 4"
      />
      <circle cx={mx(GARDEN.x)} cy={my(GARDEN.z)} r={6.5} fill="#7fd6dc" />
      <rect
        x={mx(GALLERY.x + 44)}
        y={my(GALLERY.z + 12)}
        width={88}
        height={22}
        rx={8}
        fill="#f3e2bf"
      />
      {/* roads */}
      <g stroke="#6b6976" strokeWidth={6} strokeLinecap="round">
        <line x1={0} y1={0} x2={mx(KIOSK.x)} y2={my(KIOSK.z - 13)} />
        <line x1={0} y1={0} x2={mx(GALLERY.x)} y2={my(GALLERY.z + 12)} />
        <line x1={0} y1={0} x2={mx(TRACK.x + TRACK.rx)} y2={0} />
        <line x1={0} y1={0} x2={mx(GARDEN.x - GARDEN.r)} y2={0} />
      </g>
      <circle r={PLAZA.r} fill="#f3e2bf" stroke="#6b6976" strokeWidth={2} />
      <circle
        cx={mx(LIGHTHOUSE.x)}
        cy={my(LIGHTHOUSE.z)}
        r={4.5}
        fill={PAL.tomato}
        stroke={PAL.ink}
        strokeWidth={1.5}
      />
      {/* stops */}
      {zones.map((z) => (
        <circle
          key={z.id}
          cx={mx(z.at[0])}
          cy={my(z.at[1])}
          r={z.kind === "project" ? 2.8 : 4}
          fill={z.color}
          stroke={PAL.ink}
          strokeWidth={1.4}
        />
      ))}
      {!compact &&
        LANDMARKS.map((l) => (
          <text
            key={l.icon}
            x={mx(l.x)}
            y={my(l.z)}
            fontSize={15}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {l.icon}
          </text>
        ))}
      {/* the car: a tiny red car with a pulse ring */}
      <g ref={marker}>
        <circle r={10} fill="#ffffff" opacity={0.6}>
          <animate
            attributeName="r"
            values="7;13;7"
            dur="1.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.7;0;0.7"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </circle>
        <rect
          x={-4.5}
          y={-7}
          width={9}
          height={14}
          rx={3.5}
          fill={PAL.tomato}
          stroke={PAL.ink}
          strokeWidth={1.8}
        />
        <rect x={-3} y={-1} width={6} height={4.5} rx={1.5} fill={PAL.cream} />
        <circle cx={-2.2} cy={-5.6} r={1} fill="#fff6c2" />
        <circle cx={2.2} cy={-5.6} r={1} fill="#fff6c2" />
      </g>
    </svg>
  );
}
