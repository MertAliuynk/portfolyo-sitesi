"use client";

import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import type * as THREE from "three";

import { Car } from "~/components/yolculuk/Car";
import { GALLERY, PAL } from "~/components/yolculuk/layout";
import { Minimap } from "~/components/yolculuk/Minimap";
import { input, useDrive, type Zone } from "~/components/yolculuk/store";
import { City } from "~/components/yolculuk/world/City";
import { Forest } from "~/components/yolculuk/world/Forest";
import { Gallery, PostBoard } from "~/components/yolculuk/world/Gallery";
import { Garden } from "~/components/yolculuk/world/Garden";
import { Island } from "~/components/yolculuk/world/Island";
import { PlazaToys, Roads } from "~/components/yolculuk/world/Plaza";
import { RaceTrack } from "~/components/yolculuk/world/RaceTrack";
import { ZonePad } from "~/components/yolculuk/world/parts";
import {
  Birds,
  Clouds,
  HORIZON,
  SkyDome,
} from "~/components/yolculuk/world/Sky";
import { buildZones } from "~/components/yolculuk/zones";
import type { PostView } from "~/lib/posts";
import type { ProjectView } from "~/lib/projects";
import { cn } from "~/lib/utils";

function Ready() {
  const setReady = useDrive((s) => s.setReady);
  useEffect(() => setReady(), [setReady]);
  return null;
}

function ZonePads() {
  const zones = useDrive((s) => s.zones);
  // project boards already carry their name, so their pads stay quiet
  return zones.map((z) => (
    <ZonePad
      key={z.id}
      zone={z}
      sign={z.kind !== "project" && z.kind !== "posts"}
    />
  ));
}

/** static scenery: never remounted */
function Scenery({
  projects,
  posts,
}: {
  projects: ProjectView[];
  posts: PostView[];
}) {
  return (
    <>
      <SkyDome />
      <Clouds />
      <Birds />
      <Island />
      <Roads />
      <City />
      <PostBoard posts={posts} />
      <RaceTrack />
      <Garden />
      <Gallery projects={projects} />
      <Forest />
      <ZonePads />
    </>
  );
}

/** "başa dön" rebuilds the knockable props, so letters and crates stand up again */
function ToysWithReset() {
  const resetCount = useDrive((s) => s.resetCount);
  return <PlazaToys key={resetCount} />;
}

