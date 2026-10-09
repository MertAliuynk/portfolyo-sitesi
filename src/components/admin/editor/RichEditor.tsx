"use client";

import type { Editor, JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  Bold,
  Code,
  Columns3,
  FileDown,
  Heading2,
  Heading3,
  Heading4,
  Highlighter,
  ImagePlus,
  IndentDecrease,
  IndentIncrease,
  Info,
  Italic,
  Lightbulb,
  Link,
  List,
  ListChecks,
  ListOrdered,
  Loader2,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Rows3,
  SquareCode,
  Strikethrough,
  Table,
  Trash2,
  TriangleAlert,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import { marked } from "marked";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { editorExtensions } from "~/components/admin/editor/extensions";
import { imageFiles, uploadImage } from "~/components/admin/upload";
import { readingMinutes } from "~/lib/rich/extract";
import type { RichNode } from "~/lib/rich/types";
import { cn } from "~/lib/utils";

export interface EditorStats {
  words: number;
  characters: number;
  minutes: number;
}

type Cmd = {
  id: string;
  label: string;
  hint: string;
  keys: string;
  Icon: typeof Bold;
  run: (e: Editor) => void;
};

function fold(s: string) {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

/**
 * Module-level on purpose: BubbleMenu re-registers its plugin whenever this
 * function's identity changes, and that dispatches a transaction — an inline
 * arrow here re-renders forever.
 */
function bubbleShouldShow({
  editor,
  state,
}: {
  editor: Editor;
  state: Editor["state"];
}) {
  return (
    !state.selection.empty &&
    !editor.isActive("codeBlock") &&
    !editor.isActive("image")
  );
}

/* ------------------------------------------------------------------ */

function ToolButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#44403c] transition hover:bg-[#f5f5f4] disabled:opacity-30 disabled:hover:bg-transparent",
        active && "bg-[#1c1917] text-white hover:bg-[#1c1917]",
      )}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-[#e7e5e4]" />;
}

/* ------------------------------------------------------------------ */

