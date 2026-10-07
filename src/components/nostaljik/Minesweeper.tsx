"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "~/lib/utils";

const SIZE = 9;
const MINES = 10;

interface Cell {
  mine: boolean;
  open: boolean;
  flag: boolean;
  around: number;
}

type Status = "ready" | "playing" | "won" | "lost";

const NUMBER_COLORS = [
  "",
  "#0000ff",
  "#008000",
  "#ff0000",
  "#000080",
  "#800000",
  "#008080",
  "#000000",
  "#808080",
];

function emptyBoard(): Cell[] {
  return Array.from({ length: SIZE * SIZE }, () => ({
    mine: false,
    open: false,
    flag: false,
    around: 0,
  }));
}

function neighbours(i: number) {
  const r = Math.floor(i / SIZE);
  const c = i % SIZE;
  const out: number[] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) out.push(nr * SIZE + nc);
    }
  }
  return out;
}

/** mines are placed after the first click so it is always safe */
function seed(board: Cell[], safe: number): Cell[] {
  const next = board.map((c) => ({ ...c }));
  const forbidden = new Set([safe, ...neighbours(safe)]);
  let placed = 0;
  while (placed < MINES) {
    const i = Math.floor(Math.random() * next.length);
    if (next[i]!.mine || forbidden.has(i)) continue;
    next[i]!.mine = true;
    placed++;
  }
  next.forEach((cell, i) => {
    cell.around = neighbours(i).filter((n) => next[n]!.mine).length;
  });
  return next;
}

function flood(board: Cell[], start: number) {
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    const cell = board[i]!;
    if (cell.open || cell.flag) continue;
    cell.open = true;
    if (cell.around === 0 && !cell.mine) stack.push(...neighbours(i));
  }
}

function Led({ value }: { value: number }) {
  const text =
    value < 0
      ? "-" + String(Math.min(99, -value)).padStart(2, "0")
      : String(Math.min(999, value)).padStart(3, "0");
  return (
    <span className="w98-sunken bg-black px-1 font-dos text-[28px] leading-[26px] tracking-[2px] text-[#ff0000] [text-shadow:0_0_4px_#ff000088]">
      {text}
    </span>
  );
}

type FaceMood = "smile" | "oh" | "dead" | "cool";

function Face({ mood }: { mood: FaceMood }) {
  return (
    <svg viewBox="0 0 17 17" className="h-[20px] w-[20px]" shapeRendering="crispEdges" aria-hidden>
      <rect x="5" y="0" width="7" height="17" fill="#000" />
      <rect x="0" y="5" width="17" height="7" fill="#000" />
      <rect x="2" y="2" width="13" height="13" fill="#000" />
      <rect x="6" y="1" width="5" height="15" fill="#ff0" />
      <rect x="1" y="6" width="15" height="5" fill="#ff0" />
      <rect x="3" y="3" width="11" height="11" fill="#ff0" />
      {mood === "dead" ? (
        <>
          <rect x="4" y="5" width="1" height="1" fill="#000" />
          <rect x="6" y="5" width="1" height="1" fill="#000" />
          <rect x="5" y="6" width="1" height="1" fill="#000" />
          <rect x="4" y="7" width="1" height="1" fill="#000" />
          <rect x="6" y="7" width="1" height="1" fill="#000" />
          <rect x="10" y="5" width="1" height="1" fill="#000" />
          <rect x="12" y="5" width="1" height="1" fill="#000" />
          <rect x="11" y="6" width="1" height="1" fill="#000" />
          <rect x="10" y="7" width="1" height="1" fill="#000" />
          <rect x="12" y="7" width="1" height="1" fill="#000" />
        </>
      ) : mood === "cool" ? (
        <>
          <rect x="3" y="5" width="11" height="1" fill="#000" />
          <rect x="4" y="6" width="3" height="2" fill="#000" />
          <rect x="10" y="6" width="3" height="2" fill="#000" />
        </>
      ) : (
        <>
          <rect x="5" y="5" width="2" height="2" fill="#000" />
          <rect x="10" y="5" width="2" height="2" fill="#000" />
        </>
      )}
      {mood === "oh" ? (
        <rect x="7" y="10" width="3" height="3" fill="#000" />
      ) : mood === "dead" ? (
        <>
          <rect x="6" y="11" width="5" height="1" fill="#000" />
          <rect x="5" y="12" width="1" height="1" fill="#000" />
          <rect x="11" y="12" width="1" height="1" fill="#000" />
        </>
      ) : (
        <>
          <rect x="5" y="10" width="1" height="1" fill="#000" />
          <rect x="11" y="10" width="1" height="1" fill="#000" />
          <rect x="6" y="11" width="5" height="1" fill="#000" />
        </>
      )}
    </svg>
  );
}