function Scene({
  projects,
  posts,
}: {
  projects: ProjectView[];
  posts: PostView[];
}) {
  const light = useRef<THREE.DirectionalLight>(null);
  return (
    <>
      <color attach="background" args={[HORIZON]} />
      <fog attach="fog" args={[HORIZON, 80, 230]} />
      <hemisphereLight args={["#fff6ea", "#a7d08c", 1.15]} />
      <ambientLight intensity={0.25} color="#ffe9d6" />
      <directionalLight
        ref={light}
        intensity={1.9}
        color="#fff3e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={42}
        shadow-camera-bottom={-42}
        shadow-camera-far={90}
        shadow-bias={-0.0005}
        shadow-radius={4}
      />
      <Physics gravity={[0, -20, 0]}>
        <Scenery projects={projects} posts={posts} />
        <ToysWithReset />
        <Car lightRef={light} />
        <Ready />
      </Physics>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* input                                                                */
/* ------------------------------------------------------------------ */

const KEYS: Record<string, keyof typeof input> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  KeyB: "brake",
  ShiftLeft: "turbo",
  ShiftRight: "turbo",
  Space: "jump",
};

function releaseAll() {
  for (const k of Object.keys(input)) input[k as keyof typeof input] = false;
}

/** ids of the project boards, in gallery order */
function projectBoards() {
  return useDrive
    .getState()
    .zones.filter((z) => z.kind === "project")
    .map((z) => z.id);
}

/** step to the previous/next exhibit while reading */
function stepBoard(dir: 1 | -1) {
  const { reading, read } = useDrive.getState();
  if (!reading?.board.startsWith("project:")) return;
  const ids = projectBoards();
  const i = ids.indexOf(reading.board);
  if (i < 0) return;
  read({ board: ids[(i + dir + ids.length) % ids.length]! });
}

function scrollBoard(dy: number) {
  // the main reading column of the open board
  const el = document.querySelector<HTMLElement>("[data-board-scroll]");
  el?.scrollBy({ top: dy, behavior: "smooth" });
}

/** the zone's main action: read its board, or leave through the portal */
function useZoneAction() {
  const router = useRouter();
  return (zone: Zone) => {
    const { read } = useDrive.getState();
    if (zone.kind === "project" && zone.slug)
      read({ board: `project:${zone.slug}` });
    else if (zone.kind === "posts") read({ board: "posts", post: null });
    else if (zone.kind === "portal" && zone.href) router.push(zone.href);
  };
}

function useKeyboard(act: (z: Zone) => void) {
  const actRef = useRef(act);
  useEffect(() => {
    actRef.current = act;
  });
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const st = useDrive.getState();
      if (st.reading) {
        const k = e.code;
        if (k === "Escape" || k === "Backspace") st.read(null);
        else if (k === "ArrowLeft" || k === "KeyA") stepBoard(-1);
        else if (k === "ArrowRight" || k === "KeyD") stepBoard(1);
        else if (k === "ArrowDown" || k === "KeyS") scrollBoard(120);
        else if (k === "ArrowUp" || k === "KeyW") scrollBoard(-120);
        else if (k === "Space" || k === "PageDown")
          scrollBoard(window.innerHeight * 0.6);
        else if (k === "PageUp") scrollBoard(-window.innerHeight * 0.6);
        else return;
        e.preventDefault();
        return;
      }
      const key = KEYS[e.code];
      if (key) {
        input[key] = true;
        e.preventDefault();
        st.start();
      }
      if (e.code === "KeyR") st.reset();
      if (e.code === "Enter" && st.zone) {
        const zone = st.zones.find((z) => z.id === st.zone);
        if (zone) {
          releaseAll();
          actRef.current(zone);
        }
      }
    };
    const up = (e: KeyboardEvent) => {
      const key = KEYS[e.code];
      if (key) input[key] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", releaseAll);
    // starting to read drops whatever was held, so the car doesn't keep going
    const unsub = useDrive.subscribe((s, prev) => {
      if (s.reading && !prev.reading) releaseAll();
    });
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", releaseAll);
      unsub();
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/* HUD pieces                                                           */
/* ------------------------------------------------------------------ */

const card =
  "rounded-2xl border-[3px] border-[#1A1A1A] shadow-[4px_4px_0_#1A1A1A]";
const pill =
  "inline-flex items-center gap-1.5 rounded-full border-[3px] border-[#1A1A1A] px-2.5 py-1 text-xs font-extrabold whitespace-nowrap md:px-3.5 md:py-1.5 md:text-sm shadow-[3px_3px_0_#1A1A1A] transition hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";

function Key({
  children,
  wide,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <kbd
      className={cn(
        "inline-grid h-6 min-w-6 place-items-center rounded-md border-2 border-[#1A1A1A] bg-[#FFF8EA] px-1 text-[11px] font-extrabold text-[#1A1A1A] shadow-[0_2px_0_#1A1A1A]",
        wide && "px-2",
      )}
    >
      {children}
    </kbd>
  );
}

function TouchPad({
  k,
  label,
  className,
}: {
  k: keyof typeof input;
  label: string;
  className?: string;
}) {
  const press = (down: boolean) => {
    input[k] = down;
    if (down) useDrive.getState().start();
  };
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        press(true);
      }}
      onPointerUp={() => press(false)}
      onPointerCancel={() => press(false)}
      onContextMenu={(e) => e.preventDefault()}
      className={cn(
        "font-pop grid h-16 w-16 touch-none place-items-center rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF8EA]/95 text-2xl font-extrabold shadow-[0_4px_0_#1A1A1A] select-none active:translate-y-1 active:shadow-none",
        className,
      )}
    >
      {label}
    </button>
  );
}

function fmt(ms: number | null) {
  if (ms === null) return "—";
  const s = ms / 1000;
  const m = Math.floor(s / 60);
  return `${m}:${(s - m * 60).toFixed(2).padStart(5, "0")}`;
}

function LapClock() {
  const lap = useDrive((s) => s.lap);
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!lap.running) return;
    const id = window.setInterval(() => setNow(performance.now()), 50);
    return () => window.clearInterval(id);
  }, [lap.running]);
  if (!lap.running && lap.best === null) return null;
  return (
    <div className={cn(card, "relative bg-[#FFF8EA] px-4 py-2 text-right")}>
      <span className="absolute -top-3 -left-2 -rotate-6 rounded-md border-2 border-[#1A1A1A] bg-[#FF5A36] px-1.5 text-[10px] font-extrabold text-white">
        🏁 MERT GP
      </span>
      <p className="text-2xl leading-none font-extrabold tabular-nums">
        {fmt(lap.running ? Math.max(0, now - lap.start) : null)}
      </p>
      <p className="mt-1 text-[11px] font-bold tabular-nums opacity-70">
        son {fmt(lap.last)} · en iyi {fmt(lap.best)}
      </p>
    </div>
  );
}

