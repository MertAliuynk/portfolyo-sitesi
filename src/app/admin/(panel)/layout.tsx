import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AdminNav } from "~/components/admin/AdminNav";
import { AdminTheme } from "~/components/admin/AdminTheme";
import { SESSION_COOKIE, verifySessionToken } from "~/server/session";

export const metadata = {
  title: { default: "Yönetim", template: "%s · Yönetim" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  // middleware already guards /admin; this is the belt to its braces
  const ok = await verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!ok) redirect("/admin/giris");

  return (
    <div className="min-h-screen bg-[#f6f5f2] font-swiss text-[#1c1917] antialiased">
      <AdminTheme />
      <AdminNav />
      <main className="lg:pl-60">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-8 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
