"use client";

import type { JSONContent } from "@tiptap/core";
import { ArrowLeft, ExternalLink, Eye, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RichEditor } from "~/components/admin/editor/RichEditor";
import { CoverField, TagInput } from "~/components/admin/fields";
import { PreviewPanel, type PreviewData } from "~/components/admin/PreviewPanel";
import { Badge, Button, Card, Field, Input, Textarea, Toggle } from "~/components/admin/ui";
import { slugify } from "~/lib/rich/extract";
import type { RichNode } from "~/lib/rich/types";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const GRADIENTS = [
  { id: "magenta", label: "Magenta", css: "from-fuchsia-500 via-purple-500 to-indigo-600" },
  { id: "sunset", label: "Gün batımı", css: "from-orange-400 via-pink-500 to-rose-500" },
  { id: "ocean", label: "Okyanus", css: "from-cyan-400 via-sky-500 to-blue-600" },
  { id: "forest", label: "Orman", css: "from-emerald-400 via-teal-500 to-cyan-500" },
  { id: "cosmic", label: "Kozmik", css: "from-violet-500 via-fuchsia-500 to-pink-500" },
] as const;

type Gradient = (typeof GRADIENTS)[number]["id"];

interface Draft {
  title: string;
  slug: string;
  slugTouched: boolean;
  summary: string;
  description: string;
  tags: string[];
  gradient: Gradient;
  liveUrl: string;
  repoUrl: string;
  year: number;
  featured: boolean;
  order: number;
  role: string;
  duration: string;
  status: string;
  coverImage: string | null;
}

const EMPTY: Draft = {
  title: "",
  slug: "",
  slugTouched: false,
  summary: "",
  description: "",
  tags: [],
  gradient: "magenta",
  liveUrl: "",
  repoUrl: "",
  year: new Date().getFullYear(),
  featured: false,
  order: 0,
  role: "",
  duration: "",
  status: "",
  coverImage: null,
};

function errorText(err: unknown) {
  const e = err as { data?: { zodError?: { fieldErrors?: Record<string, string[]> } }; message?: string };
  const fields = e.data?.zodError?.fieldErrors;
  if (fields) {
    const [key, msgs] = Object.entries(fields)[0] ?? [];
    if (key && msgs?.[0]) {
      const names: Record<string, string> = { liveUrl: "Canlı adres", repoUrl: "Kod adresi", slug: "Kısa ad", title: "Başlık", summary: "Özet" };
      return `${names[key] ?? key}: ${msgs[0]}`;
    }
  }
  return e.message ?? "Kaydedilemedi";
}

const orNull = (s: string) => (s.trim() ? s.trim() : null);

