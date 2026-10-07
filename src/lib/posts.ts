import { isValidElement, type ReactNode } from "react";

/** A post as the mood pages receive it — dates pre-formatted on the server. */
export interface PostView {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tag: string;
  readingTime: number;
  date: string;
  dateLong: string;
}

export function toPostView(p: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tag: string;
  readingTime: number;
  publishedAt: Date;
}): PostView {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    tag: p.tag,
    readingTime: p.readingTime,
    date: new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(p.publishedAt),
    dateLong: new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(p.publishedAt),
  };
}

export function slugify(text: string) {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** `## Heading` lines of a markdown body, for tables of contents. */
export function headingsOf(content: string) {
  return content
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => {
      const text = line.slice(3).replace(/[*`]/g, "").trim();
      return { text, id: slugify(text) };
    });
}

/** Plain text of rendered markdown children (for heading ids). */
export function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

/** Previous (newer) and next (older) neighbours in a list. */
export function neighbours<T extends { slug: string }>(list: T[], slug: string) {
  const i = list.findIndex((p) => p.slug === slug);
  return {
    prev: i > 0 ? list[i - 1] : undefined,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined,
  };
}
