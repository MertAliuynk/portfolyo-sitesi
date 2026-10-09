"use client";

import { CopyButton } from "~/components/rich/CopyButton";
import { languageLabel } from "~/lib/rich/lowlight";
import type { RichComponents } from "~/lib/rich/render";
import { cn } from "~/lib/utils";

const body = "font-swiss text-[18px] leading-[1.7] text-[#222]";
const label = "font-plex text-[11px] tracking-[0.08em] uppercase";

const CALLOUT = {
  info: { label: "Not", bar: "bg-[#111]" },
  tip: { label: "Öneri", bar: "bg-[#5E5A53]" },
  warning: { label: "Dikkat", bar: "bg-[#E5381F]" },
};

/** Serious mood: editorial, ruled, numbered, one red accent. */
export const ciddiRich: RichComponents = {
  p: ({ children }) => <p className={cn(body, "mb-6")}>{children}</p>,
  h2: ({ children, id }) => (
    <h2
      id={id}
      className="mt-16 mb-6 scroll-mt-28 border-t border-[#111] pt-4 font-editorial text-[2.4rem] leading-[1.05] [counter-increment:h2] before:mb-3 before:block before:font-plex before:text-[11px] before:tracking-[0.08em] before:text-[#6B6B6B] before:content-['§_'_counter(h2,decimal-leading-zero)]"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3 id={id} className="mt-10 mb-3 scroll-mt-28 font-swiss text-[20px] font-semibold">
      {children}
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4 id={id} className={cn(label, "mt-8 mb-2 scroll-mt-28 text-[#6B6B6B]")}>
      {children}
    </h4>
  ),
  ul: ({ children, depth }) => (
    <ul
      className={cn(
        body,
        "space-y-2 [&>li]:relative [&>li]:pl-7 [&>li]:before:absolute [&>li]:before:left-0",
        depth === 0
          ? "mb-6 [&>li]:before:text-[#E5381F] [&>li]:before:content-['—']"
          : "mt-2 [&>li]:before:text-[#8F897E] [&>li]:before:content-['–']",
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ children, depth, start }) => (
    <ol
      style={{ counterReset: `li ${start - 1}` }}
      className={cn(
        body,
        "space-y-3 [&>li]:relative [&>li]:pl-10 [&>li]:[counter-increment:li] [&>li]:before:absolute [&>li]:before:top-[0.35em] [&>li]:before:left-0 [&>li]:before:font-plex [&>li]:before:text-[12px] [&>li]:before:text-[#6B6B6B]",
        depth % 2
          ? "mt-3 [&>li]:before:content-[counter(li,lower-roman)]"
          : "mb-6 [&>li]:before:content-[counter(li,decimal-leading-zero)]",
      )}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  taskList: ({ children }) => <ul className={cn(body, "mb-6 border-t border-[#111]/20")}>{children}</ul>,
  taskItem: ({ children, checked }) => (
    <li className="flex items-baseline gap-4 border-b border-[#111]/20 py-2.5">
      <span className={cn(label, checked ? "text-[#111]" : "text-[#A8A39A]")}>
        {checked ? "[x]" : "[ ]"}
      </span>
      <span className={cn("flex-1", checked && "text-[#6B6B6B] line-through decoration-[#E5381F]/60")}>
        {children}
      </span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-10 border-l-2 border-[#E5381F] pl-6 font-editorial text-[1.75rem] leading-[1.25] italic [&_p]:mb-2 [&_p]:font-editorial [&_p]:text-[1.75rem] [&_p]:leading-[1.25] [&_p]:text-[#111]">
      {children}
    </blockquote>
  ),
  callout: ({ children, tone }) => {
    const c = CALLOUT[tone];
    return (
      <aside className="my-10 grid grid-cols-[3px_1fr] gap-5 bg-[#ECE9E3] py-5 pr-6 [&_p:last-child]:mb-0 [&_p]:text-[16px]">
        <span className={c.bar} />
        <div>
          <p className={cn(label, "!mb-2 text-[#6B6B6B]")}>{c.label}</p>
          {children}
        </div>
      </aside>
    );
  },
  codeBlock: ({ children, language, code }) => (
    <figure className="my-8 border-y border-[#111]">
      <figcaption className={cn(label, "flex items-center justify-between border-b border-[#111]/20 py-2 text-[#6B6B6B]")}>
        <span>{languageLabel(language)}</span>
        <CopyButton code={code} idle="Kopyala" done="Kopyalandı" className="hover:text-[#E5381F]" />
      </figcaption>
      <pre className="code-ciddi overflow-x-auto bg-[#ECE9E3] px-5 py-5 font-plex text-[13px] leading-[1.65] text-[#222]">
        <code>{children}</code>
      </pre>
    </figure>
  ),
  figure: ({ src, alt, caption, width }) => (
    <figure className={cn("my-12", width === "narrow" && "max-w-md", width === "wide" && "lg:-mr-[20%]")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" className="w-full border border-[#111]/15" />
      {caption && (
        <figcaption className="mt-3 grid grid-cols-[auto_1fr] gap-3 font-swiss text-[13px] leading-relaxed text-[#6B6B6B]">
          <span className={cn(label, "pt-0.5 text-[#111]")}>Şek.</span>
          {caption}
        </figcaption>
      )}
    </figure>
  ),
  hr: () => (
    <div className="my-14 flex items-center gap-4" role="separator">
      <span className="h-px flex-1 bg-[#111]" />
      <span className="h-2 w-2 bg-[#E5381F]" />
      <span className="h-px flex-1 bg-[#111]" />
    </div>
  ),
  table: ({ children }) => (
    <div className="my-10 overflow-x-auto border-y border-[#111]">
      <table className="w-full border-collapse text-left font-swiss text-[15px]">
        <tbody>{children}</tbody>
      </table>
    </div>
  ),
  tr: ({ children }) => <tr className="border-b border-[#111]/15 last:border-b-0">{children}</tr>,
  th: ({ children, colSpan, rowSpan }) => (
    <th colSpan={colSpan} rowSpan={rowSpan} className={cn(label, "border-b border-[#111] px-3 py-3 font-normal text-[#6B6B6B]")}>
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
      className="border-b border-[#111]/40 hover:border-[#E5381F] hover:text-[#E5381F]"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-[#111]">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  u: ({ children }) => <u className="decoration-1 underline-offset-4">{children}</u>,
  s: ({ children }) => <s className="decoration-[#E5381F]">{children}</s>,
  mark: ({ children }) => <mark className="bg-[#E5381F]/12 px-0.5 text-inherit">{children}</mark>,
  code: ({ children }) => <code className="bg-[#E6E2DA] px-1 py-0.5 font-plex text-[0.82em]">{children}</code>,
};
