/**
 * Island layout and palette. Remember: the camera looks towards +z, so
 * +x is on the LEFT of the screen and -x on the right.
 */
export const ISLAND_R = 104; // grass edge
export const DRIVE_R = 108; // invisible wall: the car stops on the beach
export const SEA_Y = -0.45;

export const PAL = {
  sky: "#ffe6c4",
  grass: "#9fd27e",
  grassDark: "#8cc46b",
  sand: "#f3dcaa",
  plaza: "#ead6ad",
  asphalt: "#4b4a55",
  asphaltLight: "#5c5b67",
  marking: "#f7f1e3",
  waterDeep: "#1f86b8",
  waterShallow: "#55d0d4",
  trunk: "#8a5a3b",
  leaf: "#2f9e8f",
  leaf2: "#5bbf8a",
  tomato: "#FF5A36",
  sun: "#FFC93C",
  sky2: "#4D9FFF",
  pink: "#FF8AD8",
  grassy: "#2EC27E",
  lilac: "#B79CFF",
  cream: "#FFF1D6",
  ink: "#1A1A1A",
};

/* district centres (x, z) */
export const PLAZA = { x: 0, z: 0, r: 13 };
export const CITY = { x: 0, z: 58, w: 72, d: 52 }; // w along x, d along z
export const TRACK = { x: -62, z: 4, rx: 22, rz: 34, width: 9 };
export const GARDEN = { x: 60, z: 6, r: 30 };
export const GALLERY = { x: 0, z: -54 };
export const LIGHTHOUSE = { x: -56, z: -80 };
export const PIER = { x: 58, z: -78 };
export const KIOSK = { x: 0, z: 60 };
export const PORTAL = { x: 18, z: -14 };

/** where a fresh car appears */
export const START: [number, number, number] = [0, 1.2, -6];

/* the pier sticks out to sea from PIER; the car may drive along it */
const PIER_LEN = Math.hypot(PIER.x, PIER.z);
export const PIER_DIR = { x: PIER.x / PIER_LEN, z: PIER.z / PIER_LEN };
export const PIER_FROM = PIER_LEN - 4; // distance from island centre
export const PIER_TO = PIER_LEN + 30;
export const PIER_HALF_W = 2.4;

export function onPier(x: number, z: number) {
  const along = x * PIER_DIR.x + z * PIER_DIR.z;
  const across = -x * PIER_DIR.z + z * PIER_DIR.x;
  return along > PIER_FROM && along < PIER_TO && Math.abs(across) < PIER_HALF_W;
}
