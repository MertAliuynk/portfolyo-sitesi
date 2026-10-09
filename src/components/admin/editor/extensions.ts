import { mergeAttributes, Node } from "@tiptap/core";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { CodeBlockView } from "~/components/admin/editor/CodeBlockView";
import { ImageView } from "~/components/admin/editor/ImageView";
import { lowlight } from "~/lib/rich/lowlight";
import type { CalloutTone } from "~/lib/rich/types";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (tone: CalloutTone) => ReturnType;
      unsetCallout: () => ReturnType;
    };
  }
}

/** Boxed note with a tone; holds any blocks (paragraphs, lists, code…). */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      tone: {
        default: "info",
        parseHTML: (el) => el.getAttribute("data-tone") ?? "info",
        renderHTML: (attrs) => ({ "data-tone": attrs.tone as string }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "aside[data-callout]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes, { "data-callout": "" }), 0];
  },

  addCommands() {
    return {
      setCallout:
        (tone) =>
        ({ commands, editor }) =>
          editor.isActive(this.name)
            ? commands.updateAttributes(this.name, { tone })
            : commands.wrapIn(this.name, { tone }),
      unsetCallout:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});

/** Block image with a caption and a width preset, edited in place. */
export const Figure = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-caption") ?? el.getAttribute("title") ?? "",
        renderHTML: (attrs) => ({ "data-caption": attrs.caption as string }),
      },
      width: {
        default: "normal",
        parseHTML: (el) => el.getAttribute("data-width") ?? "normal",
        renderHTML: (attrs) => ({ "data-width": attrs.width as string }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
}).configure({ inline: false, allowBase64: false });

export const CodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
}).configure({ lowlight, defaultLanguage: null });

export function editorExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        HTMLAttributes: { rel: "noreferrer noopener", target: "_blank" },
      },
    }),
    CodeBlock,
    Figure,
    Callout,
    Highlight,
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({
      placeholder: ({ node }) =>
        node.type.name === "heading" ? "Başlık" : placeholder,
    }),
    CharacterCount,
  ];
}
