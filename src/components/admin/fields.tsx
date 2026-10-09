"use client";

import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { useRef, useState } from "react";

import { inputClass } from "~/components/admin/ui";
import { imageFiles, uploadImage } from "~/components/admin/upload";
import { cn } from "~/lib/utils";

export function CoverField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  async function upload(files: File[]) {
    const file = files[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadImage(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className="group relative overflow-hidden rounded-lg border border-[#e7e5e4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="aspect-video w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-md bg-white/90 px-2 py-1 text-[12px] font-medium"
            >
              Değiştir
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-md bg-white/90 p-1.5 text-red-600"
              aria-label="Kapağı kaldır"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            void upload(imageFiles(e.dataTransfer.files));
          }}
          className={cn(
            "flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed text-[12px] text-[#a8a29e] transition",
            over ? "border-[#1c1917] bg-[#f5f5f4] text-[#1c1917]" : "border-[#e7e5e4] hover:border-[#d6d3d1] hover:text-[#78716c]",
          )}
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {busy ? "Yükleniyor…" : "Kapak görseli yükle ya da sürükle"}
        </button>
      )}
      {error && <p className="mt-1.5 text-[12px] text-red-600">{error}</p>}
      <input
        ref={fileRef}
        type="file"
        hidden
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        onChange={(e) => {
          void upload(imageFiles(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function TagInput({
  value,
  onChange,
  placeholder = "Etiket yaz, Enter'a bas",
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");

  function add(raw: string) {
    const parts = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const next = [...value];
    for (const p of parts) if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) next.push(p);
    onChange(next.slice(0, 20));
    setText("");
  }

  return (
    <div className={cn(inputClass, "flex h-auto min-h-9 flex-wrap items-center gap-1.5 py-1.5")}>
      {value.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-[#f5f5f4] py-0.5 pr-1 pl-2 text-[12px] font-medium">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="rounded p-0.5 text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-[#1c1917]"
            aria-label={`${tag} etiketini kaldır`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === ",") && text.trim()) {
            e.preventDefault();
            add(text);
          } else if (e.key === "Backspace" && !text && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => text.trim() && add(text)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-24 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#a8a29e]"
      />
    </div>
  );
}

/** Date → value for <input type="datetime-local"> in local time. */
export function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
