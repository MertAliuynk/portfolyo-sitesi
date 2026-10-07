"use client";

import { useEffect } from "react";

import { storeMood, type MoodId } from "~/lib/moods";

export function RememberMood({ mood }: { mood: MoodId }) {
  useEffect(() => {
    storeMood(mood);
  }, [mood]);

  return null;
}