/** a round dial with a needle, plus a chunky turbo bar */
function Speedo() {
  const speed = useDrive((s) => s.speed);
  const boost = useDrive((s) => s.boost);
  const k = Math.min(speed / 115, 1);
  const angle = -135 + k * 270;
  const arc = 2 * Math.PI * 40 * 0.75;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-[118px] w-[118px] rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF8EA] shadow-[4px_4px_0_#1A1A1A]">
        <svg viewBox="0 0 100 100" className="absolute inset-0">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#1a1a1a18"
            strokeWidth="9"
            strokeDasharray={`${arc} 999`}
            transform="rotate(135 50 50)"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={k > 0.8 ? PAL.tomato : k > 0.45 ? PAL.sun : PAL.grassy}
            strokeWidth="9"
            strokeDasharray={`${arc * k} 999`}
            transform="rotate(135 50 50)"
            strokeLinecap="round"
            className="transition-[stroke-dasharray] duration-100"
          />
          <g
            transform={`rotate(${angle} 50 50)`}
            className="transition-transform duration-100"
          >
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="20"
              stroke="#1A1A1A"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
          <circle
            cx="50"
            cy="50"
            r="6"
            fill={PAL.tomato}
            stroke="#1A1A1A"
            strokeWidth="2.5"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-3 text-center">
          <span className="block text-xl leading-none font-extrabold tabular-nums">
            {speed}
          </span>
          <span className="text-[9px] font-extrabold tracking-widest opacity-50">
            KM/S
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 rounded-full border-[3px] border-[#1A1A1A] bg-[#1A1A1A] p-1 pr-2 shadow-[3px_3px_0_#1A1A1A55]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#FFC93C] text-[11px]">
          ⚡
        </span>
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className="h-3 w-2.5 rounded-sm transition-colors"
            style={{
              background:
                boost * 8 > i + 0.3
                  ? boost > 0.25
                    ? PAL.sun
                    : PAL.tomato
                  : "#ffffff22",
            }}
          />
        ))}
      </div>
    </div>
  );
}

const ZONE_ICON: Record<Zone["kind"], string> = {
  project: "🖼️",
  posts: "📌",
  race: "🏁",
  garden: "🌷",
  city: "🏙️",
  portal: "✨",
  info: "💡",
};

