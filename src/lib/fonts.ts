import {
  Bricolage_Grotesque,
  Caveat,
  Fraunces,
  Geist,
  IBM_Plex_Mono,
  Instrument_Serif,
  Inter_Tight,
  Space_Grotesk,
  VT323,
} from "next/font/google";

/*
 * Only the mood gate fonts (Inter Tight, Instrument Serif) are preloaded on
 * every page; the rest load when a mood actually uses them.
 */

/* Merakli (the original neon design) */
export const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
  preload: false,
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  preload: false,
  weight: ["500", "700"],
});

/* Mutlu */
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  preload: false,
  axes: ["wdth", "opsz"],
});

export const caveat = Caveat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-caveat",
  preload: false,
});

/* Ciddi */
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
});

export const interTight = Inter_Tight({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter-tight",
});

export const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-plex-mono",
  preload: false,
  weight: ["400", "500"],
});

/* Sakin */
export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  preload: false,
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
});

/* Nostaljik */
export const vt323 = VT323({
  subsets: ["latin", "latin-ext"],
  variable: "--font-vt323",
  preload: false,
  weight: "400",
});

export const fontVariables = [
  geist,
  spaceGrotesk,
  bricolage,
  caveat,
  instrumentSerif,
  interTight,
  plexMono,
  fraunces,
  vt323,
]
  .map((f) => f.variable)
  .join(" ");
