"use client";

import { AlertTriangle, Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";

import { Card, Field, Input, Textarea } from "~/components/admin/ui";
import type { RichNode } from "~/lib/rich/types";
import {
  LEVELS,
  seoChecks,
  TITLE_SUFFIX,
  type CheckState,
} from "~/lib/seo-check";
import { cn } from "~/lib/utils";

export interface SeoDraft {
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string | null;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  level: string;
}

const ICON: Record<CheckState, React.ReactNode> = {
  good: <Check className="h-3.5 w-3.5 text-emerald-600" />,
  warn: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
  bad: <X className="h-3.5 w-3.5 text-red-500" />,
};

function Counter({ n, min, max }: { n: number; min: number; max: number }) {
  return (
    <span
      className={cn(
        "tabular-nums",
        n === 0
          ? ""
          : n < min || n > max
            ? "text-amber-600"
            : "text-emerald-600",
      )}
    >
      {n}/{max}
    </span>
  );
}

/** search settings, a Google result preview and a live checklist */
export function SeoPanel({
  draft,
  doc,
  onChange,
}: {
  draft: SeoDraft;
  doc: RichNode;
  onChange: (
    key: "seoTitle" | "seoDescription" | "focusKeyword" | "level",
    value: string,
  ) => void;
}) {
  const [open, setOpen] = useState(true);
  const r = seoChecks({
    title: draft.title,
    seoTitle: draft.seoTitle || null,
    excerpt: draft.excerpt,
    seoDescription: draft.seoDescription || null,
    slug: draft.slug,
    focusKeyword: draft.focusKeyword || null,
    coverImage: draft.coverImage,
    doc,
  });
  const tone =
    r.score >= 80
      ? "bg-emerald-500"
      : r.score >= 55
        ? "bg-amber-400"
        : "bg-red-400";
  const sorted = [...r.checks].sort(
    (a, b) =>
      ["bad", "warn", "good"].indexOf(a.state) -
      ["bad", "warn", "good"].indexOf(b.state),
  );

  return (
    <Card className="p-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 text-left"
      >
        <h3 className="text-[13px] font-semibold">Arama (SEO)</h3>
        <span className="ml-auto text-[12px] font-medium tabular-nums">
          {r.score}/100
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#a8a29e] transition",
            open && "rotate-180",
          )}
        />
      </button>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f5f5f4]">
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${r.score}%` }}
        />
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          <Field
            label="Anahtar kelime"
            hint="İnsanların Google'a yazacağı ifade. Örn: react useEffect nedir"
          >
            <Input
              value={draft.focusKeyword}
              onChange={(e) => onChange("focusKeyword", e.target.value)}
              placeholder="ör. typescript generic"
            />
          </Field>

          <Field
            label="Seviye"
            hint="Ders yazılarında Google'a ve okura kimin için olduğunu söyler"
          >
            <div className="flex gap-1 rounded-lg border border-[#e7e5e4] p-0.5">
              {[{ id: "", label: "—" }, ...LEVELS].map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onChange("level", l.id)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1 text-[12px] font-medium transition",
                    draft.level === l.id
                      ? "bg-[#1c1917] text-white"
                      : "text-[#57534e] hover:bg-[#f5f5f4]",
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="SEO başlığı (isteğe bağlı)">
            <Input
              value={draft.seoTitle}
              onChange={(e) => onChange("seoTitle", e.target.value)}
              placeholder={`${draft.title || "Başlık"}${TITLE_SUFFIX}`}
              maxLength={120}
            />
            <span className="mt-1 flex justify-between text-[11px] text-[#a8a29e]">
              <span>Boşsa başlık + adın kullanılır</span>
              <Counter n={r.title.length} min={30} max={60} />
            </span>
          </Field>

          <Field label="Meta açıklama (isteğe bağlı)">
            <Textarea
              value={draft.seoDescription}
              onChange={(e) => onChange("seoDescription", e.target.value)}
              placeholder={
                draft.excerpt ||
                "Google'da başlığın altında görünecek 1–2 cümle"
              }
              rows={3}
              maxLength={300}
            />
            <span className="mt-1 flex justify-between text-[11px] text-[#a8a29e]">
              <span>Boşsa özet kullanılır</span>
              <Counter n={r.description.length} min={120} max={160} />
            </span>
          </Field>

          {/* what the result will roughly look like */}
          <div className="rounded-lg border border-[#e7e5e4] bg-white p-3">
            <p className="text-[11px] font-medium tracking-wide text-[#a8a29e] uppercase">
              Google önizlemesi
            </p>
            <p className="mt-2 truncate text-[12px] text-[#4d5156]">
              sitenin-adresi › blog › {draft.slug || "kisa-ad"}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[17px] leading-snug text-[#1a0dab]">
              {r.title}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[13px] leading-snug text-[#4d5156]">
              {r.description ||
                "Açıklama yok: Google sayfadan rastgele bir parça seçer."}
            </p>
          </div>

          <ul className="space-y-1.5">
            {sorted.map((c) => (
              <li
                key={c.id}
                className="flex gap-2 text-[12px] leading-snug text-[#44403c]"
              >
                <span className="mt-0.5 shrink-0">{ICON[c.state]}</span>
                {c.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
