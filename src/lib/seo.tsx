import "server-only";

import { type Metadata } from "next";
import { headers } from "next/headers";

import { env } from "~/env";
import { SITE } from "~/lib/site";
import { getPost, getProject } from "~/server/content";

/**
 * Every way people might type the name into a search box. Google matches
 * the visible name and `alternateName` in the Person data, so the common
 * misspellings and the ASCII forms are listed too.
 */
export const NAME_VARIANTS = [
  "Mert Ali Uyanık",
  "Mert Ali Uyanik",
  "Mertali Uyanık",
  "Mertali Uyanik",
  "MertAli Uyanık",
  "Mert Ali Uynk",
  "Mert Uyanık",
  "Mert Uyanik",
  "mertaliuynk",
  "mertaliuyanik",
] as const;

export const HOME_TITLE = `${SITE.name} — Yazılımcı & Yazılım Geliştirici`;

export const SEO_DESCRIPTION =
  "Mert Ali Uyanık — yazılımcı ve web geliştirici. 4. sınıf bilgisayar öğrencisi; TypeScript, React, Next.js ve Node.js ile projeler, blog yazıları ve deneyler.";

export const SEO_KEYWORDS = [
  ...NAME_VARIANTS,
  "Mert Ali Uyanık yazılımcı",
  "yazılımcı Mert Ali Uyanık",
  "Mert Ali Uyanık yazılım geliştirici",
  "Mert Ali Uyanık portfolyo",
  "yazılım geliştirici",
  "web geliştirici",
  "full stack geliştirici",
  "frontend geliştirici",
  "TypeScript",
  "React",
  "Next.js",
];

/** Public origin, without a trailing slash. Prefers NEXT_PUBLIC_SITE_URL, else the request host. */
export async function siteUrl() {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Metadata for one page. The same posts and projects are shown in five mood
 * designs, so `canonical` points every copy at one address and search
 * engines don't split the ranking between them.
 */
export function pageMeta(o: {
  title: string;
  description?: string | null;
  /** canonical path, e.g. "/blog/merhaba" */
  canonical: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: Date;
  modifiedTime?: Date;
  tags?: string[];
  noindex?: boolean;
}): Metadata {
  const description = o.description ?? SEO_DESCRIPTION;
  const images = [o.image ?? "/opengraph-image"];
  return {
    title: { absolute: o.title },
    description,
    alternates: { canonical: o.canonical },
    openGraph: {
      type: o.type ?? "website",
      locale: "tr_TR",
      siteName: SITE.name,
      url: o.canonical,
      title: o.title,
      description,
      images,
      ...(o.type === "article"
        ? {
            publishedTime: o.publishedTime?.toISOString(),
            modifiedTime: o.modifiedTime?.toISOString(),
            authors: [SITE.name],
            tags: o.tags,
          }
        : {}),
    },
    twitter: { card: "summary_large_image", title: o.title, description, images },
    ...(o.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** a post's metadata, whichever mood's copy of it is being rendered */
export async function postMeta(slug: string): Promise<Metadata> {
  const post = await getPost(slug);
  if (!post) return { title: { absolute: `Yazı bulunamadı — ${SITE.name}` } };
  return pageMeta({
    title: `${post.title} — ${SITE.name}`,
    description: post.excerpt,
    canonical: `/blog/${post.slug}`,
    image: post.coverImage,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    tags: [post.tag],
  });
}

/** a project's metadata, whichever mood's copy of it is being rendered */
export async function projectMeta(slug: string): Promise<Metadata> {
  const project = await getProject(slug);
  if (!project) return { title: { absolute: `Proje bulunamadı — ${SITE.name}` } };
  const name = project.title.split("—")[0]!.trim();
  return pageMeta({
    title: `${name} — ${SITE.name} projesi`,
    description: project.summary,
    canonical: `/projeler/${project.slug}`,
    image: project.coverImage,
  });
}

/** profiles that are really this person — Google uses them to join the dots */
export const SAME_AS = SITE.socials.map((s) => s.href);

export function personJsonLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}/#person`,
    name: SITE.name,
    alternateName: NAME_VARIANTS.filter((n) => n !== SITE.name),
    givenName: "Mert Ali",
    familyName: "Uyanık",
    jobTitle: "Yazılım Geliştirici",
    description: SEO_DESCRIPTION,
    url,
    image: `${url}/opengraph-image`,
    email: `mailto:${SITE.email}`,
    nationality: { "@type": "Country", name: "Türkiye" },
    knowsAbout: [...SITE.skills],
    sameAs: SAME_AS,
  };
}

export function websiteJsonLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    url,
    name: `${SITE.name} — Yazılım Geliştirici`,
    alternateName: ["Mert Ali Uyanık Portfolyo", "mertaliuynk"],
    inLanguage: "tr-TR",
    author: { "@id": `${url}/#person` },
    publisher: { "@id": `${url}/#person` },
  };
}

export function blogPostingJsonLd(
  url: string,
  post: { slug: string; title: string; excerpt: string; coverImage: string | null; publishedAt: Date; updatedAt: Date; tag: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: `${url}/blog/${post.slug}`,
    mainEntityOfPage: `${url}/blog/${post.slug}`,
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverImage ? new URL(post.coverImage, url).toString() : `${url}/opengraph-image`,
    keywords: post.tag,
    inLanguage: "tr-TR",
    author: { "@type": "Person", "@id": `${url}/#person`, name: SITE.name, url },
    publisher: { "@type": "Person", "@id": `${url}/#person`, name: SITE.name },
  };
}

export function projectJsonLd(
  url: string,
  project: { slug: string; title: string; summary: string; tags: string; year: number; coverImage: string | null; liveUrl: string | null; repoUrl: string | null },
) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `${url}/projeler/${project.slug}`,
    dateCreated: String(project.year),
    keywords: project.tags,
    image: project.coverImage ? new URL(project.coverImage, url).toString() : undefined,
    sameAs: [project.liveUrl, project.repoUrl].filter(Boolean),
    inLanguage: "tr-TR",
    creator: { "@type": "Person", "@id": `${url}/#person`, name: SITE.name, url },
  };
}

/** `<script type="application/ld+json">`, escaped so post titles can't break out of it */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
