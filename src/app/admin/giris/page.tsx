import Link from "next/link";

import { LoginForm } from "~/app/admin/giris/LoginForm";
import { AdminTheme } from "~/components/admin/AdminTheme";
import { SITE } from "~/lib/site";

export const metadata = {
  title: "Yönetim girişi",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sonra?: string }>;
}) {
  const { sonra } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f5f2] px-5 font-swiss text-[#1c1917]">
      <AdminTheme />
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[#e7e5e4] bg-white p-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)]">
          <p className="font-plex text-[11px] tracking-[0.12em] text-[#a8a29e] uppercase">
            {SITE.name}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Yönetim paneli</h1>
          <p className="mt-1 text-[14px] text-[#78716c]">
            Yazıları ve projeleri yönetmek için giriş yap.
          </p>
          <LoginForm next={sonra ?? "/admin"} />
        </div>
        <Link href="/" className="mt-6 block text-center text-[13px] text-[#78716c] hover:text-[#1c1917]">
          ← Siteye dön
        </Link>
      </div>
    </main>
  );
}
