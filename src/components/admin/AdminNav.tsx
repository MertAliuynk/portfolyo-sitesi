"use client";

import { ExternalLink, FolderKanban, LayoutDashboard, LogOut, Newspaper } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "~/app/admin/giris/actions";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";

const LINKS = [
  { href: "/admin", label: "Pano", Icon: LayoutDashboard, exact: true },
  { href: "/admin/yazilar", label: "Yazılar", Icon: Newspaper },
  { href: "/admin/projeler", label: "Projeler", Icon: FolderKanban },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="z-30 border-b border-[#e7e5e4] bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-60 lg:border-r lg:border-b-0">
      <div className="flex h-full items-center gap-2 px-4 py-3 lg:flex-col lg:items-stretch lg:gap-0 lg:px-3 lg:py-5">
        <Link href="/admin" className="mr-2 lg:mr-0 lg:mb-6 lg:px-2">
          <span className="block font-plex text-[10px] tracking-[0.14em] text-[#a8a29e] uppercase">
            Yönetim
          </span>
          <span className="block text-[15px] font-semibold tracking-tight">{SITE.shortName}</span>
        </Link>

        <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto lg:flex-col">
          {LINKS.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition",
                  active ? "bg-[#1c1917] text-white" : "text-[#57534e] hover:bg-[#f5f5f4] hover:text-[#1c1917]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex gap-1 lg:flex-col lg:border-t lg:border-[#f5f5f4] lg:pt-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#57534e] hover:bg-[#f5f5f4]"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Siteyi aç</span>
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#57534e] hover:bg-[#f5f5f4]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
