"use client";

import { CopyButton } from "~/components/rich/CopyButton";
import { Squiggle, Star } from "~/components/mutlu/shapes";
import { languageLabel } from "~/lib/rich/lowlight";
import type { RichComponents } from "~/lib/rich/render";
import { cn } from "~/lib/utils";

const BULLETS = [
  "[&>li]:before:content-['★'] [&>li]:before:text-[#FF5A36]",
  "[&>li]:before:content-['●'] [&>li]:before:text-[#4D9FFF] [&>li]:before:text-[0.8em]",
  "[&>li]:before:content-['◆'] [&>li]:before:text-[#2EC27E] [&>li]:before:text-[0.8em]",
];

const BADGES = [
  "[&>li]:before:bg-[#4D9FFF]",
  "[&>li]:before:bg-[#FF8AD8]",
  "[&>li]:before:bg-[#FFC93C]",
];

const CALLOUT = {
  info: { bg: "#BFE0FF", label: "BİLGİ", sticker: "#4D9FFF" },
  tip: { bg: "#C4F0D6", label: "İPUCU", sticker: "#2EC27E" },
  warning: { bg: "#FFD1C2", label: "DİKKAT", sticker: "#FF5A36" },
};

/** Happy mood: chunky, sticker-like, everything with a thick outline. */
export const mutluRich: RichComponents = {
  p: ({ children }) => <p className="mb-5 text-[18px] leading-[1.75] font-medium">{children}</p>,
  h2: ({ children, id }) => (
    <h2 id={id} className="mt-12 mb-5 scroll-mt-28 font-pop text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
      <span className="box-decoration-clone bg-[linear-gradient(transparent_58%,#FFC93C_58%)] px-1">{children}</span>
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3 id={id} className="mt-9 mb-3 scroll-mt-28 font-pop text-2xl font-extrabold">
      {children}
    </h3>
  ),
  h4: ({ children, id }) => (
    <h4 id={id} className="mt-7 mb-2 scroll-mt-28 font-pop text-lg font-extrabold tracking-wide text-[#FF5A36] uppercase">
      {children}
    </h4>
  ),
  ul: ({ children, depth }) => (
    <ul
      className={cn(
        "space-y-2.5 text-[18px] font-medium [&>li]:relative [&>li]:pl-8 [&>li]:before:absolute [&>li]:before:left-1 [&>li]:before:font-pop",
        BULLETS[depth % BULLETS.length],
        depth === 0 ? "mb-6" : "mt-2.5",
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ children, depth, start }) => (
    <ol
      start={start}
      style={{ counterReset: `n ${start - 1}` }}
      className={cn(
        "space-y-3 text-[18px] font-medium [&>li]:relative [&>li]:pl-11 [&>li]:[counter-increment:n] [&>li]:before:absolute [&>li]:before:top-0 [&>li]:before:left-0 [&>li]:before:grid [&>li]:before:h-8 [&>li]:before:w-8 [&>li]:before:place-items-center [&>li]:before:rounded-full [&>li]:before:border-[3px] [&>li]:before:border-[#1A1A1A] [&>li]:before:font-pop [&>li]:before:text-sm [&>li]:before:font-extrabold",
        depth % 2 ? "[&>li]:before:content-[counter(n,lower-alpha)]" : "[&>li]:before:content-[counter(n)]",
        BADGES[depth % BADGES.length],
        depth === 0 ? "mb-6" : "mt-3",
      )}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  taskList: ({ children }) => <ul className="mb-6 space-y-2.5 text-[18px] font-medium">{children}</ul>,
  taskItem: ({ children, checked }) => (
    <li className="flex items-start gap-3">
      <span
        className={cn(
          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-[3px] border-[#1A1A1A] font-pop text-sm font-extrabold",
          checked ? "bg-[#2EC27E]" : "bg-[#FFF1D6]",
        )}
      >
        {checked ? "✓" : ""}
      </span>
      <span className={cn("flex-1", checked && "opacity-60")}>{children}</span>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-8 -rotate-1 border-[3px] border-[#1A1A1A] bg-[#FFE27A] p-5 font-hand text-3xl leading-tight shadow-[5px_5px_0_#1A1A1A] [&_p]:mb-2 [&_p]:font-hand [&_p]:text-3xl [&_p]:leading-tight [&_p:last-child]:mb-0">
      {children}
    </blockquote>
  ),
  callout: ({ children, tone }) => {
    const c = CALLOUT[tone];
    return (
      <aside
        className="relative my-9 rounded-2xl border-[3px] border-[#1A1A1A] p-5 pt-7 shadow-[5px_5px_0_#1A1A1A] [&_p:last-child]:mb-0"
        style={{ background: c.bg }}
      >
        <span
          className="absolute -top-4 left-4 -rotate-3 rounded-lg border-[3px] border-[#1A1A1A] px-3 py-0.5 font-pop text-xs font-extrabold tracking-wider text-[#1A1A1A]"
          style={{ background: c.sticker }}
        >
          {c.label}
        </span>
        {children}
      </aside>
    );
  },
  codeBlock: ({ children, language, code }) => (
    <figure className="my-8 overflow-hidden rounded-2xl border-[3px] border-[#1A1A1A] bg-[#1A1A1A] shadow-[6px_6px_0_#FF5A36]">
      <figcaption className="flex items-center gap-2 border-b-[3px] border-[#1A1A1A] bg-[#FFF1D6] px-4 py-2">
        {["#FF5A36", "#FFC93C", "#2EC27E"].map((c) => (
          <span key={c} className="h-3 w-3 rounded-full border-2 border-[#1A1A1A]" style={{ background: c }} />
        ))}
        <span className="ml-2 rounded-full border-2 border-[#1A1A1A] bg-[#FF8AD8] px-2.5 font-pop text-xs font-extrabold">
          {languageLabel(language)}
        </span>
        <CopyButton
          code={code}
          idle="kopyala"
          done="kopyalandı!"
          className="ml-auto rounded-lg border-2 border-[#1A1A1A] bg-white px-2.5 font-pop text-xs font-bold transition active:translate-y-0.5"
        />
      </figcaption>
      <pre className="code-mutlu overflow-x-auto p-5 font-mono text-sm leading-relaxed text-[#FFF1D6]">
        <code>{children}</code>
      </pre>
    </figure>
  ),
  figure: ({ src, alt, caption, width }) => (
    <figure
      className={cn(
        "my-10",
        width === "narrow" && "mx-auto max-w-md",
        width === "wide" && "sm:-mx-10",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full -rotate-1 rounded-2xl border-[3px] border-[#1A1A1A] shadow-[6px_6px_0_#1A1A1A]"
      />
      {caption && (
        <figcaption className="mt-4 flex items-start justify-center gap-2 text-center font-hand text-2xl">
          <span aria-hidden>↑</span>
          {caption}
        </figcaption>
      )}
    </figure>
  ),
  hr: () => (
    <div className="my-12 flex items-center justify-center gap-4" role="separator">
      <Squiggle stroke="#4D9FFF" className="h-5 w-24" />
      <Star fill="#FFC93C" className="h-8 w-8" />
      <Squiggle stroke="#FF8AD8" className="h-5 w-24" />
    </div>
  ),
  table: ({ children }) => (
    <div className="my-8 overflow-x-auto rounded-2xl border-[3px] border-[#1A1A1A] shadow-[5px_5px_0_#1A1A1A]">
      <table className="w-full border-collapse bg-[#FFF8EA] text-left text-[16px] font-medium">
        <tbody>{children}</tbody>
      </table>
    </div>
  ),
  tr: ({ children }) => <tr className="border-t-2 border-[#1A1A1A] first:border-t-0">{children}</tr>,
  th: ({ children, colSpan, rowSpan }) => (
    <th colSpan={colSpan} rowSpan={rowSpan} className="bg-[#FFC93C] px-4 py-2.5 font-pop font-extrabold">
      {children}
    </th>
  ),
  td: ({ children, colSpan, rowSpan }) => (
    <td colSpan={colSpan} rowSpan={rowSpan} className="border-l-2 border-[#1A1A1A] px-4 py-2.5 align-top first:border-l-0">
      {children}
    </td>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target={href.startsWith("/") || href.startsWith("#") ? undefined : "_blank"}
      rel="noreferrer noopener"
      className="font-bold underline decoration-[#FF5A36] decoration-wavy decoration-2 underline-offset-4"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="rounded bg-[#FF8AD8]/45 px-1 font-extrabold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  u: ({ children }) => <u className="decoration-[#4D9FFF] decoration-[3px] underline-offset-4">{children}</u>,
  s: ({ children }) => <s className="decoration-[#FF5A36] decoration-2">{children}</s>,
  mark: ({ children }) => <mark className="rounded bg-[#FFC93C] px-1 text-inherit">{children}</mark>,
  code: ({ children }) => (
    <code className="rounded-md border-2 border-[#1A1A1A] bg-[#FFC2EC] px-1.5 py-0.5 font-mono text-[0.85em] font-bold">
      {children}
    </code>
  ),
};
