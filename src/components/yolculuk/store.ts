"use client";

import { create } from "zustand";

import type { BoardPose } from "~/components/yolculuk/boards";

/** Live driver input, written by keyboard and touch, read every frame. */
export const input = {
  forward: false,
  back: false,
  left: false,
  right: false,
  brake: false,
  turbo: false,
  jump: false,
};

/**
 * Car telemetry, mutated every frame by the car. Read it from useFrame or
 * intervals (minimap, lap timer) — it is deliberately not React state.
 */
export const car = {
  x: 0,
  y: 0,
  z: 0,
  heading: 0,
  speed: 0,
  grounded: true,
  boost: 1,
};

export type ZoneKind =
  "project" | "posts" | "race" | "garden" | "city" | "portal" | "info";

export interface Zone {
  id: string;
  kind: ZoneKind;
  title: string;
  desc: string;
  at: [number, number];
  radius: number;
  color: string;
  /** project slug, for kind "project" */
  slug?: string;
  /** destination, for kind "portal" (leaves the world on purpose) */
  href?: string;
}

/**
 * The camera is parked in front of a board and the visitor is reading it.
 * `board` is "posts" or "project:<slug>"; on the posts board `post` is the
 * open post (null shows the list).
 */
export type Reading = { board: string; post?: string | null } | null;

interface DriveState {
  ready: boolean;
  started: boolean;
  zones: Zone[];
  boards: Record<string, BoardPose>;
  zone: string | null;
  reading: Reading;
  speed: number;
  boost: number;
  resetCount: number;
  lap: {
    running: boolean;
    start: number;
    last: number | null;
    best: number | null;
    next: number;
  };
  setReady: () => void;
  start: () => void;
  setZone: (zone: string | null) => void;
  read: (reading: Reading) => void;
  setHud: (speed: number, boost: number) => void;
  reset: () => void;
}

export const useDrive = create<DriveState>((set) => ({
  ready: false,
  started: false,
  zones: [],
  boards: {},
  zone: null,
  reading: null,
  speed: 0,
  boost: 1,
  resetCount: 0,
  lap: { running: false, start: 0, last: null, best: null, next: 0 },
  setReady: () => set({ ready: true }),
  start: () => set({ started: true }),
  setZone: (zone) => set((s) => (s.zone === zone ? s : { zone })),
  read: (reading) => set({ reading }),
  setHud: (speed, boost) => set({ speed, boost }),
  reset: () => set((s) => ({ resetCount: s.resetCount + 1 })),
}));

/** true while reading a board: the car ignores input */
export function controlsLocked() {
  return useDrive.getState().reading !== null;
}
