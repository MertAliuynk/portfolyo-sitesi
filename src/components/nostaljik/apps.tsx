"use client";

import { useState } from "react";

import {
  BinIcon,
  BrickIcon,
  ComputerIcon,
  DocIcon,
  FlagIcon,
  FolderIcon,
  MailIcon,
  MineIcon,
  NotepadIcon,
  SnakeIcon,
} from "~/components/nostaljik/icons";
import { MenuBar } from "~/components/nostaljik/Window";
import { SITE } from "~/lib/site";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type Project = RouterOutputs["project"]["all"][number];

export const WELCOME_KEY = "mert:w98-welcome";

/* ------------------------------------------------------------------ */
/* Hoş Geldiniz                                                         */
/* ------------------------------------------------------------------ */

const WELCOME_ITEMS = [
  {
    app: "projeler",
    label: "Projelerimi keşfet",
    Icon: FolderIcon,
    desc: "Son yıllarda yaptığım işler bir klasörde seni bekliyor. Bir dosyaya çift tıkla, ayrıntıları gör.",
  },
  {
    app: "bilgisayarim",
    label: "Beni tanı",
    Icon: ComputerIcon,
    desc: "Sistem Özellikleri'nde kim olduğumu, hangi teknolojileri kullandığımı ve performans değerlerimi bulabilirsin.",
  },
  {
    app: "oyunlar",
    label: "Oyun oyna",
    Icon: MineIcon,
    desc: "Mayın Tarlası, Yılan ve Tuğla Kır bir klasörde seni bekliyor. Mesai saatinde oynamak serbest.",
  },
  {
    app: "posta",
    label: "Bana e-posta gönder",
    Icon: MailIcon,
    desc: "Bir proje, bir fikir ya da sadece selam. Modeminin bağlanmasını beklemene gerek yok.",
  },
] as const;

export function WelcomeApp({
  onOpen,
  onClose,
}: {
  onOpen: (app: string) => void;
  onClose: () => void;
}) {
  const [hover, setHover] = useState(0);
  const [show, setShow] = useState(() => {
    try {
      return window.localStorage.getItem(WELCOME_KEY) !== "0";
    } catch {
      return true;
    }
  });
  const current = WELCOME_ITEMS[hover]!;

  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      <div className="flex items-end gap-3 border-b border-[#808080] pb-3 shadow-[0_1px_0_#fff]">
        <FlagIcon className="h-10 w-10" />
        <div>
          <p className="text-[#404040]">Hoş geldiniz</p>
          <p className="text-[26px] leading-none">
            <span className="font-bold italic">Mert</span>
            <span className="font-bold">OS</span>{" "}
            <span className="font-light text-[#000080]">98</span>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <ul className="flex flex-col gap-1.5 sm:w-52">
          {WELCOME_ITEMS.map((item, i) => (
            <li key={item.app}>
              <button
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={() => onOpen(item.app)}
                className={cn(
                  "flex w-full items-center gap-2 px-2 py-1.5 text-left",
                  hover === i ? "bg-[#000080] text-white" : "",
                )}
              >
                <item.Icon className="h-6 w-6 shrink-0" />
                <span className={cn(hover === i && "underline")}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="w98-field min-h-36 flex-1 p-3">
          <p className="font-bold">{current.label}</p>
          <p className="mt-2 leading-relaxed">{current.desc}</p>
          <p className="mt-4 text-[#404040]">
            İpucu: Masaüstündeki simgelere çift tıklayarak da programları
            açabilirsin. Başlat menüsünde daha fazlası var.
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={show}
            onChange={(e) => {
              setShow(e.target.checked);
              try {
                window.localStorage.setItem(WELCOME_KEY, e.target.checked ? "1" : "0");
              } catch {
                // ignore
              }
            }}
          />
          Bu ekranı her başlangıçta göster
        </label>
        <button type="button" onClick={onClose} className="w98-btn">
          Kapat
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bilgisayarım → Sistem Özellikleri                                    */
/* ------------------------------------------------------------------ */

const DEVICES = [
  { group: "Diller ve arayüz", items: ["TypeScript", "React", "Next.js", "Tailwind CSS"] },
  { group: "Sunucu ve API", items: ["Node.js", "tRPC", "REST", "WebSocket"] },
  { group: "Veri", items: ["PostgreSQL", "Prisma", "Redis", "SQLite"] },
  { group: "Grafik ve altyapı", items: ["Three.js", "WebGL", "Docker", "Sistem tasarımı"] },
];

const PERFORMANCE = [
  { label: "TypeScript", value: 95 },
  { label: "React / Next.js", value: 92 },
  { label: "Node.js ve API", value: 86 },
  { label: "Three.js / WebGL", value: 72 },
  { label: "Kahve toleransı", value: 100 },
];

function Blocks({ value }: { value: number }) {
  const total = 24;
  const filled = Math.round((value / 100) * total);
  return (
    <span className="w98-sunken flex h-[18px] flex-1 gap-[2px] bg-white p-[3px]">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn("block flex-1", i < filled ? "bg-[#000080]" : "bg-transparent")}
        />
      ))}
    </span>
  );
}

