import { markdownToDoc } from "~/lib/rich/markdown";
import { EMPTY_DOC, type RichNode } from "~/lib/rich/types";

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

export function plainText(node: RichNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return " ";
  const inner = (node.content ?? []).map(plainText);
  const blocky = /^(doc|blockquote|bulletList|orderedList|taskList|listItem|taskItem|table|tableRow|callout)$/.test(
    node.type,
  );
  return inner.join(blocky ? "\n" : node.type === "tableCell" || node.type === "tableHeader" ? " " : "");
}

export function wordCount(doc: RichNode) {
  return plainText(doc).split(/\s+/).filter(Boolean).length;
}

/** ~200 words per minute, code reads slower so it counts double */
export function readingMinutes(doc: RichNode) {
  let code = 0;
  const walk = (n: RichNode) => {
    if (n.type === "codeBlock") code += plainText(n).split(/\s+/).filter(Boolean).length;
    n.content?.forEach(walk);
  };
  walk(doc);
  return Math.max(1, Math.round((wordCount(doc) + code) / 200));
}

/** H2 headings, for the serious mood's table of contents */
export function headingsOf(doc: RichNode) {
  return (doc.content ?? [])
    .filter((n) => n.type === "heading" && n.attrs?.level === 2)
    .map((n) => {
      const text = plainText(n).trim();
      return { text, id: slugify(text) };
    });
}

/** Builds the render tree for a stored post or project body. */
export function docFrom(source: {
  format?: string | null;
  content?: string | null;
  contentJson?: string | null;
}): RichNode {
  if (source.contentJson) {
    try {
      const parsed = JSON.parse(source.contentJson) as RichNode;
      if (parsed?.type === "doc") return parsed;
    } catch {
      // fall through to markdown
    }
  }
  if (source.content) return markdownToDoc(source.content);
  return EMPTY_DOC;
}
