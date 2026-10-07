"use client";

import { useCallback, useEffect, useState } from "react";

const PREFIX = "mert:best:";

export function readBest(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? null : Number(raw);
  } catch {
    return null;
  }
}

/**
 * Per-browser best score. `lowerIsBetter` for things like reaction time or
 * move counts. `submit` returns true when the score is a new record.
 */
export function useBest(key: string, lowerIsBetter = false) {
  const [best, setBest] = useState<number | null>(null);

  useEffect(() => {
    setBest(readBest(key));
  }, [key]);

  const submit = useCallback(
    (score: number) => {
      const current = readBest(key);
      const better =
        current === null || (lowerIsBetter ? score < current : score > current);
      if (!better) return false;
      try {
        window.localStorage.setItem(PREFIX + key, String(score));
      } catch {
        // storage blocked — the record just isn't kept
      }
      setBest(score);
      return true;
    },
    [key, lowerIsBetter],
  );

  return { best, submit };
}
