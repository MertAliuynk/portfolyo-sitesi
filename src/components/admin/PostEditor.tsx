"use client";

import type { JSONContent } from "@tiptap/core";
import { ArrowLeft, Eye, ExternalLink, Loader2, Save, Trash2 } from "lucide-react";
import { marked } from "marked";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RichEditor, type EditorStats } from "~/components/admin/editor/RichEditor";
import { CoverField, toLocalInput } from "~/components/admin/fields";
import { PreviewPanel, type PreviewData } from "~/components/admin/PreviewPanel";
import { Badge, Button, Card, Field, Input, Textarea, Toggle } from "~/components/admin/ui";
import { formatDate, formatDateLong } from "~/lib/posts";
import { readingMinutes, slugify } from "~/lib/rich/extract";
import type { RichNode } from "~/lib/rich/types";
import { api } from "~/trpc/react";

interface Draft {
  title: string;
  slug: string;
  slugTouched: boolean;
  excerpt: string;
  tag: string;
  readingTime: number;
  autoReading: boolean;
  coverImage: string | null;
  published: boolean;
  publishedAt: Date;
}

const EMPTY: Draft = {
  title: "",
  slug: "",
  slugTouched: false,
  excerpt: "",
  tag: "",
  readingTime: 1,
  autoReading: true,
  coverImage: null,
  published: false,
  publishedAt: new Date(),
};

function errorText(err: unknown) {
  const e = err as { data?: { zodError?: { fieldErrors?: Record<string, string[]> } }; message?: string };
  const fields = e.data?.zodError?.fieldErrors;
  if (fields) {
    const first = Object.values(fields).flat()[0];
    if (first) return first;
  }
  return e.message ?? "Kaydedilemedi";
}

