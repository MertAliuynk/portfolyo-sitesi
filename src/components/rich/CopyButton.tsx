"use client";

import { useState } from "react";

/** Copies a code block; each mood styles it and picks its own words. */
export function CopyButton({
  code,
  className,
  idle = "kopyala",
  done = "kopyalandı",
}: {
  code: string;
  className?: string;
  idle?: string;
  done?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // clipboard blocked — nothing to do
        }
      }}
    >
      {copied ? done : idle}
    </button>
  );
}