function ZoneCard({ zone, act }: { zone: Zone; act: (z: Zone) => void }) {
  const projects = useDrive(
    (s) => s.zones.filter((z) => z.kind === "project").length,
  );
  const best = useDrive((s) => s.lap.best);
  const action =
    zone.kind === "project"
      ? "Panoyu oku"
      : zone.kind === "posts"
        ? "Panoyu oku"
        : zone.kind === "portal"
          ? "Duygu seç"
          : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -4, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate: -1, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="pointer-events-auto absolute bottom-32 left-1/2 w-[min(90vw,390px)] -translate-x-1/2 md:bottom-8"
    >
      <div
        className={cn(card, "relative p-5 pt-6")}
        style={{ background: zone.color }}
      >
        <span className="absolute -top-5 left-5 grid h-10 w-10 rotate-[-8deg] place-items-center rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF8EA] text-xl shadow-[2px_2px_0_#1A1A1A]">
          {ZONE_ICON[zone.kind]}
        </span>
        <p className="text-2xl leading-tight font-extrabold">{zone.title}</p>
        <p className="mt-1 line-clamp-3 text-sm font-semibold opacity-85">
          {zone.desc}
        </p>
        {zone.kind === "race" && (
          <p className="mt-2 text-xs font-extrabold">En iyi tur: {fmt(best)}</p>
        )}
        {zone.kind === "city" && projects > 0 && (
          <p className="mt-2 text-xs font-extrabold">
            İpucu: güneydeki sergide {projects} proje panosu var.
          </p>
        )}
        {action && (
          <button
            type="button"
            onClick={() => act(zone)}
            className={cn(pill, "mt-4 bg-[#FFF8EA]")}
          >
            {action} →
            <span className="hidden md:inline">
              <Key wide>Enter</Key>
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

function ReadingBar() {
  const reading = useDrive((s) => s.reading);
  const zones = useDrive((s) => s.zones);
  const read = useDrive((s) => s.read);
  if (!reading) return null;
  const isProject = reading.board.startsWith("project:");
  const ids = zones.filter((z) => z.kind === "project");
  const i = ids.findIndex((z) => z.id === reading.board);
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border-[3px] border-[#1A1A1A] bg-[#FFF8EA] p-1.5 shadow-[4px_4px_0_#1A1A1A]"
    >
      <button
        type="button"
        onClick={() => read(null)}
        className="rounded-full bg-[#FF5A36] px-4 py-1.5 text-sm font-extrabold whitespace-nowrap text-white"
      >
        ← arabaya dön <span className="hidden opacity-70 md:inline">· Esc</span>
      </button>
      {isProject && ids.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => stepBoard(-1)}
            aria-label="Önceki proje"
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#1A1A1A] font-extrabold"
          >
            ‹
          </button>
          <span className="min-w-12 text-center text-sm font-extrabold tabular-nums">
            {i + 1}/{ids.length}
          </span>
          <button
            type="button"
            onClick={() => stepBoard(1)}
            aria-label="Sonraki proje"
            className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#1A1A1A] font-extrabold"
          >
            ›
          </button>
        </>
      )}
      <span className="hidden pr-3 text-xs font-bold opacity-60 lg:inline">
        ↑ ↓ kaydır{isProject ? " · ← → diğer pano" : ""}
      </span>
    </motion.div>
  );
}

function Hud({ act }: { act: (z: Zone) => void }) {
  const ready = useDrive((s) => s.ready);
  const started = useDrive((s) => s.started);
  const reading = useDrive((s) => s.reading);
  const zone = useDrive((s) => s.zones.find((z) => z.id === s.zone) ?? null);
  const read = useDrive((s) => s.read);

  return (
    <div className="font-pop pointer-events-none fixed inset-0 z-20 text-[#1A1A1A]">
      <AnimatePresence>
        {!reading && (
          <motion.div
            key="driving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <div className="pointer-events-auto absolute top-4 left-4 flex flex-wrap gap-2">
              <Link href="/" className={cn(pill, "bg-[#FFF8EA]")}>
                ← duygular
              </Link>
              <button
                type="button"
                onClick={() => useDrive.getState().reset()}
                className={cn(pill, "bg-[#FFC93C]")}
              >
                ↺ başa dön
              </button>
              <button
                type="button"
                onClick={() => read({ board: "posts", post: null })}
                className={cn(pill, "bg-[#4D9FFF] text-white")}
              >
                📌 yazılar
              </button>
            </div>

            <div className="absolute top-14 right-3 flex origin-top-right scale-[0.68] flex-col items-end gap-4 md:top-4 md:right-4 md:scale-100">
              <Speedo />
              <LapClock />
            </div>

            {/* minimap: postcard on desktop, small round one on phones */}
            <div className="absolute top-[62px] left-4 h-28 w-28 overflow-hidden rounded-full border-[3px] border-[#1A1A1A] shadow-[3px_3px_0_#1A1A1A] md:top-auto md:bottom-4 md:h-auto md:w-[214px] md:rounded-[22px] md:bg-[#FFF8EA] md:p-1.5 md:shadow-[5px_5px_0_#1A1A1A]">
              <p className="hidden items-center justify-between px-2 pt-0.5 pb-1 text-[11px] font-extrabold tracking-widest md:flex">
                <span>MERT ADASI</span>
                <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-[#1A1A1A] text-[9px]">
                  K
                </span>
              </p>
              <div className="h-full w-full overflow-hidden md:h-[200px] md:rounded-2xl md:border-[2.5px] md:border-[#1A1A1A]">
                <Minimap />
              </div>
            </div>

            <div className="absolute right-4 bottom-4 hidden flex-col items-end gap-1.5 rounded-2xl bg-[#1A1A1A]/75 p-3 text-[11px] font-bold text-[#FFF8EA] md:flex">
              <span className="flex items-center gap-1">
                <Key>W</Key>
                <Key>A</Key>
                <Key>S</Key>
                <Key>D</Key> sür
              </span>
              <span className="flex items-center gap-1">
                <Key wide>⇧ Shift</Key> turbo · <Key wide>Boşluk</Key> zıpla
              </span>
              <span className="flex items-center gap-1">
                <Key>B</Key> fren · <Key wide>Enter</Key> oku · <Key>R</Key>{" "}
                başa
              </span>
            </div>

            <AnimatePresence>
              {zone && <ZoneCard key={zone.id} zone={zone} act={act} />}
            </AnimatePresence>

            {/* touch controls */}
            <div className="pointer-events-auto absolute right-3 bottom-4 left-3 flex items-end justify-between md:hidden">
              <div className="flex gap-2">
                <TouchPad k="left" label="◀" />
                <TouchPad k="right" label="▶" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <TouchPad
                    k="jump"
                    label="⤒"
                    className="h-12 w-12 bg-[#B79CFF] text-xl"
                  />
                  <TouchPad
                    k="turbo"
                    label="⚡"
                    className="h-12 w-12 bg-[#FFC93C] text-xl"
                  />
                </div>
                <div className="flex gap-2">
                  <TouchPad k="back" label="▼" />
                  <TouchPad k="forward" label="▲" className="bg-[#2EC27E]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reading && <ReadingBar key="reading" />}
      </AnimatePresence>

      <AnimatePresence>
        {!started && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-auto absolute inset-0 grid place-items-center bg-[#ffe2c6]/60 px-6 backdrop-blur-[3px]"
          >
            <motion.div
              initial={{ y: 30, rotate: -3, opacity: 0 }}
              animate={{ y: 0, rotate: -1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              className="relative max-w-md rounded-[30px] border-[3px] border-[#1A1A1A] bg-[#FFF8EA] p-7 pt-9 text-center shadow-[8px_8px_0_#1A1A1A]"
            >
              <span className="absolute -top-7 left-1/2 grid h-14 w-14 -translate-x-1/2 rotate-[-8deg] place-items-center rounded-full border-[3px] border-[#1A1A1A] bg-[#FFC93C] text-3xl shadow-[3px_3px_0_#1A1A1A]">
                🚗
              </span>
              <p className="font-hand text-2xl text-[#FF5A36]">
                gizli bir yol buldun
              </p>
              <h1 className="mt-1 text-4xl font-extrabold tracking-tight">
                Mert Adası
              </h1>
              <p className="mt-3 text-sm leading-relaxed font-medium">
                Etrafı deniz, ortası dolu dolu bir ada. Güneyde proje sergisi,
                kuzeyde şehir ve yazı panosu, batıda yarış pisti, doğuda bahçe
                var. Bir panonun önüne gel, kamera yaklaşsın, oradan oku.
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold">
                <Key>W</Key>
                <Key>A</Key>
                <Key>S</Key>
                <Key>D</Key>
                <span className="mx-1">·</span>
                <Key wide>Shift</Key> turbo
                <span className="mx-1">·</span>
                <Key wide>Boşluk</Key> zıpla
                <span className="mx-1">·</span>
                <Key wide>Enter</Key> oku
              </div>
              <button
                type="button"
                disabled={!ready}
                onClick={() => useDrive.getState().start()}
                className="mt-6 rounded-full border-[3px] border-[#1A1A1A] bg-[#FF5A36] px-8 py-3 text-lg font-extrabold text-[#FFF8EA] shadow-[0_5px_0_#1A1A1A] transition hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-60"
              >
                {ready ? "Kontağı çevir" : "Ada yükleniyor…"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DriveExperience({
  projects,
  posts,
}: {
  projects: ProjectView[];
  posts: PostView[];
}) {
  const act = useZoneAction();
  useKeyboard(act);

  // fresh state when coming back to the page
  useEffect(() => {
    const { zones, boards } = buildZones(projects, GALLERY);
    useDrive.setState({
      ready: false,
      started: false,
      zone: null,
      reading: null,
      speed: 0,
      boost: 1,
      zones,
      boards,
    });
  }, [projects]);

  return (
    <div className="fixed inset-0 touch-none bg-[#ffe2c6] select-none">
      <Canvas
        flat
        shadows="soft"
        dpr={[1, 1.75]}
        camera={{ fov: 45, position: [0, 16, -22], near: 0.1, far: 800 }}
      >
        <Suspense fallback={null}>
          <Scene projects={projects} posts={posts} />
        </Suspense>
      </Canvas>
      <Hud act={act} />
    </div>
  );
}
