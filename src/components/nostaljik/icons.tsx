/* 32×32 icons drawn on a pixel grid, crisp edges, Win98 palette. */

type IconProps = { className?: string };

function Svg({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function ComputerIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="3" width="24" height="18" fill="#000" />
      <rect x="5" y="4" width="22" height="16" fill="#c0c0c0" />
      <rect x="7" y="6" width="18" height="12" fill="#000" />
      <rect x="8" y="7" width="16" height="10" fill="#008080" />
      <rect x="9" y="8" width="6" height="2" fill="#7fffff" />
      <rect x="12" y="21" width="8" height="3" fill="#808080" />
      <rect x="6" y="24" width="20" height="5" fill="#000" />
      <rect x="7" y="25" width="18" height="3" fill="#c0c0c0" />
      <rect x="20" y="26" width="3" height="1" fill="#00a000" />
    </Svg>
  );
}

export function FolderIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="7" width="12" height="3" fill="#000" />
      <rect x="3" y="8" width="10" height="2" fill="#ffff9c" />
      <rect x="2" y="9" width="28" height="19" fill="#000" />
      <rect x="3" y="10" width="26" height="17" fill="#e8c34a" />
      <rect x="3" y="10" width="26" height="2" fill="#ffff9c" />
      <rect x="3" y="25" width="26" height="2" fill="#b08a1c" />
    </Svg>
  );
}

export function NotepadIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="6" y="3" width="21" height="27" fill="#000" />
      <rect x="7" y="4" width="19" height="25" fill="#fff" />
      <rect x="7" y="4" width="19" height="3" fill="#00a0c0" />
      {[10, 13, 16, 19, 22, 25].map((y) => (
        <rect key={y} x="9" y={y} width={y === 25 ? 9 : 15} height="1" fill="#808080" />
      ))}
      {[9, 13, 17, 21].map((x) => (
        <rect key={x} x={x} y="2" width="2" height="4" fill="#404040" />
      ))}
    </Svg>
  );
}

export function MineIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="15" y="3" width="2" height="26" fill="#000" />
      <rect x="3" y="15" width="26" height="2" fill="#000" />
      <rect x="7" y="7" width="3" height="3" fill="#000" />
      <rect x="22" y="7" width="3" height="3" fill="#000" />
      <rect x="7" y="22" width="3" height="3" fill="#000" />
      <rect x="22" y="22" width="3" height="3" fill="#000" />
      <rect x="9" y="9" width="14" height="14" fill="#000" />
      <rect x="8" y="11" width="16" height="10" fill="#000" />
      <rect x="11" y="8" width="10" height="16" fill="#000" />
      <rect x="12" y="12" width="3" height="3" fill="#fff" />
    </Svg>
  );
}

export function DosIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="4" width="28" height="24" fill="#000" />
      <rect x="3" y="5" width="26" height="3" fill="#000080" />
      <rect x="3" y="8" width="26" height="19" fill="#c0c0c0" />
      <rect x="4" y="9" width="24" height="17" fill="#000" />
      <rect x="6" y="12" width="2" height="2" fill="#c0c0c0" />
      <rect x="8" y="14" width="2" height="2" fill="#c0c0c0" />
      <rect x="6" y="16" width="2" height="2" fill="#c0c0c0" />
      <rect x="12" y="17" width="6" height="2" fill="#c0c0c0" />
    </Svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="7" width="28" height="19" fill="#000" />
      <rect x="3" y="8" width="26" height="17" fill="#fffbe8" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={3 + i} y={9 + i * 0.75} width="2" height="1" fill="#808080" />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={27 - i} y={9 + i * 0.75} width="2" height="1" fill="#808080" />
      ))}
      <rect x="23" y="10" width="4" height="5" fill="#c00000" />
    </Svg>
  );
}

export function BinIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="6" y="5" width="20" height="3" fill="#000" />
      <rect x="7" y="6" width="18" height="1" fill="#dfdfdf" />
      <rect x="7" y="8" width="18" height="21" fill="#000" />
      <rect x="8" y="8" width="16" height="20" fill="#c0c0c0" />
      {[11, 15, 19].map((x) => (
        <rect key={x} x={x} y="10" width="2" height="16" fill="#808080" />
      ))}
      <rect x="9" y="3" width="6" height="3" fill="#fff" />
      <rect x="17" y="2" width="5" height="4" fill="#ffff9c" />
    </Svg>
  );
}

