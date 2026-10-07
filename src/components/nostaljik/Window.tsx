"use client";

import { motion, useDragControls, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";

import { cn } from "~/lib/utils";

function useIsSmall() {
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setSmall(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return small;
}

export function Win98Window({
  title,
  icon,
  active,
  z,
  minimized,
  initial,
  width,
  height,
  constraints,
  resizable = true,
  statusBar,
  onFocus,
  onClose,
  onMinimize,
  children,
  bodyClassName,
}: {
  title: string;
  icon: React.ReactNode;
  active: boolean;
  z: number;
  minimized: boolean;
  initial: { x: number; y: number };
  width: number;
  height?: number;
  constraints: React.RefObject<HTMLElement | null>;
  resizable?: boolean;
  statusBar?: React.ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  children: React.ReactNode;
  bodyClassName?: string;
}) {
  const controls = useDragControls();
  const small = useIsSmall();
  const [maximized, setMaximized] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [saved, setSaved] = useState({ x: 0, y: 0 });

  const fill = maximized || small;

  function toggleMax() {
    if (!maximized) {
      setSaved({ x: x.get(), y: y.get() });
      x.set(0);
      y.set(0);
    } else {
      x.set(saved.x);
      y.set(saved.y);
    }
    setMaximized((m) => !m);
  }

  return (
    <motion.div
      role="dialog"
      aria-label={title}
      drag={!fill}
      dragControls={controls}
      dragListener={false}
      dragMomentum={false}
      dragConstraints={constraints}
      dragElastic={0}
      onPointerDown={onFocus}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.12 }}
      style={{
        x: fill ? 0 : x,
        y: fill ? 0 : y,
        zIndex: z,
        left: fill ? undefined : initial.x,
        top: fill ? undefined : initial.y,
        width: fill ? undefined : width,
        height: fill ? undefined : height,
        display: minimized ? "none" : "flex",
      }}
      className={cn(
        "w98-window absolute flex-col font-win text-[13px] text-black",
        fill && "inset-x-1 top-1 bottom-11",
      )}
    >
      <div
        onPointerDown={(e) => {
          onFocus();
          if (!fill) controls.start(e);
        }}
        onDoubleClick={() => resizable && toggleMax()}
        data-inactive={!active}
        className="w98-title flex h-[22px] shrink-0 cursor-default touch-none items-center gap-1.5 px-1 select-none"
      >
        <span className="h-4 w-4 shrink-0">{icon}</span>
        <span className="flex-1 truncate font-bold">{title}</span>
        <button
          type="button"
          aria-label="Simge durumuna küçült"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onMinimize}
          className="w98-ctrl"
        >
          <span className="mt-[6px] block h-[2px] w-[6px] bg-black" />
        </button>
        {resizable && (
          <button
            type="button"
            aria-label={maximized ? "Önceki boyut" : "Ekranı kapla"}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={toggleMax}
            className="w98-ctrl hidden sm:grid"
          >
            <span className="block h-[8px] w-[9px] border border-t-2 border-black" />
          </button>
        )}
        <button
          type="button"
          aria-label="Kapat"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="w98-ctrl ml-0.5"
        >
          <span className="relative block h-[8px] w-[8px]">
            <span className="absolute top-[3px] left-0 block h-[2px] w-[8px] rotate-45 bg-black" />
            <span className="absolute top-[3px] left-0 block h-[2px] w-[8px] -rotate-45 bg-black" />
          </span>
        </button>
      </div>

      <div className={cn("flex min-h-0 flex-1 flex-col", bodyClassName)}>
        {children}
      </div>

      {statusBar && (
        <div className="mt-[2px] flex shrink-0 gap-[2px] text-[12px]">
          {statusBar}
        </div>
      )}
    </motion.div>
  );
}

export function StatusCell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("w98-sunken truncate px-2 py-[2px]", className)}>
      {children}
    </span>
  );
}

export function MenuBar({ items }: { items: string[] }) {
  return (
    <div className="flex shrink-0 gap-0.5 py-[2px] text-[13px]">
      {items.map((item) => (
        <span
          key={item}
          className="cursor-default px-1.5 py-[1px] hover:bg-[#000080] hover:text-white"
        >
          <span className="underline">{item[0]}</span>
          {item.slice(1)}
        </span>
      ))}
    </div>
  );
}
