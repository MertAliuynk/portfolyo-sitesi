"use client";

import { FolderKanban, Loader2, Newspaper, PenLine, Plus, Star } from "lucide-react";
import Link from "next/link";

import { Badge, Card, PageHeader, relativeTime } from "~/components/admin/ui";
import { api } from "~/trpc/react";

function Stat({ label, value, Icon }: { label: string; value: number | undefined; Icon: typeof Star }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-[#a8a29e]">
        <span className="text-[12px] font-medium text-[#78716c]">{label}</span>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value ?? "–"}</p>
    </Card>
  );
}

export function Dashboard() {
  const { data, isLoading } = api.admin.stats.useQuery();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Merhaba Mert"
        description="Sitendeki yazılar ve projeler burada. Ne yapmak istersin?"
        actions={
          <>
            <Link
              href="/admin/projeler/yeni"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#e7e5e4] bg-white px-3.5 text-[13px] font-medium hover:bg-[#fafaf9]"
            >
              <Plus className="h-4 w-4" /> Proje
            </Link>
            <Link
              href="/admin/yazilar/yeni"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1c1917] px-3.5 text-[13px] font-medium text-white hover:bg-[#292524]"
            >
              <PenLine className="h-4 w-4" /> Yeni yazı
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Toplam yazı" value={data?.posts} Icon={Newspaper} />
        <Stat label="Taslak" value={data?.drafts} Icon={PenLine} />
        <Stat label="Proje" value={data?.projects} Icon={FolderKanban} />
        <Stat label="Öne çıkan proje" value={data?.featured} Icon={Star} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-[#f5f5f4] px-5 py-3.5">
            <h2 className="text-[14px] font-semibold">Son düzenlenen yazılar</h2>
            <Link href="/admin/yazilar" className="text-[12px] text-[#78716c] hover:text-[#1c1917]">
              Tümü →
            </Link>
          </div>
          {isLoading ? (
            <div className="grid h-40 place-items-center text-[#a8a29e]">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <ul>
              {data?.recentPosts.map((p) => (
                <li key={p.id} className="border-b border-[#f5f5f4] last:border-b-0">
                  <Link href={`/admin/yazilar/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[#fafaf9]">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{p.title}</span>
                      <span className="text-[12px] text-[#a8a29e]">
                        {p.tag} · {relativeTime(p.updatedAt)}
                      </span>
                    </span>
                    {p.published ? <Badge tone="green">Yayında</Badge> : <Badge tone="amber">Taslak</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-[#f5f5f4] px-5 py-3.5">
            <h2 className="text-[14px] font-semibold">Son düzenlenen projeler</h2>
            <Link href="/admin/projeler" className="text-[12px] text-[#78716c] hover:text-[#1c1917]">
              Tümü →
            </Link>
          </div>
          {isLoading ? (
            <div className="grid h-40 place-items-center text-[#a8a29e]">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : (
            <ul>
              {data?.recentProjects.map((p) => (
                <li key={p.id} className="border-b border-[#f5f5f4] last:border-b-0">
                  <Link href={`/admin/projeler/${p.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[#fafaf9]">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">{p.title}</span>
                      <span className="text-[12px] text-[#a8a29e]">
                        {p.year} · {relativeTime(p.updatedAt)}
                      </span>
                    </span>
                    {p.featured && <Badge tone="blue">Öne çıkan</Badge>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
