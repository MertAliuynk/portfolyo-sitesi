"use client";

import { Monitor, Smartphone, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MOODS, type MoodId } from "~/lib/moods";
import type { PostView } from "~/lib/posts";
import type { ProjectView } from "~/lib/projects";
import { cn } from "~/lib/utils";

export type PreviewData =
  | { kind: "post"; post: PostView }
  | { kind: "project"; project: ProjectView };

/**
 * Full-screen preview. The real mood page renders inside an iframe (so its
 * fixed navs and page colours behave exactly like on the site) and receives
 * the unsaved draft over postMessage.
 */
export function PreviewPanel({ data, onClose }: { data: PreviewData; onClose: () => void }) {
  const [mood, setMood] = useState<MoodId>("mutlu");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const frameRef = useRef<HTMLIFrameElement>(null);

  const send = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({ type: "preview", ...data }, window.location.origin);
  }, [data]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if ((e.data as { type?: string })?.type === "preview-ready") send();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [send]);

  useEffect(() => {
    send();
  }, [send]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#1c1917]/70 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#1c1917] px-3 py-2 text-white">
        <span className="mr-2 text-[13px] font-semibold">Önizleme</span>
        <div className="flex flex-wrap gap-1 rounded-lg bg-white/10 p-1">
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood(m.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[12px] font-medium transition",
                mood === m.id ? "bg-white text-[#1c1917]" : "text-white/70 hover:text-white",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1 rounded-lg bg-white/10 p-1">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={cn("rounded-md p-1.5", device === "desktop" ? "bg-white text-[#1c1917]" : "text-white/70")}
            aria-label="Masaüstü"
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={cn("rounded-md p-1.5", device === "mobile" ? "bg-white text-[#1c1917]" : "text-white/70")}
            aria-label="Telefon"
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Kapat (Esc)">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-hidden p-3">
        <iframe
          key={mood}
          ref={frameRef}
          title="Önizleme"
          src={`/admin/onizleme?mod=${mood}`}
          onLoad={send}
          className={cn(
            "h-full rounded-xl bg-white shadow-2xl transition-[width] duration-300",
            device === "mobile" ? "w-[390px]" : "w-full",
          )}
        />
      </div>
      <p className="pb-2 text-center text-[11px] text-white/50">
        Kaydedilmemiş hâli gösteriliyor · Esc ile kapat
      </p>
    </div>
  );
}
