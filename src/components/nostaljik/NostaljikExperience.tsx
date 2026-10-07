"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

import {
  BinApp,
  GamesFolderApp,
  ExplorerApp,
  MailApp,
  NotepadApp,
  ProjectApp,
  SystemApp,
  WELCOME_KEY,
  WelcomeApp,
} from "~/components/nostaljik/apps";
import { BrowserApp } from "~/components/nostaljik/Browser";
import { DosPrompt } from "~/components/nostaljik/DosPrompt";
import {
  BinIcon,
  BrickIcon,
  ComputerIcon,
  DocIcon,
  DosIcon,
  FlagIcon,
  FolderIcon,
  GamesFolderIcon,
  GlobeIcon,
  KeyIcon,
  MailIcon,
  MineIcon,
  NotepadIcon,
  ShutdownIcon,
  SnakeIcon,
} from "~/components/nostaljik/icons";
import { Breakout } from "~/components/nostaljik/Breakout";
import { Minesweeper } from "~/components/nostaljik/Minesweeper";
import { Snake } from "~/components/nostaljik/Snake";
import { StatusCell, Win98Window } from "~/components/nostaljik/Window";
import { beep } from "~/lib/beep";
import type { PostView } from "~/lib/posts";
import { cn } from "~/lib/utils";
import type { RouterOutputs } from "~/trpc/react";

type Project = RouterOutputs["project"]["all"][number];
type Phase = "bios" | "splash" | "desktop" | "shutting" | "off";

interface Win {
  id: string;
  z: number;
  minimized: boolean;
  pos: { x: number; y: number };
}

type IconC = (p: { className?: string }) => React.ReactElement;

const DESKTOP_ICONS: { id: string; label: string; Icon: IconC }[] = [
  { id: "bilgisayarim", label: "Bilgisayarım", Icon: ComputerIcon },
  { id: "projeler", label: "Projelerim", Icon: FolderIcon },
  { id: "benioku", label: "beni_oku.txt", Icon: NotepadIcon },
  { id: "oyunlar", label: "Oyunlar", Icon: GamesFolderIcon },
  { id: "dos", label: "MS-DOS İstemi", Icon: DosIcon },
  { id: "posta", label: "Bana Yaz", Icon: MailIcon },
  { id: "gezgin", label: "Yazılarım.htm", Icon: GlobeIcon },
  { id: "cop", label: "Geri Dönüşüm Kutusu", Icon: BinIcon },
];

const BIOS_LINES = [
  "MertBIOS (C) 1998 Uyanık Megatrends, Inc.",
  "MERT-PC  Sürüm 5.0",
  "",
  "İşlemci  : TypeScript 5.x, 5+ yıl çekirdek",
  "@MEMTEST",
  "",
  "Kahve sürücüsü yükleniyor ............ TAMAM",
  "REACT.SYS yükleniyor ................. TAMAM",
  "THREE.DRV yükleniyor ................. TAMAM",
  "Mayın tarlası algılandı .............. TAMAM",
  "Klavye algılandı (sesi gereksiz yüksek)",
  "",
  "MertOS 98 başlatılıyor...",
];

/* ------------------------------------------------------------------ */

