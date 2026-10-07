"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { PostView } from "~/lib/posts";
import { SITE } from "~/lib/site";
import type { RouterOutputs } from "~/trpc/react";

type Project = RouterOutputs["project"]["all"][number];

const BANNER = [
  "MertOS 98 [Sürüm 5.0.1998]",
  "(C) Telif Hakkı 1998-2026 Mert Ali Uyanık.",
  "",
  "Komutları görmek için YARDIM yaz.",
  "",
];

function normalise(s: string) {
  return s
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export function DosPrompt({
  projects,
  posts,
  onExit,
  onOpen,
}: {
  projects: Project[];
  posts: PostView[];
  onExit: () => void;
  onOpen: (app: string) => void;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<string[]>(BANNER);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [green, setGreen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  function run(raw: string) {
    const [cmd = ""] = normalise(raw).split(/\s+/);
    const out: string[] = [];

    switch (cmd) {
      case "":
        break;
      case "yardim":
      case "help":
      case "?":
        out.push(
          "KIMIM      Ben kimim?",
          "DIR        Projeleri listele",
          "BECERILER  Bildiğim teknolojiler",
          "YAZILAR    Blog yazılarını listele ve aç",
          "ILETISIM   Bana nasıl ulaşırsın",
          "OYNA       Mayın Tarlası'nı aç",
          "OYUNLAR    Oyunlar klasörü (YILAN, TUGLA da yazılabilir)",
          "TARIH      Bugünün tarihi",
          "RENK       Yeşil fosfor ekranı aç/kapat",
          "ECHO       Yazdığını tekrar eder",
          "CLS        Ekranı temizle",
          "MOD        Ruh halini değiştir",
          "CIKIS      Pencereyi kapat",
        );
        break;
      case "kimim":
      case "whoami":
      case "ver":
        out.push(`${SITE.name}, ${SITE.role}.`, SITE.tagline);
        break;
      case "dir":
      case "ls":
      case "projeler":
        out.push(" C sürücüsündeki birimin etiketi: PROJELER", " Dizin: C:\\PROJELER", "");
        projects.forEach((p) => {
          const name = p.slug.toUpperCase().slice(0, 14).padEnd(16, " ");
          out.push(`${name}<PRJ>   ${p.year}   ${p.title.split("—")[0]!.trim()}`);
        });
        out.push(`        ${projects.length} dosya`, "");
        break;
      case "yazilar":
      case "blog":
        posts.forEach((p) => out.push(`${p.date}  ${p.title}`));
        out.push("", "Mert Gezgini başlatılıyor...");
        onOpen("gezgin");
        break;
      case "beceriler":
        out.push(SITE.skills.join(", "));
        break;
      case "iletisim":
        out.push(`E-posta : ${SITE.email}`);
        SITE.socials.forEach((s) => out.push(`${s.label.padEnd(8, " ")}: ${s.href}`));
        break;
      case "oyunlar":
        out.push("Oyunlar klasörü açılıyor...");
        onOpen("oyunlar");
        break;
      case "yilan":
      case "snake":
        out.push("YILAN.EXE başlatılıyor...");
        onOpen("yilan");
        break;
      case "tugla":
      case "breakout":
        out.push("TUGLA.EXE başlatılıyor...");
        onOpen("tugla");
        break;
      case "oyna":
      case "winmine":
        out.push("WINMINE.EXE başlatılıyor...");
        onOpen("mayin");
        break;
      case "tarih":
      case "date":
        out.push(
          "Bugünün tarihi: " +
            new Intl.DateTimeFormat("tr-TR", { dateStyle: "full" }).format(new Date()),
        );
        break;
      case "renk":
      case "color":
        setGreen((g) => !g);
        out.push("Tamam.");
        break;
      case "echo":
        out.push(raw.trim().slice(5));
        break;
      case "cls":
      case "clear":
        setLines([]);
        return;
      case "mod":
        out.push("Ruh hali seçicisine dönülüyor...");
        setTimeout(() => router.push("/"), 600);
        break;
      case "cikis":
      case "exit":
        onExit();
        return;
      case "format":
        out.push("Erişim reddedildi. Güzel deneme ama.");
        break;
      default:
        out.push(
          `'${raw.trim()}' iç ya da dış komut, çalıştırılabilir program veya`,
          "toplu iş dosyası olarak tanınmıyor. YARDIM yazmayı dene.",
        );
    }

    setLines((l) => [...l, `C:\\MERT>${raw}`, ...out, ""]);
  }

  return (
    <div
      className="w98-field min-h-0 flex-1 overflow-y-auto bg-black p-2 font-dos text-[20px] leading-[1.15]"
      style={{ color: green ? "#33ff66" : "#c0c0c0" }}
      onClick={() => inputRef.current?.focus()}
    >
      {lines.map((line, i) => (
        <pre key={i} className="font-dos whitespace-pre-wrap">
          {line || " "}
        </pre>
      ))}
      <form
        className="flex"
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
          if (input.trim()) setHistory((h) => [input, ...h]);
          setInput("");
          setCursor(-1);
        }}
      >
        <span>C:\MERT&gt;</span>
        <span className="relative flex-1">
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowUp") {
                e.preventDefault();
                const next = Math.min(cursor + 1, history.length - 1);
                if (history[next] !== undefined) {
                  setCursor(next);
                  setInput(history[next]);
                }
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                const next = cursor - 1;
                setCursor(Math.max(next, -1));
                setInput(next >= 0 ? (history[next] ?? "") : "");
              }
            }}
            spellCheck={false}
            autoComplete="off"
            aria-label="Komut"
            className="absolute inset-0 w-full bg-transparent font-dos text-transparent caret-transparent outline-none"
          />
          <span aria-hidden>
            {input}
            <span className="animate-blink inline-block h-[0.2em] w-[0.6em] bg-current align-baseline" />
          </span>
        </span>
      </form>
      <div ref={endRef} />
    </div>
  );
}
