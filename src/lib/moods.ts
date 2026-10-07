export type MoodId = "mutlu" | "ciddi" | "sakin" | "merakli" | "nostaljik";

export interface Mood {
  id: MoodId;
  label: string;
  hint: string;
  /** colours used by the gate preview and the hand-off transition */
  bg: string;
  fg: string;
  accent: string;
}

export const MOODS: Mood[] = [
  {
    id: "mutlu",
    label: "Aşırı mutlu",
    hint: "renkli, gürültülü, zıplayan",
    bg: "#FFF1D6",
    fg: "#1A1A1A",
    accent: "#FF5A36",
  },
  {
    id: "ciddi",
    label: "Ciddi",
    hint: "net, sade, işe odaklı",
    bg: "#F4F2EE",
    fg: "#111111",
    accent: "#E5381F",
  },
  {
    id: "sakin",
    label: "Sakin",
    hint: "yavaş, yumuşak, acelesiz",
    bg: "#ECE5D8",
    fg: "#2F3A2F",
    accent: "#8A9A7B",
  },
  {
    id: "merakli",
    label: "Meraklı",
    hint: "karanlık, neon, sırlarla dolu",
    bg: "#05040D",
    fg: "#F6F3FF",
    accent: "#FF2FD0",
  },
  {
    id: "nostaljik",
    label: "Nostaljik",
    hint: "bip sesleri, pencereler, 1998",
    bg: "#008080",
    fg: "#FFFFFF",
    accent: "#000080",
  },
];

export const MOOD_STORAGE_KEY = "mert:mood";

export function isMoodId(value: unknown): value is MoodId {
  return MOODS.some((m) => m.id === value);
}

export function readStoredMood(): MoodId | null {
  try {
    const value = window.localStorage.getItem(MOOD_STORAGE_KEY);
    return isMoodId(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeMood(mood: MoodId) {
  try {
    window.localStorage.setItem(MOOD_STORAGE_KEY, mood);
  } catch {
    // storage blocked — the choice just won't be remembered
  }
}