export function Minesweeper() {
  const [board, setBoard] = useState<Cell[]>(emptyBoard);
  const [status, setStatus] = useState<Status>("ready");
  const [seconds, setSeconds] = useState(0);
  const [pressing, setPressing] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const longPress = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const flags = board.filter((c) => c.flag).length;

  function reset() {
    setBoard(emptyBoard());
    setStatus("ready");
    setSeconds(0);
  }

  function reveal(i: number) {
    if (status === "won" || status === "lost") return;
    let next = board.map((c) => ({ ...c }));
    if (status === "ready") {
      next = seed(next, i);
      setStatus("playing");
    }
    const cell = next[i]!;
    if (cell.flag || cell.open) return;

    if (cell.mine) {
      next.forEach((c) => {
        if (c.mine) c.open = true;
      });
      setBoard(next);
      setStatus("lost");
      return;
    }

    flood(next, i);
    const won = next.every((c) => c.mine || c.open);
    if (won) {
      next.forEach((c) => {
        if (c.mine) c.flag = true;
      });
      setStatus("won");
    }
    setBoard(next);
  }

  function toggleFlag(i: number) {
    if (status === "won" || status === "lost") return;
    const cell = board[i]!;
    if (cell.open) return;
    setBoard(board.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
  }

  const face: FaceMood =
    status === "lost"
      ? "dead"
      : status === "won"
        ? "cool"
        : pressing
          ? "oh"
          : "smile";

  return (
    <div
      className="w98-raised select-none p-[6px]"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="w98-sunken mb-[6px] flex items-center justify-between p-[5px]">
        <Led value={MINES - flags} />
        <button
          type="button"
          onClick={reset}
          aria-label="Yeni oyun"
          className="w98-btn grid h-[30px] !min-w-0 w-[30px] place-items-center !p-0 font-dos text-[20px] leading-none"
        >
          <Face mood={face} />
        </button>
        <Led value={seconds} />
      </div>

      <div
        className="w98-sunken grid p-[3px]"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 24px)` }}
        onPointerUp={() => setPressing(false)}
        onPointerLeave={() => setPressing(false)}
      >
        {board.map((cell, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Kare ${i + 1}`}
            onPointerDown={(e) => {
              if (e.button === 2) return;
              setPressing(true);
              longPressed.current = false;
              if (e.pointerType === "touch") {
                longPress.current = setTimeout(() => {
                  longPressed.current = true;
                  toggleFlag(i);
                }, 380);
              }
            }}
            onPointerUp={() => {
              if (longPress.current) clearTimeout(longPress.current);
            }}
            onClick={() => {
              if (longPressed.current) return;
              if (flagMode) toggleFlag(i);
              else reveal(i);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              toggleFlag(i);
            }}
            className={cn(
              "grid h-[24px] w-[24px] place-items-center font-win text-[15px] leading-none font-bold",
              cell.open
                ? "border-t border-l border-[#808080] bg-[#c0c0c0]"
                : "w98-raised",
              cell.open && cell.mine && status === "lost" && "bg-[#ff0000]/0",
            )}
            style={{
              color: cell.open ? NUMBER_COLORS[cell.around] : undefined,
            }}
          >
            {cell.open && cell.mine ? (
              <span className="block h-[12px] w-[12px] rounded-full bg-black shadow-[0_0_0_2px_#c0c0c0,0_0_0_3px_#000]" />
            ) : cell.open && cell.around > 0 ? (
              cell.around
            ) : !cell.open && cell.flag ? (
              <span className="relative block h-[13px] w-[10px]">
                <span className="absolute top-0 left-[1px] block h-0 w-0 border-y-[4px] border-r-[7px] border-y-transparent border-r-[#ff0000]" />
                <span className="absolute top-0 left-[7px] block h-[10px] w-[1px] bg-black" />
                <span className="absolute bottom-0 left-[2px] block h-[2px] w-[8px] bg-black" />
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-[6px] flex items-center justify-between text-[12px]">
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={flagMode}
            onChange={(e) => setFlagMode(e.target.checked)}
          />
          Bayrak modu
        </label>
        <span>
          {status === "won"
            ? "Kazandın!"
            : status === "lost"
              ? "Bum. Tekrar dene."
              : "Sağ tık: bayrak"}
        </span>
      </div>
    </div>
  );
}
