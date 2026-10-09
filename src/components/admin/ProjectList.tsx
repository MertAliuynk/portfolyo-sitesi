"use client";

import { FolderKanban, Loader2, Plus, Search, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge, Button, Card, PageHeader, relativeTime } from "~/components/admin/ui";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const SWATCH: Record<string, string> = {
  magenta: "from-fuchsia-500 to-indigo-600",
  sunset: "from-orange-400 to-rose-500",
  ocean: "from-cyan-400 to-blue-600",
  forest: "from-emerald-400 to-cyan-500",
  cosmic: "from-violet-500 to-pink-500",
};

export function ProjectList() {
  const utils = api.useUtils();
  const { data, isLoading } = api.admin.projects.useQuery();
  const feature = api.admin.setProjectFeatured.useMutation({
    onSuccess: () => {
      void utils.admin.projects.invalidate();
      void utils.admin.stats.invalidate();
    },
  });
  const remove = api.admin.deleteProject.useMutation({
    onSuccess: () => {
      void utils.admin.projects.invalidate();
      void utils.admin.stats.invalidate();
    },
  });
  const [q, setQ] = useState("");
  const [confirm, setConfirm] = useState<string | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("tr-TR");
    return (data ?? []).filter(
      (p) => !term || `${p.title} ${p.summary} ${p.tags}`.toLocaleLowerCase("tr-TR").includes(term),
    );
  }, [data, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projeler"
        description="Portföyündeki işler ve vaka çalışmaları."
        actions={
          <Link
            href="/admin/projeler/yeni"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1c1917] px-3.5 text-[13px] font-medium text-white hover:bg-[#292524]"
          >
            <Plus className="h-4 w-4" /> Yeni proje
          </Link>
        }
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#a8a29e]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ada, özete ya da teknolojiye göre ara"
          className="h-9 w-full rounded-lg border border-[#e7e5e4] bg-white pr-3 pl-9 text-[14px] outline-none focus:border-[#1c1917]"
        />
      </div>

      {isLoading ? (
        <div className="grid h-48 place-items-center text-[#a8a29e]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <Card className="grid h-48 place-items-center text-[14px] text-[#a8a29e]">
          {data?.length ? "Aramana uyan proje yok." : "Henüz proje yok."}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <Card key={p.id} className="flex flex-col overflow-hidden">
              <Link href={`/admin/projeler/${p.id}`} className="block">
                <div className={cn("relative grid aspect-[16/9] place-items-center bg-gradient-to-br", SWATCH[p.gradient] ?? SWATCH.magenta)}>
                  {p.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <FolderKanban className="h-8 w-8 text-white/70" />
                  )}
                  <span className="absolute top-2 left-2 rounded-md bg-black/50 px-1.5 py-0.5 font-plex text-[11px] text-white">
                    #{p.order}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{p.title.split("—")[0]}</span>
                    {p.featured && <Badge tone="blue">Öne çıkan</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[13px] text-[#78716c]">{p.summary}</p>
                  <p className="mt-2 text-[12px] text-[#a8a29e]">
                    {p.year}
                    {p.status && ` · ${p.status}`} · {relativeTime(p.updatedAt)}
                  </p>
                </div>
              </Link>
              <div className="mt-auto flex items-center gap-1 border-t border-[#f5f5f4] px-2 py-1.5">
                <Button size="sm" variant="ghost" onClick={() => feature.mutate({ id: p.id, featured: !p.featured })}>
                  <Star className={cn("h-3.5 w-3.5", p.featured && "fill-current")} />
                  {p.featured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
                </Button>
                <span className="ml-auto" />
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
