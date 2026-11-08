import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";

import { Tracker } from "~/components/analytics/Tracker";
import { env } from "~/env";
import { fontVariables } from "~/lib/fonts";
import { HOME_TITLE, SEO_DESCRIPTION, SEO_KEYWORDS, siteUrl } from "~/lib/seo";
import { SITE } from "~/lib/site";
import { TRPCReactProvider } from "~/trpc/react";

export async function generateMetadata(): Promise<Metadata> {
  const url = await siteUrl();
  return {
    metadataBase: new URL(url),
    title: HOME_TITLE,
    description: SEO_DESCRIPTION,
    applicationName: SITE.name,
    keywords: SEO_KEYWORDS,
    authors: [{ name: SITE.name, url }],
    creator: SITE.name,
    publisher: SITE.name,
    openGraph: {
      type: "profile",
      locale: "tr_TR",
      siteName: SITE.name,
      title: HOME_TITLE,
      description: SEO_DESCRIPTION,
      firstName: "Mert Ali",
      lastName: "Uyanık",
      username: "mertaliuynk",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE,
      description: SEO_DESCRIPTION,
      images: ["/opengraph-image"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
    verification: env.GOOGLE_SITE_VERIFICATION ? { google: env.GOOGLE_SITE_VERIFICATION } : undefined,
    formatDetection: { telephone: false, email: false, address: false },
    category: "technology",
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#151412",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={fontVariables} data-scroll-behavior="smooth">
      <body className="overflow-x-hidden">
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Tracker />
      </body>
    </html>
  );
}
