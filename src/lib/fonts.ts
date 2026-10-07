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

/* Merakli (the original neon design) */
export const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  weight: ["500", "700"],
});

/* Mutlu */
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  axes: ["wdth", "opsz"],
});

export const caveat = Caveat({
  subsets: ["latin", "latin-ext"],
  variable: "--font-caveat",
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
  weight: ["400", "500"],
});

/* Sakin */
export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
  style: ["normal", "italic"],
});

/* Nostaljik */
export const vt323 = VT323({
  subsets: ["latin", "latin-ext"],
  variable: "--font-vt323",
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
