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
  /** ISO timestamps for <time dateTime> */
  publishedIso: string;
  /** set when the post was edited more than a day after it went out */
  updatedLong: string | null;
  updatedIso: string | null;
  /** tutorial difficulty, if the post has one */
  level: "baslangic" | "orta" | "ileri" | null;
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
  updatedAt?: Date;
  level?: string | null;
}): PostView {
  const edited =
    p.updatedAt && p.updatedAt.getTime() - p.publishedAt.getTime() > 86_400_000
      ? p.updatedAt
      : null;
  const level =
    p.level === "baslangic" || p.level === "orta" || p.level === "ileri"
      ? p.level
      : null;
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
    publishedIso: p.publishedAt.toISOString(),
    updatedLong: edited ? formatDateLong(edited) : null,
    updatedIso: edited ? edited.toISOString() : null,
    level,
  };
}

/** Previous (newer) and next (older) neighbours in a list. */
export function neighbours<T extends { slug: string }>(
  list: T[],
  slug: string,
) {
  const i = list.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? list[i - 1] : undefined,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined,
  };
}
