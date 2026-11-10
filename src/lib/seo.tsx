import "server-only";

import { type Metadata } from "next";
import { headers } from "next/headers";

import { env } from "~/env";
import { SITE } from "~/lib/site";
import { docFrom, wordCount } from "~/lib/rich/extract";
import { finalDescription, finalTitle, LEVELS } from "~/lib/seo-check";
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
  if (env.NEXT_PUBLIC_SITE_URL)
    return env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
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
    alternates: {
      canonical: o.canonical,
      // lets feed readers and crawlers find new posts
      types: {
        "application/rss+xml": [
          { url: "/blog/rss.xml", title: `${SITE.name} — Blog` },
        ],
      },
    },
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
    twitter: {
      card: "summary_large_image",
      title: o.title,
      description,
      images,
    },
    ...(o.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** a post's metadata, whichever mood's copy of it is being rendered */
export async function postMeta(slug: string): Promise<Metadata> {
  const post = await getPost(slug);
  if (!post) return { title: { absolute: `Yazı bulunamadı — ${SITE.name}` } };
  const meta = pageMeta({
    title: finalTitle(post),
    description: finalDescription(post),
    canonical: `/blog/${post.slug}`,
    image: post.coverImage,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    tags: [post.tag, ...(post.focusKeyword ? [post.focusKeyword] : [])],
  });
  return {
    ...meta,
    keywords: [post.focusKeyword, post.tag, SITE.name].filter(
      (k): k is string => !!k,
    ),
  };
}

/** a project's metadata, whichever mood's copy of it is being rendered */
export async function projectMeta(slug: string): Promise<Metadata> {
  const project = await getProject(slug);
  if (!project)
    return { title: { absolute: `Proje bulunamadı — ${SITE.name}` } };
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

/**
 * A post as a TechArticle (the schema.org type for tutorials and technical
 * write-ups) plus the breadcrumb trail Google shows above the result.
 */
export function postJsonLd(
  url: string,
  post: {
    slug: string;
    title: string;
    excerpt: string;
    seoDescription: string | null;
    coverImage: string | null;
    publishedAt: Date;
    updatedAt: Date;
    tag: string;
    focusKeyword: string | null;
    level: string | null;
    readingTime: number;
    format: string | null;
    content: string;
    contentJson: string | null;
  },
) {
  const page = `${url}/blog/${post.slug}`;
  const doc = docFrom(post);
  const level = LEVELS.find((l) => l.id === post.level);
  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${page}#article`,
    headline: post.title.slice(0, 110),
    description: finalDescription(post),
    url: page,
    mainEntityOfPage: { "@type": "WebPage", "@id": page },
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverImage
      ? new URL(post.coverImage, url).toString()
      : `${url}/opengraph-image`,
    articleSection: post.tag,
    keywords: [post.focusKeyword, post.tag].filter(Boolean).join(", "),
    wordCount: wordCount(doc),
    timeRequired: `PT${post.readingTime}M`,
    ...(level
      ? { proficiencyLevel: level.schema, educationalLevel: level.label }
      : {}),
    inLanguage: "tr-TR",
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      "@id": `${url}/#person`,
      name: SITE.name,
      url,
    },
    publisher: { "@type": "Person", "@id": `${url}/#person`, name: SITE.name },
  };
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE.name, item: `${url}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${url}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: page },
    ],
  };
  return [article, breadcrumb];
}

export function projectJsonLd(
  url: string,
  project: {
    slug: string;
    title: string;
    summary: string;
    tags: string;
    year: number;
    coverImage: string | null;
    liveUrl: string | null;
    repoUrl: string | null;
  },
) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: `${url}/projeler/${project.slug}`,
    dateCreated: String(project.year),
    keywords: project.tags,
    image: project.coverImage
      ? new URL(project.coverImage, url).toString()
      : undefined,
    sameAs: [project.liveUrl, project.repoUrl].filter(Boolean),
    inLanguage: "tr-TR",
    creator: {
      "@type": "Person",
      "@id": `${url}/#person`,
      name: SITE.name,
      url,
    },
  };
}

/** `<script type="application/ld+json">`, escaped so post titles can't break out of it */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
