import { docFrom } from "~/lib/rich/extract";
import type { RichNode } from "~/lib/rich/types";

/**
 * A post as the mood pages receive it — dates pre-formatted and the body
 * already parsed into a render tree on the server.
 */
export interface PostView {
  slug: string;
  title: string;
  excerpt: string;
  doc: RichNode;
  coverImage: string | null;
  tag: string;
  readingTime: number;
  date: string;
  dateLong: string;
}

export function formatDate(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateLong(d: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function toPostView(p: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentJson?: string | null;
  format?: string | null;
  coverImage?: string | null;
  tag: string;
  readingTime: number;
  publishedAt: Date;
}): PostView {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    doc: docFrom(p),
    coverImage: p.coverImage ?? null,
    tag: p.tag,
    readingTime: p.readingTime,
    date: formatDate(p.publishedAt),
    dateLong: formatDateLong(p.publishedAt),
  };
}

/** Previous (newer) and next (older) neighbours in a list. */
export function neighbours<T extends { slug: string }>(list: T[], slug: string) {
  const i = list.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? list[i - 1] : undefined,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined,
  };
}
