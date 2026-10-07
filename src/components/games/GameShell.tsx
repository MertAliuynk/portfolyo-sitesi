"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function GameShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-screen touch-none overflow-hidden bg-ink select-none">
      <div className="pointer-events-none absolute inset-0 z-20 opacity-60 [background:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.025)_0px,rgba(255,255,255,0.025)_1px,transparent_1px,transparent_3px)]" />
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        <Link
          href="/playground"
          className="glass-panel inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-paper/70 hover:text-paper"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Oyunlar
        </Link>
        <span className="font-display text-xs tracking-[0.2em] text-paper/40 uppercase">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
