/**
 * The document tree the site renders. It is the TipTap/ProseMirror JSON shape
 * (the admin editor saves exactly this), and legacy markdown posts are
 * converted into it, so every mood only needs one renderer.
 */
export interface RichMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface RichNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichNode[];
  text?: string;
  marks?: RichMark[];
}

export type CalloutTone = "info" | "tip" | "warning";
export type ImageWidth = "narrow" | "normal" | "wide";

export const EMPTY_DOC: RichNode = { type: "doc", content: [{ type: "paragraph" }] };
