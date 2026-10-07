/* Hand-built SVG shapes for the happy mood — no emoji, no icon set. */

const INK = "#1A1A1A";

export function Star({
  fill,
  className,
}: {
  fill: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M50 4 L61 37 L96 38 L68 59 L78 94 L50 73 L22 94 L32 59 L4 38 L39 37 Z"
        fill={fill}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Flower({
  fill,
  className,
}: {
  fill: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path
        d="M50 8c9 0 14 9 14 18 8-6 19-5 23 3s-1 17-9 21c8 4 13 13 9 21s-15 9-23 3c0 9-5 18-14 18s-14-9-14-18c-8 6-19 5-23-3s1-17 9-21c-8-4-13-13-9-21s15-9 23-3c0-9 5-18 14-18z"
        fill={fill}
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Smiley({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="44" fill="#FFC93C" stroke={INK} strokeWidth="5" />
      <ellipse cx="36" cy="40" rx="5" ry="8" fill={INK} />
      <ellipse cx="64" cy="40" rx="5" ry="8" fill={INK} />
      <path
        d="M28 58 Q50 82 72 58"
        fill="none"
        stroke={INK}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Squiggle({
  stroke,
  className,
}: {
  stroke: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 200 40" className={className} aria-hidden>
      <path
        d="M4 20 Q 17 2 30 20 T 56 20 T 82 20 T 108 20 T 134 20 T 160 20 T 186 20"
        fill="none"
        stroke={stroke}
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden>
      <path
        d="M8 10 C 40 0, 90 10, 96 58"
        fill="none"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M82 48 L96 62 L108 44"
        fill="none"
        stroke={INK}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
