"use client";

import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

import { CODE_LANGUAGES, normalizeLanguage } from "~/lib/rich/lowlight";

export function CodeBlockView({ node, updateAttributes, editor, getPos }: NodeViewProps) {
  const raw = node.attrs.language as string | null;
  const language = normalizeLanguage(raw) ?? "";
  const known = !language || CODE_LANGUAGES.some((l) => l.id === language);

  return (
    <NodeViewWrapper className="code-block-view relative my-5">
      <div className="absolute top-2 right-2 z-10" contentEditable={false}>
        <select
          value={language}
          onChange={(e) => {
            updateAttributes({ language: e.target.value || null });
            // hand focus back to the code so typing doesn't jump the <select>
            const pos = getPos();
            if (typeof pos === "number") editor.chain().focus(pos + node.nodeSize - 1).run();
          }}
          className="rounded-md border border-white/15 bg-[#1c1c22] px-2 py-1 font-sans text-[12px] text-white/80 outline-none focus:border-white/40"
          aria-label="Kod dili"
        >
          <option value="">Otomatik algıla</option>
          {!known && <option value={language}>{raw}</option>}
          {CODE_LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <pre className="code-neon">
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
