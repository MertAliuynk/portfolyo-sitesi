"use client";

import { CopyButton } from "~/components/rich/CopyButton";
import { languageLabel } from "~/lib/rich/lowlight";
import type { RichComponents } from "~/lib/rich/render";
import { cn } from "~/lib/utils";

const soft = "[font-variation-settings:'SOFT'_100]";
const body = cn("font-soft leading-[1.85] font-[350]", soft);

const CALLOUT = {
  info: { word: "bir not", bg: "bg-[#2F3A2F]/[0.05]" },
  tip: { word: "küçük bir öneri", bg: "bg-[#8A9A7B]/15" },
  warning: { word: "dikkat", bg: "bg-[#C47A5A]/12" },
};

/** Calm mood: generous space, soft serif, nothing shouts. Font size is inherited. */
export const sakinRich: RichComponents = {
  p: ({ children }) => <p className={cn(body, "mb-7")}>{children}</p>,
  h2: ({ children, id }) => (
    <h2 id={id} className={cn("mt-16 mb-6 scroll-mt-28 text-center font-soft text-[1.9rem] leading-tight font-light italic", soft)}>
      <span aria-hidden className="mb-6 block text-base tracking-[1em] not-italic opacity-30">
        · · ·
      </span>
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3 id={id} className={cn("mt-10 mb-4 scroll-mt-28 font-soft text-[1.35rem] italic", soft)}>
      {children}
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4 id={id} className="mt-8 mb-3 scroll-mt-28 font-soft text-[0.8rem] tracking-[0.22em] uppercase opacity-60">
      {children}
    </h4>
  ),
  ul: ({ children, depth }) => (
    <ul
      className={cn(
        body,
        "space-y-3 [&>li]:relative [&>li]:pl-7 [&>li]:before:absolute [&>li]:before:top-[0.85em] [&>li]:before:left-1 [&>li]:before:rounded-full [&>li]:before:content-['']",
        depth === 0
          ? "mb-7 [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:bg-[#8A9A7B]"
          : "mt-3 [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:border [&>li]:before:border-[#8A9A7B]",
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ children, depth, start }) => (
    <ol
      start={start}
      className={cn(
        body,
        "space-y-4 pl-6 marker:font-light marker:italic marker:opacity-50",
        depth % 2 ? "mt-3 list-[lower-alpha]" : "mb-7 list-decimal",
      )}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  taskList: ({ children }) => <ul className={cn(body, "mb-7 space-y-3")}>{children}</ul>,
  taskItem: ({ children, checked }) => (
    <li className="flex items-baseline gap-3">
      <span
        className={cn(
          "relative top-[0.1em] h-3.5 w-3.5 shrink-0 rounded-full border border-[#6E8060]",
          checked && "bg-[#8A9A7B]",
        )}
      />
      <span className={cn("flex-1", checked && "opacity-55")}>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className={cn("my-12 text-center font-soft text-[1.6rem] leading-[1.45] font-light italic [&_p]:mb-2 [&_p]:text-[1.6rem] [&_p]:leading-[1.45]", soft)}>
      {children}
    </blockquote>
  ),
  callout: ({ children, tone }) => {
    const c = CALLOUT[tone];
    return (
      <aside className={cn("my-10 rounded-[1.75rem] px-7 py-6 [&_p:last-child]:mb-0", c.bg)}>
        <p className={cn("mb-2 font-soft text-[0.95rem] italic opacity-60", soft)}>{c.word}</p>
        {children}
      </aside>
    );
  },
  codeBlock: ({ children, language, code }) => (
    <figure className="my-10 overflow-hidden rounded-2xl bg-[#2F3A2F]/[0.06]">
      <figcaption className={cn("flex items-center justify-between px-6 pt-4 font-soft text-[0.8rem] italic opacity-60", soft)}>
        <span>{languageLabel(language).toLocaleLowerCase("tr-TR")}</span>
        <CopyButton code={code} idle="kopyala" done="kopyalandı" className="transition-opacity hover:opacity-100" />
      </figcaption>
      <pre className="code-sakin overflow-x-auto px-6 pt-3 pb-6 font-mono text-[0.75em] leading-[1.65]">
        <code>{children}</code>
      </pre>
    </figure>
  ),
  figure: ({ src, alt, caption, width }) => (
    <figure className={cn("my-14", width === "narrow" && "mx-auto max-w-sm", width === "wide" && "sm:-mx-16")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-[1.75rem]" />
      {caption && (
        <figcaption className={cn("mt-4 text-center font-soft text-[0.95rem] italic opacity-60", soft)}>
          {caption}
        </figcaption>
      )}
    </figure>
  ),
  hr: () => (
    <p className="my-14 text-center tracking-[1em] opacity-30" role="separator">
      · · ·
    </p>
  ),
  table: ({ children }) => (
    <div className="my-10 overflow-x-auto">
      <table className={cn("w-full border-collapse text-left font-soft text-[0.95em]", soft)}>
        <tbody>{children}</tbody>
      </table>
    </div>
  ),
  tr: ({ children }) => <tr className="border-b border-current/10">{children}</tr>,
  th: ({ children, colSpan, rowSpan }) => (
    <th colSpan={colSpan} rowSpan={rowSpan} className="px-3 py-3 text-[0.75em] font-normal tracking-[0.2em] uppercase opacity-55">
      {children}
    </th>
  ),
  td: ({ children, colSpan, rowSpan }) => (
    <td colSpan={colSpan} rowSpan={rowSpan} className="px-3 py-3 align-top">
      {children}
    </td>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target={href.startsWith("/") || href.startsWith("#") ? undefined : "_blank"}
      rel="noreferrer noopener"
      className="border-b border-current/30 transition-colors hover:border-current"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-medium">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  u: ({ children }) => <u className="decoration-current/40 underline-offset-4">{children}</u>,
  s: ({ children }) => <s className="opacity-60">{children}</s>,
  mark: ({ children }) => <mark className="rounded bg-[#C9D2BC]/70 px-1 text-inherit">{children}</mark>,
  code: ({ children }) => (
    <code className="rounded bg-[#2F3A2F]/[0.07] px-1.5 py-0.5 font-mono text-[0.8em]">{children}</code>
  ),
};
