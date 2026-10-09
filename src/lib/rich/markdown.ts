import { marked, type Token, type Tokens } from "marked";

import type { RichMark, RichNode } from "~/lib/rich/types";

/* Converts legacy markdown posts into the same tree the editor produces. */

function inline(tokens: Token[] | undefined, marks: RichMark[] = []): RichNode[] {
  if (!tokens) return [];
  const out: RichNode[] = [];
  for (const t of tokens) {
    switch (t.type) {
      case "text":
      case "escape": {
        const tt = t as Tokens.Text;
        if (tt.tokens?.length) out.push(...inline(tt.tokens, marks));
        else if (tt.text) out.push(text(decode(tt.text), marks));
        break;
      }
      case "strong":
        out.push(...inline((t as Tokens.Strong).tokens, [...marks, { type: "bold" }]));
        break;
      case "em":
        out.push(...inline((t as Tokens.Em).tokens, [...marks, { type: "italic" }]));
        break;
      case "del":
        out.push(...inline((t as Tokens.Del).tokens, [...marks, { type: "strike" }]));
        break;
      case "codespan":
        out.push(text(decode((t as Tokens.Codespan).text), [...marks, { type: "code" }]));
        break;
      case "link": {
        const l = t as Tokens.Link;
        out.push(...inline(l.tokens, [...marks, { type: "link", attrs: { href: l.href } }]));
        break;
      }
      case "image": {
        const img = t as Tokens.Image;
        out.push({ type: "image", attrs: { src: img.href, alt: img.text, caption: img.title ?? "" } });
        break;
      }
      case "br":
        out.push({ type: "hardBreak" });
        break;
      default:
        if ("text" in t && typeof t.text === "string") out.push(text(decode(t.text), marks));
    }
  }
  return out.filter((n) => n.type !== "text" || n.text);
}

function text(value: string, marks: RichMark[]): RichNode {
  return marks.length ? { type: "text", text: value, marks } : { type: "text", text: value };
}

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** a paragraph that holds nothing but an image becomes a block image */
function paragraph(children: RichNode[]): RichNode {
  if (children.length === 1 && children[0]!.type === "image") return children[0]!;
  return { type: "paragraph", content: children };
}

function blocks(tokens: Token[]): RichNode[] {
  const out: RichNode[] = [];
  for (const t of tokens) {
    switch (t.type) {
      case "heading": {
        const h = t as Tokens.Heading;
        out.push({
          type: "heading",
          attrs: { level: Math.min(4, Math.max(2, h.depth)) },
          content: inline(h.tokens),
        });
        break;
      }
      case "paragraph":
        out.push(paragraph(inline((t as Tokens.Paragraph).tokens)));
        break;
      case "text": {
        const tt = t as Tokens.Text;
        out.push(paragraph(tt.tokens ? inline(tt.tokens) : [text(decode(tt.text), [])]));
        break;
      }
      case "code": {
        const c = t as Tokens.Code;
        out.push({
          type: "codeBlock",
          attrs: { language: c.lang?.trim() ? c.lang.trim() : null },
          content: c.text ? [{ type: "text", text: c.text }] : [],
        });
        break;
      }
      case "blockquote":
        out.push({ type: "blockquote", content: blocks((t as Tokens.Blockquote).tokens) });
        break;
      case "hr":
        out.push({ type: "horizontalRule" });
        break;
      case "list": {
        const l = t as Tokens.List;
        const isTask = l.items.some((i) => i.task);
        out.push({
          type: isTask ? "taskList" : l.ordered ? "orderedList" : "bulletList",
          attrs: l.ordered ? { start: typeof l.start === "number" ? l.start : 1 } : undefined,
          content: l.items.map((item) => ({
            type: isTask ? "taskItem" : "listItem",
            attrs: isTask ? { checked: !!item.checked } : undefined,
            content: blocks(item.tokens.filter((x) => x.type !== "checkbox")),
          })),
        });
        break;
      }
      case "table": {
        const tb = t as Tokens.Table;
        out.push({
          type: "table",
          content: [
            {
              type: "tableRow",
              content: tb.header.map((cell) => ({
                type: "tableHeader",
                content: [paragraph(inline(cell.tokens))],
              })),
            },
            ...tb.rows.map((row) => ({
              type: "tableRow",
              content: row.map((cell) => ({
                type: "tableCell",
                content: [paragraph(inline(cell.tokens))],
              })),
            })),
          ],
        });
        break;
      }
      default:
        break;
    }
  }
  return out;
}

export function markdownToDoc(markdown: string): RichNode {
  const tokens = marked.lexer(markdown, { gfm: true });
  const content = blocks(tokens);
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}
