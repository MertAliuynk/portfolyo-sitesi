"use client";

import { Eye, EyeOff, Loader2, PenLine, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge, Button, Card, PageHeader, relativeTime } from "~/components/admin/ui";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

type Filter = "all" | "published" | "draft";

export function PostList() {
  const utils = api.useUtils();
  const { data, isLoading } = api.admin.posts.useQuery();
  const toggle = api.admin.setPostPublished.useMutation({
    onSuccess: () => {
      void utils.admin.posts.invalidate();
      void utils.admin.stats.invalidate();
    },
  });
  const remove = api.admin.deletePost.useMutation({
    onSuccess: () => {
      void utils.admin.posts.invalidate();
      void utils.admin.stats.invalidate();
    },
  });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [confirm, setConfirm] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("tr-TR");
    return (data ?? []).filter((p) => {
      if (filter === "published" && !p.published) return false;
      if (filter === "draft" && p.published) return false;
      if (!term) return true;
      return `${p.title} ${p.excerpt} ${p.tag}`.toLocaleLowerCase("tr-TR").includes(term);
    });
  }, [data, q, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yazılar"
        description="Blog yazılarını yaz, düzenle, yayınla."
        actions={
          <Link
            href="/admin/yazilar/yeni"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1c1917] px-3.5 text-[13px] font-medium text-white hover:bg-[#292524]"
          >
            <Plus className="h-4 w-4" /> Yeni yazı
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#a8a29e]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Başlık, özet ya da konuya göre ara"
            className="h-9 w-full rounded-lg border border-[#e7e5e4] bg-white pr-3 pl-9 text-[14px] outline-none focus:border-[#1c1917]"
          />
        </div>
        <div className="flex rounded-lg border border-[#e7e5e4] bg-white p-0.5">
          {(
            [
              ["all", "Tümü"],
              ["published", "Yayında"],
              ["draft", "Taslak"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-[12px] font-medium",
                filter === id ? "bg-[#1c1917] text-white" : "text-[#57534e] hover:text-[#1c1917]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="grid h-48 place-items-center text-[#a8a29e]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="grid h-48 place-items-center text-center text-[14px] text-[#a8a29e]">
            {data?.length ? "Aramana uyan yazı yok." : "Henüz yazı yok. İlkini yazmaya ne dersin?"}
          </div>
        ) : (
          <ul>
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 border-b border-[#f5f5f4] px-4 py-3 last:border-b-0">
                <Link href={`/admin/yazilar/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  {p.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" />
                  ) : (
                    <span className="grid h-12 w-16 shrink-0 place-items-center rounded-md bg-[#f5f5f4] text-[#d6d3d1]">
                      <PenLine className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium hover:underline">{p.title}</span>
                    <span className="block truncate text-[12px] text-[#a8a29e]">
                      {p.tag} · {p.readingTime} dk · güncellendi {relativeTime(p.updatedAt)}
                      {p.format === "markdown" && " · eski biçim"}
                    </span>
                  </span>
                </Link>
                {p.published ? <Badge tone="green">Yayında</Badge> : <Badge tone="amber">Taslak</Badge>}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    title={p.published ? "Taslağa al" : "Yayınla"}
                    onClick={() => toggle.mutate({ id: p.id, published: !p.published })}
                  >
                    {p.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    <span className="hidden md:inline">{p.published ? "Gizle" : "Yayınla"}</span>
                  </Button>
                  {confirm === p.id ? (
                    <>
                      <Button size="sm" variant="danger" loading={remove.isPending} onClick={() => remove.mutate({ id: p.id })}>
                        Sil
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setConfirm(null)}>
                        Vazgeç
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" title="Sil" onClick={() => setConfirm(p.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