export function PostEditor({ id }: { id: string | null }) {
  const router = useRouter();
  const utils = api.useUtils();
  const query = api.admin.post.useQuery({ id: id ?? "" }, { enabled: !!id, refetchOnWindowFocus: false });
  const tags = api.admin.tags.useQuery();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [doc, setDoc] = useState<JSONContent | null>(null);
  const [initial, setInitial] = useState<JSONContent | string | null>(id ? null : "");
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // hydrate from the server once
  useEffect(() => {
    const p = query.data;
    if (!p) return;
    setDraft({
      title: p.title,
      slug: p.slug,
      slugTouched: true,
      excerpt: p.excerpt,
      tag: p.tag,
      readingTime: p.readingTime,
      autoReading: false,
      coverImage: p.coverImage,
      published: p.published,
      publishedAt: p.publishedAt,
    });
    const content = p.contentJson
      ? (JSON.parse(p.contentJson) as JSONContent)
      : p.content
        ? marked.parse(p.content, { async: false, gfm: true })
        : "";
    setInitial(content);
    if (typeof content !== "string") setDoc(content);
    setSavedAt(p.updatedAt);
  }, [query.data]);

  const update = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      if (key === "title" && !d.slugTouched) next.slug = slugify(value as string);
      return next;
    });
    setDirty(true);
  }, []);

  const onEditorChange = useCallback((json: JSONContent, stats: EditorStats) => {
    setDoc(json);
    setDirty(true);
    setDraft((d) => (d.autoReading ? { ...d, readingTime: stats.minutes } : d));
  }, []);

  // grow the title box with its content
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft.title]);

  const create = api.admin.createPost.useMutation();
  const save = api.admin.updatePost.useMutation();
  const remove = api.admin.deletePost.useMutation();
  const saving = create.isPending || save.isPending;

  const submit = useCallback(
    async (publish?: boolean) => {
      setError(null);
      const published = publish ?? draft.published;
      const contentDoc = doc ?? { type: "doc", content: [{ type: "paragraph" }] };
      const input = {
        title: draft.title,
        slug: draft.slug || slugify(draft.title),
        excerpt: draft.excerpt,
        tag: draft.tag,
        readingTime: draft.autoReading ? readingMinutes(contentDoc as RichNode) : draft.readingTime,
        contentJson: JSON.stringify(contentDoc),
        coverImage: draft.coverImage,
        published,
        publishedAt: draft.publishedAt,
      };
      try {
        if (id) {
          const res = await save.mutateAsync({ id, ...input });
          setSavedAt(res.updatedAt);
          setDraft((d) => ({ ...d, published, slug: input.slug }));
          setDirty(false);
        } else {
          const res = await create.mutateAsync(input);
          setDirty(false);
          router.replace(`/admin/yazilar/${res.id}`);
        }
        void utils.admin.posts.invalidate();
        void utils.admin.stats.invalidate();
      } catch (err) {
        setError(errorText(err));
      }
    },
    [draft, doc, id, save, create, router, utils],
  );

  // Ctrl/Cmd+S saves
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

  // don't lose work on accidental tab close
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const previewData: PreviewData = useMemo(
    () => ({
      kind: "post",
      post: {
        slug: draft.slug || "onizleme",
        title: draft.title || "Başlıksız yazı",
        excerpt: draft.excerpt,
        doc: (doc ?? { type: "doc", content: [] }) as RichNode,
        coverImage: draft.coverImage,
        tag: draft.tag || "Konu",
        readingTime: draft.readingTime,
        date: formatDate(draft.publishedAt),
        dateLong: formatDateLong(draft.publishedAt),
      },
    }),
    [draft, doc],
  );

  if (id && query.isLoading) {
    return (
      <div className="grid h-96 place-items-center text-[#a8a29e]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (id && query.error) {
    return <p className="text-red-600">Yazı bulunamadı.</p>;
  }

  return (
    <div>
      {/* top bar */}
      <div className="sticky top-0 z-30 -mx-4 mb-6 flex flex-wrap items-center gap-2 border-b border-[#e7e5e4] bg-[#f6f5f2]/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <Link href="/admin/yazilar" className="mr-1 rounded-lg p-1.5 text-[#78716c] hover:bg-white hover:text-[#1c1917]" aria-label="Yazılara dön">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-[14px] font-semibold">{id ? "Yazıyı düzenle" : "Yeni yazı"}</span>
        {draft.published ? <Badge tone="green">Yayında</Badge> : <Badge tone="amber">Taslak</Badge>}
        <span className="text-[12px] text-[#a8a29e]">
          {saving ? "Kaydediliyor…" : dirty ? "Kaydedilmemiş değişiklikler" : savedAt ? "Kaydedildi" : ""}
        </span>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button onClick={() => setPreview(true)}>
            <Eye className="h-4 w-4" /> Önizle
          </Button>
          {!draft.published && (
            <Button onClick={() => void submit(true)} loading={saving}>
              Yayınla
            </Button>
          )}
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
            placeholder="Yazının başlığı"
            rows={1}
            className="w-full resize-none overflow-hidden bg-transparent text-[2.2rem] leading-tight font-semibold tracking-tight outline-none placeholder:text-[#d6d3d1]"
          />
          <Textarea
            value={draft.excerpt}
            onChange={(e) => update("excerpt", e.target.value)}
            placeholder="Kısa özet: listelerde ve paylaşımlarda görünür (1–2 cümle)"
            rows={2}
            maxLength={500}
          />
          {initial !== null && (
            <RichEditor key={id ?? "new"} initial={initial} onChange={onEditorChange} stickyTop={61} />
          )}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card className="space-y-4 p-4">
            <h3 className="text-[13px] font-semibold">Yayın</h3>
            <Toggle
              checked={draft.published}
              onChange={(v) => update("published", v)}
              label={draft.published ? "Yayında" : "Taslak"}
              description={draft.published ? "Ziyaretçiler bu yazıyı görüyor." : "Sadece sen görebilirsin."}
            />
            <Field label="Yayın tarihi">
              <Input
                type="datetime-local"
                value={toLocalInput(draft.publishedAt)}
                onChange={(e) => e.target.value && update("publishedAt", new Date(e.target.value))}
              />
            </Field>
          </Card>

          <Card className="space-y-4 p-4">
            <h3 className="text-[13px] font-semibold">Ayrıntılar</h3>
            <Field label="Konu" hint="Örn. Mühendislik, Tasarım, Kariyer">
              <Input list="post-tags" value={draft.tag} onChange={(e) => update("tag", e.target.value)} placeholder="Konu seç ya da yaz" />
              <datalist id="post-tags">
                {tags.data?.map((t) => <option key={t} value={t} />)}
              </datalist>
            </Field>
            <Field label="Adres (kısa ad)" hint={`/…/blog/${draft.slug || "kisa-ad"}`}>
              <Input
                value={draft.slug}
                onChange={(e) => {
                  setDraft((d) => ({ ...d, slug: slugify(e.target.value) || e.target.value.toLowerCase(), slugTouched: true }));
                  setDirty(true);
                }}
                placeholder="baslik-gibi-yazilir"
              />
            </Field>
            <Field label="Okuma süresi (dakika)">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={240}
                  value={draft.readingTime}
                  disabled={draft.autoReading}
                  onChange={(e) => update("readingTime", Math.max(1, Number(e.target.value) || 1))}
                  className="w-24"
                />
                <label className="flex items-center gap-1.5 text-[12px] text-[#57534e]">
                  <input
                    type="checkbox"
                    checked={draft.autoReading}
                    onChange={(e) => update("autoReading", e.target.checked)}
                    className="accent-[#1c1917]"
                  />
                  otomatik hesapla
                </label>
              </div>
            </Field>
          </Card>

          <Card className="space-y-3 p-4">
            <h3 className="text-[13px] font-semibold">Kapak görseli</h3>
            <CoverField value={draft.coverImage} onChange={(v) => update("coverImage", v)} />
          </Card>

          {id && draft.published && (
            <Card className="p-4">
              <h3 className="text-[13px] font-semibold">Sitede aç</h3>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[13px]">
                {[
                  ["Mutlu", `/mutlu/blog/${draft.slug}`],
                  ["Ciddi", `/ciddi/blog/${draft.slug}`],
                  ["Sakin", `/sakin/blog/${draft.slug}`],
                  ["Meraklı", `/blog/${draft.slug}`],
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
                  <p className="text-[13px]">Bu yazı kalıcı olarak silinecek. Emin misin?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="danger"
                      loading={remove.isPending}
                      onClick={async () => {
                        await remove.mutateAsync({ id });
                        setDirty(false);
                        void utils.admin.posts.invalidate();
                        void utils.admin.stats.invalidate();
                        router.push("/admin/yazilar");
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
                  <Trash2 className="h-4 w-4" /> Yazıyı sil
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
