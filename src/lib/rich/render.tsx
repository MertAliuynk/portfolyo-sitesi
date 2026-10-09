import { createElement, Fragment, type ReactNode } from "react";

import { plainText, slugify } from "~/lib/rich/extract";
import { lowlight } from "~/lib/rich/lowlight";
import type { CalloutTone, ImageWidth, RichMark, RichNode } from "~/lib/rich/types";

type Kids = { children?: ReactNode };

/**
 * One map per mood. Every key has a plain fallback, so a mood only has to
 * restyle what it cares about — in practice each mood styles all of them.
 */
export interface RichComponents {
  p: (p: Kids) => ReactNode;
  h2: (p: Kids & { id: string }) => ReactNode;
  h3: (p: Kids & { id: string }) => ReactNode;
  h4: (p: Kids & { id: string }) => ReactNode;
  ul: (p: Kids & { depth: number }) => ReactNode;
  ol: (p: Kids & { depth: number; start: number }) => ReactNode;
  li: (p: Kids) => ReactNode;
  taskList: (p: Kids) => ReactNode;
  taskItem: (p: Kids & { checked: boolean }) => ReactNode;
  blockquote: (p: Kids) => ReactNode;
  callout: (p: Kids & { tone: CalloutTone }) => ReactNode;
  codeBlock: (p: Kids & { language: string | null; code: string }) => ReactNode;
  figure: (p: { src: string; alt: string; caption: string; width: ImageWidth }) => ReactNode;
  hr: () => ReactNode;
  table: (p: Kids) => ReactNode;
  tr: (p: Kids) => ReactNode;
  th: (p: Kids & { colSpan?: number; rowSpan?: number }) => ReactNode;
  td: (p: Kids & { colSpan?: number; rowSpan?: number }) => ReactNode;
  a: (p: Kids & { href: string }) => ReactNode;
  strong: (p: Kids) => ReactNode;
  em: (p: Kids) => ReactNode;
  u: (p: Kids) => ReactNode;
  s: (p: Kids) => ReactNode;
  mark: (p: Kids) => ReactNode;
  code: (p: Kids) => ReactNode;
}

export const baseComponents: RichComponents = {
  p: ({ children }) => <p>{children}</p>,
  h2: ({ children, id }) => <h2 id={id}>{children}</h2>,
  h3: ({ children, id }) => <h3 id={id}>{children}</h3>,
  h4: ({ children, id }) => <h4 id={id}>{children}</h4>,
  ul: ({ children }) => <ul className="list-disc pl-6">{children}</ul>,
  ol: ({ children, start }) => (
    <ol start={start} className="list-decimal pl-6">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  taskList: ({ children }) => <ul>{children}</ul>,
  taskItem: ({ children, checked }) => (
    <li>
      <input type="checkbox" checked={checked} readOnly /> {children}
    </li>
  ),
  blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  callout: ({ children }) => <aside>{children}</aside>,
  codeBlock: ({ children }) => (
    <pre>
      <code>{children}</code>
    </pre>
  ),
  figure: ({ src, alt, caption }) => (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  ),
  hr: () => <hr />,
  table: ({ children }) => (
    <table>
      <tbody>{children}</tbody>
    </table>
  ),
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children, colSpan, rowSpan }) => (
    <th colSpan={colSpan} rowSpan={rowSpan}>
      {children}
    </th>
  ),
  td: ({ children, colSpan, rowSpan }) => (
    <td colSpan={colSpan} rowSpan={rowSpan}>
      {children}
    </td>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  ),
  strong: ({ children }) => <strong>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  u: ({ children }) => <u>{children}</u>,
  s: ({ children }) => <s>{children}</s>,
  mark: ({ children }) => <mark>{children}</mark>,
  code: ({ children }) => <code>{children}</code>,
};

/* ------------------------------------------------------------------ */

interface HastNode {
  type: string;
  value?: string;
  tagName?: string;
  properties?: { className?: string[] };
  children?: HastNode[];
}

function hastToReact(node: HastNode, key: number): ReactNode {
  if (node.type === "text") return node.value;
  const kids = node.children?.map(hastToReact);
  if (node.type === "element") {
    return createElement(
      node.tagName ?? "span",
      { key, className: node.properties?.className?.join(" ") },
      kids,
    );
  }
  return createElement(Fragment, { key }, kids);
}

/** Syntax-highlighted spans with `hljs-*` classes; each mood colours them. */
export function highlight(code: string, language: string | null): ReactNode {
  try {
    const tree =
      language && language !== "plaintext" && lowlight.registered(language)
        ? lowlight.highlight(language, code)
        : language === "plaintext"
          ? null
          : lowlight.highlightAuto(code);
    if (!tree) return code;
    return (tree.children as HastNode[]).map(hastToReact);
  } catch {
    return code;
  }
}

/** Only http(s), mailto, relative and in-page links survive. */
function safeHref(href: unknown) {
  if (typeof href !== "string") return "#";
  const h = href.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(h)) return h;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(h)) return `https://${h}`;
  return "#";
}

function safeSrc(src: unknown) {
  if (typeof src !== "string") return "";
  return /^(https?:\/\/|\/)/i.test(src.trim()) ? src.trim() : "";
}

function withMarks(text: ReactNode, marks: RichMark[] | undefined, c: RichComponents, key: number) {
  let node = text;
  for (const mark of marks ?? []) {
    switch (mark.type) {
      case "bold":
        node = c.strong({ children: node });
        break;
      case "italic":
        node = c.em({ children: node });
        break;
      case "underline":
        node = c.u({ children: node });
        break;
      case "strike":
        node = c.s({ children: node });
        break;
      case "highlight":
        node = c.mark({ children: node });
        break;
      case "code":
        node = c.code({ children: node });
        break;
      case "link":
        node = c.a({ children: node, href: safeHref(mark.attrs?.href) });
        break;
    }
  }
  return <Fragment key={key}>{node}</Fragment>;
}

