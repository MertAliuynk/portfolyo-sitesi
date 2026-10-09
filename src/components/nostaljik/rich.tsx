"use client";

import type { RichComponents } from "~/lib/rich/render";
import { cn } from "~/lib/utils";

const times = "font-['Times_New_Roman',Times,serif]";
const courier = "font-['Courier_New',Courier,monospace]";

const CALLOUT = {
  info: { icon: "i", bg: "bg-[#000080]", title: "Bilgi" },
  tip: { icon: "?", bg: "bg-[#008000]", title: "İpucu" },
  warning: { icon: "!", bg: "bg-[#ff0000]", title: "Uyarı" },
};

/** Nostalgic mood: a hand-written 1998 web page inside Mert Gezgini. */
export const w98Rich: RichComponents = {
  p: ({ children }) => <p className={cn(times, "mb-3 text-[16px] leading-[1.45]")}>{children}</p>,
  h2: ({ children, id }) => (
    <h2 id={id} className={cn(times, "mt-6 mb-2 text-[22px] font-bold text-[#000080]")}>
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3 id={id} className={cn(times, "mt-4 mb-2 text-[18px] font-bold")}>
      {children}
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4 id={id} className={cn(times, "mt-3 mb-1 text-[16px] font-bold italic")}>
      {children}
    </h4>
  ),
  ul: ({ children, depth }) => (
    <ul
      className={cn(
        times,
        "pl-8 text-[16px] leading-[1.45]",
        depth === 0 ? "mb-3 list-disc" : depth === 1 ? "list-[circle]" : "list-[square]",
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ children, depth, start }) => (
    <ol start={start} className={cn(times, "pl-8 text-[16px] leading-[1.45]", depth % 2 ? "list-[lower-alpha]" : "mb-3 list-decimal")}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="mb-1">{children}</li>,
  taskList: ({ children }) => <ul className={cn(times, "mb-3 pl-2 text-[16px]")}>{children}</ul>,
  taskItem: ({ children, checked }) => (
    <li className="mb-1 flex items-start gap-2">
      <input type="checkbox" checked={checked} readOnly className="mt-1" />
      <span>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => <blockquote className="mb-3 ml-8 italic">{children}</blockquote>,
  callout: ({ children, tone }) => {
    const c = CALLOUT[tone];
    return (
      <aside className="w98-raised my-4 flex gap-3 p-3 font-win text-[13px] [&_p:last-child]:mb-0 [&_p]:font-win [&_p]:text-[13px]">
        <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full font-bold text-white", c.bg)}>
          {c.icon}
        </span>
        <div>
          <p className="mb-1 font-bold">{c.title}</p>
          {children}
        </div>
      </aside>
    );
  },
  codeBlock: ({ children }) => (
    <pre className={cn(courier, "code-w98 mb-3 overflow-x-auto border border-[#808080] bg-[#f0f0f0] p-2 text-[13px] leading-[1.35]")}>
      <code>{children}</code>
    </pre>
  ),
  figure: ({ src, alt, caption, width }) => (
    <figure className={cn("my-4 text-center", width === "narrow" && "mx-auto max-w-xs")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="inline-block max-w-full border-2 border-[#808080]" />
      {caption && <figcaption className={cn(times, "mt-1 text-[13px] italic")}>{caption}</figcaption>}
    </figure>
  ),
  hr: () => <hr className="my-4 border-t-[#808080] border-b border-b-white" />,
  table: ({ children }) => (
    <table className={cn(times, "mb-3 border-collapse border-2 border-[#808080] text-[15px]")}>
      <tbody>{children}</tbody>
    </table>
  ),
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children, colSpan, rowSpan }) => (
    <th colSpan={colSpan} rowSpan={rowSpan} className="border border-[#808080] bg-[#c0c0c0] px-2 py-1">
      {children}
    </th>
  ),
  td: ({ children, colSpan, rowSpan }) => (
    <td colSpan={colSpan} rowSpan={rowSpan} className="border border-[#808080] px-2 py-1 align-top">
      {children}
    </td>
  ),
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer noopener" className="text-[#0000ee] underline visited:text-[#551a8b]">
      {children}
    </a>
  ),
  strong: ({ children }) => <b>{children}</b>,
  em: ({ children }) => <i>{children}</i>,
  u: ({ children }) => <u>{children}</u>,
  s: ({ children }) => <s>{children}</s>,
  mark: ({ children }) => <mark className="bg-[#ffff00] text-inherit">{children}</mark>,
  code: ({ children }) => <code className={cn(courier, "text-[14px]")}>{children}</code>,
};
