import { faceDir, type BoardPose } from "~/components/yolculuk/boards";
import {
  GARDEN,
  KIOSK,
  PORTAL,
  TRACK,
  CITY,
  PAL,
} from "~/components/yolculuk/layout";
import type { Zone } from "~/components/yolculuk/store";
import type { ProjectView } from "~/lib/projects";

/**
 * Fixed stops on the island. Project stops are added from the database in
 * `buildZones`, one in front of each exhibit in the gallery.
 */
export const STATIC_ZONES: Zone[] = [
  {
    id: "kiosk",
    kind: "posts",
    title: "Yazı Panosu",
    desc: "Bütün yazılarım bu panoda asılı. Yaklaş, arabadan inmeden oku.",
    at: [KIOSK.x, KIOSK.z - 11.2],
    radius: 3.4,
    color: PAL.sky2,
  },
  {
    id: "race",
    kind: "race",
    title: "Yarış Pisti",
    desc: "Damalı çizgiden geç, tur sayacı başlasın. Turbo serbest!",
    at: [TRACK.x + TRACK.rx, TRACK.z],
    radius: 4,
    color: PAL.tomato,
  },
  {
    id: "garden",
    kind: "garden",
    title: "Bahçe",
    desc: "Biraz yavaşla. Çiçeklerin arasından, havuzun etrafından dolaş.",
    at: [GARDEN.x - GARDEN.r + 4, GARDEN.z],
    radius: 3.4,
    color: PAL.grassy,
  },
  {
    id: "city",
    kind: "city",
    title: "Şehir",
    desc: "Sokaklarda tur at, konileri devir. Yazı Köşkü şehrin meydanında.",
    at: [CITY.x, CITY.z - CITY.d / 2 - 4],
    radius: 3.4,
    color: PAL.sun,
  },
  {
    id: "portal",
    kind: "portal",
    title: "Duygular",
    desc: "Sürmekten sıkıldıysan bugün nasıl hissettiğini seç, siteyi öyle gez.",
    at: [PORTAL.x, PORTAL.z],
    radius: 3,
    color: PAL.lilac,
    href: "/",
  },
];

export const GALLERY_COLORS: Record<string, string> = {
  magenta: PAL.pink,
  sunset: PAL.sun,
  ocean: PAL.sky2,
  forest: PAL.grassy,
  cosmic: PAL.lilac,
};

/**
 * Exhibit positions: rows of up to 7 along a gentle arc facing the plaza.
 * Extra rows step further south, so the gallery grows with the portfolio.
 */
export function exhibitSpots(count: number, centerX: number, centerZ: number) {
  const perRow = 7;
  const spacing = 12;
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / perRow);
    const inRow = Math.min(perRow, count - row * perRow);
    const offset = ((i % perRow) - (inRow - 1) / 2) * spacing;
    // boards face the camera (south); extra rows step north towards the plaza
    const z = centerZ + row * 18 - Math.abs(offset) * 0.18;
    return { x: centerX + offset, z, rot: Math.atan2(offset, 40) };
  });
}

/** the post board stands on the kiosk square, facing the boulevard */
export const POSTS_BOARD: BoardPose = { x: KIOSK.x, z: KIOSK.z - 5, rot: 0 };

export function buildZones(
  projects: ProjectView[],
  gallery: { x: number; z: number },
) {
  const spots = exhibitSpots(projects.length, gallery.x, gallery.z);
  const boards: Record<string, BoardPose> = { posts: POSTS_BOARD };
  const projectZones: Zone[] = projects.map((p, i) => {
    const s = spots[i]!;
    boards[`project:${p.slug}`] = { x: s.x, z: s.z, rot: s.rot };
    // the pad sits in front of the board, along the direction it faces
    const d = faceDir(s.rot);
    return {
      id: `project:${p.slug}`,
      kind: "project",
      title: p.name,
      desc: p.summary,
      at: [s.x + d.x * 6.2, s.z + d.z * 6.2],
      radius: 2.8,
      color: GALLERY_COLORS[p.gradient] ?? PAL.sun,
      slug: p.slug,
    };
  });
  return { zones: [...STATIC_ZONES, ...projectZones], boards };
}
