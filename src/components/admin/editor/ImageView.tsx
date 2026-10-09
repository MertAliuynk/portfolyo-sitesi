"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { Trash2 } from "lucide-react";

import { cn } from "~/lib/utils";

const WIDTHS = [
  { id: "narrow", label: "Dar" },
  { id: "normal", label: "Normal" },
  { id: "wide", label: "Geniş" },
] as const;

export function ImageView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const { src, alt, caption, width } = node.attrs as {
    src: string;
    alt: string | null;
    caption: string;
    width: string;
  };

  return (
    <NodeViewWrapper
      className={cn(
        "image-view my-6",
        width === "narrow" && "mx-auto max-w-sm",
        width === "wide" && "-mx-6",
      )}
      data-drag-handle
    >
      <figure
        className={cn(
          "group relative rounded-xl transition",
          selected && "ring-2 ring-[#2563eb] ring-offset-4",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt ?? ""} className="w-full rounded-xl" draggable={false} />

        <div
          contentEditable={false}
          className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 p-1 opacity-0 backdrop-blur transition group-hover:opacity-100 data-[on=true]:opacity-100"
          data-on={selected}
        >
          {WIDTHS.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => updateAttributes({ width: w.id })}
              className={cn(
                "rounded-md px-2 py-1 text-[12px] font-medium text-white/75 hover:bg-white/15",
                width === w.id && "bg-white text-black hover:bg-white",
              )}
            >
              {w.label}
            </button>
          ))}
          <button
            type="button"
            onClick={deleteNode}
            className="rounded-md p-1.5 text-white/75 hover:bg-red-500 hover:text-white"
            aria-label="Resmi sil"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div contentEditable={false} className="mt-2 grid gap-1.5 sm:grid-cols-[1fr_14rem]">
          <input
            value={caption}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            placeholder="Alt yazı ekle (isteğe bağlı)"
            className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-center text-[14px] text-[#57534e] italic outline-none placeholder:text-[#a8a29e] hover:border-[#e7e5e4] focus:border-[#d6d3d1] sm:text-left"
          />
          <input
            value={alt ?? ""}
            onChange={(e) => updateAttributes({ alt: e.target.value })}
            placeholder="Alternatif metin (erişilebilirlik)"
            className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-[12px] text-[#78716c] outline-none placeholder:text-[#a8a29e] hover:border-[#e7e5e4] focus:border-[#d6d3d1]"
          />
        </div>
      </figure>
    </NodeViewWrapper>
  );
}