export function FlagIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="5" y="5" width="10" height="10" fill="#f03c1e" />
      <rect x="17" y="4" width="10" height="10" fill="#3cb43c" />
      <rect x="5" y="17" width="10" height="10" fill="#1e64f0" />
      <rect x="17" y="16" width="10" height="10" fill="#ffd21e" />
    </Svg>
  );
}

export function DocIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="6" y="2" width="16" height="28" fill="#000" />
      <rect x="22" y="8" width="5" height="22" fill="#000" />
      <rect x="7" y="3" width="15" height="26" fill="#fff" />
      <rect x="22" y="9" width="4" height="20" fill="#fff" />
      <rect x="20" y="3" width="2" height="6" fill="#808080" />
      <rect x="20" y="7" width="6" height="2" fill="#808080" />
      <rect x="10" y="13" width="12" height="9" fill="#000080" />
      <rect x="12" y="15" width="4" height="3" fill="#1084d0" />
      <rect x="10" y="24" width="12" height="1" fill="#808080" />
    </Svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="9" y="4" width="14" height="24" fill="#000" />
      <rect x="5" y="8" width="22" height="16" fill="#000" />
      <rect x="7" y="6" width="18" height="20" fill="#000" />
      <rect x="8" y="7" width="16" height="18" fill="#1e64f0" />
      <rect x="6" y="9" width="20" height="14" fill="#1e64f0" />
      <rect x="10" y="9" width="6" height="5" fill="#3cb43c" />
      <rect x="17" y="15" width="6" height="6" fill="#3cb43c" />
      <rect x="9" y="19" width="4" height="3" fill="#3cb43c" />
    </Svg>
  );
}

export function KeyIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="10" width="12" height="12" fill="#000" />
      <rect x="5" y="11" width="10" height="10" fill="#ffd21e" />
      <rect x="8" y="14" width="4" height="4" fill="#000" />
      <rect x="15" y="15" width="13" height="3" fill="#000" />
      <rect x="22" y="18" width="3" height="4" fill="#000" />
      <rect x="26" y="18" width="2" height="3" fill="#000" />
    </Svg>
  );
}

export function ShutdownIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="4" width="24" height="18" fill="#000" />
      <rect x="5" y="5" width="22" height="16" fill="#000080" />
      <rect x="10" y="22" width="12" height="3" fill="#808080" />
      <rect x="6" y="25" width="20" height="4" fill="#c0c0c0" />
      <rect x="14" y="8" width="4" height="7" fill="#ffd21e" />
      <rect x="10" y="11" width="2" height="6" fill="#ffd21e" />
      <rect x="20" y="11" width="2" height="6" fill="#ffd21e" />
      <rect x="11" y="17" width="10" height="2" fill="#ffd21e" />
    </Svg>
  );
}

export function SnakeIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="5" width="26" height="22" fill="#000" />
      <rect x="4" y="6" width="24" height="20" fill="#a8c64e" />
      {[
        [7, 20],
        [10, 20],
        [13, 20],
        [13, 17],
        [13, 14],
        [16, 14],
        [19, 14],
        [19, 11],
      ].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" fill="#2b3a12" />
      ))}
      <rect x="23" y="9" width="3" height="3" fill="#2b3a12" />
    </Svg>
  );
}

export function BrickIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="3" width="28" height="26" fill="#000" />
      {[
        ["#f03c1e", 5],
        ["#ff9a1e", 9],
        ["#ffd21e", 13],
      ].map(([c, y]) =>
        [4, 11, 18, 25].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={Number(y)} width="5" height="3" fill={String(c)} />
        )),
      )}
      <rect x="15" y="19" width="2" height="2" fill="#fff" />
      <rect x="10" y="25" width="12" height="2" fill="#c0c0c0" />
    </Svg>
  );
}

export function GamesFolderIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="2" y="7" width="12" height="3" fill="#000" />
      <rect x="3" y="8" width="10" height="2" fill="#ffff9c" />
      <rect x="2" y="9" width="28" height="19" fill="#000" />
      <rect x="3" y="10" width="26" height="17" fill="#e8c34a" />
      <rect x="3" y="10" width="26" height="2" fill="#ffff9c" />
      <rect x="11" y="15" width="12" height="8" fill="#000" />
      <rect x="12" y="16" width="10" height="6" fill="#c0c0c0" />
      <rect x="13" y="18" width="3" height="1" fill="#000" />
      <rect x="14" y="17" width="1" height="3" fill="#000" />
      <rect x="19" y="17" width="2" height="2" fill="#f03c1e" />
    </Svg>
  );
}