function Boot({ onDone }: { onDone: () => void }) {
  const [shown, setShown] = useState(0);
  const [mem, setMem] = useState(0);

  useEffect(() => {
    beep(1046, 0.12);
    const lineTimer = setInterval(() => {
      setShown((s) => {
        if (s >= BIOS_LINES.length) {
          clearInterval(lineTimer);
          return s;
        }
        return s + 1;
      });
    }, 150);
    const memTimer = setInterval(() => {
      setMem((m) => Math.min(m + 32768, 655360));
    }, 30);
    const done = setTimeout(onDone, 150 * BIOS_LINES.length + 700);
    return () => {
      clearInterval(lineTimer);
      clearInterval(memTimer);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[200] cursor-none bg-black p-6 font-dos text-[22px] leading-[1.15] text-[#c0c0c0] sm:p-10 sm:text-[26px]">
      <div className="flex items-start justify-between">
        <div>
          {BIOS_LINES.slice(0, shown).map((line, i) => (
            <p key={i} className="whitespace-pre">
              {line === "@MEMTEST"
                ? `Bellek testi: ${mem}K ${mem >= 655360 ? "TAMAM" : ""}`
                : line || " "}
            </p>
          ))}
          <span className="animate-blink inline-block h-[0.15em] w-[0.6em] bg-[#c0c0c0]" />
        </div>
        <div className="hidden text-right text-[#ffd21e] sm:block">
          <FlagIcon className="ml-auto h-16 w-16" />
          <p className="mt-1 text-[20px]">Enerji dostu</p>
        </div>
      </div>
      <p className="absolute bottom-6 left-6 text-[18px] sm:bottom-10 sm:left-10">
        Atlamak için bir tuşa bas ya da tıkla
      </p>
    </div>
  );
}

function Splash() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[linear-gradient(180deg,#4a84d4_0%,#9cc3f0_55%,#dfeaf7_100%)]">
      <div className="flex items-end gap-4">
        <FlagIcon className="h-24 w-24 drop-shadow-[3px_3px_0_rgba(0,0,0,0.25)]" />
        <p className="font-win text-[64px] leading-none text-white [text-shadow:2px_2px_0_#00000055]">
          <span className="font-bold italic">Mert</span>
          <span className="font-bold">OS</span>
          <span className="ml-3 font-light">98</span>
        </p>
      </div>
      <p className="mt-3 font-win text-white/90">İkinci Sürüm</p>
      <div className="absolute inset-x-0 bottom-16 mx-auto h-3 w-64 overflow-hidden bg-white/40">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "250%" }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/3 bg-[linear-gradient(90deg,transparent,#000080,transparent)]"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);
  return <span>{time}</span>;
}

function Speaker() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" shapeRendering="crispEdges" aria-hidden>
      <rect x="2" y="6" width="3" height="4" fill="#000" />
      <rect x="5" y="4" width="2" height="8" fill="#000" />
      <rect x="7" y="2" width="2" height="12" fill="#000" />
      <rect x="11" y="5" width="1" height="6" fill="#808080" />
      <rect x="13" y="3" width="1" height="10" fill="#808080" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

export function NostaljikExperience({
  projects,
  posts,
}: {
  projects: Project[];
  posts: PostView[];
}) {
  const router = useRouter();
  const desktopRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("bios");
  const [wins, setWins] = useState<Win[]>([]);
  const [topZ, setTopZ] = useState(10);
  const [startOpen, setStartOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const lastPointer = useRef<string>("mouse");

  const toSplash = useCallback(() => setPhase((p) => (p === "bios" ? "splash" : p)), []);

  // any key / click skips the boot sequence
  useEffect(() => {
    if (phase !== "bios" && phase !== "splash") return;
    const skip = () => setPhase("desktop");
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "splash") return;
    const t = setTimeout(() => setPhase("desktop"), 1700);
    return () => clearTimeout(t);
  }, [phase]);

  const open = useCallback(
    (id: string) => {
      setStartOpen(false);
      setTopZ((z) => z + 1);
      setWins((ws) => {
        const z = topZ + 1;
        const existing = ws.find((w) => w.id === id);
        if (existing) {
          return ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w));
        }
        const n = ws.length % 6;
        const vw = typeof window === "undefined" ? 1200 : window.innerWidth;
        const width = META_WIDTH[id.startsWith("proje:") ? "proje" : id] ?? 480;
        const x = Math.max(4, Math.min(120 + n * 28, vw - width - 8));
        const y = 24 + n * 26;
        return [...ws, { id, z, minimized: false, pos: { x, y } }];
      });
    },
    [topZ],
  );

  const close = (id: string) => setWins((ws) => ws.filter((w) => w.id !== id));
  const focus = (id: string) => {
    setTopZ((z) => z + 1);
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: topZ + 1 } : w)));
  };
  const minimize = (id: string) =>
    setWins((ws) => ws.map((w) => (w.id === id ? { ...w, minimized: true } : w)));

  const visible = wins.filter((w) => !w.minimized);
  const activeId = visible.length
    ? visible.reduce((a, b) => (a.z > b.z ? a : b)).id
    : null;

  // first arrival on the desktop: startup chime + welcome dialog
  const booted = useRef(false);
  useEffect(() => {
    if (phase !== "desktop" || booted.current) return;
    booted.current = true;
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.5), i * 140));
    let showWelcome = true;
    try {
      showWelcome = window.localStorage.getItem(WELCOME_KEY) !== "0";
    } catch {
      // ignore
    }
    if (showWelcome) setTimeout(() => open("hosgeldin"), 350);
  }, [phase, open]);

  function shutdown() {
    setStartOpen(false);
    setPhase("shutting");
    setTimeout(() => setPhase("off"), 1600);
  }

  function reboot() {
    setWins([]);
    booted.current = false;
    setPhase("bios");
  }

  /* -------------------------------------------------------------- */

  function render(w: Win) {
    const common = {
      active: w.id === activeId,
      z: w.z,
      minimized: w.minimized,
      initial: w.pos,
      constraints: desktopRef,
      onFocus: () => focus(w.id),
      onClose: () => close(w.id),
      onMinimize: () => minimize(w.id),
    };

    if (w.id.startsWith("proje:")) {
      const project = projects.find((p) => `proje:${p.slug}` === w.id);
      if (!project) return null;
      return (
        <Win98Window
          {...common}
          title={`${project.slug}.prj Özellikleri`}
          icon={<DocIcon className="h-4 w-4" />}
          width={META_WIDTH.proje!}
          height={460}
          resizable={false}
        >
          <ProjectApp project={project} onClose={() => close(w.id)} />
        </Win98Window>
      );
    }

    switch (w.id) {
      case "hosgeldin":
        return (
          <Win98Window
            {...common}
            title="Hoş Geldiniz"
            icon={<FlagIcon className="h-4 w-4" />}
            width={META_WIDTH.hosgeldin!}
            resizable={false}
          >
            <WelcomeApp onOpen={open} onClose={() => close(w.id)} />
          </Win98Window>
        );
      case "bilgisayarim":
        return (
          <Win98Window
            {...common}
            title="Sistem Özellikleri"
            icon={<ComputerIcon className="h-4 w-4" />}
            width={META_WIDTH.bilgisayarim!}
            resizable={false}
          >
            <SystemApp onClose={() => close(w.id)} />
          </Win98Window>
        );
      case "projeler":
        return (
          <Win98Window
            {...common}
            title="Projelerim"
            icon={<FolderIcon className="h-4 w-4" />}
            width={META_WIDTH.projeler!}
            height={380}
            statusBar={
              <>
                <StatusCell className="flex-1">{projects.length} nesne</StatusCell>
                <StatusCell className="w-32">Bilgisayarım</StatusCell>
              </>
            }
          >
            <ExplorerApp
              projects={projects}
              onOpenProject={(slug) => open(`proje:${slug}`)}
            />
          </Win98Window>
        );
      case "benioku":
        return (
          <Win98Window
            {...common}
            title="beni_oku.txt - Not Defteri"
            icon={<NotepadIcon className="h-4 w-4" />}
            width={META_WIDTH.benioku!}
            height={440}
          >
            <NotepadApp />
          </Win98Window>
        );
      case "mayin":
        return (
          <Win98Window
            {...common}
            title="Mayın Tarlası"
            icon={<MineIcon className="h-4 w-4" />}
            width={META_WIDTH.mayin!}
            resizable={false}
          >
            <div className="flex justify-center">
              <Minesweeper />
            </div>
          </Win98Window>
        );
      case "oyunlar":
        return (
          <Win98Window
            {...common}
            title="Oyunlar"
            icon={<GamesFolderIcon className="h-4 w-4" />}
            width={META_WIDTH.oyunlar!}
            height={260}
          >
            <GamesFolderApp onOpen={open} />
          </Win98Window>
        );
      case "yilan":
        return (
          <Win98Window
            {...common}
            title="Yılan"
            icon={<SnakeIcon className="h-4 w-4" />}
            width={META_WIDTH.yilan!}
            resizable={false}
          >
            <Snake active={common.active} />
          </Win98Window>
        );
      case "tugla":
        return (
          <Win98Window
            {...common}
            title="Tuğla Kır"
            icon={<BrickIcon className="h-4 w-4" />}
            width={META_WIDTH.tugla!}
            resizable={false}
          >
            <Breakout active={common.active} />
          </Win98Window>
        );
      case "dos":
        return (
          <Win98Window
            {...common}
            title="MS-DOS İstemi"
            icon={<DosIcon className="h-4 w-4" />}
            width={META_WIDTH.dos!}
            height={400}
          >
            <DosPrompt
              projects={projects}
              posts={posts}
              onExit={() => close(w.id)}
              onOpen={open}
            />
          </Win98Window>
        );
      case "posta":
        return (
          <Win98Window
            {...common}
            title="Yeni İleti"
            icon={<MailIcon className="h-4 w-4" />}
            width={META_WIDTH.posta!}
            height={420}
          >
            <MailApp />
          </Win98Window>
        );
      case "gezgin":
        return (
          <Win98Window
            {...common}
            title="Yazılarım - Mert Gezgini"
            icon={<GlobeIcon className="h-4 w-4" />}
            width={META_WIDTH.gezgin!}
            height={540}
          >
            <BrowserApp posts={posts} />
          </Win98Window>
        );
      case "cop":
        return (
          <Win98Window
            {...common}
            title="Geri Dönüşüm Kutusu"
            icon={<BinIcon className="h-4 w-4" />}
            width={META_WIDTH.cop!}
            height={340}
          >
            <BinApp />
          </Win98Window>
        );
      default:
        return null;
    }
  }

  function titleOf(id: string) {
    if (id.startsWith("proje:")) return `${id.slice(6)}.prj`;
    return TASK_TITLES[id] ?? id;
  }

  function iconOf(id: string) {
    if (id.startsWith("proje:")) return DocIcon;
    if (id === "hosgeldin") return FlagIcon;
    if (id === "mayin") return MineIcon;
    if (id === "yilan") return SnakeIcon;
    if (id === "tugla") return BrickIcon;
    return DESKTOP_ICONS.find((d) => d.id === id)?.Icon ?? DocIcon;
  }

  /* -------------------------------------------------------------- */

  if (phase === "bios") return <Boot onDone={toSplash} />;
  if (phase === "splash") return <Splash />;
  if (phase === "off") {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={reboot}
        onKeyDown={(e) => e.key === "Enter" && reboot()}
        className="fixed inset-0 flex cursor-pointer flex-col items-center justify-center gap-6 bg-black px-6 text-center font-dos"
      >
        <p className="text-[28px] text-[#ff8a00] sm:text-[40px]">
          Artık bilgisayarınızı güvenle kapatabilirsiniz.
        </p>
        <p className="text-[20px] text-[#808080]">
          (yeniden başlatmak için tıkla)
        </p>
        <Link
          href="/"
          onClick={(e) => e.stopPropagation()}
          className="mt-6 text-[20px] text-[#c0c0c0] underline"
        >
          ya da başka bir ruh haline geç
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={desktopRef}
      className={cn(
        "relative h-[100svh] w-full overflow-hidden bg-[#008080] font-win text-[13px] select-none",
        phase === "shutting" && "grayscale-[0.6]",
      )}
      onPointerDown={(e) => {
        lastPointer.current = e.pointerType;
        if (e.target === e.currentTarget) {
          setSelectedIcon(null);
          setStartOpen(false);
        }
      }}
    >
      {/* desktop icons */}
      <div
        className="absolute inset-x-0 top-0 bottom-10 flex flex-col flex-wrap content-start gap-1 p-2"
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedIcon(null);
            setStartOpen(false);
          }
        }}
      >
        {DESKTOP_ICONS.map(({ id, label, Icon }) => {
          const sel = selectedIcon === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setSelectedIcon(id);
                if (lastPointer.current === "touch") open(id);
              }}
              onDoubleClick={() => open(id)}
              onKeyDown={(e) => e.key === "Enter" && open(id)}
              className="flex w-[78px] flex-col items-center gap-1 py-1 outline-none"
            >
              <span className="relative">
                <Icon className="h-8 w-8" />
                {sel && <span className="absolute inset-0 bg-[#000080]/50 mix-blend-multiply" />}
              </span>
              <span
                className={cn(
                  "px-0.5 text-center leading-tight text-white",
                  sel && "bg-[#000080] outline-1 outline-dotted outline-[#ffff00]",
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* windows */}
      <AnimatePresence>
        {wins.map((w) => (
          <Fragment key={w.id}>{render(w)}</Fragment>
        ))}
      </AnimatePresence>

      {/* start menu */}
      <AnimatePresence>
        {startOpen && (
          <motion.div
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "linear" }}
            className="w98-window absolute bottom-[38px] left-[2px] z-[9999] flex"
          >
            <div className="flex w-[24px] items-end bg-[linear-gradient(0deg,#000080,#1084d0)] pb-2">
              <span className="rotate-180 text-[18px] leading-none text-[#c0c0c0] [writing-mode:vertical-rl]">
                <span className="font-bold text-white">Mert</span>OS 98
              </span>
            </div>
            <ul className="min-w-[210px] py-0.5">
              {[
                { id: "hosgeldin", label: "Hoş Geldiniz", Icon: FlagIcon },
                { id: "projeler", label: "Projelerim", Icon: FolderIcon },
                { id: "bilgisayarim", label: "Bilgisayarım", Icon: ComputerIcon },
                { id: "benioku", label: "Belgeler", Icon: NotepadIcon },
                { id: "oyunlar", label: "Oyunlar", Icon: GamesFolderIcon },
                { id: "mayin", label: "Mayın Tarlası", Icon: MineIcon },
                { id: "yilan", label: "Yılan", Icon: SnakeIcon },
                { id: "tugla", label: "Tuğla Kır", Icon: BrickIcon },
                { id: "dos", label: "MS-DOS İstemi", Icon: DosIcon },
                { id: "posta", label: "Bana Yaz", Icon: MailIcon },
              ].map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => open(item.id)}
                    className="flex w-full items-center gap-2.5 px-2 py-1.5 text-left hover:bg-[#000080] hover:text-white"
                  >
                    <item.Icon className="h-6 w-6" />
                    {item.label}
                  </button>
                </li>
              ))}
              <li className="mx-1 my-1 border-t border-t-[#808080] border-b border-b-white" />
              <li>
                <button
                  type="button"
                  onClick={() => open("gezgin")}
                  className="flex w-full items-center gap-2.5 px-2 py-1.5 text-left hover:bg-[#000080] hover:text-white"
                >
                  <GlobeIcon className="h-6 w-6" />
                  Yazılarım (Blog)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="flex w-full items-center gap-2.5 px-2 py-1.5 text-left hover:bg-[#000080] hover:text-white"
                >
                  <KeyIcon className="h-6 w-6" />
                  Ruh halini değiştir...
                </button>
              </li>
              <li className="mx-1 my-1 border-t border-t-[#808080] border-b border-b-white" />
              <li>
                <button
                  type="button"
                  onClick={shutdown}
                  className="flex w-full items-center gap-2.5 px-2 py-1.5 text-left hover:bg-[#000080] hover:text-white"
                >
                  <ShutdownIcon className="h-6 w-6" />
                  Bilgisayarı kapat...
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* taskbar */}
      <div className="w98-raised absolute inset-x-0 bottom-0 z-[9998] flex h-10 items-center gap-1 px-[3px] shadow-[inset_0_1px_#dfdfdf,inset_0_2px_#fff]">
        <button
          type="button"
          data-pressed={startOpen}
          onClick={() => setStartOpen((o) => !o)}
          className="w98-btn flex h-[30px] !min-w-0 items-center gap-1.5 !px-2 font-bold"
        >
          <FlagIcon className="h-5 w-5" />
          Başlat
        </button>
        <span className="mx-0.5 h-[28px] w-[2px] border-l border-l-[#808080] border-r border-r-white" />
        <div className="flex min-w-0 flex-1 gap-1 overflow-hidden">
          {wins.map((w) => {
            const Icon = iconOf(w.id);
            const isActive = w.id === activeId;
            return (
              <button
                key={w.id}
                type="button"
                data-pressed={isActive}
                onClick={() => {
                  if (w.minimized) {
                    open(w.id);
                  } else if (isActive) {
                    minimize(w.id);
                  } else {
                    focus(w.id);
                  }
                }}
                className={cn(
                  "w98-btn flex h-[30px] w-40 !min-w-0 shrink items-center gap-1.5 truncate !px-2 text-left",
                  isActive && "font-bold",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{titleOf(w.id)}</span>
              </button>
            );
          })}
        </div>
        <div className="w98-sunken flex h-[30px] items-center gap-2 px-3">
          <Speaker />
          <Clock />
        </div>
      </div>

      {phase === "shutting" && (
        <div className="absolute inset-0 z-[10000] grid place-items-center bg-black/30">
          <div className="w98-window w-72">
            <div className="w98-title flex h-[22px] items-center px-1.5 font-bold">
              MertOS kapatılıyor
            </div>
            <div className="flex items-center gap-3 p-4">
              <ShutdownIcon className="h-8 w-8" />
              Ayarlarınız kaydediliyor, lütfen bekleyin...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const META_WIDTH: Record<string, number> = {
  hosgeldin: 560,
  bilgisayarim: 640,
  projeler: 560,
  proje: 440,
  benioku: 520,
  mayin: 260,
  dos: 600,
  posta: 480,
  cop: 420,
  gezgin: 760,
  oyunlar: 400,
  yilan: 310,
  tugla: 430,
};

const TASK_TITLES: Record<string, string> = {
  hosgeldin: "Hoş Geldiniz",
  bilgisayarim: "Sistem Özellikleri",
  projeler: "Projelerim",
  benioku: "beni_oku.txt",
  mayin: "Mayın Tarlası",
  dos: "MS-DOS İstemi",
  posta: "Yeni İleti",
  cop: "Geri Dönüşüm Kutusu",
  gezgin: "Mert Gezgini",
  oyunlar: "Oyunlar",
  yilan: "Yılan",
  tugla: "Tuğla Kır",
};
