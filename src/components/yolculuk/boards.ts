/**
 * Reading boards: billboards the camera flies up to so their content can be
 * read right there in the world. Shared by the boards (layout) and the car
 * (camera), so both agree on where the board is and how big it looks.
 */

export interface BoardPose {
  x: number;
  z: number;
  /** rotation about y; the readable face looks along local -z */
  rot: number;
}

/** frame and face sizes in world units, landscape (desktop) and portrait (phone) */
export const BOARD = {
  landscape: { frameW: 8.4, frameH: 5, faceW: 7.6, faceH: 4.2, centerY: 4.1 },
  portrait: { frameW: 5.2, frameH: 9.4, faceW: 4.6, faceH: 8.7, centerY: 5.8 },
} as const;

/** default (non-reading) face content is designed at this many px per world unit */
export const SUMMARY_PX = 100;

export function isPortrait(width: number, height: number) {
  return width < height * 0.9;
}

/** camera field of view when not boosting */
export function baseFov(portrait: boolean) {
  return portrait ? 55 : 45;
}

/** unit vector the readable face looks along */
export function faceDir(rot: number) {
  return { x: -Math.sin(rot), z: -Math.cos(rot) };
}

/**
 * Where the camera parks to read a board, and how many screen px one world
 * unit covers there — the board's HTML uses that so text is 1:1 sharp.
 */
export function readingView(
  pose: BoardPose,
  width: number,
  height: number,
  fovDeg: number,
) {
  const portrait = isPortrait(width, height);
  const b = portrait ? BOARD.portrait : BOARD.landscape;
  const t = Math.tan((fovDeg * Math.PI) / 360);
  const aspect = width / height;
  // leave room for the reading bar under the board
  const margin = portrait ? 1.1 : 1.2;
  const dist = Math.max(b.frameH / 2 / t, b.frameW / 2 / (t * aspect)) * margin;
  const pxPerUnit = height / (2 * dist * t);
  const d = faceDir(pose.rot);
  // aim a touch below the centre so the board sits high, clear of the bar
  const lift = portrait ? 0.35 : 0.3;
  return {
    portrait,
    board: b,
    dist,
    pxPerUnit,
    camera: {
      x: pose.x + d.x * dist,
      y: b.centerY - lift,
      z: pose.z + d.z * dist,
    },
    target: { x: pose.x, y: b.centerY - lift, z: pose.z },
  };
}