export function RichEditor({
  initial,
  onChange,
  placeholder = "Yazmaya başla… Blok eklemek için / yaz",
  stickyTop = 0,
}: {
  initial: JSONContent | string | null;
  onChange: (doc: JSONContent, stats: EditorStats) => void;
  placeholder?: string;
  /** offset for the sticky toolbar when the page has its own sticky bar */
  stickyTop?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const onChangeRef = useRef(onChange);
  const [uploads, setUploads] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [mdOpen, setMdOpen] = useState(false);
  const [mdValue, setMdValue] = useState("");
  const [slash, setSlash] = useState<{
    query: string;
    from: number;
    to: number;
    x: number;
    y: number;
    top: number;
  } | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);
  const slashRef = useRef<{
    open: boolean;
    items: Cmd[];
    index: number;
    pick: (c: Cmd) => void;
  }>({
    open: false,
    items: [],
    index: 0,
    pick: () => undefined,
  });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /* --------------------------------------------------------- uploads */

  const insertImages = useCallback(async (files: File[], at?: number) => {
    const editor = editorRef.current;
    if (!editor || !files.length) return;
    setUploadError(null);
    setUploads((n) => n + files.length);
    for (const file of files) {
      try {
        const src = await uploadImage(file);
        const node = {
          type: "image",
          attrs: {
            src,
            alt: file.name.replace(/\.[^.]+$/, ""),
            caption: "",
            width: "normal",
          },
        };
        if (typeof at === "number")
          editor.chain().focus().insertContentAt(at, node).run();
        else editor.chain().focus().insertContent(node).run();
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "Yükleme başarısız",
        );
      } finally {
        setUploads((n) => n - 1);
      }
    }
  }, []);

  /* ----------------------------------------------------------- editor */

  const extensions = useMemo(
    () => editorExtensions(placeholder),
    [placeholder],
  );

  const editor = useEditor(
    {
      extensions,
      content: initial ?? "",
      immediatelyRender: false,
      shouldRerenderOnTransaction: true,
      editorProps: {
        attributes: { class: "rich-editor-content", spellcheck: "true" },
        handlePaste: (_view, event) => {
          const files = imageFiles(event.clipboardData?.files);
          if (!files.length) return false;
          event.preventDefault();
          void insertImages(files);
          return true;
        },
        handleDrop: (view, event, _slice, moved) => {
          if (moved) return false;
          const files = imageFiles(event.dataTransfer?.files);
          if (!files.length) return false;
          event.preventDefault();
          const pos = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          })?.pos;
          void insertImages(files, pos);
          return true;
        },
        handleKeyDown: (_view, event) => {
          const s = slashRef.current;
          if (!s.open || !s.items.length) return false;
          if (event.key === "ArrowDown") {
            setSlashIndex((i) => (i + 1) % s.items.length);
            return true;
          }
          if (event.key === "ArrowUp") {
            setSlashIndex((i) => (i - 1 + s.items.length) % s.items.length);
            return true;
          }
          if (event.key === "Enter" || event.key === "Tab") {
            s.pick(s.items[s.index]!);
            return true;
          }
          if (event.key === "Escape") {
            setSlash(null);
            return true;
          }
          return false;
        },
      },
      onUpdate: ({ editor }) => {
        const doc = editor.getJSON();
        onChangeRef.current(doc, {
          words: editor.storage.characterCount.words(),
          characters: editor.storage.characterCount.characters(),
          minutes: readingMinutes(doc as RichNode),
        });
      },
    },
    // created once: everything inside reads refs or stable setters, so re-applying
    // options on each render (which re-renders again) is never needed
    [],
  );

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  /* ------------------------------------------------------ slash menu */

  const commands: Cmd[] = useMemo(
    () => [
      {
        id: "p",
        label: "Paragraf",
        hint: "Düz metin",
        keys: "paragraf metin yazi",
        Icon: Pilcrow,
        run: (e) => e.chain().focus().setParagraph().run(),
      },
      {
        id: "h2",
        label: "Büyük başlık",
        hint: "Bölüm başlığı (H2)",
        keys: "baslik h2 bolum",
        Icon: Heading2,
        run: (e) => e.chain().focus().setHeading({ level: 2 }).run(),
      },
      {
        id: "h3",
        label: "Orta başlık",
        hint: "Alt bölüm (H3)",
        keys: "baslik h3 alt",
        Icon: Heading3,
        run: (e) => e.chain().focus().setHeading({ level: 3 }).run(),
      },
      {
        id: "h4",
        label: "Küçük başlık",
        hint: "Etiket gibi (H4)",
        keys: "baslik h4 kucuk",
        Icon: Heading4,
        run: (e) => e.chain().focus().setHeading({ level: 4 }).run(),
      },
      {
        id: "ul",
        label: "Madde listesi",
        hint: "Tab ile alt madde",
        keys: "madde liste bullet",
        Icon: List,
        run: (e) => e.chain().focus().toggleBulletList().run(),
      },
      {
        id: "ol",
        label: "Numaralı liste",
        hint: "1. 2. 3.",
        keys: "numara sira liste",
        Icon: ListOrdered,
        run: (e) => e.chain().focus().toggleOrderedList().run(),
      },
      {
        id: "task",
        label: "Yapılacaklar",
        hint: "İşaretlenebilir liste",
        keys: "yapilacak gorev checkbox todo",
        Icon: ListChecks,
        run: (e) => e.chain().focus().toggleTaskList().run(),
      },
      {
        id: "quote",
        label: "Alıntı",
        hint: "Öne çıkan söz",
        keys: "alinti quote",
        Icon: Quote,
        run: (e) => e.chain().focus().toggleBlockquote().run(),
      },
      {
        id: "code",
        label: "Kod bloğu",
        hint: "Renklendirmeli kod",
        keys: "kod code blok",
        Icon: SquareCode,
        run: (e) => e.chain().focus().toggleCodeBlock().run(),
      },
      {
        id: "info",
        label: "Bilgi kutusu",
        hint: "Not düş",
        keys: "bilgi kutu not callout",
        Icon: Info,
        run: (e) => e.chain().focus().setCallout("info").run(),
      },
      {
        id: "tip",
        label: "İpucu kutusu",
        hint: "Öneri",
        keys: "ipucu oneri kutu",
        Icon: Lightbulb,
        run: (e) => e.chain().focus().setCallout("tip").run(),
      },
      {
        id: "warn",
        label: "Uyarı kutusu",
        hint: "Dikkat çek",
        keys: "uyari dikkat kutu",
        Icon: TriangleAlert,
        run: (e) => e.chain().focus().setCallout("warning").run(),
      },
      {
        id: "img",
        label: "Resim",
        hint: "Bilgisayardan yükle",
        keys: "resim gorsel image foto",
        Icon: ImagePlus,
        run: () => fileRef.current?.click(),
      },
      {
        id: "table",
        label: "Tablo",
        hint: "3×3, başlık satırlı",
        keys: "tablo table",
        Icon: Table,
        run: (e) =>
          e
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run(),
      },
      {
        id: "hr",
        label: "Ayırıcı",
        hint: "Bölüm arası çizgi",
        keys: "ayirici cizgi hr",
        Icon: Minus,
        run: (e) => e.chain().focus().setHorizontalRule().run(),
      },
    ],
    [],
  );

  const slashItems = useMemo(() => {
    if (!slash) return [];
    const q = fold(slash.query.trim());
    return commands.filter(
      (c) => !q || fold(c.label).includes(q) || c.keys.includes(q),
    );
  }, [slash, commands]);

  const pick = useCallback(
    (cmd: Cmd) => {
      if (!editor || !slash) return;
      editor
        .chain()
        .focus()
        .deleteRange({ from: slash.from, to: slash.to })
        .run();
      setSlash(null);
      cmd.run(editor);
    },
    [editor, slash],
  );

  useEffect(() => {
    slashRef.current = {
      open: !!slash,
      items: slashItems,
      index: slashIndex,
      pick,
    };
  }, [slash, slashItems, slashIndex, pick]);

  useEffect(() => {
    if (!editor) return;
    const check = () => {
      const { $from, empty } = editor.state.selection;
      if (!empty || $from.parent.type.name !== "paragraph")
        return setSlash(null);
      const before = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        "￼",
      );
      const match = /^\/([\p{L}\d]{0,20})$/u.exec(before);
      if (!match) return setSlash(null);
      const coords = editor.view.coordsAtPos($from.pos);
      setSlash((prev) => {
        if (!prev || prev.query !== match[1]) setSlashIndex(0);
        return {
          query: match[1] ?? "",
          from: $from.pos - before.length,
          to: $from.pos,
          x: coords.left,
          y: coords.bottom,
          top: coords.top,
        };
      });
    };
    editor.on("update", check);
    editor.on("selectionUpdate", check);
    return () => {
      editor.off("update", check);
      editor.off("selectionUpdate", check);
    };
  }, [editor]);

  /* ------------------------------------------------------------ links */

  function openLink() {
    if (!editor) return;
    setLinkValue(
      (editor.getAttributes("link").href as string | undefined) ?? "",
    );
    setLinkOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const href = linkValue.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!href) chain.unsetLink().run();
    else chain.setLink({ href }).run();
    setLinkOpen(false);
  }

  function importMarkdown() {
    if (!editor || !mdValue.trim()) return;
    const html = marked.parse(mdValue, { async: false, gfm: true });
    editor.chain().focus().insertContent(html).run();
    setMdValue("");
    setMdOpen(false);
  }

  if (!editor) {
    return (
      <div className="grid h-96 place-items-center rounded-xl border border-[#e7e5e4] bg-white text-[#a8a29e]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const inList = editor.isActive("listItem") || editor.isActive("taskItem");
  const listType = editor.isActive("taskItem") ? "taskItem" : "listItem";
  const block = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : editor.isActive("heading", { level: 4 })
        ? "h4"
        : "p";

  return (
    <div className="rich-editor rounded-xl border border-[#e7e5e4] bg-white">
      {/* ---------------------------------------------------- toolbar */}
      <div
        className="sticky z-20 rounded-t-xl border-b border-[#e7e5e4] bg-white/95 backdrop-blur"
        style={{ top: stickyTop }}
      >
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
          <ToolButton
            label="Geri al (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo2 className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Yinele (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo2 className="h-4 w-4" />
          </ToolButton>
          <Sep />
          <select
            value={block}
            onChange={(e) => {
              const v = e.target.value;
              const c = editor.chain().focus();
              if (v === "p") c.setParagraph().run();
              else
                c.setHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run();
            }}
            className="h-8 rounded-md border border-[#e7e5e4] bg-white px-2 text-[13px] text-[#44403c] outline-none hover:border-[#d6d3d1]"
            aria-label="Blok türü"
          >
            <option value="p">Paragraf</option>
            <option value="h2">Büyük başlık</option>
            <option value="h3">Orta başlık</option>
            <option value="h4">Küçük başlık</option>
          </select>
          <Sep />
          <ToolButton
            label="Kalın (Ctrl+B)"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="İtalik (Ctrl+I)"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Altı çizili (Ctrl+U)"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <Underline className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Üstü çizili"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Satır içi kod"
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Vurgula"
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Bağlantı (Ctrl+K)"
            active={editor.isActive("link") || linkOpen}
            onClick={openLink}
          >
            <Link className="h-4 w-4" />
          </ToolButton>
          <Sep />
          <ToolButton
            label="Madde listesi"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Numaralı liste"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Yapılacaklar listesi"
            active={editor.isActive("taskList")}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            <ListChecks className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Alt maddeye al (Tab)"
            disabled={!inList || !editor.can().sinkListItem(listType)}
            onClick={() => editor.chain().focus().sinkListItem(listType).run()}
          >
            <IndentIncrease className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Üst maddeye çıkar (Shift+Tab)"
            disabled={!inList || !editor.can().liftListItem(listType)}
            onClick={() => editor.chain().focus().liftListItem(listType).run()}
          >
            <IndentDecrease className="h-4 w-4" />
          </ToolButton>
          <Sep />
          <ToolButton
            label="Alıntı"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Bilgi kutusu"
            active={editor.isActive("callout")}
            onClick={() =>
              editor.isActive("callout")
                ? editor.chain().focus().unsetCallout().run()
                : editor.chain().focus().setCallout("info").run()
            }
          >
            <Info className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Kod bloğu"
            active={editor.isActive("codeBlock")}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          >
            <SquareCode className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Resim yükle"
            onClick={() => fileRef.current?.click()}
          >
            {uploads ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
          </ToolButton>
          <ToolButton
            label="Tablo ekle"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <Table className="h-4 w-4" />
          </ToolButton>
          <ToolButton
            label="Ayırıcı çizgi"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="h-4 w-4" />
          </ToolButton>
          <Sep />
          <ToolButton
            label="Markdown içe aktar"
            active={mdOpen}
            onClick={() => setMdOpen((o) => !o)}
          >
            <FileDown className="h-4 w-4" />
          </ToolButton>
        </div>

        {/* contextual rows */}
        {linkOpen && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyLink();
            }}
            className="flex items-center gap-2 border-t border-[#f5f5f4] px-3 py-2"
          >
            <Link className="h-4 w-4 text-[#a8a29e]" />
            <input
              autoFocus
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              placeholder="https://… (boş bırakırsan bağlantı kaldırılır)"
              className="h-8 flex-1 rounded-md border border-[#e7e5e4] px-2 text-[13px] outline-none focus:border-[#1c1917]"
            />
            <button
              type="submit"
              className="h-8 rounded-md bg-[#1c1917] px-3 text-[13px] font-medium text-white"
            >
              Uygula
            </button>
            <button
              type="button"
              onClick={() => setLinkOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-md hover:bg-[#f5f5f4]"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </form>
        )}

        {editor.isActive("callout") && (
          <div className="flex items-center gap-1 border-t border-[#f5f5f4] px-3 py-1.5 text-[12px] text-[#57534e]">
            <span className="mr-2 font-medium">Kutu türü:</span>
            {(
              [
                ["info", "Bilgi", Info],
                ["tip", "İpucu", Lightbulb],
                ["warning", "Uyarı", TriangleAlert],
              ] as const
            ).map(([tone, label, Icon]) => (
              <button
                key={tone}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor.chain().focus().setCallout(tone).run()}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-[#f5f5f4]",
                  editor.isActive("callout", { tone }) &&
                    "bg-[#1c1917] text-white hover:bg-[#1c1917]",
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().unsetCallout().run()}
              className="ml-auto rounded-md px-2 py-1 hover:bg-[#f5f5f4]"
            >
              Kutuyu kaldır
            </button>
          </div>
        )}

        {editor.isActive("table") && (
          <div className="flex flex-wrap items-center gap-1 border-t border-[#f5f5f4] px-3 py-1.5 text-[12px] text-[#57534e]">
            <span className="mr-2 font-medium">Tablo:</span>
            {[
              [
                "Satır ekle",
                Rows3,
                () => editor.chain().focus().addRowAfter().run(),
              ],
              [
                "Sütun ekle",
                Columns3,
                () => editor.chain().focus().addColumnAfter().run(),
              ],
              [
                "Satırı sil",
                Trash2,
                () => editor.chain().focus().deleteRow().run(),
              ],
              [
                "Sütunu sil",
                Trash2,
                () => editor.chain().focus().deleteColumn().run(),
              ],
              [
                "Başlık satırı",
                Rows3,
                () => editor.chain().focus().toggleHeaderRow().run(),
              ],
            ].map(([label, Icon, run]) => {
              const I = Icon as typeof Rows3;
              return (
                <button
                  key={label as string}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={run as () => void}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-[#f5f5f4]"
                >
                  <I className="h-3.5 w-3.5" /> {label as string}
                </button>
              );
            })}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="ml-auto rounded-md px-2 py-1 text-red-600 hover:bg-red-50"
            >
              Tabloyu sil
            </button>
          </div>
        )}

        {mdOpen && (
          <div className="border-t border-[#f5f5f4] p-3">
            <p className="mb-2 text-[12px] text-[#78716c]">
              Markdown yapıştır; başlıklar, listeler, kod blokları ve tablolar
              editör bloklarına çevrilip imlecin olduğu yere eklenir.
            </p>
            <textarea
              value={mdValue}
              onChange={(e) => setMdValue(e.target.value)}
              rows={6}
              placeholder={
                "## Başlık\n\n- madde\n  - alt madde\n\n```ts\nconst x = 1;\n```"
              }
              className="w-full rounded-md border border-[#e7e5e4] p-2 font-mono text-[12px] outline-none focus:border-[#1c1917]"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMdOpen(false)}
                className="h-8 rounded-md px-3 text-[13px] hover:bg-[#f5f5f4]"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={importMarkdown}
                className="h-8 rounded-md bg-[#1c1917] px-3 text-[13px] font-medium text-white"
              >
                İçe aktar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------- bubble menu */}
      <BubbleMenu
        editor={editor}
        shouldShow={bubbleShouldShow}
        className="flex items-center gap-0.5 rounded-lg border border-[#e7e5e4] bg-white p-1 shadow-lg"
      >
        <ToolButton
          label="Kalın"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="İtalik"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Altı çizili"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Kod"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Vurgula"
          active={editor.isActive("highlight")}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <Highlighter className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Bağlantı"
          active={editor.isActive("link")}
          onClick={openLink}
        >
          <Link className="h-4 w-4" />
        </ToolButton>
        <Sep />
        <ToolButton
          label="Büyük başlık"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          label="Orta başlık"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
        </ToolButton>
      </BubbleMenu>

      <EditorContent editor={editor} className="px-5 py-6 sm:px-10 sm:py-8" />

      {/* -------------------------------------------------- slash menu */}
      {slash && slashItems.length > 0 && (
        <div
          className="fixed z-50 max-h-80 w-72 overflow-y-auto rounded-xl border border-[#e7e5e4] bg-white p-1.5 shadow-xl"
          style={
            typeof window !== "undefined" && slash.y + 340 > window.innerHeight
              ? { left: slash.x, bottom: window.innerHeight - slash.top + 6 }
              : { left: slash.x, top: slash.y + 6 }
          }
          role="listbox"
        >
          <p className="px-2 pt-1 pb-1.5 text-[11px] font-medium tracking-wide text-[#a8a29e] uppercase">
            Blok ekle
          </p>
          {slashItems.map((cmd, i) => (
            <button
              key={cmd.id}
              type="button"
              role="option"
              aria-selected={i === slashIndex}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setSlashIndex(i)}
              onClick={() => pick(cmd)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left",
                i === slashIndex && "bg-[#f5f5f4]",
              )}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#e7e5e4] bg-white text-[#44403c]">
                <cmd.Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[13px] font-medium text-[#1c1917]">
                  {cmd.label}
                </span>
                <span className="block text-[12px] text-[#a8a29e]">
                  {cmd.hint}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ---------------------------------------------------- footer */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-b-xl border-t border-[#e7e5e4] bg-[#fafaf9] px-4 py-2 text-[12px] text-[#78716c]">
        <span>{editor.storage.characterCount.words()} kelime</span>
        <span>{editor.storage.characterCount.characters()} karakter</span>
        <span>~{readingMinutes(editor.getJSON() as RichNode)} dk okuma</span>
        {uploads > 0 && (
          <span className="flex items-center gap-1 text-[#2563eb]">
            <Loader2 className="h-3 w-3 animate-spin" /> {uploads} resim
            yükleniyor
          </span>
        )}
        {uploadError && (
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-600"
          >
            {uploadError} ✕
          </button>
        )}
        <span className="ml-auto hidden sm:inline">
          İpucu:{" "}
          <kbd className="rounded border border-[#e7e5e4] bg-white px-1">/</kbd>{" "}
          blok menüsü ·{" "}
          <kbd className="rounded border border-[#e7e5e4] bg-white px-1">
            Tab
          </kbd>{" "}
          alt madde · resim yapıştırabilir ya da sürükleyebilirsin
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        multiple
        hidden
        onChange={(e) => {
          void insertImages(imageFiles(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}