export function SystemApp({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({
    "Diller ve arayüz": true,
  });
  const tabs = ["Genel", "Aygıt Yöneticisi", "Performans"];

  return (
    <div className="flex flex-1 flex-col p-2">
      <div className="flex gap-0 pl-1">
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(i)}
            className={cn(
              "relative -mb-[2px] border-x border-t border-x-[#808080] border-t-white bg-[#c0c0c0] px-3 shadow-[inset_1px_1px_#dfdfdf,1px_0_0_#0a0a0a]",
              tab === i ? "z-10 -mt-[2px] pt-[5px] pb-[5px]" : "pt-[3px] pb-[2px]",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="w98-raised min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 0 && (
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex shrink-0 justify-center">
              <ComputerIcon className="h-24 w-24" />
            </div>
            <div className="shrink-0 space-y-3 leading-snug whitespace-nowrap">
              <div>
                <p>Sistem:</p>
                <p className="pl-6">MertOS 98</p>
                <p className="pl-6">İkinci Sürüm</p>
                <p className="pl-6">5.0.1998 B</p>
              </div>
              <div>
                <p>Kayıtlı kullanıcı:</p>
                <p className="pl-6">{SITE.name}</p>
                <p className="pl-6">{SITE.role}</p>
                <p className="pl-6">{SITE.location}</p>
              </div>
              <div>
                <p>Bilgisayar:</p>
                <p className="pl-6">TypeScript İşlemci</p>
                <p className="pl-6">5+ yıl deneyim</p>
                <p className="pl-6">40+ proje belleği</p>
                <p className="pl-6">9.999 fincan kahve</p>
              </div>
            </div>
            <fieldset className="min-w-0 flex-1 border border-[#808080] p-3 shadow-[1px_1px_0_#fff]">
              <legend className="px-1">Hakkında</legend>
              <p className="leading-relaxed">{SITE.bio}</p>
            </fieldset>
          </div>
        )}

        {tab === 1 && (
          <div className="w98-field h-full p-2">
            <p className="flex items-center gap-1.5">
              <ComputerIcon className="h-4 w-4" /> MERT-PC
            </p>
            <ul className="ml-2 border-l border-dotted border-[#808080] pl-3">
              {DEVICES.map((d) => (
                <li key={d.group} className="mt-1">
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [d.group]: !o[d.group] }))}
                    className="flex items-center gap-1.5"
                  >
                    <span className="grid h-[9px] w-[9px] place-items-center border border-[#808080] bg-white text-[9px] leading-none">
                      {open[d.group] ? "−" : "+"}
                    </span>
                    <FolderIcon className="h-4 w-4" />
                    {d.group}
                  </button>
                  {open[d.group] && (
                    <ul className="ml-5 border-l border-dotted border-[#808080] pl-3">
                      {d.items.map((item) => (
                        <li key={item} className="mt-0.5 flex items-center gap-1.5">
                          <DocIcon className="h-4 w-4" /> {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === 2 && (
          <div className="space-y-3">
            <fieldset className="border border-[#808080] p-3 shadow-[1px_1px_0_#fff]">
              <legend className="px-1">Performans durumu</legend>
              <div className="space-y-2.5">
                {PERFORMANCE.map((p) => (
                  <div key={p.label} className="flex items-center gap-3">
                    <span className="w-32 shrink-0">{p.label}</span>
                    <Blocks value={p.value} />
                    <span className="w-10 text-right">%{p.value}</span>
                  </div>
                ))}
              </div>
            </fieldset>
            <p>Sistem kaynakları: %98 serbest. Tüm aygıtlar düzgün çalışıyor.</p>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="w98-btn">
          Tamam
        </button>
        <button type="button" onClick={onClose} className="w98-btn">
          İptal
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Projelerim (Explorer)                                                */
/* ------------------------------------------------------------------ */

export function ExplorerApp({
  projects,
  onOpenProject,
}: {
  projects: Project[];
  onOpenProject: (slug: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MenuBar items={["Dosya", "Düzen", "Görünüm", "Git", "Sık Kullanılanlar", "Yardım"]} />
      <div className="flex shrink-0 gap-1 border-y border-y-[#808080] py-1 shadow-[inset_0_1px_0_#fff]">
        {["← Geri", "İleri →", "Yukarı"].map((b) => (
          <span key={b} className="px-2 text-[#808080] [text-shadow:1px_1px_0_#fff]">
            {b}
          </span>
        ))}
      </div>
      <div className="flex shrink-0 items-center gap-2 py-1">
        <span className="text-[#404040]">Adres</span>
        <span className="w98-field flex flex-1 items-center gap-1.5 px-1.5 py-[2px]">
          <FolderIcon className="h-4 w-4" /> C:\Belgelerim\Projelerim
        </span>
      </div>
      <div className="w98-field min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {["Ad", "Tür", "Yıl", "Etiketler"].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "w98-raised sticky top-0 px-2 py-[2px] font-normal",
                    i > 1 && "hidden sm:table-cell",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const isSel = selected === p.slug;
              return (
                <tr
                  key={p.id}
                  onClick={(e) => {
                    setSelected(p.slug);
                    if ((e.nativeEvent as PointerEvent).pointerType === "touch") {
                      onOpenProject(p.slug);
                    }
                  }}
                  onDoubleClick={() => onOpenProject(p.slug)}
                  className="cursor-default"
                >
                  <td className="px-2 py-[3px]">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-0.5",
                        isSel && "bg-[#000080] text-white outline-1 outline-dotted outline-black",
                      )}
                    >
                      <DocIcon className="h-4 w-4 shrink-0" />
                      {p.slug}.prj
                    </span>
                  </td>
                  <td className="px-2">Proje dosyası</td>
                  <td className="hidden px-2 sm:table-cell">{p.year}</td>
                  <td className="hidden max-w-48 truncate px-2 sm:table-cell">
                    {p.tags.split(",").join(", ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProjectApp({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [name, subtitle] = project.title.split("—").map((s) => s.trim());
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
      <div className="flex items-center gap-3">
        <DocIcon className="h-8 w-8 shrink-0" />
        <span className="w98-field flex-1 px-2 py-1 font-bold">{name}</span>
      </div>
      <hr className="border-t-[#808080] border-b-white" />
      <dl className="grid grid-cols-[6.5rem_1fr] gap-x-2 gap-y-1.5">
        <dt>Tür:</dt>
        <dd>{subtitle ?? "Proje"}</dd>
        <dt>Konum:</dt>
        <dd>C:\Belgelerim\Projelerim</dd>
        <dt>Oluşturulma:</dt>
        <dd>{project.year}</dd>
        <dt>Teknolojiler:</dt>
        <dd>{project.tags.split(",").join(", ")}</dd>
      </dl>
      <hr className="border-t-[#808080] border-b-white" />
      <p className="leading-relaxed">{project.summary}</p>
      <p className="leading-relaxed text-[#202020]">{project.description}</p>
      <div className="mt-auto flex flex-wrap justify-end gap-2 pt-2">
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="w98-btn text-center">
            Canlı sürüm
          </a>
        )}
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noreferrer" className="w98-btn text-center">
            Kaynak kod
          </a>
        )}
        <button type="button" onClick={onClose} className="w98-btn">
          Tamam
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* beni_oku.txt                                                         */
/* ------------------------------------------------------------------ */

const README = [
  "BENI_OKU.TXT",
  "============",
  "",
  "MertOS 98'i kullandığın için teşekkürler!",
  "",
  ...SITE.manifesto.flatMap((p) => [p, ""]),
  "BİLİNEN SORUNLAR",
  "----------------",
  ...SITE.funFacts.map((f) => `* ${f.label}: ${f.value}`),
  "",
  "DESTEK",
  "------",
  `Kurulum sırasında sorun yaşarsan: ${SITE.email}`,
  "",
  "İpucu: MS-DOS İstemi'ni aç ve YARDIM yaz.",
].join("\n");

export function NotepadApp() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MenuBar items={["Dosya", "Düzen", "Ara", "Yardım"]} />
      <div className="w98-field min-h-0 flex-1 overflow-y-auto p-2">
        <pre className="font-dos text-[19px] leading-[1.15] whitespace-pre-wrap">
          {README}
        </pre>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Posta                                                                */
/* ------------------------------------------------------------------ */

export function MailApp() {
  const [subject, setSubject] = useState("Merhaba Mert!");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  function send() {
    const url = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    setSent(true);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MenuBar items={["Dosya", "Düzen", "Görünüm", "Ekle", "Biçim", "Araçlar"]} />
      <div className="flex shrink-0 gap-1 border-y border-y-[#808080] py-1 shadow-[inset_0_1px_0_#fff]">
        <button
          type="button"
          onClick={send}
          className="flex flex-col items-center px-3 py-0.5 hover:shadow-[inset_-1px_-1px_#808080,inset_1px_1px_#fff]"
        >
          <MailIcon className="h-6 w-6" />
          Gönder
        </button>
      </div>
      <div className="grid shrink-0 grid-cols-[4rem_1fr] items-center gap-x-2 gap-y-1.5 py-2">
        <span className="text-right">Kime:</span>
        <span className="w98-field px-1.5 py-[2px]">{SITE.email}</span>
        <span className="text-right">Konu:</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w98-field px-1.5 py-[2px] outline-none"
        />
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Mesajını buraya yaz..."
        className="w98-field min-h-32 flex-1 resize-none p-2 outline-none"
      />
      <p className="pt-1 text-[12px] text-[#404040]">
        {sent
          ? "Varsayılan e-posta programın açıldı. Teşekkürler!"
          : "Gönder'e basınca e-posta programın açılacak."}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Geri Dönüşüm Kutusu                                                  */
/* ------------------------------------------------------------------ */

const TRASH = [
  { name: "portfolyo_v3_FINAL_son_bu_kesin.psd", size: "84 MB" },
  { name: "jquery_spagetti.js", size: "312 KB" },
  { name: "cuma_akşamı_deploy_planı.txt", size: "1 KB" },
  { name: "important_listesi.css", size: "48 KB" },
  { name: "node_modules", size: "2,4 GB" },
  { name: "TODO_sonra_bakarim.md", size: "0 KB" },
];

export function BinApp() {
  const [warn, setWarn] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MenuBar items={["Dosya", "Düzen", "Görünüm", "Yardım"]} />
      <div className="flex shrink-0 items-center justify-between border-y border-y-[#808080] px-1 py-1 shadow-[inset_0_1px_0_#fff]">
        <span className="flex items-center gap-1.5">
          <BinIcon className="h-5 w-5" /> {TRASH.length} nesne
        </span>
        <button type="button" onClick={() => setWarn(true)} className="w98-btn">
          Kutuyu boşalt
        </button>
      </div>
      <ul className="w98-field min-h-0 flex-1 overflow-y-auto p-1">
        {TRASH.map((t) => (
          <li key={t.name} className="flex items-center justify-between gap-3 px-1 py-[3px]">
            <span className="flex items-center gap-1.5 truncate">
              <NotepadIcon className="h-4 w-4 shrink-0" /> {t.name}
            </span>
            <span className="shrink-0 text-[#404040]">{t.size}</span>
          </li>
        ))}
      </ul>
      {warn && (
        <div className="mt-2 flex items-start gap-3 bg-[#ffffe1] p-2 shadow-[inset_0_0_0_1px_#000]">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#ff0000] font-bold text-white">
            ×
          </span>
          <p>
            Bu dosyalar silinemiyor: hepsi değerli birer ders. Kutuyu boşaltmak
            yerine onlardan öğrenmeye devam ediliyor.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Oyunlar klasörü                                                      */
/* ------------------------------------------------------------------ */

const GAME_FILES = [
  { app: "mayin", file: "Mayın Tarlası", Icon: MineIcon, info: "Klasik. 9×9, 10 mayın." },
  { app: "yilan", file: "Yılan", Icon: SnakeIcon, info: "Yeşil ekranlı, yön tuşlarıyla." },
  { app: "tugla", file: "Tuğla Kır", Icon: BrickIcon, info: "Raket, top, bir sürü tuğla." },
];

export function GamesFolderApp({ onOpen }: { onOpen: (app: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const sel = GAME_FILES.find((g) => g.app === selected);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MenuBar items={["Dosya", "Düzen", "Görünüm", "Yardım"]} />
      <div className="flex shrink-0 items-center gap-2 border-y border-y-[#808080] py-1 shadow-[inset_0_1px_0_#fff]">
        <span className="text-[#404040]">Adres</span>
        <span className="w98-field flex flex-1 items-center gap-1.5 px-1.5 py-[2px]">
          <FolderIcon className="h-4 w-4" /> C:\Program Files\Oyunlar
        </span>
      </div>
      <div
        className="w98-field flex min-h-0 flex-1 flex-wrap content-start gap-2 overflow-auto p-3"
        onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
      >
        {GAME_FILES.map(({ app, file, Icon }) => (
          <button
            key={app}
            type="button"
            onClick={(e) => {
              setSelected(app);
              if ((e.nativeEvent as PointerEvent).pointerType === "touch") onOpen(app);
            }}
            onDoubleClick={() => onOpen(app)}
            onKeyDown={(e) => e.key === "Enter" && onOpen(app)}
            className="flex w-[84px] flex-col items-center gap-1 py-1 outline-none"
          >
            <span className="relative">
              <Icon className="h-8 w-8" />
              {selected === app && (
                <span className="absolute inset-0 bg-[#000080]/50 mix-blend-multiply" />
              )}
            </span>
            <span
              className={cn(
                "px-0.5 text-center leading-tight",
                selected === app && "bg-[#000080] text-white outline-1 outline-dotted outline-black",
              )}
            >
              {file}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-[2px] flex shrink-0 gap-[2px] text-[12px]">
        <span className="w98-sunken flex-1 truncate px-2 py-[2px]">
          {sel ? sel.info : `${GAME_FILES.length} nesne`}
        </span>
      </div>
    </div>
  );
}
