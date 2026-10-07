"use client";

import { useEffect, useRef } from "react";

import { KONAMI_CODE } from "~/lib/site";
import { usePortalStore } from "~/stores/portal-store";

/**
 * Listens for the Konami code anywhere on the site. Success warps the
 * visitor to /blog — a hidden shortcut to content that also has a normal,
 * visible link in the footer terminal.
 */
export function KonamiListener() {
  const trigger = usePortalStore((s) => s.trigger);
  const active = usePortalStore((s) => s.active);
  const progress = useRef(0);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (active) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = KONAMI_CODE[progress.current];

      if (key === expected) {
        progress.current += 1;
        if (progress.current === KONAMI_CODE.length) {
          progress.current = 0;
          trigger("/blog", "Kod doğru. Blog'a ışınlanıyorsun 🚀");
        }
      } else {
        progress.current = key === KONAMI_CODE[0] ? 1 : 0;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, trigger]);

  return null;
}
