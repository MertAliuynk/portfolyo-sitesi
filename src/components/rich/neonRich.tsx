"use client";

import { CopyButton } from "~/components/rich/CopyButton";
import { languageLabel } from "~/lib/rich/lowlight";
import type { RichComponents } from "~/lib/rich/render";
import { cn } from "~/lib/utils";

const CALLOUT = {
  info: { label: "Bilgi", ring: "border-cyan/40", glow: "shadow-[0_0_40px_-12px_rgba(34,211,238,0.5)]", text: "text-cyan" },
  tip: { label: "İpucu", ring: "border-violet/50", glow: "shadow-[0_0_40px_-12px_rgba(124,58,237,0.6)]", text: "text-violet" },
  warning: { label: "Dikkat", ring: "border-magenta/50", glow: "shadow-[0_0_40px_-12px_rgba(255,47,208,0.6)]", text: "text-magenta" },
};

/** Curious mood: the original neon look. */
export const neonRich: RichComponents = {
  p: ({ children }) => <p className="mb-5 leading-relaxed text-paper/75">{children}</p>,
  h2: ({ children, id }) => (
    <h2 id={id} className="font-display mt-12 mb-4 scroll-mt-24 text-2xl font-bold text-paper sm:text-3xl">
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3 id={id} className="font-display mt-8 mb-3 scroll-mt-24 text-xl font-bold text-paper">
      {children}
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4 id={id} className="font-display mt-6 mb-2 scroll-mt-24 text-sm tracking-[0.25em] text-cyan uppercase">
      {children}
    </h4>
  ),
  ul: ({ children, depth }) => (
    <ul
      className={cn(
        "space-y-2 text-paper/75 [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:top-[0.6em] [&>li]:before:left-0.5 [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:content-['']",
        depth === 0
          ? "mb-5 [&>li]:before:bg-magenta [&>li]:before:shadow-[0_0_8px_#ff2fd0]"
          : depth === 1
            ? "mt-2 [&>li]:before:bg-cyan [&>li]:before:shadow-[0_0_8px_#22d3ee]"
            : "mt-2 [&>li]:before:bg-violet",
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ children, depth, start }) => (
    <ol start={start} className={cn("space-y-2 pl-6 text-paper/75 marker:text-cyan", depth % 2 ? "mt-2 list-[lower-alpha]" : "mb-5 list-decimal")}>
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  taskList: ({ children }) => <ul className="mb-5 space-y-2 text-paper/75">{children}</ul>,
  taskItem: ({ children, checked }) => (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          "mt-1 grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px]",
          checked ? "border-cyan bg-cyan/20 text-cyan" : "border-white/25",
        )}
      >
        {checked ? "✓" : ""}
      </span>
      <span className={cn("flex-1", checked && "text-paper/45 line-through")}>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-magenta/60 pl-4 text-paper/60 italic [&_p]:text-paper/60">
      {children}
    </blockquote>
  ),
  callout: ({ children, tone }) => {
    const c = CALLOUT[tone];
    return (
      <aside className={cn("glass-panel my-8 rounded-2xl border p-5 [&_p:last-child]:mb-0", c.ring, c.glow)}>
        <p className={cn("font-display mb-2 text-xs tracking-[0.25em] uppercase", c.text)}>{c.label}</p>
        {children}
      </aside>
    );
  },
  codeBlock: ({ children, language, code }) => (
    <figure className="glass-panel my-7 overflow-hidden rounded-xl">
      <figcaption className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs">
        <span className="text-gradient font-display font-bold">{languageLabel(language)}</span>
        <CopyButton code={code} idle="kopyala" done="kopyalandı ✓" className="text-paper/50 transition hover:text-paper" />
      </figcaption>
      <pre className="code-neon overflow-x-auto p-4 font-mono text-sm leading-relaxed text-paper/90">
        <code>{children}</code>
      </pre>
    </figure>
  ),
  figure: ({ src, alt, caption, width }) => (
    <figure className={cn("my-10", width === "narrow" && "mx-auto max-w-md", width === "wide" && "sm:-mx-12")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full rounded-2xl border border-white/10 shadow-[0_30px_80px_-30px_rgba(255,47,208,0.45)]"
      />
      {caption && <figcaption className="mt-3 text-center text-sm text-paper/45">{caption}</figcaption>}
    </figure>
  ),
  hr: () => <hr className="my-12 h-px border-0 bg-gradient-to-r from-transparent via-magenta/60 to-transparent" />,
  table: ({ children }) => (
    <div className="glass-panel my-8 overflow-x-auto rounded-xl">
      <table className="w-full border-collapse text-left text-sm text-paper/80">
        <tbody>{children}</tbody>
      </table>
    </div>
  ),
  tr: ({ children }) => <tr className="border-b border-white/10 last:border-b-0">{children}</tr>,
  th: ({ children, colSpan, rowSpan }) => (
    <th colSpan={colSpan} rowSpan={rowSpan} className="font-display bg-white/[0.04] px-4 py-3 text-xs tracking-[0.2em] text-cyan uppercase">
      {children}
    </th>
  ),
  td: ({ children, colSpan, rowSpan }) => (
    <td colSpan={colSpan} rowSpan={rowSpan} className="px-4 py-3 align-top">
      {children}
    </td>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target={href.startsWith("/") || href.startsWith("#") ? undefined : "_blank"}
      rel="noreferrer noopener"
      className="text-cyan underline decoration-cyan/30 underline-offset-4 hover:decoration-cyan"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-paper">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  u: ({ children }) => <u className="decoration-magenta/60 underline-offset-4">{children}</u>,
  s: ({ children }) => <s className="text-paper/45">{children}</s>,
  mark: ({ children }) => <mark className="rounded bg-magenta/25 px-1 text-paper">{children}</mark>,
  code: ({ children }) => (
    <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan">{children}</code>
  ),
};