function renderNodes(nodes: RichNode[] | undefined, c: RichComponents, depth: number): ReactNode[] {
  return (nodes ?? []).map((n, i) => renderNode(n, c, depth, i));
}

/** list items hold paragraphs; the first is unwrapped so bullets sit tight */
function listItemChildren(item: RichNode, c: RichComponents, depth: number) {
  return (item.content ?? []).map((child, i) => {
    if (child.type === "paragraph") {
      const inner = renderNodes(child.content, c, depth);
      return i === 0 ? (
        <Fragment key={i}>{inner}</Fragment>
      ) : (
        <span key={i} className="mt-2 block">
          {inner}
        </span>
      );
    }
    return renderNode(child, c, depth + 1, i);
  });
}

function renderNode(n: RichNode, c: RichComponents, depth: number, key: number): ReactNode {
  switch (n.type) {
    case "doc":
      return <Fragment key={key}>{renderNodes(n.content, c, depth)}</Fragment>;
    case "text":
      return withMarks(n.text ?? "", n.marks, c, key);
    case "hardBreak":
      return <br key={key} />;
    case "paragraph":
      if (!n.content?.length) return <Fragment key={key} />;
      return <Fragment key={key}>{c.p({ children: renderNodes(n.content, c, depth) })}</Fragment>;
    case "heading": {
      const level = Number(n.attrs?.level ?? 2);
      const id = slugify(plainText(n));
      const children = renderNodes(n.content, c, depth);
      const h = level <= 2 ? c.h2 : level === 3 ? c.h3 : c.h4;
      return <Fragment key={key}>{h({ children, id })}</Fragment>;
    }
    case "bulletList":
      return (
        <Fragment key={key}>
          {c.ul({ depth, children: renderNodes(n.content, c, depth) })}
        </Fragment>
      );
    case "orderedList":
      return (
        <Fragment key={key}>
          {c.ol({ depth, start: Number(n.attrs?.start ?? 1), children: renderNodes(n.content, c, depth) })}
        </Fragment>
      );
    case "listItem":
      return <Fragment key={key}>{c.li({ children: listItemChildren(n, c, depth) })}</Fragment>;
    case "taskList":
      return <Fragment key={key}>{c.taskList({ children: renderNodes(n.content, c, depth) })}</Fragment>;
    case "taskItem":
      return (
        <Fragment key={key}>
          {c.taskItem({ checked: !!n.attrs?.checked, children: listItemChildren(n, c, depth) })}
        </Fragment>
      );
    case "blockquote":
      return <Fragment key={key}>{c.blockquote({ children: renderNodes(n.content, c, depth) })}</Fragment>;
    case "callout": {
      const tone = (["info", "tip", "warning"].includes(String(n.attrs?.tone))
        ? n.attrs?.tone
        : "info") as CalloutTone;
      return <Fragment key={key}>{c.callout({ tone, children: renderNodes(n.content, c, depth) })}</Fragment>;
    }
    case "codeBlock": {
      const code = plainText(n);
      const language = typeof n.attrs?.language === "string" ? n.attrs.language : null;
      return (
        <Fragment key={key}>
          {c.codeBlock({ language, code, children: highlight(code, language) })}
        </Fragment>
      );
    }
    case "image": {
      const src = safeSrc(n.attrs?.src);
      if (!src) return null;
      const width = (["narrow", "normal", "wide"].includes(String(n.attrs?.width))
        ? n.attrs?.width
        : "normal") as ImageWidth;
      return (
        <Fragment key={key}>
          {c.figure({
            src,
            alt: typeof n.attrs?.alt === "string" ? n.attrs.alt : "",
            caption: typeof n.attrs?.caption === "string" ? n.attrs.caption : "",
            width,
          })}
        </Fragment>
      );
    }
    case "horizontalRule":
      return <Fragment key={key}>{c.hr()}</Fragment>;
    case "table":
      return <Fragment key={key}>{c.table({ children: renderNodes(n.content, c, depth) })}</Fragment>;
    case "tableRow":
      return <Fragment key={key}>{c.tr({ children: renderNodes(n.content, c, depth) })}</Fragment>;
    case "tableHeader":
    case "tableCell": {
      const span = {
        colSpan: Number(n.attrs?.colspan ?? 1) > 1 ? Number(n.attrs?.colspan) : undefined,
        rowSpan: Number(n.attrs?.rowspan ?? 1) > 1 ? Number(n.attrs?.rowspan) : undefined,
      };
      // cells hold paragraphs; render them inline
      const children = (n.content ?? []).map((p, i) =>
        p.type === "paragraph" ? (
          <Fragment key={i}>
            {i > 0 && <br />}
            {renderNodes(p.content, c, depth)}
          </Fragment>
        ) : (
          renderNode(p, c, depth, i)
        ),
      );
      const cell = n.type === "tableHeader" ? c.th : c.td;
      return <Fragment key={key}>{cell({ ...span, children })}</Fragment>;
    }
    default:
      return n.content ? <Fragment key={key}>{renderNodes(n.content, c, depth)}</Fragment> : null;
  }
}

export function RichRenderer({
  doc,
  components,
}: {
  doc: RichNode;
  components: Partial<RichComponents>;
}) {
  const c = { ...baseComponents, ...components };
  return <>{renderNode(doc, c, 0, 0)}</>;
}
