import "~/styles/globals.css";

import { type Metadata } from "next";

import { fontVariables } from "~/lib/fonts";
import { SITE } from "~/lib/site";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.role}`,
  description: SITE.tagline,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={fontVariables} data-scroll-behavior="smooth">
      <body className="overflow-x-hidden">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