export function ProjectEditor({ id }: { id: string | null }) {
  const router = useRouter();
  const utils = api.useUtils();
  const query = api.admin.project.useQuery({ id: id ?? "" }, { enabled: !!id, refetchOnWindowFocus: false });

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [doc, setDoc] = useState<JSONContent | null>(null);
  const [initial, setInitial] = useState<JSONContent | string | null>(id ? null : "");
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const p = query.data;
    if (!p) return;
    setDraft({
      title: p.title,
      slug: p.slug,
      slugTouched: true,
      summary: p.summary,
      description: p.description,
      tags: p.tags.split(",").map((t) => t.trim()).filter(Boolean),
      gradient: (GRADIENTS.some((g) => g.id === p.gradient) ? p.gradient : "magenta") as Gradient,
      liveUrl: p.liveUrl ?? "",
      repoUrl: p.repoUrl ?? "",
      year: p.year,
      featured: p.featured,
      order: p.order,
      role: p.role ?? "",
      duration: p.duration ?? "",
      status: p.status ?? "",
      coverImage: p.coverImage,
    });
    const content = p.contentJson ? (JSON.parse(p.contentJson) as JSONContent) : "";
    setInitial(content);
    if (typeof content !== "string") setDoc(content);
  }, [query.data]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft.title]);

  const update = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      if (key === "title" && !d.slugTouched) next.slug = slugify((value as string).split("—")[0] ?? "");
      return next;
    });
    setDirty(true);
  }, []);

  const onEditorChange = useCallback((json: JSONContent) => {
    setDoc(json);
    setDirty(true);
  }, []);

  const create = api.admin.createProject.useMutation();
  const save = api.admin.updateProject.useMutation();
  const remove = api.admin.deleteProject.useMutation();
  const saving = create.isPending || save.isPending;

  // an editor with nothing but an empty paragraph means "no case study"
  const hasBody = useMemo(() => {
    const content = doc?.content ?? [];
    return content.some((n) => n.type !== "paragraph" || (n.content?.length ?? 0) > 0);
  }, [doc]);

  const submit = useCallback(async () => {
    setError(null);
    const input = {
      title: draft.title,
      slug: draft.slug || slugify(draft.title),
      summary: draft.summary,
      description: draft.description,
      tags: draft.tags,
      gradient: draft.gradient,
      liveUrl: orNull(draft.liveUrl),
      repoUrl: orNull(draft.repoUrl),
      year: draft.year,
      featured: draft.featured,
      order: draft.order,
      role: orNull(draft.role),
      duration: orNull(draft.duration),
      status: orNull(draft.status),
      coverImage: draft.coverImage,
      contentJson: hasBody && doc ? JSON.stringify(doc) : null,
    };
    try {
      if (id) {
        await save.mutateAsync({ id, ...input });
        setDraft((d) => ({ ...d, slug: input.slug }));
        setDirty(false);
      } else {
        const res = await create.mutateAsync(input);
        setDirty(false);
        router.replace(`/admin/projeler/${res.id}`);
      }
      void utils.admin.projects.invalidate();
      void utils.admin.stats.invalidate();
    } catch (err) {
      setError(errorText(err));
    }
  }, [draft, doc, hasBody, id, save, create, router, utils]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit]);

  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const previewData: PreviewData = useMemo(() => {
    const [name, ...rest] = (draft.title || "Adsız proje").split("—");
    return {
      kind: "project",
      project: {
        id: id ?? "onizleme",
        slug: draft.slug || "onizleme",
        title: draft.title,
        name: name!.trim(),
        subtitle: rest.join("—").trim() || null,
        summary: draft.summary,
        description: draft.description,
        tags: draft.tags,
        gradient: draft.gradient,
        liveUrl: orNull(draft.liveUrl),
        repoUrl: orNull(draft.repoUrl),
        year: draft.year,
        featured: draft.featured,
        role: orNull(draft.role),
        duration: orNull(draft.duration),
        status: orNull(draft.status),
        coverImage: draft.coverImage,
        doc: hasBody && doc ? (doc as RichNode) : null,
      },
    };
  }, [draft, doc, hasBody, id]);

  if (id && query.isLoading) {
    return (
      <div className="grid h-96 place-items-center text-[#a8a29e]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (id && query.error) return <p className="text-red-600">Proje bulunamadı.</p>;

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 mb-6 flex flex-wrap items-center gap-2 border-b border-[#e7e5e4] bg-[#f6f5f2]/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <Link href="/admin/projeler" className="mr-1 rounded-lg p-1.5 text-[#78716c] hover:bg-white hover:text-[#1c1917]" aria-label="Projelere dön">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-[14px] font-semibold">{id ? "Projeyi düzenle" : "Yeni proje"}</span>
        {draft.featured && <Badge tone="blue">Öne çıkan</Badge>}
        <span className="text-[12px] text-[#a8a29e]">
          {saving ? "Kaydediliyor…" : dirty ? "Kaydedilmemiş değişiklikler" : id ? "Kaydedildi" : ""}
        </span>
        <div className="ml-auto flex gap-2">
          <Button onClick={() => setPreview(true)}>
            <Eye className="h-4 w-4" /> Önizle
          </Button>
          <Button variant="primary" onClick={() => void submit()} loading={saving}>
            <Save className="h-4 w-4" /> Kaydet
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-4">
          <textarea
            ref={titleRef}
            value={draft.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Proje adı — kısa alt başlık"
            rows={1}
            className="w-full resize-none overflow-hidden bg-transparent text-[2.2rem] leading-tight font-semibold tracking-tight outline-none placeholder:text-[#d6d3d1]"
          />
          <p className="-mt-2 text-[12px] text-[#a8a29e]">
            İpucu: &quot;Pulse — Gerçek Zamanlı Analitik&quot; gibi uzun tire ile ayırırsan, ilk kısım proje adı, ikincisi alt başlık olur.
          </p>

          <Card className="grid gap-4 p-4 sm:grid-cols-2">
            <Field label="Özet" hint="Kartlarda görünen tek cümle" className="sm:col-span-2">
              <Textarea value={draft.summary} onChange={(e) => update("summary", e.target.value)} rows={2} maxLength={400} />
            </Field>
            <Field label="Kısa açıklama" hint="Vaka çalışması yazmadıysan detay sayfasında bu gösterilir" className="sm:col-span-2">
              <Textarea value={draft.description} onChange={(e) => update("description", e.target.value)} rows={3} maxLength={2000} />
            </Field>
            <Field label="Teknolojiler" className="sm:col-span-2">
              <TagInput value={draft.tags} onChange={(v) => update("tags", v)} placeholder="Next.js, tRPC… (Enter ile ekle)" />
            </Field>
            <Field label="Rolün">
              <Input value={draft.role} onChange={(e) => update("role", e.target.value)} placeholder="Örn. Baş geliştirici" />
            </Field>
            <Field label="Süre">
              <Input value={draft.duration} onChange={(e) => update("duration", e.target.value)} placeholder="Örn. 4 ay" />
            </Field>
            <Field label="Canlı adres">
              <Input type="url" value={draft.liveUrl} onChange={(e) => update("liveUrl", e.target.value)} placeholder="https://" />
            </Field>
            <Field label="Kaynak kod">
              <Input type="url" value={draft.repoUrl} onChange={(e) => update("repoUrl", e.target.value)} placeholder="https://github.com/…" />
            </Field>
          </Card>

          <div>
            <h3 className="mb-2 text-[13px] font-semibold">Vaka çalışması</h3>
            <p className="mb-3 text-[12px] text-[#a8a29e]">
              Problemi, yaklaşımını, ekran görüntülerini, kod parçalarını ve sonuçları anlat. Her mod bunu kendi tasarımıyla gösterir.
            </p>
            {initial !== null && (
              <RichEditor
                key={id ?? "new"}
                initial={initial}
                onChange={onEditorChange}
                placeholder="Projenin hikayesini anlat… Blok eklemek için / yaz"
                stickyTop={61}
              />
            )}
          </div>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card className="space-y-4 p-4">
            <h3 className="text-[13px] font-semibold">Görünürlük</h3>
            <Toggle
              checked={draft.featured}
              onChange={(v) => update("featured", v)}
              label="Öne çıkan"
              description="Mutlu, Sakin ve Meraklı ana sayfalarında gösterilir."
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Yıl">
                <Input type="number" min={1990} max={2100} value={draft.year} onChange={(e) => update("year", Number(e.target.value) || draft.year)} />
              </Field>
              <Field label="Sıra" hint="Küçük olan önce">
                <Input type="number" min={0} max={999} value={draft.order} onChange={(e) => update("order", Math.max(0, Number(e.target.value) || 0))} />
              </Field>
            </div>
            <Field label="Durum">
              <Input list="project-status" value={draft.status} onChange={(e) => update("status", e.target.value)} placeholder="Yayında, Geliştiriliyor…" />
              <datalist id="project-status">
                {["Yayında", "Geliştiriliyor", "Beta", "Arşivlendi", "Konsept"].map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </Field>
            <Field label="Adres (kısa ad)" hint={`/…/projeler/${draft.slug || "kisa-ad"}`}>
              <Input
                value={draft.slug}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, slug: slugify(e.target.value) || e.target.value.toLowerCase(), slugTouched: true }));
                  setDirty(true);
                }}
              />
            </Field>
          </Card>

          <Card className="space-y-3 p-4">
            <h3 className="text-[13px] font-semibold">Renk</h3>
            <div className="grid grid-cols-5 gap-2">
              {GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  title={g.label}
                  onClick={() => update("gradient", g.id)}
                  className={cn(
                    "aspect-square rounded-lg bg-gradient-to-br transition",
                    g.css,
                    draft.gradient === g.id ? "ring-2 ring-[#1c1917] ring-offset-2" : "opacity-80 hover:opacity-100",
                  )}
                />
              ))}
            </div>
          </Card>

          <Card className="space-y-3 p-4">
            <h3 className="text-[13px] font-semibold">Kapak görseli</h3>
            <CoverField value={draft.coverImage} onChange={(v) => update("coverImage", v)} />
          </Card>

          {id && (
            <Card className="p-4">
              <h3 className="text-[13px] font-semibold">Sitede aç</h3>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
                {[
                  ["Mutlu", `/mutlu/projeler/${draft.slug}`],
                  ["Ciddi", `/ciddi/projeler/${draft.slug}`],
                  ["Sakin", `/sakin/projeler/${draft.slug}`],
                  ["Meraklı", `/projeler/${draft.slug}`],
                ].map(([label, href]) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#2563eb] hover:underline">
                    {label} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </Card>
          )}

          {id && (
            <Card className="p-4">
              {confirmDelete ? (
                <div className="space-y-2">
                  <p className="text-[13px]">Bu proje kalıcı olarak silinecek. Emin misin?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      loading={remove.isPending}
                      onClick={async () => {
                        await remove.mutateAsync({ id });
                        setDirty(false);
                        void utils.admin.projects.invalidate();
                        void utils.admin.stats.invalidate();
                        router.push("/admin/projeler");
                      }}
                    >
                      Evet, sil
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                      Vazgeç
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="danger" onClick={() => setConfirmDelete(true)} className="w-full">
                  <Trash2 className="h-4 w-4" /> Projeyi sil
                </Button>
              )}
            </Card>
          )}
        </aside>
      </div>

      {preview && <PreviewPanel data={previewData} onClose={() => setPreview(false)} />}
    </div>
  );
}
